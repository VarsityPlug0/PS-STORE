"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Smile, Paperclip, Phone, Video, MoreVertical } from "lucide-react";
import Link from "next/link";

interface Msg {
  id: string;
  from: "bot" | "user";
  text: string;
  time: string;
  quickReplies?: string[];
}

function now() {
  return new Date().toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const QUICK_REPLIES = [
  "Track my order",
  "Shipping info",
  "Payment options",
  "Returns & refunds",
  "Contact us",
];

function getBotReply(input: string): { text: string; quickReplies?: string[] } {
  const msg = input.toLowerCase().trim();

  if (/^(hi|hello|hey|howzit|good day|sup|yo)\b/i.test(msg)) {
    return {
      text: "Hey! 😊 Great to have you here. What can I help you with today?",
      quickReplies: QUICK_REPLIES,
    };
  }

  if (/track|order (id|number|status|ref)|my order|where is/i.test(msg)) {
    return {
      text: "To track your order, head to our Track Order page and enter your Order ID (looks like *PS-XXXXXXXX*) and your email address.\n\nYour Order ID was shown at checkout and in your order confirmation.",
    };
  }

  if (/ship|deliver|how long|when will|estimated|how fast/i.test(msg)) {
    return {
      text: "📦 *Shipping Info:*\n\n• Standard delivery: 3–5 business days\n• Orders dispatched within 24 hours of payment confirmation\n• Tracking number emailed once your order ships\n\nWe deliver nationwide across South Africa.",
    };
  }

  if (/payment|pay|eft|stripe|card|credit|bank/i.test(msg)) {
    return {
      text: "💳 *Payment Options:*\n\n• *Card* — Visa & Mastercard via Stripe (instant confirmation)\n• *EFT* — Direct bank transfer (1–2 business days to verify)\n\nBoth options are available at checkout. EFT bank details are shown after placing your order.",
    };
  }

  if (/return|refund|exchange|cancel|wrong item/i.test(msg)) {
    return {
      text: "↩️ *Returns & Refunds:*\n\n• 7-day return window on all products\n• Items must be unused and in original packaging\n• Refunds processed within 3–5 business days after we receive the item\n\nTo start a return, reply with your Order ID or send us an email.",
    };
  }

  if (/contact|email|phone|call|reach|speak/i.test(msg)) {
    return {
      text: "📞 *Contact Us:*\n\n• Email: support@psstore.co.za\n• Phone: +27 10 123 4567\n• Hours: Mon–Fri, 8am–5pm\n\nOr keep chatting here — we respond fast! 💬",
    };
  }

  if (/ps-[a-f0-9]{8}/i.test(msg)) {
    const orderId = (msg.match(/ps-[a-f0-9]{8}/i)?.[0] ?? "").toUpperCase();
    return {
      text: `Let me help you with Order *${orderId}*. 🔍\n\nGo to our Track Order page and enter your Order ID + email to see real-time status and updates.`,
    };
  }

  if (/stock|available|in stock|out of stock/i.test(msg)) {
    return {
      text: "Stock availability is shown on each product page. If an item shows 0 stock, it's currently unavailable.\n\nFeel free to check back soon or contact us to ask about restocking! 🎮",
    };
  }

  if (/warranty|guarantee/i.test(msg)) {
    return {
      text: "🛡️ *Warranty:*\n\nAll products come with the manufacturer's standard warranty:\n• PS5 Console: 1-year warranty\n• Controllers & Accessories: 6-month warranty\n\nKeep your order confirmation as proof of purchase.",
    };
  }

  return {
    text: "I'm not quite sure about that 😅 Here's what I can help with:",
    quickReplies: QUICK_REPLIES,
  };
}

function renderText(text: string) {
  // Convert *bold* and newlines to JSX
  const parts = text.split(/(\*[^*]+\*|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return <strong key={i}>{part.slice(1, -1)}</strong>;
    }
    if (part === "\n") return <br key={i} />;
    return <span key={i}>{part}</span>;
  });
}

const INITIAL: Msg[] = [
  {
    id: "0",
    from: "bot",
    text: "👋 Hi! Welcome to PS Store. How can I help you today?",
    time: now(),
    quickReplies: QUICK_REPLIES,
  },
];

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  function send(text: string) {
    if (!text.trim()) return;

    const userMsg: Msg = {
      id: Date.now().toString(),
      from: "user",
      text: text.trim(),
      time: now(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply = getBotReply(text);
      const botMsg: Msg = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        text: reply.text,
        time: now(),
        quickReplies: reply.quickReplies,
      };
      setMessages((m) => [...m, botMsg]);
    }, 600);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: 360, height: 540 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: "#1F2C34" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
              style={{ background: "#075E54", color: "#fff" }}
            >
              PS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">
                PS Store Support
              </p>
              <p className="text-xs" style={{ color: "#8696A0" }}>
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1 align-middle"
                  style={{ marginBottom: 1 }}
                />
                Online
              </p>
            </div>
            <div className="flex items-center gap-3" style={{ color: "#8696A0" }}>
              <Video size={18} className="cursor-pointer hover:text-white transition-colors" />
              <Phone size={18} className="cursor-pointer hover:text-white transition-colors" />
              <MoreVertical size={18} className="cursor-pointer hover:text-white transition-colors" />
              <button
                onClick={() => setOpen(false)}
                className="hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-1.5"
            style={{
              background: "#0B141A",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[78%] rounded-2xl px-3 py-2 text-sm relative"
                    style={
                      msg.from === "user"
                        ? {
                            background: "#005C4B",
                            color: "#E9EDEF",
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: "#1F2C34",
                            color: "#E9EDEF",
                            borderBottomLeftRadius: 4,
                          }
                    }
                  >
                    <p className="leading-relaxed text-[13px]">
                      {renderText(msg.text)}
                    </p>
                    <div
                      className="flex items-center justify-end gap-1 mt-1"
                      style={{ color: "#8696A0" }}
                    >
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.from === "user" && (
                        <span className="text-[11px]" style={{ color: "#53BDEB" }}>
                          ✓✓
                        </span>
                      )}
                    </div>
                    {/* Track order button inside bot message */}
                    {msg.from === "bot" &&
                      (msg.text.includes("Track Order") ||
                        msg.text.includes("track your order")) && (
                        <Link
                          href="/track"
                          className="block mt-2 text-center text-xs font-semibold rounded-xl py-1.5 px-3 transition-colors"
                          style={{ background: "#005C4B", color: "#E9EDEF" }}
                          onClick={() => setOpen(false)}
                        >
                          Go to Track Order →
                        </Link>
                      )}
                  </div>
                </div>

                {/* Quick reply chips */}
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 mt-2 justify-start">
                    {msg.quickReplies.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => send(qr)}
                        className="text-xs px-3 py-1.5 rounded-full font-medium border transition-colors"
                        style={{
                          borderColor: "#2A3942",
                          background: "#1F2C34",
                          color: "#00A884",
                        }}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
            style={{ background: "#1F2C34" }}
          >
            <button
              type="button"
              className="flex-shrink-0 transition-colors"
              style={{ color: "#8696A0" }}
            >
              <Smile size={22} />
            </button>
            <button
              type="button"
              className="flex-shrink-0 transition-colors"
              style={{ color: "#8696A0" }}
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message"
              className="flex-1 text-sm rounded-xl px-4 py-2 outline-none"
              style={{
                background: "#2A3942",
                color: "#E9EDEF",
                border: "none",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: input.trim() ? "#00A884" : "#2A3942",
                color: input.trim() ? "#fff" : "#8696A0",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: "#25D366" }}
        aria-label="Chat with us"
      >
        {open ? (
          <X size={24} color="#fff" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="white"
            width="26"
            height="26"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
