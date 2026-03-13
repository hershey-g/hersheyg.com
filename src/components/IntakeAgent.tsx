"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { INTAKE_GREETINGS } from "@/lib/intake-system-prompt";
import { COPY } from "@/lib/constants";

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function ThinkingIndicator() {
  return (
    <div className="flex flex-col gap-1.5 py-1" role="status" aria-label="Agent is thinking">
      <div className="w-[120px] h-[3px] rounded-full bg-term-orange/15 overflow-hidden relative">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent, oklch(0.8 0.15 65 / 0.6), transparent)",
            animation: "intake-shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>
      <span className="text-[10px] font-mono text-term-orange/50">thinking...</span>
    </div>
  );
}

function AgentMessage({
  message,
  isStreaming,
}: {
  message?: UIMessage;
  isStreaming?: boolean;
}) {
  const hasText = message?.parts.some((p) => p.type === "text" && p.text);

  return (
    <div className="flex gap-2.5 items-start mb-4 intake-animate-in">
      <div className="w-7 h-7 rounded-md bg-term-orange/10 border border-term-orange/25 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs text-term-orange font-mono font-semibold">
          H
        </span>
      </div>
      <div
        className="bg-accent/40 border border-accent/25 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 max-w-[85%]"
        style={{ minHeight: "2.5rem", overflowWrap: "break-word" }}
      >
        {isStreaming && !hasText ? (
          <ThinkingIndicator />
        ) : (
          <p className="text-[13px] leading-relaxed text-text font-mono whitespace-pre-line">
            {message?.parts.map((part, i) => {
              if (part.type === "text") return <span key={i}>{part.text}</span>;
              return null;
            })}
            {isStreaming && hasText && (
              <span className="inline-block w-[6px] h-[14px] bg-term-orange/70 ml-0.5 align-middle opacity-70 animate-pulse" />
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: UIMessage }) {
  return (
    <div className="flex justify-end mb-4 intake-animate-in">
      <div className="bg-accent-lit/15 border border-accent-lit/30 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 max-w-[85%]">
        <p className="text-[13px] leading-relaxed text-white font-mono">
          {message.parts.map((part, i) => {
            if (part.type === "text") return <span key={i}>{part.text}</span>;
            return null;
          })}
        </p>
      </div>
    </div>
  );
}

const SUGGESTION_CHIPS = [
  "I want to build an AI agent",
  "I have a project idea",
  "Tell me about your work",
  "Just exploring",
] as const;

function SuggestionChips({
  onSelect,
  visible,
}: {
  onSelect: (text: string) => void;
  visible: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, height: "auto", marginTop: 0 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, height: 0, marginTop: 0 }
          }
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          className="overflow-hidden mb-4 px-7 pb-5"
        >
          <div className="grid grid-cols-2 gap-2.5">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSelect(chip)}
                className="border border-line rounded-lg px-4 py-3.5 text-left font-mono text-[13px] text-text bg-transparent hover:border-accent-lit/30 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChatInput({
  input,
  setInput,
  onSubmit,
  isStreaming,
}: {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  isStreaming: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !isStreaming) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2 px-4 sm:px-5 py-3 border-t border-line bg-bg/30 flex-shrink-0">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="font-mono text-[13px] flex-1 px-4 py-2.5 border border-line rounded-lg bg-bg/60 text-text outline-none focus:border-accent-lit/50 transition-colors placeholder:text-dim"
      />
      <button
        onClick={onSubmit}
        disabled={!input.trim() || isStreaming}
        className="font-mono text-xs px-4 py-2.5 border border-accent-lit/40 rounded-lg
                   bg-accent-lit/10 text-accent-lit hover:bg-accent-lit/20 transition-all
                   disabled:opacity-25 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        →
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function IntakeAgent() {
  const [greeting] = useState(() =>
    INTAKE_GREETINGS[Math.floor(Math.random() * INTAKE_GREETINGS.length)]
  );

  const initialMessages: UIMessage[] = [
    {
      id: "greeting",
      role: "assistant",
      parts: [{ type: "text", text: greeting }],
    },
  ];

  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages,
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const [input, setInput] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  const scrollToBottom = useCallback((force = false) => {
    requestAnimationFrame(() => {
      const el = chatRef.current;
      if (!el) return;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (force || isNearBottom || !userScrolledUpRef.current) {
        el.scrollTop = el.scrollHeight;
        userScrolledUpRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const handleScroll = () => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      userScrolledUpRef.current = !isNearBottom;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  const isActive = status === "streaming" || status === "submitted";

  const handleSendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || status === "streaming" || status === "submitted") return;
    setInput("");
    sendMessage({ text: trimmed });
    userScrolledUpRef.current = false;
  }, [input, status, sendMessage]);

  const handleChipSelect = useCallback(
    (text: string) => {
      if (status === "streaming" || status === "submitted") return;
      sendMessage({ text });
      userScrolledUpRef.current = false;
    },
    [status, sendMessage]
  );

  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col bg-bg scroll-mt-20"
    >
      {/* Section header */}
      <div className="text-center pt-20 pb-8 px-6 sm:px-12">
        <p className="font-mono text-xs tracking-widest uppercase text-accent-lit mb-5">
          {COPY.contact.tag}
        </p>
        <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-4">
          {COPY.contact.heading}
        </h2>
        <p className="text-base text-dim leading-relaxed max-w-[540px] mx-auto mb-3">
          {COPY.contact.sub}
        </p>
        <p className="text-sm text-dim leading-relaxed max-w-[540px] mx-auto">
          {COPY.contact.pricing}
        </p>
      </div>

      {/* Chat container */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="max-w-[680px] w-full bg-bg-2 border border-line rounded-xl overflow-hidden flex flex-col md:h-[420px]">
          {/* Messages area */}
          <div
            ref={chatRef}
            className="p-7 font-mono text-sm leading-relaxed overflow-y-auto intake-scroll flex-1 min-h-0"
          >
            {messages.map((msg) => {
              const hasVisibleContent = msg.parts.some(
                (p) => p.type === "text" && p.text
              );
              if (!hasVisibleContent) return null;

              if (msg.role === "assistant") {
                const isLastMsg = msg === messages[messages.length - 1];
                return (
                  <AgentMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={isLastMsg && isActive}
                  />
                );
              }
              if (msg.role === "user") {
                return <UserMessage key={msg.id} message={msg} />;
              }
              return null;
            })}

            {isActive &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role === "user") && (
                <AgentMessage isStreaming />
              )}

            {(status === "error" || error) && (
              <div className="flex gap-2.5 items-start mb-4 intake-animate-in">
                <div className="w-7 h-7 rounded-md bg-term-red/10 border border-term-red/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-term-red font-mono font-semibold">!</span>
                </div>
                <div className="bg-bg/60 border border-term-red/15 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 max-w-[85%]">
                  <p className="text-[13px] leading-relaxed text-term-red/80 font-mono whitespace-pre-line">
                    Something went sideways. No worries — just email{" "}
                    <a
                      href="mailto:hello@hersheyg.com"
                      className="underline text-term-red hover:text-term-red/90"
                    >
                      hello@hersheyg.com
                    </a>{" "}
                    and Hershey will pick it up.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips — rendered outside scroll area, inside container */}
          <SuggestionChips
            onSelect={handleChipSelect}
            visible={messages.length === 1 && messages[0]?.role === "assistant"}
          />

          {/* Input bar */}
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSendMessage}
            isStreaming={isActive}
          />
        </div>
      </div>
    </section>
  );
}
