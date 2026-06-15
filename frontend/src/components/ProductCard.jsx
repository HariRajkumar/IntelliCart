import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Card from "./ui/Card";
import Button from "./ui/Button";

import { addToCart } from "../services/cartService";
import { getErrorMessage } from "../utils/errorHandler";

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success("Added to wishlist");
    } else {
      toast.success("Removed from wishlist");
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, 1);
      toast.success("Added to cart");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingToCart(false);
    }
  };

  const rating = product.rating || 0.0;
  const reviewsCount = product.reviews_count || 0;

  return (
    <Link to={`/products/${product.id}`} className="group block h-full">
      <Card className="flex flex-col h-full p-4 relative overflow-hidden bg-surface hover:shadow-hover-card hover:-translate-y-1.5 transition-all duration-300 border border-border/50 rounded-2xl">
        
        {/* Wishlist Heart Icon */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-surface/90 hover:bg-surface border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none"
        >
          <svg
            className={`w-4.5 h-4.5 transition-colors duration-200 ${
              isWishlisted
                ? "text-error fill-error"
                : "text-muted hover:text-error fill-none"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Product Image Section */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
          <img
            src={
              product.images?.[0]
                ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0]}`
                : "https://placehold.co/400x300"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Low Stock Badge */}
          {product.stock > 0 && product.stock <= 8 && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-brand-discount/10 border border-brand-discount/20 text-[10px] font-bold text-brand-discount tracking-wide animate-pulse">
              Only {product.stock} Left!
            </div>
          )}
          {product.stock <= 0 && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-muted/10 border border-muted/20 text-[10px] font-bold text-muted tracking-wide">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col flex-1 mt-4">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
            {product.category}
          </span>
          
          <h2 className="text-base font-bold text-text line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h2>

          <p className="text-xs text-muted mt-1.5 line-clamp-2 min-h-[2rem]">
            {product.description}
          </p>

          {/* Stars & Ratings */}
          <div className="flex items-center gap-1 mt-2.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating)
                      ? "text-brand-amber fill-brand-amber"
                      : "text-border fill-transparent"
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.772-.56-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <span className="text-[11px] font-bold text-text/80 ml-0.5">
              {rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-muted">
              ({reviewsCount})
            </span>
          </div>

          {/* Pricing Stack */}
          <div className="mt-4 flex items-baseline flex-wrap gap-1.5">
            <span className="text-xl font-black text-text">
              ₹{product.price.toLocaleString()}
            </span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-xs line-through text-muted/70 font-medium">
                  ₹{product.mrp.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-success leading-none">
                  {Math.round(product.discount)}% off
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Add To Cart Button */}
        <div className="mt-4 pt-1">
          <Button
            onClick={handleQuickAdd}
            disabled={addingToCart || product.stock <= 0}
            className={`w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all ${
              product.stock <= 0
                ? "bg-slate-100 text-muted cursor-not-allowed border-none shadow-none"
                : "bg-primary text-white hover:bg-primary-hover shadow-primary/10"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{addingToCart ? "Adding..." : "Quick Add"}</span>
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;