import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import { getProductById } from "../services/productService";
import { addToCart } from "../services/cartService";
import { getErrorMessage } from "../utils/errorHandler";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      setActiveImageIdx(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success("Added to cart");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      navigate("/cart");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm font-semibold text-muted">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <svg className="w-16 h-16 text-muted/60 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-text mb-2">Product Not Found</h2>
        <p className="text-sm text-muted mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products">
          <Button className="rounded-xl px-5">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const rating = product.rating || 0.0;
  const reviewsCount = product.reviews_count || 0;
  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.png"];
  
  // Split description by period to display bullet points
  const bulletDescriptions = product.description
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);

  const specData = {
    Brand: "IntelliCart Premium",
    Category: product.category,
    Availability: product.stock > 0 ? "In Stock" : "Out of Stock",
    Warranty: "1 Year Limited Warranty",
    "Secure Checkout": "Verified Secure Pay",
    "Product ID": product.id,
  };

  // Star review mock distribution data
  const ratingPercentages = {
    5: 68,
    4: 18,
    3: 8,
    2: 4,
    1: 2,
  };

  // Star ratings helper
  const renderStars = (ratingVal, sizeClass = "w-4 h-4") => (
    <div className="flex items-center text-brand-amber">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(ratingVal)
              ? "fill-brand-amber text-brand-amber"
              : "fill-none stroke-border text-border"
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
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted mb-6">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <span className="text-border">/</span>
        <Link to="/products" className="hover:text-primary transition">Products</Link>
        <span className="text-border">/</span>
        <span className="text-text max-w-[150px] truncate">{product.name}</span>
      </nav>

      {/* Main Grid: Left (Media), Middle (Details), Right (Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 1. Media Gallery (Left Column - 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
          
          {/* Vertical Thumbnail Strip (Only if > 1 image) */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-visible py-1 sm:py-0 shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border bg-surface shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? "border-primary ring-2 ring-primary/20 scale-[0.98]"
                      : "border-border/60 hover:border-muted/50"
                  }`}
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${img}`}
                    alt={`product-thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Active Image Viewport with zoom-on-hover */}
          <div className="flex-1 order-1 sm:order-2 relative rounded-3xl overflow-hidden border border-border/40 bg-surface shadow-sm aspect-square flex items-center justify-center cursor-zoom-in group">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${images[activeImageIdx]}`}
              alt={product.name}
              className="w-full h-full object-cover origin-center transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>
        </div>

        {/* 2. Specs & Descriptions (Middle Column - 4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-text mt-3 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Rating Stars Summary */}
            <div className="flex items-center gap-2 mt-3">
              {renderStars(rating)}
              <span className="text-xs font-bold text-text">{rating.toFixed(1)} Rating</span>
              <span className="text-border">|</span>
              <a href="#reviews" className="text-xs font-bold text-primary hover:text-primary-hover hover:underline transition">
                {reviewsCount} Customer Reviews
              </a>
            </div>
          </div>

          {/* Slashed Pricing */}
          <div className="pb-5 border-b border-border/50">
            <div className="flex items-baseline flex-wrap gap-2">
              <span className="text-3xl font-black text-text">
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-sm line-through text-muted/70 font-semibold">
                    MRP ₹{product.mrp.toLocaleString()}
                  </span>
                  <span className="text-sm font-extrabold text-success uppercase">
                    ({Math.round(product.discount)}% off)
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-muted font-bold mt-1 tracking-wide uppercase">
              Inclusive of all taxes
            </p>
          </div>

          {/* About Bullet Points */}
          <div>
            <h3 className="text-xs font-black uppercase text-muted tracking-wider mb-2.5">
              About This Item
            </h3>
            {bulletDescriptions.length > 0 ? (
              <ul className="space-y-2">
                {bulletDescriptions.map((bullet, idx) => (
                  <li key={idx} className="text-xs text-muted flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Trust Policy Badges */}
          <div className="grid grid-cols-4 gap-2 py-4 border-y border-border/40">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-border/20">
              <svg className="w-5 h-5 text-primary mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[9px] font-bold text-text leading-tight">Secure Pay</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-border/20">
              <svg className="w-5 h-5 text-primary mb-1.5 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              <span className="text-[9px] font-bold text-text leading-tight">7 Days Return</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-border/20">
              <svg className="w-5 h-5 text-primary mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[9px] font-bold text-text leading-tight">1 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-border/20">
              <svg className="w-5 h-5 text-primary mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[9px] font-bold text-text leading-tight">Fast Delivery</span>
            </div>
          </div>

          {/* Specifications Accordion Tabs */}
          <div className="border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-border/50 bg-slate-50">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "about"
                    ? "border-primary text-primary bg-surface"
                    : "border-transparent text-muted hover:text-text"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "specs"
                    ? "border-primary text-primary bg-surface"
                    : "border-transparent text-muted hover:text-text"
                }`}
              >
                Specifications
              </button>
            </div>
            <div className="p-4 bg-surface min-h-[120px]">
              {activeTab === "about" ? (
                <p className="text-xs text-muted leading-relaxed">
                  {product.description}
                </p>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    {Object.entries(specData).map(([key, val]) => (
                      <tr key={key} className="border-b border-border/30 last:border-none">
                        <td className="py-2.5 font-semibold text-muted w-1/3">{key}</td>
                        <td className="py-2.5 text-text font-bold">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* 3. Sticky Buy Box Widget (Right Column - 3 Cols) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 bg-surface p-6 rounded-3xl border border-border/60 shadow-premium">
          <div className="space-y-4">
            {/* Card Price Header */}
            <div>
              <span className="text-2xl font-black text-text">
                ₹{product.price.toLocaleString()}
              </span>
              <p className="text-[10px] text-success font-bold mt-0.5">
                FREE Delivery available
              </p>
            </div>

            {/* Stock Levels Indicator */}
            <div>
              {product.stock > 0 ? (
                product.stock <= 8 ? (
                  <span className="inline-block px-2.5 py-1 rounded-md bg-brand-discount/10 text-xs font-bold text-brand-discount animate-pulse">
                    Only {product.stock} left in stock - order soon!
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-xs font-bold text-success">
                    In Stock
                  </span>
                )
              ) : (
                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold text-muted">
                  Temporarily Out of Stock
                </span>
              )}
            </div>

            {/* Custom Quantity Picker */}
            {product.stock > 0 && (
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-border/50 bg-slate-50">
                <span className="text-xs font-bold text-muted">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 rounded-full bg-surface hover:bg-slate-100 border border-border/60 shadow-sm flex items-center justify-center text-xs font-bold hover:shadow transition disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-text w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 rounded-full bg-surface hover:bg-slate-100 border border-border/60 shadow-sm flex items-center justify-center text-xs font-bold hover:shadow transition disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
                className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
                  product.stock <= 0
                    ? "bg-slate-100 text-muted cursor-not-allowed border-none shadow-none"
                    : "bg-primary text-white hover:bg-primary-hover shadow-primary/10"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
              </Button>

              {product.stock > 0 && (
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] bg-secondary hover:bg-indigo-600 text-white shadow-secondary/10"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Buy Now</span>
                </button>
              )}
            </div>

            {/* Secure Payments text */}
            <div className="pt-2 text-center text-[10px] text-muted font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Customer Reviews Section (Bottom Area) */}
      <div id="reviews" className="mt-16 pt-12 border-t border-border/40">
        <h2 className="text-xl font-extrabold text-text mb-6">
          Customer Ratings & Reviews
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Rating Breakdown Bar Chart (4 Cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-text">{rating.toFixed(1)}</span>
              <span className="text-sm font-semibold text-muted">out of 5</span>
            </div>
            
            <div className="mb-2">
              {renderStars(rating, "w-5 h-5")}
              <p className="text-xs font-semibold text-muted mt-1.5">{reviewsCount} global ratings</p>
            </div>

            {/* Progress Bar Distribution */}
            <div className="space-y-2 mt-4 max-w-sm">
              {Object.entries(ratingPercentages)
                .reverse()
                .map(([star, percent]) => (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <button className="font-semibold text-primary hover:underline w-10 text-left">
                      {star} star
                    </button>
                    <div className="flex-1 h-3 rounded bg-slate-100 overflow-hidden border border-border/30">
                      <div
                        className="h-full bg-brand-amber rounded transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-muted font-bold w-8 text-right">{percent}%</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Customer Reviews List (8 Cols) */}
          <div className="md:col-span-8 space-y-6">
            <h3 className="text-base font-bold text-text pb-2 border-b border-border/40">
              Top Reviews from India
            </h3>

            <div className="space-y-6 division-y division-border/40">
              {[
                {
                  author: "Rajesh Kumar",
                  stars: 5,
                  title: "Absolutely worth the price!",
                  date: "June 12, 2026",
                  text: "Build quality is top notch. Visual styles are premium, and keys feel extremely tactile. Highly recommend purchasing this if you are a coder or developer.",
                },
                {
                  author: "Siddharth S.",
                  stars: 4,
                  title: "Great product, solid construction",
                  date: "May 28, 2026",
                  text: "Exceeded my expectations. Packaging was safe, and shipping was prompt. Very premium feel. Only minor issue is the cord layout could be a bit cleaner.",
                },
                {
                  author: "Nisha J.",
                  stars: 4,
                  title: "Decent performance, very pretty",
                  date: "May 04, 2026",
                  text: "Looks exactly like the product photos. Color scheme and aesthetics fit my room setup perfectly. Smooth interactions.",
                },
              ].map((rev, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {rev.author[0]}
                    </div>
                    <span className="text-xs font-bold text-text">{rev.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStars(rev.stars, "w-3.5 h-3.5")}
                    <span className="text-xs font-bold text-text">{rev.title}</span>
                  </div>

                  <p className="text-[10px] text-muted font-semibold">
                    Reviewed in India on {rev.date} <span className="text-brand-discount/80 font-bold ml-1.5">• Verified Purchase</span>
                  </p>

                  <p className="text-xs text-muted leading-relaxed">
                    {rev.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
