import {
  useEffect,
  useState,
} from "react";

import {
  getMyOrders,
} from "../services/orderService";

const Orders = () => {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data =
        await getMyOrders();

      setOrders(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div>Loading...</div>;

  return (
    <div className="p-6">

      <h1
        className="
          text-3xl
          font-bold
          mb-6
        "
      >
        My Orders
      </h1>

      {orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="
            border
            rounded-lg
            p-4
            mb-4
          "
        >
          <div
            className="
              flex
              justify-between
              mb-3
            "
          >
            <span>
              Order:
              {" "}
              {order.id}
            </span>

            <span
              className="
                font-semibold
              "
            >
              {order.status}
            </span>
          </div>

          {order.items.map(
            (item) => (
              <div
                key={
                  item.product_id
                }
              >
                {item.name}
                {" "}
                x
                {" "}
                {item.quantity}
              </div>
            )
          )}

          <div
            className="
              mt-3
              font-bold
            "
          >
            Total:
            {" "}
            ₹
            {order.total_price}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;