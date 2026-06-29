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
