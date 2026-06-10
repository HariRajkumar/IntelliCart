import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
// import { getCart } from "../services/cartService";
import {
  getCart,
  updateCartItem,
  removeFromCart,
} from "../services/cartService";

import { checkout } from "../services/orderService";
import { getErrorMessage } from "../utils/errorHandler";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (productId, quantity) => {
    try {
      await updateCartItem(productId, quantity);

      toast.success("Cart updated");
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);

      toast.success("Item removed");

      loadCart();
    } catch (error) {
      toast.error("Failed to remove item");

      console.error(error);
    }
  };

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
      toast.error(getErrorMessage(err));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!cart) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-text">Shopping Cart</h1>

      {cart.items?.length === 0 ? (
        <div className="text-center py-10 text-muted">
          Your cart is empty.
        </div>
      ) : (
        cart.items.map((item) => (
          <div
            key={item.product_id}
            className="border-b border-border py-4"
          >
            <h2 className="text-lg font-semibold text-text">{item.name}</h2>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-muted">Qty:</span>

              <Input
                type="number"
                min="1"
                defaultValue={item.quantity}
                onBlur={(e) =>
                  handleQuantityChange(item.product_id, Number(e.target.value))
                }
                className="w-24 p-2"
              />
            </div>

            <p className="mt-3 text-text">₹{item.price}</p>

            <Button
              variant="error"
              onClick={() => handleRemove(item.product_id)}
              className="mt-3"
            >
              Remove
            </Button>
          </div>
        ))
      )}

      <h2 className="text-2xl font-bold mt-6 text-text">
        Total: ₹{cart.total_price}
      </h2>

      {cart.items?.length > 0 && (
        <Button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="mt-6 px-6 py-3"
        >
          {checkoutLoading ? "Processing..." : "Checkout"}
        </Button>
      )}
    </div>
  );
};

export default Cart;
