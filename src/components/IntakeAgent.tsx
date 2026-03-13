"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { INTAKE_GREETINGS } from "@/lib/intake-system-prompt";

/* ═══════════════════════════════════════════════════════════════════════════
   Hooks: useFocusTrap, useScrollLock
   ═══════════════════════════════════════════════════════════════════════════ */

function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  onEscape: () => void
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    const focusFirst = () => {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0].focus();
    };

    const timer = setTimeout(focusFirst, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isActive, containerRef, onEscape]);
}

function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}

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
              // Hide tool invocations from UI
              return null;
            })}
            {isStreaming && hasText && (
              <span className="inline-block w-[6px] h-[14px] bg-term-orange/70 ml-0.5 align-middle" style={{ animation: "blink 1s step-end infinite" }} />
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
          className="overflow-hidden ml-[38px] mb-4"
        >
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSelect(chip)}
                className="font-mono text-[12px] px-3 py-1.5 rounded-full border border-accent/30 bg-accent/15 text-dim hover:text-text hover:bg-accent/25 hover:border-accent/40 transition-colors whitespace-nowrap"
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
   IntakeChatContent — modal content
   ═══════════════════════════════════════════════════════════════════════════ */

function IntakeChatContent({
  chatRef,
  messages,
  status,
  input,
  setInput,
  onSendMessage,
  onClose,
  isModal,
  error,
  onChipSelect,
}: {
  chatRef: RefObject<HTMLDivElement | null>;
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  input: string;
  setInput: (val: string) => void;
  onSendMessage: () => void;
  onClose?: () => void;
  isModal?: boolean;
  error?: Error;
  onChipSelect?: (text: string) => void;
}) {
  const isActive = status === "streaming" || status === "submitted";

  return (
    <div className="bg-surface flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-line bg-bg/30 flex-shrink-0">
        <>
          {/* Desktop header: traffic lights + title + ESC hint */}
            <div className="hidden sm:flex items-center gap-2 w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-term-red" />
              <span className="w-2.5 h-2.5 rounded-full bg-term-yellow" />
              <span className="w-2.5 h-2.5 rounded-full bg-term-green" />
              <span className="font-mono text-xs text-dim ml-2 flex-1">~/intake-agent</span>
              {status === "submitted" && (
                <span className="w-2 h-2 rounded-full bg-term-orange animate-pulse" />
              )}
              {status === "streaming" && (
                <span className="w-2 h-2 rounded-full bg-term-green animate-pulse" />
              )}
              <span className="font-mono text-[10px] text-dim/40">ESC to close</span>
            </div>
            {/* Mobile header: H badge + title + close button */}
            <div className="flex sm:hidden items-center gap-2 w-full">
              <div className="w-7 h-7 rounded-md bg-term-orange/10 border border-term-orange/25 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-term-orange font-mono font-semibold">H</span>
              </div>
              <span className="font-mono text-xs text-dim ml-1 flex-1">Intake Agent</span>
              {status === "submitted" && (
                <span className="w-2 h-2 rounded-full bg-term-orange animate-pulse" />
              )}
              {status === "streaming" && (
                <span className="w-2 h-2 rounded-full bg-term-green animate-pulse" />
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="ml-2 w-11 h-11 flex items-center justify-center rounded-lg text-text hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close intake form"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
        </>
      </div>

      {/* Chat body */}
      <div
        ref={chatRef}
        className="p-5 sm:p-7 font-mono text-sm leading-relaxed overflow-y-auto intake-scroll flex-1 min-h-0"
      >
        {messages.map((msg) => {
          // Skip messages with no visible content (pure tool invocations)
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

        {/* Suggestion chips — shown only when greeting is the sole message */}
        <SuggestionChips
          onSelect={(text) => onChipSelect?.(text)}
          visible={messages.length === 1 && messages[0]?.role === "assistant"}
        />

        {/* Typing dots when waiting for first text chunk */}
        {isActive &&
          (messages.length === 0 ||
            messages[messages.length - 1]?.role === "user") && (
            <AgentMessage isStreaming />
          )}

        {/* Error fallback */}
        {(status === "error" || error) && (
          <div className="flex gap-2.5 items-start mb-4 intake-animate-in">
            <div className="w-7 h-7 rounded-md bg-term-red/10 border border-term-red/25 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-term-red font-mono font-semibold">!</span>
            </div>
            <div className="bg-bg/60 border border-term-red/15 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 max-w-[85%]">
              <p className="text-[13px] leading-relaxed text-term-red/80 font-mono whitespace-pre-line">
                Something went sideways. No worries — just email{" "}
                <a href="mailto:hello@hersheyg.com" className="underline text-term-red hover:text-term-red/90">
                  hello@hersheyg.com
                </a>{" "}
                and Hershey will pick it up.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={onSendMessage}
        isStreaming={isActive}
      />

      {/* Safe area spacer for modal on notched devices */}
      {isModal && (
        <div className="flex-shrink-0 pb-[env(safe-area-inset-bottom,0px)]" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Modal — rendered via React Portal, all breakpoints
   ═══════════════════════════════════════════════════════════════════════════ */

function IntakeModal({
  isOpen,
  chatRef,
  messages,
  status,
  input,
  setInput,
  onSendMessage,
  onClose,
  prefersReducedMotion,
  error,
  onChipSelect,
}: {
  isOpen: boolean;
  chatRef: RefObject<HTMLDivElement | null>;
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  input: string;
  setInput: (val: string) => void;
  onSendMessage: () => void;
  onClose: () => void;
  prefersReducedMotion: boolean | null;
  error?: Error;
  onChipSelect: (text: string) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useFocusTrap(modalRef, isOpen, onClose);
  useScrollLock(isOpen);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="intake-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[70] overlay-backdrop"
            onClick={onClose}
            role="presentation"
          />
          {/* Overlay container — pointer-events-none so clicks pass to backdrop */}
          <div className="fixed inset-0 z-[71] sm:flex sm:items-center sm:justify-center sm:p-6 pointer-events-none">
            <motion.div
              ref={modalRef}
              initial={prefersReducedMotion ? false : { scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={prefersReducedMotion ? {} : { scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-[100dvh] sm:h-auto sm:max-h-[70vh] w-full sm:max-w-[600px] sm:rounded-xl overflow-hidden flex flex-col pointer-events-auto"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
              role="dialog"
              aria-modal="true"
              aria-label="Project intake form"
            >
              <IntakeChatContent
                chatRef={chatRef}
                messages={messages}
                status={status}
                input={input}
                setInput={setInput}
                onSendMessage={onSendMessage}
                onClose={onClose}
                isModal
                error={error}
                onChipSelect={onChipSelect}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component — overlay only, no section wrapper
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
  const [modalOpen, setModalOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const userScrolledUpRef = useRef(false);

  // Auto-scroll helper
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

  // Track user scroll-up
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const el = e.target as HTMLElement;
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      userScrolledUpRef.current = !isNearBottom;
    };
    const el = chatRef.current;
    el?.addEventListener("scroll", handleScroll, { passive: true });
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on messages/status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  // Send message handler
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

  // Listen for open-intake-modal custom event
  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-intake-modal", handler);
    return () => window.removeEventListener("open-intake-modal", handler);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <IntakeModal
      isOpen={modalOpen}
      chatRef={chatRef}
      messages={messages}
      status={status}
      input={input}
      setInput={setInput}
      onSendMessage={handleSendMessage}
      onClose={closeModal}
      prefersReducedMotion={prefersReducedMotion ?? false}
      error={error}
      onChipSelect={handleChipSelect}
    />
  );
}
