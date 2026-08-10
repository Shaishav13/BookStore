import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthProvider";
import {
  FiArrowLeft, FiTablet, FiBook, FiGlobe, FiCreditCard,
  FiBookmark, FiSettings, FiMinus, FiPlus, FiSun, FiMoon,
  FiX, FiList, FiMaximize2, FiMinimize2, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const stripePromise = loadStripe("pk_test_51SNo5JPgn4fVebeOZnUCBFWEsyv6ftDkye4mQqPxesrGRmSBe4gVxFziKgUvnUqT3Lgfufvj6Jh8ARC1ACklfq7E00AXOuhdaN");

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: { color: "#1f2937", fontSize: "15px", "::placeholder": { color: "#9ca3af" } },
    invalid: { color: "#ef4444" },
  },
};

// ── Stripe checkout form ────────────────────────────────────────────────
function EBookCheckoutForm({ ebook, userId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState("card"); // 'card' | 'upi'
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");

  useEffect(() => {
    if (!ebook?._id) return;
    axios.post(`${API_URL}/ebook/payment-intent`, { ebookId: ebook._id })
      .then(r => setClientSecret(r.data.clientSecret))
      .catch(() => toast.error("Failed to initialize payment."));
  }, [ebook]);

  // ── Card ──
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });
    if (error) { toast.error("Payment failed: " + error.message); setLoading(false); return; }
    try {
      await axios.post(`${API_URL}/ebook/purchase`, { userId, ebookId: ebook._id, paymentIntentId: paymentIntent.id });
      toast.success("eBook purchased! Happy reading 📖");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed.");
      setLoading(false);
    }
  };

  // ── UPI ──
  const validateUpi = (id) => /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(id);

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!validateUpi(upiId)) { setUpiError("Enter a valid UPI ID (e.g. name@upi)"); return; }
    setUpiError("");
    setLoading(true);
    try {
      toast('📱 Simulating UPI approval...', { icon: '⏳', duration: 2000 });
      await new Promise(r => setTimeout(r, 2000));

      await axios.post(`${API_URL}/ebook/purchase-upi`, {
        userId, ebookId: ebook._id, upiId,
      });
      toast.success("eBook purchased via UPI! Happy reading 📖");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "UPI payment failed.");
      setLoading(false);
    }
  };

  const canPay = !!stripe && !!clientSecret;

  return (
    <div className="space-y-4">
      {/* ── Tabs ── */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-600 rounded-xl">
        <button type="button" onClick={() => setPayMethod("card")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${payMethod === "card" ? "bg-white dark:bg-slate-800 text-pink-600 shadow-sm" : "text-gray-500 dark:text-gray-400"
            }`}>
          💳 Card
        </button>
        <button type="button" onClick={() => setPayMethod("upi")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${payMethod === "upi" ? "bg-white dark:bg-slate-800 text-pink-600 shadow-sm" : "text-gray-500 dark:text-gray-400"
            }`}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 w-auto" />
          UPI
        </button>
      </div>

      {/* ── Card form ── */}
      {payMethod === "card" && (
        <form onSubmit={handleCardSubmit} className="space-y-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wide">Card Details</p>
            <CardElement options={CARD_OPTIONS} />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2.5">
            <p className="text-xs text-blue-600 dark:text-blue-300">
              🧪 Test: <span className="font-mono font-bold">4242 4242 4242 4242</span> · Any future date · Any CVC
            </p>
          </div>
          <button type="submit" disabled={!canPay || loading}
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${!canPay || loading ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 shadow-md active:scale-95"
              }`}>
            <FiCreditCard size={18} />
            {loading ? "Processing..." : `Pay ₹${ebook?.price} with Card`}
          </button>
        </form>
      )}

      {/* ── UPI form ── */}
      {payMethod === "upi" && (
        <form onSubmit={handleUpiSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => { setUpiId(e.target.value); setUpiError(""); }}
              placeholder="yourname@upi  or  number@paytm"
              className={`w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${upiError ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-slate-600 focus:ring-pink-400"
                }`}
            />
            {upiError && <p className="text-xs text-red-500 mt-1">⚠ {upiError}</p>}
            <p className="text-xs text-gray-400 mt-1">Supported: GPay, PhonePe, Paytm, BHIM, and all UPI apps</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { name: "GPay", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" },
              { name: "PhonePe", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.png/800px-PhonePe_Logo.png" },
              { name: "Paytm", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" },
              { name: "BHIM", src: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/BHIM_logo.png/220px-BHIM_logo.png" },
            ].map(app => (
              <div key={app.name} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                <img src={app.src} alt={app.name} className="h-4 w-auto object-contain" onError={e => { e.target.style.display = "none"; }} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{app.name}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-2.5">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              📱 After clicking Pay, approve the request in your UPI app within 2 minutes.
            </p>
          </div>

          <button type="submit" disabled={loading || !upiId}
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${loading || !upiId ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 shadow-md active:scale-95"
              }`}>
            {loading ? "Processing UPI payment..." : `Pay ₹${ebook?.price} with UPI`}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        🔒 Secure & encrypted payment powered by Stripe
      </p>
    </div>
  );
}

// ── Themes ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: { bg: "#0f1117", surface: "#1a1d27", toolbar: "#13161f", text: "#e2e8f0", sub: "#94a3b8", border: "#2d3148", accent: "#a78bfa", name: "Dark" },
  sepia: { bg: "#f4ede1", surface: "#ede3d5", toolbar: "#e0d5c3", text: "#3d2b1f", sub: "#7c6350", border: "#c8b89a", accent: "#b5683e", name: "Sepia" },
  light: { bg: "#f8fafc", surface: "#ffffff", toolbar: "#f1f5f9", text: "#1e293b", sub: "#64748b", border: "#e2e8f0", accent: "#6d28d9", name: "Light" },
};

// ── PDF.js worker — served locally via Vite (no CDN, no CORS) ──────────
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// ── In-browser reader (react-pdf powered) ──────────────────────────────
function EBookReader({ ebook, onClose }) {
  const storageKey = `reader_${ebook._id}`;
  const persist = (key, val) =>
    localStorage.setItem(`${storageKey}_${key}`, typeof val === "object" ? JSON.stringify(val) : String(val));

  // Persisted prefs
  const [theme, setTheme]         = useState(() => localStorage.getItem(`${storageKey}_theme`) || "dark");
  const [scale, setScale]         = useState(() => Number(localStorage.getItem(`${storageKey}_scale`)) || 1.2);
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem(`${storageKey}_bm`) || "[]"));
  // progress: 0–100. With react-pdf = currentPage/numPages; with iframe fallback = user scroll.
  const [progress, setProgress]   = useState(() => Number(localStorage.getItem(`${storageKey}_prog`) || 0));

  // PDF state — skip react-pdf entirely for non-PDF URLs (HTML, EPUB, etc.)
  const isPdfUrl = /\.pdf(\?|$)/i.test(ebook.pdfUrl || "");
  const [numPages, setNumPages]   = useState(null);
  const [useIframe, setUseIframe] = useState(!isPdfUrl); // true = iframe, false = react-pdf
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Number(localStorage.getItem(`${storageKey}_page`) || 1)));

  const [showSettings, setShowSettings]   = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [bookmarkNote, setBookmarkNote]   = useState("");
  const [addingNote, setAddingNote]       = useState(false);

  const iframeScrollRef = useRef(null);
  const pageRefs = useRef({});
  const t = THEMES[theme];

  const displayProgress = numPages ? Math.round((currentPage / numPages) * 100) : progress;

  const changeScale = (v) => {
    const c = Math.min(2.5, Math.max(0.6, Math.round(v * 10) / 10));
    setScale(c); persist("scale", c);
  };

  const changeTheme = (v) => { setTheme(v); persist("theme", v); };

  const goToPage = useCallback((p) => {
    const target = Math.min(Math.max(1, p), numPages || 1);
    setCurrentPage(target);
    persist(`${storageKey}_page`, target);
    pageRefs.current[target]?.scrollIntoView({ behavior: "smooth", block: "start" });
    const pct = numPages ? Math.round((target / numPages) * 100) : 0;
    setProgress(pct); persist("prog", pct);
  }, [numPages, storageKey]);

  // ── Manual progress slider (fallback mode) ──
  // Since we cannot track the inner scroll of a cross-origin iframe, we provide a manual slider.
  const changeProgress = (raw) => {
    const val = Number(raw);
    setProgress(val);
    persist("prog", val);
  };

  const addBookmark = () => {
    let livePct = progress;
    const label = bookmarkNote.trim() || (numPages ? `Page ${currentPage}` : `${livePct}% read`);
    const bm = {
      id: Date.now(),
      page: (!useIframe && numPages) ? currentPage : null,
      pct: livePct,
      note: label,
      createdAt: new Date().toLocaleString(),
    };
    const updated = [bm, ...bookmarks].slice(0, 20);
    setBookmarks(updated); persist("bm", updated);
    setBookmarkNote(""); setAddingNote(false);
    toast.success("Bookmark saved!", { icon: "🔖" });
  };

  const removeBookmark = (id) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated); persist("bm", updated);
  };

  const jumpToBookmark = (bm) => {
    if (!useIframe && bm.page && numPages) {
      // react-pdf mode: scroll to the exact page
      goToPage(bm.page);
    } else {
      // iframe mode: since we can't scroll the native viewer, just update the progress state
      // so the user remembers where they were.
      setProgress(bm.pct);
      persist("prog", bm.pct);
      toast(`Moved to ~${bm.pct}% — please scroll the PDF to your position`, { icon: "🔖", duration: 4000 });
    }
    setShowBookmarks(false);
  };

  // ── Intersection observer — track currentPage as user scrolls (react-pdf mode) ──
  useEffect(() => {
    if (!numPages || useIframe) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const p = Number(e.target.dataset.page);
          if (p) {
            setCurrentPage(p);
            persist(`${storageKey}_page`, p);
            const pct = Math.round((p / numPages) * 100);
            setProgress(pct); persist("prog", pct);
          }
        }
      });
    }, { threshold: 0.5 });
    Object.values(pageRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [numPages, useIframe, storageKey]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") { if (showSettings) setShowSettings(false); else if (showBookmarks) setShowBookmarks(false); else onClose(); }
      if (e.altKey && e.key === "b") setAddingNote(v => !v);
      if (!useIframe) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") goToPage(currentPage + 1);
        if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goToPage(currentPage - 1);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [showSettings, showBookmarks, currentPage, goToPage, useIframe]);

  // ── Fullscreen ──
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: t.bg, color: t.text, fontFamily: "'Inter',sans-serif" }}>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: t.border }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: `linear-gradient(90deg,${t.accent},#f472b6)` }} />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0" style={{ background: t.toolbar, borderColor: t.border }}>

        {/* Close + title */}
        <button onClick={onClose} className="p-1.5 rounded-lg flex-shrink-0 hover:scale-110 transition-all" style={{ color: t.sub, background: `${t.accent}20` }} title="Close (Esc)">
          <FiArrowLeft size={18} />
        </button>
        <div className="min-w-0 mr-2">
          <p className="font-bold text-xs truncate" style={{ color: t.text }}>{ebook.name}</p>
          <p className="text-xs truncate" style={{ color: t.sub }}>by {ebook.author}</p>
        </div>

        {/* Page nav — only meaningful in react-pdf mode */}
        {!useIframe ? (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border flex-shrink-0" style={{ borderColor: t.border, background: t.surface }}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} className="p-1 rounded hover:opacity-70 disabled:opacity-30 transition" style={{ color: t.sub }}>
            <FiChevronUp size={13} />
          </button>
          <input
            type="number" min={1} max={numPages || 1}
            value={isNaN(currentPage) ? 1 : currentPage}
            onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) goToPage(v); }}
            className="w-10 text-center text-xs font-mono font-bold bg-transparent outline-none"
            style={{ color: t.text }}
          />
          <span className="text-xs" style={{ color: t.sub }}>/ {numPages || "—"}</span>
          <button onClick={() => goToPage(currentPage + 1)} disabled={!numPages || currentPage >= numPages} className="p-1 rounded hover:opacity-70 disabled:opacity-30 transition" style={{ color: t.sub }}>
            <FiChevronDown size={13} />
          </button>
        </div>
        ) : (
          /* Manual progress scrubber for iframe mode */
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs mx-4">
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: t.accent }}>📖 {progress}%</span>
            <input
              type="range" min={0} max={100} value={progress}
              onChange={e => changeProgress(e.target.value)}
              title="Drag to save your reading position (cross-origin PDFs can't track scroll automatically)"
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: t.accent, background: `linear-gradient(to right, ${t.accent} ${progress}%, ${t.border} ${progress}%)` }}
            />
          </div>
        )}

        {/* Progress badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0" style={{ background: `${t.accent}25`, color: t.accent }}>
          📖 {displayProgress}%
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border flex-shrink-0" style={{ borderColor: t.border, background: t.surface }}>
          <button onClick={() => changeScale(scale - 0.1)} className="p-1 rounded hover:opacity-70 transition" style={{ color: t.sub }} title="Zoom out">
            <FiMinus size={12} />
          </button>
          <span className="text-xs font-mono w-10 text-center font-bold" style={{ color: t.text }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => changeScale(scale + 0.1)} className="p-1 rounded hover:opacity-70 transition" style={{ color: t.sub }} title="Zoom in">
            <FiPlus size={12} />
          </button>
        </div>

        {/* Bookmark add */}
        <button onClick={() => setAddingNote(v => !v)} className="p-2 rounded-lg transition-all hover:scale-110" style={{ color: addingNote ? t.accent : t.sub, background: addingNote ? `${t.accent}25` : "transparent" }} title="Add bookmark (Alt+B)">
          <FiBookmark size={16} />
        </button>

        {/* Bookmarks list */}
        <button onClick={() => { setShowBookmarks(v => !v); setShowSettings(false); }} className="p-2 rounded-lg transition-all hover:scale-110 relative" style={{ color: showBookmarks ? t.accent : t.sub, background: showBookmarks ? `${t.accent}25` : "transparent" }} title="Bookmarks">
          <FiList size={16} />
          {bookmarks.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: t.accent, color: "#fff" }}>{bookmarks.length}</span>}
        </button>

        {/* Settings */}
        <button onClick={() => { setShowSettings(v => !v); setShowBookmarks(false); }} className="p-2 rounded-lg transition-all hover:scale-110" style={{ color: showSettings ? t.accent : t.sub, background: showSettings ? `${t.accent}25` : "transparent" }} title="Settings">
          <FiSettings size={16} />
        </button>

        {/* Fullscreen */}
        <button onClick={toggleFullscreen} className="hidden sm:flex p-2 rounded-lg hover:scale-110 transition-all" style={{ color: t.sub }}>
          {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
        </button>

        {/* Open in tab */}
        <a href={ebook.pdfUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition hover:opacity-80 flex-shrink-0" style={{ borderColor: t.border, color: t.sub, background: t.surface }}>
          <FiGlobe size={12} /> New Tab
        </a>
      </div>

      {/* ── Add bookmark bar ── */}
      {addingNote && (
        <div className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0" style={{ background: `${t.accent}15`, borderColor: t.border }}>
          <FiBookmark size={14} style={{ color: t.accent }} />
          <input autoFocus value={bookmarkNote} onChange={e => setBookmarkNote(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addBookmark(); if (e.key === "Escape") setAddingNote(false); }}
            placeholder={`Label for Page ${currentPage}… (Enter to save)`}
            className="flex-1 bg-transparent outline-none text-sm" style={{ color: t.text }}
          />
          <button onClick={addBookmark} className="px-3 py-1 rounded-lg text-xs font-semibold text-white hover:opacity-80 transition" style={{ background: t.accent }}>Save</button>
          <button onClick={() => setAddingNote(false)} style={{ color: t.sub }}><FiX size={14} /></button>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Hybrid PDF viewer ── */}
        <div
          className="flex-1 overflow-hidden"
          style={{ background: t.bg === "#0f1117" ? "#1a1a2e" : t.bg }}
        >
          {/* react-pdf renderer — auto-switches to iframe on CORS error */}
          {!useIframe ? (
            <Document
              file={ebook.pdfUrl}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              onLoadError={() => { setUseIframe(true); }}
              loading={
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: t.accent, borderTopColor: "transparent" }} />
                  <p className="text-sm" style={{ color: t.sub }}>Loading PDF…</p>
                </div>
              }
              className="flex flex-col items-center py-6 gap-4"
            >
              {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                <div key={p} data-page={p} ref={el => { pageRefs.current[p] = el; }} className="shadow-2xl">
                  <Page
                    pageNumber={p}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    loading={<div style={{ width: 600 * scale, height: 800 * scale, background: t.surface }} className="animate-pulse rounded" />}
                  />
                </div>
              ))}
            </Document>
          ) : (
            /*
             * Iframe fallback — bypasses CORS. We use 100% width/height so the user 
             * can use the native PDF viewer's inner scroll.
             */
            <iframe
              src={ebook.pdfUrl}
              title={ebook.name}
              className="border-0 w-full h-full"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center top",
                width: `${(100 / scale)}%`,
                height: `${(100 / scale)}%`,
                marginLeft: `${(100 - (100 / scale)) / 2}%`
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>

        {/* ── Settings panel ── */}
        {showSettings && (
          <div className="w-64 flex-shrink-0 border-l overflow-y-auto" style={{ background: t.surface, borderColor: t.border }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: t.border }}>
              <p className="font-bold text-sm" style={{ color: t.text }}>⚙️ Settings</p>
              <button onClick={() => setShowSettings(false)} style={{ color: t.sub }}><FiX size={16} /></button>
            </div>
            <div className="p-4 space-y-6">
              {/* Theme */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: t.sub }}>Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(THEMES).map(([key, val]) => (
                    <button key={key} onClick={() => changeTheme(key)} className="p-2.5 rounded-xl border-2 text-xs font-semibold transition-all hover:scale-105"
                      style={{ background: val.bg, color: val.text, borderColor: theme === key ? t.accent : val.border, boxShadow: theme === key ? `0 0 0 2px ${t.accent}40` : "none" }}>
                      {key === "dark" ? "🌑" : key === "sepia" ? "☕" : "☀️"}<br />{val.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Zoom */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: t.sub }}>Zoom — {Math.round(scale * 100)}%</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => changeScale(scale - 0.1)} className="w-9 h-9 rounded-xl border flex items-center justify-center hover:opacity-70 transition" style={{ borderColor: t.border, color: t.sub, background: t.bg }}><FiMinus size={14} /></button>
                  <div className="flex-1 h-2 rounded-full" style={{ background: t.border }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${((scale - 0.6) / 1.9) * 100}%`, background: `linear-gradient(90deg,${t.accent},#f472b6)` }} />
                  </div>
                  <button onClick={() => changeScale(scale + 0.1)} className="w-9 h-9 rounded-xl border flex items-center justify-center hover:opacity-70 transition" style={{ borderColor: t.border, color: t.sub, background: t.bg }}><FiPlus size={14} /></button>
                </div>
                <div className="flex justify-between mt-1 text-xs" style={{ color: t.sub }}><span>60%</span><span>250%</span></div>
              </div>
              {/* Stats */}
              <div className="rounded-xl p-3 border" style={{ borderColor: t.border, background: t.bg }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: t.sub }}>Reading Stats</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span style={{ color: t.sub }}>Page</span><span className="font-bold" style={{ color: t.accent }}>{currentPage} / {numPages || "—"}</span></div>
                  <div className="flex justify-between"><span style={{ color: t.sub }}>Progress</span><span className="font-bold" style={{ color: t.accent }}>{progress}%</span></div>
                  <div className="flex justify-between"><span style={{ color: t.sub }}>Bookmarks</span><span className="font-bold" style={{ color: t.accent }}>{bookmarks.length}</span></div>
                </div>
              </div>
              {/* Shortcuts */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: t.sub }}>Shortcuts</p>
                <div className="space-y-1.5 text-xs" style={{ color: t.sub }}>
                  {[["Esc", "Close"], ["Alt+B", "Bookmark"], ["← / →", "Prev/Next page"]].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span>{v}</span>
                      <kbd className="px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: t.border, background: t.bg }}>{k}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Bookmarks panel ── */}
        {showBookmarks && (
          <div className="w-64 flex-shrink-0 border-l overflow-y-auto" style={{ background: t.surface, borderColor: t.border }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: t.border }}>
              <p className="font-bold text-sm" style={{ color: t.text }}>🔖 Bookmarks ({bookmarks.length})</p>
              <button onClick={() => setShowBookmarks(false)} style={{ color: t.sub }}><FiX size={16} /></button>
            </div>
            {bookmarks.length === 0 ? (
              <div className="flex flex-col items-center p-8 text-center gap-2">
                <span className="text-4xl">🔖</span>
                <p className="text-sm font-semibold" style={{ color: t.text }}>No bookmarks yet</p>
                <p className="text-xs" style={{ color: t.sub }}>Press the bookmark icon to save your current page</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {bookmarks.map(bm => (
                  <div key={bm.id} onClick={() => jumpToBookmark(bm)} className="group rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]" style={{ borderColor: t.border, background: t.bg }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: t.text }}>{bm.note}</p>
                        <p className="text-xs" style={{ color: t.sub }}>{bm.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${t.accent}25`, color: t.accent }}>
                          {bm.page ? `p.${bm.page}` : `${bm.pct}%`}
                        </span>
                        <button onClick={e => { e.stopPropagation(); removeBookmark(bm.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-all" style={{ color: t.sub }}><FiX size={12} /></button>
                      </div>
                    </div>
                    <div className="mt-2 h-1 rounded-full" style={{ background: t.border }}>
                      <div className="h-1 rounded-full" style={{ width: `${bm.page && numPages ? Math.round((bm.page / numPages) * 100) : bm.pct}%`, background: `linear-gradient(90deg,${t.accent},#f472b6)` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t text-xs flex-shrink-0" style={{ background: t.toolbar, borderColor: t.border, color: t.sub }}>
        <span>📖 {ebook.name} {useIframe && <span style={{ color: t.accent, marginLeft: 6 }}>(iframe mode)</span>}</span>
        <span style={{ color: t.accent }}>🔖 {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} · {THEMES[theme].name} · {Math.round(scale * 100)}% zoom{numPages ? ` · p.${currentPage}/${numPages}` : ` · ${displayProgress}%`}</span>
      </div>
    </div>
  );
}


// ── Main EBook Detail page ──────────────────────────────────────────────
function EBookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = authUser ? user?._id : null;

  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [relatedEbooks, setRelatedEbooks] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ebookRes, allRes] = await Promise.all([
        axios.get(`${API_URL}/ebook/${id}`),
        axios.get(`${API_URL}/ebook`),
      ]);
      setEbook(ebookRes.data);
      setRelatedEbooks(allRes.data.filter(e => e.category === ebookRes.data.category && e._id !== id).slice(0, 4));

      if (userId) {
        const ownRes = await axios.get(`${API_URL}/ebook/owns/${userId}/${id}`);
        setOwned(ownRes.data.owned);
      }
    } catch {
      toast.error("Failed to load eBook.");
      navigate("/course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handlePurchaseSuccess = () => {
    setOwned(true);
    setShowCheckout(false);
    setShowReader(true);
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading eBook...</p>
        </div>
      </div>
    </>
  );

  if (!ebook) return null;

  return (
    <>
      {showReader && <EBookReader ebook={ebook} onClose={() => setShowReader(false)} />}

      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 mb-6 transition-colors">
            <FiArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* ── Main card ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row">

              {/* Cover */}
              <div className="md:w-64 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center p-8 min-h-[280px] relative">
                <img src={ebook.image} alt={ebook.name}
                  className="max-h-64 w-auto object-contain drop-shadow-xl rounded-lg"
                  onError={e => { e.target.style.display = 'none'; }} />
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <FiTablet size={11} /> eBook
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
                    {ebook.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{ebook.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">by <span className="font-semibold">{ebook.author}</span></p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{ebook.title}</p>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "Format", value: "eBook" },
                      { label: "Language", value: ebook.language || "English" },
                      { label: "Pages", value: ebook.pages > 0 ? ebook.pages : "—" },
                      { label: "Access", value: "Lifetime" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price + CTA */}
                <div>
                  <div className="flex items-baseline gap-3 mb-5">
                    {ebook.inStock === false && !owned ? (
                      <span className="text-3xl font-bold text-gray-500 dark:text-gray-400">Out of Stock</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-pink-500">₹{ebook.price}</span>
                        <span className="text-sm text-gray-400 line-through">₹{Math.round(ebook.price * 1.3)}</span>
                        <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                          Instant Access
                        </span>
                      </>
                    )}
                  </div>

                  {!authUser ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center">
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Please <button onClick={() => document.getElementById("my_modal_3").showModal()} className="underline font-bold">login</button> to purchase.
                      </p>
                    </div>
                  ) : owned ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setShowReader(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95">
                        📖 Read Now
                      </button>
                      <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium text-sm">
                        ✅ You own this eBook
                      </div>
                    </div>
                  ) : ebook.inStock === false ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-center">
                      <p className="text-red-600 dark:text-red-400 font-semibold text-sm">
                        This eBook is currently unavailable.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setShowCheckout(!showCheckout)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95">
                        <FiCreditCard size={18} />
                        {showCheckout ? "Cancel" : `Buy for ₹${ebook.price}`}
                      </button>
                    </div>
                  )}

                  {/* Inline checkout */}
                  {showCheckout && !owned && (
                    <div className="mt-4 p-5 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-sm">Complete Purchase</h3>
                      <Elements stripe={stripePromise}>
                        <EBookCheckoutForm ebook={ebook} userId={userId} onSuccess={handlePurchaseSuccess} />
                      </Elements>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── About ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiBook className="text-pink-500" /> About This eBook
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold text-gray-800 dark:text-white">{ebook.name}</span> by {ebook.author} — {ebook.title}.
              This eBook is available in the <span className="text-pink-500 font-medium">{ebook.category}</span> category.
              Once purchased, you get lifetime access and can read it directly in your browser anytime.
              No downloads required — just click "Read Now" and start reading instantly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["eBook", ebook.category, "Instant Access", "Read Online"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  #{tag.replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          </div>

          {/* ── Related ── */}
          {relatedEbooks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                More in <span className="text-pink-500">{ebook.category}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedEbooks.map(e => (
                  <div key={e._id} onClick={() => navigate(`/ebook/${e._id}`)}
                    className="cursor-pointer group bg-gray-50 dark:bg-slate-700 rounded-xl p-3 hover:shadow-md transition-all hover:-translate-y-1">
                    <div className="h-28 flex items-center justify-center mb-2 overflow-hidden rounded-lg bg-white dark:bg-slate-600">
                      <img src={e.image} alt={e.name} className="max-h-full object-contain group-hover:scale-105 transition-all"
                        onError={ev => { ev.target.style.display = 'none'; }} />
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2">{e.name}</p>
                    {e.inStock === false ? (
                      <p className="text-gray-500 font-bold text-xs mt-1">Out of Stock</p>
                    ) : (
                      <p className="text-pink-500 font-bold text-xs mt-1">₹{e.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default EBookDetail;
