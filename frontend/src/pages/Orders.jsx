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

  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase() ?? "";

    if (normalized.includes("completed") || normalized.includes("delivered")) {
      return "bg-success text-white";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("processing") ||
      normalized.includes("shipped")
    ) {
      return "bg-warning text-slate-900";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("fail") ||
      normalized.includes("returned")
    ) {
      return "bg-error text-white";
    }

    return "bg-secondary text-white";
  };

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
      <h1 className="text-3xl font-bold mb-6 text-text">My Orders</h1>

      {orders.length === 0 && (
        <p className="text-muted">No orders found.</p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-3xl border border-border bg-surface p-4 mb-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-text">Order: {order.id}</span>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(order.status)}`}
            >
              {order.status}
            </span>
          </div>

          <div className="space-y-2 text-text">
            {order.items.map((item) => (
              <div key={item.product_id}>
                {item.name} x {item.quantity}
              </div>
            ))}
          </div>

          <div className="mt-3 font-bold text-text">
            Total: ₹{order.total_price}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;