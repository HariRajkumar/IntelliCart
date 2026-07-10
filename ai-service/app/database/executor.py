from bson import ObjectId
from app.database.connection import db_conn
from app.utils.logger import logger

def convert_ids(obj):
    """
    Recursively scans query dictionaries/lists and casts any 24-character string
    associated with '_id' or ending in '_id' to an ObjectId so MongoDB finds it.
    """
    if isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            if k == "_id" or k.endswith("_id") or k == "product_id" or k == "user_id":
                if isinstance(v, str) and len(v) == 24:
                    try:
                        new_obj[k] = ObjectId(v)
                        continue
                    except Exception:
                        pass
                elif isinstance(v, dict) and "$in" in v:
                    new_in = []
                    for item in v["$in"]:
                        if isinstance(item, str) and len(item) == 24:
                            try:
                                new_in.append(ObjectId(item))
                            except Exception:
                                new_in.append(item)
                        else:
                            new_in.append(item)
                    new_obj[k] = {"$in": new_in}
                    continue
            new_obj[k] = convert_ids(v)
        return new_obj
    elif isinstance(obj, list):
        return [convert_ids(x) for x in obj]
    return obj

class QueryExecutor:
    @staticmethod
    async def execute(query_spec: dict) -> list:
        collection_name = query_spec.get("collection")
        operation = query_spec.get("operation")
        
        if not collection_name or operation == "none":
            return []

        db = db_conn.db
        if db is None:
            raise Exception("Database connection is not initialized")

        collection = db[collection_name]
        logger.info(f"Executing query on collection '{collection_name}' with operation '{operation}'")
        
        if operation == "find":
            query_filter = query_spec.get("query", {})
            query_filter = convert_ids(query_filter)
            
            projection = query_spec.get("projection")
            sort = query_spec.get("sort")
            limit = query_spec.get("limit", 10)
            
            if limit is None or not isinstance(limit, int):
                limit = 10
            limit = min(limit, 50)  # Cap limit for safety
            
            cursor = collection.find(query_filter, projection)
            
            if sort:
                # Convert sort dict to list of tuples: {"price": 1} -> [("price", 1)]
                sort_list = list(sort.items())
                cursor = cursor.sort(sort_list)
            
            cursor = cursor.limit(limit)
            results = await cursor.to_list(length=limit)
            return QueryExecutor._serialize(results)
            
        elif operation == "aggregate":
            pipeline = query_spec.get("pipeline", [])
            pipeline = convert_ids(pipeline)
            
            cursor = collection.aggregate(pipeline)
            results = await cursor.to_list(length=50)
            return QueryExecutor._serialize(results)

        elif operation == "insert_one":
            document = query_spec.get("document", {})
            document = convert_ids(document)
            from datetime import datetime
            if "created_at" not in document:
                document["created_at"] = datetime.utcnow()
            if "updated_at" not in document:
                document["updated_at"] = datetime.utcnow()
            res = await collection.insert_one(document)
            return [{"inserted_id": str(res.inserted_id)}]

        elif operation == "update_one":
            query_filter = query_spec.get("query", {})
            query_filter = convert_ids(query_filter)
            update_doc = query_spec.get("update", {})
            update_doc = convert_ids(update_doc)
            res = await collection.update_one(query_filter, update_doc)
            return [{"matched_count": res.matched_count, "modified_count": res.modified_count}]

        elif operation == "update_many":
            query_filter = query_spec.get("query", {})
            query_filter = convert_ids(query_filter)
            update_doc = query_spec.get("update", {})
            update_doc = convert_ids(update_doc)
            res = await collection.update_many(query_filter, update_doc)
            return [{"matched_count": res.matched_count, "modified_count": res.modified_count}]

        elif operation == "delete_one":
            query_filter = query_spec.get("query", {})
            query_filter = convert_ids(query_filter)
            res = await collection.delete_one(query_filter)
            return [{"deleted_count": res.deleted_count}]

        elif operation == "delete_many":
            query_filter = query_spec.get("query", {})
            query_filter = convert_ids(query_filter)
            res = await collection.delete_many(query_filter)
            return [{"deleted_count": res.deleted_count}]

        elif operation == "add_to_cart":
            user_id = query_spec.get("user_id")
            product_name = query_spec.get("product_name", "")
            quantity = int(query_spec.get("quantity", 1))

            prod_cursor = db["products"].find({
                "name": {"$regex": product_name, "$options": "i"},
                "is_active": True
            })
            products = await prod_cursor.to_list(length=1)
            if not products:
                return [{"error": f"Product '{product_name}' was not found in our store."}]
            
            product = products[0]
            product_id = str(product["_id"])
            price = float(product.get("price", 0.0))
            name = product.get("name", "")
            stock = int(product.get("stock", 0))
            images = product.get("images", [])
            image = images[0] if images else None

            cart = await db["carts"].find_one({"user_id": user_id})
            from datetime import datetime
            if not cart:
                cart = {
                    "user_id": user_id,
                    "items": [],
                    "total_price": 0.0,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                await db["carts"].insert_one(cart)

            existing_qty = 0
            for item in cart.get("items", []):
                if item.get("product_id") == product_id:
                    existing_qty = int(item.get("quantity", 0))
                    break
            
            if stock < (existing_qty + quantity):
                return [{"error": f"Only {stock} items in stock. You already have {existing_qty} in cart."}]

            items = cart.get("items", [])
            found = False
            for item in items:
                if item.get("product_id") == product_id:
                    item["quantity"] = int(item["quantity"]) + quantity
                    found = True
                    break
            
            if not found:
                items.append({
                    "product_id": product_id,
                    "name": name,
                    "price": price,
                    "quantity": quantity,
                    "image": image
                })

            total_price = sum(float(item.get("price", 0.0)) * int(item.get("quantity", 0)) for item in items)

            await db["carts"].update_one(
                {"user_id": user_id},
                {"$set": {
                    "items": items,
                    "total_price": total_price,
                    "updated_at": datetime.utcnow()
                }}
            )

            return [{
                "success": True,
                "message": f"Successfully added {quantity} x {name} to your cart.",
                "cart": {
                    "items": items,
                    "total_price": total_price
                }
            }]

        elif operation == "remove_from_cart":
            user_id = query_spec.get("user_id")
            product_name = query_spec.get("product_name", "")

            cart = await db["carts"].find_one({"user_id": user_id})
            if not cart or not cart.get("items"):
                return [{"error": "Your shopping cart is empty."}]

            items = cart.get("items", [])
            matching_item = None
            for item in items:
                if product_name.lower() in item.get("name", "").lower():
                    matching_item = item
                    break

            if not matching_item:
                return [{"error": f"Item matching '{product_name}' is not in your cart."}]

            items = [item for item in items if item.get("product_id") != matching_item.get("product_id")]
            total_price = sum(float(item.get("price", 0.0)) * int(item.get("quantity", 0)) for item in items)

            from datetime import datetime
            await db["carts"].update_one(
                {"user_id": user_id},
                {"$set": {
                    "items": items,
                    "total_price": total_price,
                    "updated_at": datetime.utcnow()
                }}
            )

            return [{
                "success": True,
                "message": f"Removed '{matching_item.get('name')}' from your cart.",
                "cart": {
                    "items": items,
                    "total_price": total_price
                }
            }]

        elif operation == "clear_cart":
            user_id = query_spec.get("user_id")
            from datetime import datetime
            await db["carts"].update_one(
                {"user_id": user_id},
                {"$set": {
                    "items": [],
                    "total_price": 0.0,
                    "updated_at": datetime.utcnow()
                }}
            )
            return [{"success": True, "message": "Cleared your shopping cart."}]

        elif operation == "checkout":
            user_id = query_spec.get("user_id")
            shipping_address = query_spec.get("shipping_address")

            cart = await db["carts"].find_one({"user_id": user_id})
            if not cart or not cart.get("items"):
                return [{"error": "Cannot checkout. Your shopping cart is empty."}]

            items = cart.get("items", [])
            total_price = float(cart.get("total_price", 0.0))

            user = await db["users"].find_one({"_id": ObjectId(user_id)})
            address_obj = None
            if shipping_address:
                address_obj = shipping_address
            elif user and user.get("addresses"):
                for addr in user.get("addresses", []):
                    if addr.get("is_default"):
                        address_obj = addr
                        break
                if not address_obj:
                    address_obj = user["addresses"][0]
            else:
                return [{"error": "Please provide a shipping address or configure it in your profile before checking out."}]

            from datetime import datetime
            order = {
                "user_id": user_id,
                "items": items,
                "total_price": total_price,
                "status": "pending",
                "shipping_address": address_obj,
                "payment_method": "COD",
                "payment_status": "pending",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            order_res = await db["orders"].insert_one(order)

            await db["carts"].update_one(
                {"user_id": user_id},
                {"$set": {
                    "items": [],
                    "total_price": 0.0,
                    "updated_at": datetime.utcnow()
                }}
            )

            return [{
                "success": True,
                "message": "Order placed successfully via COD.",
                "order_id": str(order_res.inserted_id),
                "total_price": total_price
            }]

        elif operation == "cancel_order":
            user_id = query_spec.get("user_id")
            order_id = query_spec.get("order_id")

            match_filter = {"user_id": user_id}
            if order_id:
                try:
                    match_filter["_id"] = ObjectId(order_id)
                except Exception:
                    match_filter["_id"] = order_id
            
            cursor = db["orders"].find(match_filter).sort("created_at", -1)
            orders = await cursor.to_list(length=1)
            if not orders:
                return [{"error": "No matching order found to cancel."}]

            order = orders[0]
            if order.get("status") not in ["pending", "processing"]:
                return [{"error": f"Cannot cancel order. Status is already '{order.get('status')}'."}]

            from datetime import datetime
            await db["orders"].update_one(
                {"_id": order["_id"]},
                {"$set": {
                    "status": "cancelled",
                    "updated_at": datetime.utcnow()
                }}
            )
            return [{
                "success": True,
                "message": f"Successfully cancelled order with ID {str(order['_id'])}."
            }]

        elif operation == "add_address":
            user_id = query_spec.get("user_id")
            address_line = query_spec.get("address_line")
            city = query_spec.get("city")
            state = query_spec.get("state")
            postal_code = query_spec.get("postal_code")
            import uuid

            new_address = {
                "id": uuid.uuid4().hex,
                "address_line": address_line,
                "city": city,
                "state": state,
                "postal_code": postal_code,
                "country": "India",
                "is_default": False
            }

            await db["users"].update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {"addresses": new_address}}
            )

            return [{
                "success": True,
                "message": f"Added shipping address: {address_line}, {city}, {postal_code}.",
                "address": new_address
            }]
            
        return []

    @staticmethod
    def _serialize(data):
        if isinstance(data, list):
            return [QueryExecutor._serialize(item) for item in data]
        elif isinstance(data, dict):
            return {k: QueryExecutor._serialize(v) for k, v in data.items()}
        elif isinstance(data, ObjectId):
            return str(data)
        elif hasattr(data, "isoformat"):  # DateTime objects
            return data.isoformat()
        return data
