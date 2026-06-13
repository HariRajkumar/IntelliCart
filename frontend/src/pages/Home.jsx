import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

const HERO_SLIDES = [
  {
    title: "AI-Curated Shopping Experience",
    subtitle: "Experience IntelliCart, the next-gen marketplace. Use our interactive AI assistant below to instantly find products that match your lifestyle.",
    btnText: "Meet IntelliBot",
    btnLink: "#intellibot",
    badge: "AI Powered",
    gradient: "from-slate-950 via-indigo-950 to-slate-900",
    visualType: "ai",
  },
  {
    title: "High-Performance Workspaces",
    subtitle: "Upgrade your productivity with mechanical RGB keyboards, ergonomic setups, and cutting-edge tech accessories.",
    btnText: "Explore Electronics",
    btnLink: "/products?category=Electronics",
    badge: "Featured Tech",
    gradient: "from-slate-900 via-blue-950 to-slate-950",
    visualType: "keyboard",
  },
  {
    title: "Premium Comfort & Style",
    subtitle: "Redefine your lifestyle with high-quality casual wear, cozy furniture, and curated home essentials.",
    btnText: "Browse Collection",
    btnLink: "/products",
    badge: "Lifestyle Deals",
    gradient: "from-slate-900 via-stone-900 to-zinc-950",
    visualType: "lifestyle",
  }
];

const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes("elect")) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (name.includes("cloth") || name.includes("apparel") || name.includes("fashion")) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 4H8m0 0L4 7v13a2 2 0 002 2h12a2 2 0 002-2V7l-4-3zm-4 4h.01M9 16h6" />
      </svg>
    );
  }
  if (name.includes("book")) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  }
  if (name.includes("furnit")) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4M4 11h16M4 15h12M4 19h8" />
      </svg>
    );
  }
  if (name.includes("kitchen") || name.includes("home")) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    );
  }
  if (name.includes("access")) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (name.includes("bag")) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // States
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [selectedProductTab, setSelectedProductTab] = useState("All");

  // Bot states
  const [botMessages, setBotMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm IntelliBot, your AI Shopping Assistant. Tell me what you're looking for or describe your needs (e.g., 'I need a fast gaming laptop' or 'Show me shirts'), and I will find the best matches for you!",
    }
  ]);
  const [botInput, setBotInput] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Load Categories & Initial Products
  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingCategories(true);
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const loadTabProducts = async () => {
      try {
        setLoadingProducts(true);
        const queryParams = {
          limit: 8,
          page: 1,
        };
        if (selectedProductTab !== "All") {
          queryParams.category = selectedProductTab;
        }
        const data = await getProducts(queryParams);
        setProducts(data.items || []);
      } catch (err) {
        console.error("Failed to load products for tab:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadTabProducts();
  }, [selectedProductTab]);

  // Autoplay Hero Banner Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Scroll bot conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages, botLoading]);

  // Bot Submit Handler
  const handleBotSubmit = async (e) => {
    e.preventDefault();
    if (!botInput.trim()) return;

    const userQuery = botInput;
    setBotInput("");
    setBotMessages((prev) => [...prev, { sender: "user", text: userQuery }]);
    setBotLoading(true);

    try {
      const data = await getProducts({ search: userQuery, limit: 3 });
      
      setTimeout(() => {
        setBotLoading(false);
        if (data.items && data.items.length > 0) {
          setBotMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `I've scanned IntelliCart database and found ${data.items.length} great match(es) for "${userQuery}":`,
              products: data.items,
            }
          ]);
        } else {
          setBotMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `I couldn't find any products matching "${userQuery}" directly. Here are some terms you could try: "Keyboard", "Laptop", "Smartphone", "T-Shirt", or "Book".`,
              suggestions: ["Keyboard", "Laptop", "Smartphone", "T-Shirt", "Book"]
            }
          ]);
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setBotLoading(false);
        setBotMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "My neural link feels interrupted. Please verify your connection and try asking me again!"
          }
        ]);
      }, 800);
    }
  };

  const handleSuggestionClick = (query) => {
    setBotInput(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* 1. HERO CAROUSEL */}
      <section className="relative overflow-hidden w-full h-[540px] md:h-[580px] bg-slate-950">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentHeroSlide;
          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full flex flex-col justify-center transition-all duration-1000 ease-in-out bg-gradient-to-br ${slide.gradient} ${
                isActive ? "opacity-100 translate-x-0 z-10 animate-fade-in-up" : "opacity-0 translate-x-12 z-0 pointer-events-none"
              }`}
            >
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                
                {/* Text Content */}
                <div className="lg:col-span-7 text-left space-y-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary/20 text-indigo-300 border border-primary/30">
                    {slide.badge}
                  </span>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    {slide.btnLink.startsWith("#") ? (
                      <a
                        href={slide.btnLink}
                        className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5 text-center"
                      >
                        {slide.btnText}
                      </a>
                    ) : (
                      <Link
                        to={slide.btnLink}
                        className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5 text-center"
                      >
                        {slide.btnText}
                      </Link>
                    )}
                    <Link
                      to="/products"
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-8 py-3.5 rounded-full font-bold backdrop-blur-sm transition-all duration-300 text-center"
                    >
                      Shop All
                    </Link>
                  </div>
                </div>

                {/* Decorative Visual Content */}
                <div className="hidden lg:col-span-5 lg:flex justify-center items-center">
                  {slide.visualType === "ai" && (
                    <div className="relative w-80 h-80 flex items-center justify-center animate-float">
                      {/* Outer Ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '30s' }}></div>
                      {/* Pulse Circle */}
                      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 blur-2xl animate-pulse-glow"></div>
                      {/* Glass Card */}
                      <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl text-center space-y-4 max-w-xs">
                        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg">IntelliBot AI</h3>
                        <p className="text-slate-400 text-sm">Natural language shopping assistant finds perfect deals instantly.</p>
                      </div>
                    </div>
                  )}

                  {slide.visualType === "keyboard" && (
                    <div className="relative w-80 h-80 flex items-center justify-center animate-float">
                      <div className="absolute w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse-glow"></div>
                      <div className="relative z-10 p-6 rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md shadow-2xl space-y-3 transform rotate-6 hover:rotate-0 transition-all duration-500">
                        <div className="flex gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="w-64 h-28 rounded-lg bg-slate-950 p-2 flex flex-col justify-between border border-slate-800">
                          <div className="grid grid-cols-6 gap-1.5">
                            {[...Array(18)].map((_, i) => (
                              <div key={i} className={`h-4 rounded-sm ${i % 3 === 0 ? 'bg-primary' : 'bg-slate-800'}`}></div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>Mechanical Core</span>
                            <span className="text-emerald-400">● RGB Active</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold text-sm">Pro Mechanical Keyboard</p>
                          <p className="text-primary text-xs font-semibold">₹12,499.00</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {slide.visualType === "lifestyle" && (
                    <div className="relative w-80 h-80 flex items-center justify-center animate-float">
                      <div className="absolute w-64 h-64 rounded-full bg-amber-500/15 blur-3xl animate-pulse-glow"></div>
                      <div className="relative z-10 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl text-left space-y-4 transform -rotate-3 hover:rotate-0 transition-all duration-500">
                        <span className="text-amber-400 font-extrabold text-sm uppercase tracking-wider">Premium Essentials</span>
                        <h4 className="text-white text-2xl font-black">Modern Lounge & Study Chair</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <span className="text-slate-400 text-xs">(48 reviews)</span>
                        </div>
                        <p className="text-slate-300 font-semibold text-lg">₹8,999.00</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {/* Carousel Dots Indicators */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                idx === currentHeroSlide ? "bg-white scale-125 shadow-md shadow-white/30" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. CATEGORY BAR */}
      <section className="py-12 bg-surface border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-text">Explore Categories</h2>
            <p className="text-muted mt-1 text-sm md:text-base">Find what you need with categories tailored to your style.</p>
          </div>
          
          {loadingCategories ? (
            <div className="flex justify-center py-6">
              <div className="flex space-x-2 animate-pulse">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-background border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300 mb-3 shadow-inner">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="font-semibold text-sm text-text text-center group-hover:text-primary transition-colors duration-200">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. DYNAMIC PRODUCTS TABS */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="text-left">
              <h2 className="text-3xl font-extrabold tracking-tight text-text">Trending Products</h2>
              <p className="text-muted mt-1 text-sm">Our most popular products updated in real-time.</p>
            </div>
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedProductTab("All")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  selectedProductTab === "All"
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                    : "bg-surface border-border text-muted hover:text-text hover:border-slate-400"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedProductTab(cat.name)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    selectedProductTab === cat.name
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                      : "bg-surface border-border text-muted hover:text-text hover:border-slate-400"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl p-4 border border-border/50 space-y-4 animate-pulse">
                  <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="group">
                  <Card className="p-4 rounded-2xl bg-surface border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 flex flex-col justify-between h-full">
                    <div>
                      <div className="overflow-hidden rounded-xl bg-slate-100 relative mb-4">
                        <img
                          src={
                            product.images?.[0]
                              ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0]}`
                              : "https://placehold.co/400x300"
                          }
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-muted text-sm mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-lg text-text">
                          ₹{product.price.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-muted">
                          Stock: {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
                        </p>
                      </div>
                      <span className="w-9 h-9 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border p-6">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
              <h3 className="text-lg font-bold text-text">No products found</h3>
              <p className="text-muted text-sm mt-1">We don't have items in this category currently. Check again soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. APPLE STYLE PROMO BANNER GRID */}
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden flex flex-col justify-between h-[360px] shadow-xl group border border-slate-800">
            {/* Mesh glow background */}
            <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="space-y-3 relative z-10 max-w-sm">
              <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-widest">Intelligent Search</span>
              <h3 className="text-3xl font-black tracking-tight leading-tight">Shopping Redefined with AI</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Describe the vibe, budget, or specifications you desire. Talk to our assistant below to filter our database instantly.
              </p>
            </div>

            <div className="relative z-10">
              <a
                href="#intellibot"
                className="inline-flex items-center gap-2 bg-white text-slate-950 font-bold px-6 py-2.5 rounded-full hover:bg-slate-200 transition-colors shadow-md text-sm"
              >
                <span>Activate Assistant</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-slate-100 text-slate-950 relative overflow-hidden flex flex-col justify-between h-[360px] shadow-lg group border border-slate-200">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>

            <div className="space-y-3 relative z-10 max-w-sm">
              <span className="text-xs uppercase font-extrabold text-primary tracking-widest">Summer Specials</span>
              <h3 className="text-3xl font-black tracking-tight leading-tight">Elite Workspace Gear Up to 30% Off</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Premium mechanical keyboards, dual laptops, and accessories. Premium tactile feedback, premium aesthetic.
              </p>
            </div>

            <div className="relative z-10">
              <Link
                to="/products?category=Electronics"
                className="inline-flex items-center gap-2 bg-slate-950 text-white font-bold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-colors shadow-md text-sm"
              >
                <span>Shop Tech Deal</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE INTELLIBOT ASSISTANT - IN CONSTRUCTION */}
      <section id="intellibot" className="py-20 bg-slate-950 text-white border-t border-b border-slate-900 relative overflow-hidden">
        {/* Glow backgrounds */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Side: Info & Launch Alerts */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Under Construction</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              IntelliBot AI <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Available Soon
              </span>
            </h2>
            
            <p className="text-slate-400 leading-relaxed font-normal text-base">
              We are currently fine-tuning our next-generation conversational shopping assistant. 
              Soon, you'll be able to search our entire catalog dynamically using natural language, 
              compare products side-by-side, and check out instantly with personalized recommendations.
            </p>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                <span className="text-sm text-slate-300">Semantic Search API</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                <span className="text-sm text-slate-300">Catalog Synchronization</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold">⚙</span>
                <span className="text-sm text-slate-300">Model Training (92%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold">⚙</span>
                <span className="text-sm text-slate-300">Beta Testing Phase</span>
              </div>
            </div>

            {/* Notify Form */}
            <div className="pt-4 border-t border-slate-900">
              {notifySuccess ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 animate-fade-in-up">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-bold text-sm">You're on the list!</p>
                    <p className="text-xs text-emerald-500/80">We'll email you at {notifyEmail} when IntelliBot goes live.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Get notified on launch:</p>
                  <form 
                    onSubmit={(e) => { 
                      e.preventDefault(); 
                      if (notifyEmail.trim()) setNotifySuccess(true); 
                    }} 
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-sm rounded-full px-5 py-3 w-full text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-3 rounded-full transition shadow-lg shadow-primary/20 whitespace-nowrap"
                    >
                      Notify Me
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Futuristic Glassmorphic Mock Mockup */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md flex flex-col h-[420px] justify-between p-6 group">
              
              {/* Blur/Dim Overlay for Under Construction */}
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center p-8 text-center transition-all duration-500 group-hover:backdrop-blur-[2px]">
                {/* Glowing Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg border border-white/10 animate-float">
                    <svg className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '12s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                <h4 className="font-extrabold text-xl text-white tracking-wide uppercase">Engine Offline</h4>
                <p className="text-slate-300 text-sm max-w-sm mt-2 leading-relaxed">
                  Integrating real-time product parsing & neural matching. Stay tuned!
                </p>
                
                {/* Visual Progress Bar */}
                <div className="w-64 bg-slate-900 border border-slate-800 rounded-full h-3.5 mt-6 overflow-hidden relative">
                  <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full w-[92%] animate-pulse"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white tracking-wider">92% SYNCED</span>
                </div>
              </div>

              {/* Mock Chat UI Behind the overlay */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 opacity-30 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">IntelliBot Assistant</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">Offline</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 py-4 space-y-4 opacity-20 select-none">
                <div className="bg-slate-800/50 p-3.5 rounded-2xl rounded-bl-none text-sm max-w-[80%] text-left">
                  Hello! How can I assist you with shopping today?
                </div>
                <div className="bg-primary/50 p-3.5 rounded-2xl rounded-br-none text-sm max-w-[80%] ml-auto text-left">
                  I need a mechanical keyboard under ₹15,000.
                </div>
              </div>

              <div className="flex gap-2 opacity-30 select-none">
                <div className="flex-1 bg-slate-800 text-sm rounded-full px-4 py-2.5">Type here...</div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-xs">▶</div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. TRUST BENEFITS GRID */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Benefit 1 */}
            <div className="flex gap-4 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-text">Free Shipping Over ₹500</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Automatic savings at checkout. Delivered securely to your doorstep within days.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-text">AI Shopper Assistant</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  IntelliBot parses our database immediately based on descriptive cues to find your match.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-4 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-text">100% Secure Checkout</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Full SSL encryption ensuring your card and credentials are never stored insecurely.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex gap-4 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-text">Hassle-Free Returns</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Simple 7-day refund policy. Drop it back and we process the refund directly to your account.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PREMIUM FOOTER */}
      <footer className="mt-auto bg-slate-950 text-white border-t border-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-black text-white hover:opacity-90">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>IntelliCart</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              IntelliCart is an AI-powered next-generation e-commerce shopping sandbox designed for high-end digital curations, responsive client interactions, and lightning-fast checkouts.
            </p>
          </div>

          {/* Col 2: Categories Shortcuts */}
          <div className="space-y-4 text-left">
            <h5 className="font-bold text-sm text-slate-300 uppercase tracking-widest">Shop Categories</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="hover:text-white transition">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="hover:text-white transition font-semibold">
                  All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-4 text-left">
            <h5 className="font-bold text-sm text-slate-300 uppercase tracking-widest">Customer Center</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/cart" className="hover:text-white transition">
                  My Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Login Access
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-4 text-left">
            <h5 className="font-bold text-sm text-slate-300 uppercase tracking-widest">Keep Updated</h5>
            <p className="text-slate-400 text-xs leading-relaxed">
              Subscribe to get notified about our premium tech drops and seasonal AI selections.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="bg-slate-900 border border-slate-800 text-xs rounded-full px-4 py-2 w-full text-white focus:outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-full transition"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} IntelliCart Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Terms of Use</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Sales Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;