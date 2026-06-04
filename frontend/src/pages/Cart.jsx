import {
  useEffect,
  useState,
} from "react";

import {
  getCart,
} from "../services/cartService";

const Cart = () => {
  const [cart, setCart] =
    useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data =
        await getCart();

      setCart(data);

    } catch (err) {
      console.error(err);
    }
  };

  if (!cart)
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
        Shopping Cart
      </h1>

      {cart.items?.map(
        (item) => (
          <div
            key={
              item.product_id
            }
            className="
            border-b
            py-4
          "
          >
            <h2>
              {item.name}
            </h2>

            <p>
              Qty:
              {
                item.quantity
              }
            </p>

            <p>
              ₹
              {item.price}
            </p>
          </div>
        )
      )}

      <h2
        className="
        text-2xl
        font-bold
        mt-6
      "
      >
        Total:
        ₹
        {
          cart.total_price
        }
      </h2>
    </div>
  );
};

export default Cart;