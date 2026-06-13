import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../services/cartService";
import { checkout } from "../services/orderService";
import { getErrorMessage } from "../utils/errorHandler";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    setUpdatingId(productId);
    try {
      await updateCartItem(productId, quantity);
      toast.success("Quantity updated");
      await loadCart();
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
      loadCart();
    } catch (error) {
      toast.error("Failed to remove item");
      console.error(error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
      loadCart();
    } catch (error) {
      toast.error("Failed to clear cart");
      console.error(error);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await checkout();
      setCart({
        items: [],
        total_price: 0,
      });
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-muted">Loading your cart...</span>
        </div>
      </div>
    );
  }

  const itemsCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const deliveryCharge = cart.total_price > 500 || cart.total_price === 0 ? 0 : 40;
  const finalTotal = cart.total_price + deliveryCharge;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-text mb-8 tracking-tight">Shopping Cart</h1>

      {cart.items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center mb-6 text-primary animate-float">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Your cart is empty!</h2>
          <p className="text-muted mb-8 text-sm max-w-xs">
            Explore our awesome products and add some items to your cart.
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface border border-border/60 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-border/60 mb-4">
                <span className="text-sm font-bold text-muted uppercase tracking-wider">
                  Items ({itemsCount})
                </span>
                <button
                  onClick={handleClearCart}
                  className="text-xs text-muted hover:text-error font-semibold hover:underline transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-border/60">
                {cart.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex flex-col sm:flex-row gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    {/* Image Container */}
                    <div 
                      onClick={() => navigate(`/products/${item.product_id}`)}
                      className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-background border border-border/40 rounded-xl overflow-hidden flex items-center justify-center p-2 cursor-pointer hover:opacity-90 transition"
                    >
                      <img
                        src={
                          item.image
                            ? `http://localhost:8000${item.image}`
                            : "https://placehold.co/150"
                        }
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h2
                            onClick={() => navigate(`/products/${item.product_id}`)}
                            className="text-base sm:text-lg font-bold text-text hover:text-primary cursor-pointer transition line-clamp-2"
                          >
                            {item.name}
                          </h2>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base sm:text-lg font-extrabold text-text">
                              ₹{item.price * item.quantity}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted">₹{item.price} each</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 items-center">
                          <span className="inline-flex items-center gap-1 text-xs text-success font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                            In Stock
                          </span>
                          <span className="text-xs text-muted">|</span>
                          <span className="text-xs text-muted">Eligible for FREE Shipping</span>
                        </div>
                      </div>

                      {/* Stepper Actions and Remove */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-border/40">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted font-bold">Qty:</span>
                          <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden shadow-sm h-8">
                            <button
                              disabled={updatingId === item.product_id || item.quantity <= 1}
                              onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              className="px-2.5 h-full hover:bg-border/20 text-text font-extrabold transition disabled:opacity-30 border-r border-border"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-extrabold text-text select-none min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              disabled={updatingId === item.product_id}
                              onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                              className="px-2.5 h-full hover:bg-border/20 text-text font-extrabold transition disabled:opacity-30 border-l border-border"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(item.product_id)}
                          className="flex items-center gap-1 text-xs font-bold text-error hover:text-red-700 bg-error/5 hover:bg-error/10 px-3 py-1.5 rounded-lg transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 hover:bg-primary/5 rounded-full px-5 py-2 text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Continue Shopping</span>
            </Button>
          </div>

          {/* Right Column: Price details / checkout */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-surface border border-border/60 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-extrabold text-muted tracking-wider uppercase mb-4">
                Price Details
              </h3>

              <div className="space-y-3 border-b border-border/60 pb-4 text-sm text-text">
                <div className="flex justify-between">
                  <span>Price ({itemsCount} items)</span>
                  <span className="font-semibold">₹{cart.total_price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-success font-semibold">FREE</span>
                  ) : (
                    <span className="font-semibold">₹{deliveryCharge}</span>
                  )}
                </div>

                {deliveryCharge > 0 && (
                  <div className="bg-amber-50 text-amber-800 text-xs p-2.5 rounded-xl border border-amber-200 mt-2">
                    Add <strong>₹{500 - cart.total_price}</strong> more to get <strong>FREE Delivery</strong>!
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-4 border-b border-border/60 mb-6">
                <span className="text-base font-bold text-text">Total Amount</span>
                <span className="text-xl font-black text-text">₹{finalTotal}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-3.5 rounded-full text-base font-bold shadow-md hover:shadow-lg transition duration-300 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary/90 hover:scale-[1.01] active:scale-[0.99] transform"
              >
                {checkoutLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </div>

            {/* Security trust badge */}
            <div className="bg-surface/50 border border-border/40 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3 text-xs text-muted">
                <svg className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="leading-relaxed">
                  Safe and Secure Payments. Easy returns. 100% Authentic products.
                </span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;
