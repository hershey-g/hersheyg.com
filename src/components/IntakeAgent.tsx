"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
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

const THINKING_VERBS = [
  "Crystallizing...",
  "Composing...",
  "Synthesizing...",
  "Formulating...",
  "Processing...",
] as const;

function ThinkingIndicator() {
  const verb = useMemo(
    () => THINKING_VERBS[Math.floor(Math.random() * THINKING_VERBS.length)],
    []
  );

  return (
    <p className="text-[13px] font-mono flex items-center gap-1.5" role="status" aria-label="Agent is thinking">
      <span className="text-term-green" style={{ animation: "intake-thinking-pulse 2s ease-in-out infinite" }}>
        &gt;
      </span>
      <span className="text-term-green/70" style={{ animation: "intake-thinking-pulse 2s ease-in-out infinite" }}>
        {verb}
      </span>
    </p>
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
    <div className="mb-4 intake-animate-in" style={{ overflowWrap: "break-word" }}>
      {isStreaming && !hasText ? (
        <ThinkingIndicator />
      ) : (
        <p className="text-[13px] leading-relaxed text-text font-mono whitespace-pre-line">
          {message?.parts.map((part, i) => {
            if (part.type === "text") return <span key={i}>{part.text}</span>;
            return null;
          })}
          {isStreaming && hasText && (
            <span
              className="inline-block w-[6px] h-[15px] bg-term-green/70 ml-0.5 align-middle rounded-sm"
              style={{
                animation: "intake-cursor-blink 1.2s ease-in-out infinite",
                boxShadow: "0 0 8px oklch(0.72 0.19 145 / 0.4)",
              }}
            />
          )}
        </p>
      )}
    </div>
  );
}

function UserMessage({ message }: { message: UIMessage }) {
  return (
    <div className="flex justify-end mb-4 intake-animate-in">
      <div className="bg-accent-lit/8 rounded-xl px-3.5 py-2.5 max-w-[85%]">
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
          className="overflow-hidden mt-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSelect(chip)}
                className="border border-line rounded-lg px-3 py-3 sm:px-3.5 sm:py-3.5 text-left font-mono text-xs sm:text-[13px] text-text bg-transparent hover:border-accent-lit/30 transition-colors"
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

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    // Don't auto-focus on touch devices — opening the keyboard on scroll is disruptive
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.focus({ preventScroll: true });
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !isStreaming) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2.5 px-4 sm:px-5 py-3 border-t border-line/50 flex-shrink-0">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="font-mono text-[13px] flex-1 px-3 py-2 border border-line rounded-lg bg-bg/60 text-text outline-none focus:border-accent-lit/50 transition-colors placeholder:text-dim"
      />
      <button
        onClick={onSubmit}
        disabled={!input.trim() || isStreaming}
        className="font-mono text-xs px-3.5 py-2 border border-accent-lit/50 rounded-lg
                   bg-accent-lit/15 text-accent-lit hover:bg-accent-lit/25 transition-all
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
  const [greeting] = useState(() => {
    const day = new Date().getUTCDate();
    return INTAKE_GREETINGS[day % INTAKE_GREETINGS.length];
  });

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
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  const scrollToBottom = useCallback((force = false) => {
    requestAnimationFrame(() => {
      const el = chatRef.current;
      if (!el) return;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (force || isNearBottom || !userScrolledUpRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      className="min-h-dvh flex flex-col bg-bg scroll-mt-14 sm:scroll-mt-20"
    >
      {/* Section header */}
      <div className="text-center pt-12 sm:pt-20 pb-6 sm:pb-10 px-6 sm:px-12">
        <p className="font-mono text-xs tracking-widest uppercase text-accent-lit mb-5">
          {COPY.contact.tag}
        </p>
        <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-2 sm:mb-4">
          {COPY.contact.heading}
        </h2>
        <p className="text-base text-dim leading-relaxed max-w-[540px] mx-auto mb-1.5 sm:mb-3">
          {COPY.contact.sub}
        </p>
        <p className="text-sm text-dim leading-relaxed max-w-[540px] mx-auto">
          {COPY.contact.pricing}
        </p>
      </div>

      {/* Chat container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 sm:pb-16">
        <div className="max-w-[680px] w-full bg-bg-2 border border-line/50 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 max-h-[600px]">
          {/* Messages area */}
          <div
            ref={chatRef}
            className="px-4 py-4 sm:px-5 sm:py-5 font-mono text-sm leading-relaxed overflow-y-auto intake-scroll flex-1 min-h-0"
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
              <div className="mb-3 intake-animate-in">
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
            )}

            {/* Suggestion chips — inside scroll area so they don't steal space */}
            <SuggestionChips
              onSelect={handleChipSelect}
              visible={messages.length === 1 && messages[0]?.role === "assistant"}
            />
            <div ref={bottomRef} aria-hidden="true" />
          </div>

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
