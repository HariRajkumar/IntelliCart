import { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../context/AuthContext";
import { sendMessage, getChatHistory, clearChatHistory } from "../services/chatService";

const Chatbot = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // States
  const [botMessages, setBotMessages] = useState([
    {
      sender: "bot",
      text: "### Welcome to IntelliCart AI Concierge! 👋\n\nI can help you browse our product catalog, find technical specifications, list active store categories, check your cart status, or review order history. \n\n*Try asking me details like:* \n* `Show me mechanical keyboards under Rs. 10000`\n* `Are there any headphones in the store?`\n* `Show my recent orders` \n\nWhat can I assist you with today?",
    }
  ]);
  const [botInput, setBotInput] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Guard routing: redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to use the AI chatbot");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch Chat History on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (isAuthenticated) {
        try {
          const history = await getChatHistory();
          if (history && history.length > 0) {
            setBotMessages(
              history.map((msg) => ({
                sender: msg.role === "user" ? "user" : "bot",
                text: msg.content,
              }))
            );
          }
        } catch (err) {
          console.error("Failed to load chat history:", err);
        }
      }
    };
    fetchHistory();
  }, [isAuthenticated]);

  // Scroll chat messages to the bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages, botLoading]);

  // Custom Markdown parser supporting bolding, headers, lists, tables, links, and absolute images
  const parseMarkdown = (text) => {
    if (!text) return "";
    let html = text;

    // Escape basic HTML tag indicators to prevent injection
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Helper to resolve media URLs (relative /uploads -> absolute backend URL)
    const resolveUrl = (url) => {
      if (url.startsWith("/uploads")) {
        return `${import.meta.env.VITE_BACKEND_URL}${url}`;
      }
      return url;
    };

    // 1. Linked Images: [![alt](img_url)](link_url)
    html = html.replace(/\[\!\[(.*?)\]\((.*?)\)\]\((.*?)\)/g, (match, alt, imgUrl, linkUrl) => {
      const fullImgUrl = resolveUrl(imgUrl);
      const fullLinkUrl = resolveUrl(linkUrl);
      return `<div class="my-4 text-center"><a href="${fullLinkUrl}" target="_blank" rel="noopener noreferrer" class="inline-block group"><img src="${fullImgUrl}" alt="${alt}" class="max-h-52 mx-auto rounded-2xl shadow-xl object-contain border border-slate-800/80 group-hover:scale-[1.02] group-hover:border-primary/50 transition-all duration-300" /></a></div>`;
    });

    // 2. Standard Images: ![alt](img_url)
    html = html.replace(/\!\[(.*?)\]\((.*?)\)/g, (match, alt, imgUrl) => {
      const fullImgUrl = resolveUrl(imgUrl);
      return `<div class="my-4 text-center"><img src="${fullImgUrl}" alt="${alt}" class="max-h-52 mx-auto rounded-2xl shadow-xl object-contain border border-slate-800/85" /></div>`;
    });

    // 3. Links: [text](link_url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, anchorText, linkUrl) => {
      const fullLinkUrl = resolveUrl(linkUrl);
      const isInternal = linkUrl.startsWith("/") && !linkUrl.startsWith("/uploads");
      if (isInternal) {
        return `<a href="${fullLinkUrl}" class="text-primary hover:text-primary-hover underline font-bold transition">${anchorText}</a>`;
      }
      return `<a href="${fullLinkUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-hover underline font-bold transition">${anchorText}</a>`;
    });

    // Bold **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-black text-white'>$1</strong>");

    // Bullet points * item -> <li>item</li>
    html = html.replace(/^\*\s+(.*?)$/gm, "<li class='list-disc list-inside text-slate-350 ml-2 my-1'>$1</li>");
    html = html.replace(/(<li class='list-disc.*?<\/li>)+/gs, "<ul class='my-2.5 space-y-1'>$&</ul>");

    // Headings ### title
    html = html.replace(/^###\s+(.*?)$/gm, '<h3 class="text-lg font-black mt-4 mb-2 text-white border-b border-slate-800/60 pb-1">$1</h3>');
    html = html.replace(/^####\s+(.*?)$/gm, '<h4 class="text-sm font-bold mt-3 mb-1.5 text-slate-200">$1</h4>');

    // Code blocks `code`
    html = html.replace(/`(.*?)`/g, "<code class='bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[11px] text-pink-400 font-mono'>$1</code>");

    // Tables parsing:
    // | Col 1 | Col 2 |
    // | --- | --- |
    // | Val 1 | Val 2 |
    const lines = html.split("\n");
    let inTable = false;
    let tableHtml = "";
    let newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="overflow-x-auto my-4 shadow-xl border border-slate-800/80 rounded-2xl"><table class="min-w-full text-xs text-left border-collapse bg-slate-950/90 rounded-2xl overflow-hidden">';
        }
        
        const cells = line.split("|").slice(1, -1).map(c => c.trim());
        
        if (line.includes("---") || line.includes("===")) {
          continue;
        }
        
        if (tableHtml.includes("<thead>")) {
          tableHtml += '<tr class="border-b border-slate-900 hover:bg-slate-900/35 transition-colors">' + cells.map(c => `<td class="p-3 text-slate-300 font-medium">${c}</td>`).join('') + '</tr>';
        } else {
          tableHtml += '<thead class="bg-slate-900/85 font-extrabold text-slate-200 border-b border-slate-800"><tr>' + cells.map(c => `<th class="p-3 font-semibold text-white tracking-wider">${c}</th>`).join('') + '</tr></thead><tbody>';
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += "</tbody></table></div>";
          newLines.push(tableHtml);
          tableHtml = "";
        }
        newLines.push(line);
      }
    }
    if (inTable) {
      tableHtml += "</tbody></table></div>";
      newLines.push(tableHtml);
    }

    html = newLines.join("\n");
    
    // Paragraphs double newlines
    html = html.replace(/\n\n/g, "</p><p class='mt-2.5 text-slate-350'>");
    
    return `<p class='text-slate-300 leading-relaxed'>${html}</p>`;
  };

  // Bot Submit Handler
  const handleBotSubmit = async (e) => {
    e.preventDefault();
    if (!botInput.trim()) return;

    const userQuery = botInput;
    setBotInput("");
    setBotMessages((prev) => [...prev, { sender: "user", text: userQuery }]);
    setBotLoading(true);

    try {
      const data = await sendMessage(userQuery);
      setBotMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.response,
        }
      ]);
    } catch (err) {
      console.error(err);
      setBotMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "My neural link feels interrupted. Please verify your connection and try asking me again!"
        }
      ]);
    } finally {
      setBotLoading(false);
    }
  };

  // Pre-defined quick action click
  const handleQuickAction = (text) => {
    setBotInput(text);
  };

  // Clear History Handlers
  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = async () => {
    setShowClearConfirm(false);
    try {
      await clearChatHistory();
      setBotMessages([
        {
          sender: "bot",
          text: "### Welcome to IntelliCart AI Concierge! 👋\n\nI can help you browse our product catalog, find technical specifications, list active store categories, check your cart status, or review order history. \n\n*Try asking me details like:* \n* `Show me mechanical keyboards under Rs. 10000`\n* `Are there any headphones in the store?`\n* `Show my recent orders` \n\nWhat can I assist you with today?",
        }
      ]);
      toast.success("Chat history cleared");
    } catch (err) {
      console.error("Failed to clear chat history:", err);
      toast.error("Failed to clear chat history");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#03050d] text-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-start items-center font-sans">
      
      {/* Background neon mesh gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Side: System Metrics & Diagnostics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl space-y-6 text-left relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                ⚡
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">IntelliBot Workspace</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Neural Shopping</p>
              </div>
            </div>

            {/* Diagnostic Fields */}
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">System Diagnostics</span>
              
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-850/60 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">LLM Model:</span>
                  <span className="font-mono text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">Llama-3.1-8B</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Database:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    MongoDB Connected
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">User Scope:</span>
                  <span className={`font-black tracking-wider text-[10px] uppercase px-2 py-0.5 rounded ${
                    user?.role === "admin" 
                      ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                      : "bg-primary/10 border border-primary/20 text-primary"
                  }`}>
                    {user?.role || "customer"}
                  </span>
                </div>
              </div>
            </div>

            {/* Suggestions Panel */}
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Queries</span>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickAction("Do you have mechanical keyboards under Rs. 10000?")}
                  className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-900 border border-slate-850 hover:border-primary/40 p-3 rounded-2xl transition duration-200 text-slate-350 hover:text-white"
                >
                  ⌨️ Keyboards under ₹10k
                </button>
                <button
                  onClick={() => handleQuickAction("Show my recent orders")}
                  className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-900 border border-slate-850 hover:border-primary/40 p-3 rounded-2xl transition duration-200 text-slate-350 hover:text-white"
                >
                  📦 Check my recent orders
                </button>
                <button
                  onClick={() => handleQuickAction("What products do you have in Electronics?")}
                  className="w-full text-left text-xs bg-slate-950/40 hover:bg-slate-900 border border-slate-850 hover:border-primary/40 p-3 rounded-2xl transition duration-200 text-slate-350 hover:text-white"
                >
                  🔌 Browse Electronics
                </button>
              </div>
            </div>

            {/* Wipe Action */}
            <button
              onClick={handleClearHistory}
              className="w-full bg-slate-950/60 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-bold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 relative z-10"
            >
              🗑️ Clear Chat History
            </button>

          </div>
        </div>

        {/* Right Side: Interactive Chat Panel */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl space-y-6 flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 text-left relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg border border-white/5">
                🤖
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">IntelliBot Concierge</h4>
                <p className="text-[10px] text-slate-500 font-medium">Understands intent, queries databases, formats answers</p>
              </div>
            </div>

            {/* Messages container - scrollable with absolute height limit */}
            <div className="h-[480px] overflow-y-auto pr-2 space-y-4 text-left scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-10">
              {botMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs border ${
                    msg.sender === "user" 
                      ? "bg-slate-950 border-primary/20 text-primary font-bold uppercase" 
                      : "bg-slate-900 border-slate-800 text-slate-350"
                  }`}>
                    {msg.sender === "user" ? (user?.full_name?.charAt(0) || "U") : "🤖"}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-2xl shadow-md ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-tr from-primary to-indigo-600 border border-white/10 rounded-tr-none text-white" 
                      : "bg-slate-950/80 border border-slate-850/60 rounded-tl-none"
                  }`}>
                    <div 
                      className="prose prose-invert max-w-none text-[13px] leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                    />
                  </div>
                </div>
              ))}

              {botLoading && (
                <div className="flex gap-3 mr-auto items-center">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-xs">
                    🤖
                  </div>
                  <div className="bg-slate-950/80 border border-slate-850/60 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Action Form */}
            <form onSubmit={handleBotSubmit} className="flex gap-3 pt-4 border-t border-slate-800 relative z-10">
              <input
                type="text"
                placeholder="Ask about products, orders, cart status..."
                value={botInput}
                disabled={botLoading}
                onChange={(e) => setBotInput(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-slate-850 text-xs rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition disabled:opacity-50 placeholder-slate-500 font-medium"
              />
              <button
                type="submit"
                disabled={botLoading}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-500 flex items-center justify-center text-white transition-all disabled:opacity-50 shadow-lg shadow-primary/10 hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </form>

          </div>
        </div>

      {/* Custom Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-red-500/10 blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-lg">
                ⚠️
              </div>
              <h3 className="font-extrabold text-base text-white">Wipe Chat Context?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              This will permanently delete all stored chat history and message logs from MongoDB. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-350 text-xs font-bold py-3 rounded-2xl transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearHistory}
                className="flex-1 bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-xs font-bold py-3 rounded-2xl transition duration-200 shadow-lg shadow-red-500/10"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default Chatbot;
