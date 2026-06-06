import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCart } from "../services/cartService";

import { checkout } from "../services/orderService";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();

      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();

  const handleCheckout = async () => {
    setCheckoutLoading(true);

    try {
      await checkout();

      setCart({
        items: [],
        total_price: 0,
      });

      toast.success("Order placed successfully");

      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!cart) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1
        className="
        text-3xl
        font-bold
        mb-6
      "
      >
        Shopping Cart
      </h1>

      {cart.items?.map((item) => (
        <div
          key={item.product_id}
          className="
            border-b
            py-4
          "
        >
          <h2>{item.name}</h2>

          <p>
            Qty:
            {item.quantity}
          </p>

          <p>₹{item.price}</p>
        </div>
      ))}

      <h2
        className="
        text-2xl
        font-bold
        mt-6
      "
      >
        Total: ₹{cart.total_price}
      </h2>

      <button
        onClick={handleCheckout}
        disabled={checkoutLoading}
        className="
        mt-6
        bg-black
        text-white
        px-6
        py-3
        rounded
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
      >
        {checkoutLoading ? "Processing..." : "Checkout"}
      </button>
    </div>
  );
};

export default Cart;
