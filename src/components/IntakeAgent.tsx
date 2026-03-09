"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useReducer,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  STEPS,
  AGENT_RESPONSES,
  INTAKE_GREETINGS,
} from "./intake-agent-constants";
import { COPY } from "@/lib/constants";

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface Message {
  from: "agent" | "user";
  text: string;
}

type Answers = Record<string, string>;

type Phase =
  | { kind: "idle" }
  | { kind: "typing" }
  | { kind: "options"; stepId: string; options: string[] }
  | {
      kind: "input";
      stepId: string;
      inputType: "input" | "textarea";
      placeholder: string;
    }
  | { kind: "summary"; answers: Answers; ref: string }
  | { kind: "done" };

interface ConversationState {
  sessionId: number;
  messages: Message[];
  phase: Phase;
  stepIndex: number;
  answers: Answers;
  summaryRef: string;
  status: "idle" | "running" | "done";
}

type Action =
  | { type: "START_SESSION" }
  | { type: "ADD_MESSAGE"; sessionId: number; message: Message }
  | { type: "SET_PHASE"; sessionId: number; phase: Phase }
  | { type: "SET_STEP_INDEX"; sessionId: number; index: number }
  | { type: "SET_ANSWERS"; sessionId: number; answers: Answers }
  | { type: "SET_SUMMARY_REF"; sessionId: number; ref: string }
  | { type: "SET_STATUS"; sessionId: number; status: "idle" | "running" | "done" }
  | { type: "RESET" };

/* ═══════════════════════════════════════════════════════════════════════════
   Reducer
   ═══════════════════════════════════════════════════════════════════════════ */

const initialState: ConversationState = {
  sessionId: 0,
  messages: [],
  phase: { kind: "idle" },
  stepIndex: 0,
  answers: {},
  summaryRef: "",
  status: "idle",
};

function reducer(state: ConversationState, action: Action): ConversationState {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...initialState,
        sessionId: state.sessionId + 1,
        status: "running",
      };
    case "RESET":
      return { ...initialState, sessionId: state.sessionId };
    default:
      break;
  }

  // All remaining actions carry sessionId — ignore stale dispatches
  if ("sessionId" in action && action.sessionId !== state.sessionId) {
    return state;
  }

  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_STEP_INDEX":
      return { ...state, stepIndex: action.index };
    case "SET_ANSWERS":
      return { ...state, answers: action.answers };
    case "SET_SUMMARY_REF":
      return { ...state, summaryRef: action.ref };
    case "SET_STATUS":
      return { ...state, status: action.status };
    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Async helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

/** Resolver map keyed by session ID. */
const inputResolvers = new Map<number, (val: string) => void>();

function waitForInput(sessionId: number, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    inputResolvers.set(sessionId, resolve);
    signal.addEventListener(
      "abort",
      () => {
        inputResolvers.delete(sessionId);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

function generateRef() {
  return "#PRJ-" + Math.floor(1000 + Math.random() * 9000);
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

/* ═══════════════════════════════════════════════════════════════════════════
   runConversation — standalone async function
   ═══════════════════════════════════════════════════════════════════════════ */

async function runConversation(
  dispatch: React.Dispatch<Action>,
  sessionId: number,
  signal: AbortSignal,
  greeting: string
) {
  /** Dispatch with sessionId auto-injected. Accepts any action payload sans sessionId. */
  const d = (
    action:
      | { type: "ADD_MESSAGE"; message: Message }
      | { type: "SET_PHASE"; phase: Phase }
      | { type: "SET_STEP_INDEX"; index: number }
      | { type: "SET_ANSWERS"; answers: Answers }
      | { type: "SET_SUMMARY_REF"; ref: string }
      | { type: "SET_STATUS"; status: "idle" | "running" | "done" }
  ) => {
    dispatch({ ...action, sessionId } as Action);
  };

  const currentAnswers: Answers = {};

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];

    let msg = step.agentMsg;
    if (step.id === "type") {
      msg = greeting;
    } else if (step.id === "contact") {
      msg = `Last one, ${currentAnswers.name || "friend"}. Where should Hershey actually reach you?`;
    }

    // Show typing indicator
    d({ type: "SET_PHASE", phase: { kind: "typing" } });

    const text = msg ?? "";
    const typingDelay = 600 + Math.min(text.length * 8, 1200);
    await delay(typingDelay, signal);

    // Add agent message
    d({ type: "ADD_MESSAGE", message: { from: "agent", text } });
    d({ type: "SET_STEP_INDEX", index: i + 1 });

    // Show input UI
    if (step.options) {
      d({
        type: "SET_PHASE",
        phase: { kind: "options", stepId: step.id, options: step.options },
      });
    } else if (step.type) {
      d({
        type: "SET_PHASE",
        phase: {
          kind: "input",
          stepId: step.id,
          inputType: step.type,
          placeholder: step.placeholder ?? "",
        },
      });
    }

    // Wait for user input
    const userAnswer = await waitForInput(sessionId, signal);

    currentAnswers[step.id] = userAnswer;
    d({ type: "SET_ANSWERS", answers: { ...currentAnswers } });
    d({ type: "ADD_MESSAGE", message: { from: "user", text: userAnswer } });

    // Contextual reply
    const contextReply = AGENT_RESPONSES[step.id]?.[userAnswer];
    if (contextReply) {
      d({ type: "SET_PHASE", phase: { kind: "typing" } });
      const contextDelay = 600 + Math.min(contextReply.length * 8, 1200);
      await delay(contextDelay, signal);
      d({
        type: "ADD_MESSAGE",
        message: { from: "agent", text: contextReply },
      });
    }
  }

  // Wrap-up
  d({ type: "SET_STEP_INDEX", index: STEPS.length });
  d({ type: "SET_PHASE", phase: { kind: "typing" } });
  await delay(1000, signal);

  const wrapMsg = "That's a wrap. Here's what I'm sending Hershey:";
  d({ type: "ADD_MESSAGE", message: { from: "agent", text: wrapMsg } });

  const ref = generateRef();
  d({ type: "SET_SUMMARY_REF", ref });
  d({
    type: "SET_PHASE",
    phase: { kind: "summary", answers: currentAnswers, ref },
  });

  // Submit to API
  try {
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentAnswers, ref }),
      signal,
    });

    if (!res.ok) throw new Error("Failed to send");

    await delay(1200, signal);
    d({ type: "SET_PHASE", phase: { kind: "typing" } });
    await delay(1200, signal);

    const contact = currentAnswers.contact || "your inbox";
    const closingMsg = `You'll get a confirmation at ${contact} shortly. Hershey will personally follow up within a few hours. Probably sooner. The man lives in his terminal.`;
    d({ type: "ADD_MESSAGE", message: { from: "agent", text: closingMsg } });
    d({ type: "SET_PHASE", phase: { kind: "done" } });
    d({ type: "SET_STATUS", status: "done" });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;

    await delay(800, signal);
    d({
      type: "ADD_MESSAGE",
      message: {
        from: "agent",
        text: "Hmm, something went sideways sending that. No worries though \u2014 just email hello@hersheyg.com with what you told me and Hershey will pick it up.",
      },
    });
    d({ type: "SET_SUMMARY_REF", ref: "" });
    d({ type: "SET_PHASE", phase: { kind: "done" } });
    d({ type: "SET_STATUS", status: "done" });
  }
}

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

    // Save currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    // Focus first focusable element
    const focusFirst = () => {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0].focus();
    };

    // Small delay to let animation start
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
      // Restore focus
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

function TypingDots() {
  return (
    <div className="flex gap-1 py-1" role="status" aria-label="Agent is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-dim"
          style={{
            animation: "intake-bounce 1.2s infinite",
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

function AgentMessage({
  text,
  isTyping,
}: {
  text?: string;
  isTyping?: boolean;
}) {
  return (
    <div className="flex gap-2.5 items-start mb-4 intake-animate-in">
      <div className="w-7 h-7 rounded-md bg-accent-lit/10 border border-accent-lit/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs text-accent-lit font-mono font-semibold">
          H
        </span>
      </div>
      <div className="bg-bg/40 border border-line rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[85%]">
        {isTyping ? (
          <TypingDots />
        ) : (
          <p className="text-[13px] leading-relaxed text-text font-mono whitespace-pre-line">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-4 intake-animate-in">
      <div className="bg-accent-lit/10 border border-accent-lit/15 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[85%]">
        <p className="text-[13px] leading-relaxed text-accent-lit font-mono">
          {text}
        </p>
      </div>
    </div>
  );
}

function OptionButtons({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (opt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 ml-0 sm:ml-[38px] mt-3 intake-animate-in">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="font-mono text-xs px-3.5 py-2 border border-line rounded-lg
                     text-dim hover:border-accent-lit hover:text-accent-lit
                     hover:bg-accent-lit/10 hover:-translate-y-px transition-all duration-200
                     active:scale-[0.97]"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function TextInput({
  inputType,
  placeholder,
  onSubmit,
}: {
  inputType: "input" | "textarea";
  placeholder: string;
  onSubmit: (val: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const sharedClasses =
    "font-mono text-[13px] flex-1 px-3.5 py-2.5 border border-line rounded-lg bg-bg/40 text-text outline-none focus:border-accent-lit transition-colors placeholder:text-dim";

  return (
    <div className="flex gap-2 ml-0 sm:ml-[38px] mt-3 intake-animate-in">
      {inputType === "textarea" ? (
        <textarea
          ref={inputRef as RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${sharedClasses} min-h-[72px] resize-none max-h-[120px] leading-relaxed`}
        />
      ) : (
        <input
          ref={inputRef as RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={sharedClasses}
        />
      )}
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="font-mono text-xs px-4 py-2.5 border border-accent-lit rounded-lg
                   bg-accent-lit/10 text-accent-lit hover:bg-accent-lit/20 transition-all
                   disabled:opacity-25 disabled:cursor-not-allowed self-end"
      >
        →
      </button>
    </div>
  );
}

function SummaryCard({
  answers,
  refId,
}: {
  answers: Answers;
  refId: string;
}) {
  const rows: Array<[string, string] | "divider"> = [
    ["Project", answers.type ?? "\u2014"],
    [
      "Description",
      answers.describe ? truncate(answers.describe, 80) : "\u2014",
    ],
    "divider",
    ["Timeline", answers.timeline ?? "\u2014"],
    ["Budget", answers.budget ?? "\u2014"],
    "divider",
    ["Name", answers.name ?? "\u2014"],
    ["Contact", answers.contact ?? "\u2014"],
  ];

  return (
    <div className="bg-bg/40 border border-line rounded-xl p-4 px-4 sm:px-5 ml-0 sm:ml-[38px] mt-3 intake-animate-in">
      <div className="flex items-center gap-1.5 text-xs text-term-success mb-3 font-mono">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Brief sent · ref {refId}
      </div>
      <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3 sm:gap-x-4 gap-y-2 text-xs font-mono">
        {rows.map((row, i) =>
          row === "divider" ? (
            <div key={i} className="col-span-2 h-px bg-line my-1" />
          ) : (
            <div key={i} className="contents">
              <span className="text-dim">{row[0]}</span>
              <span className="text-text break-words">{row[1]}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IntakeChatContent — shared between desktop embed and mobile modal
   ═══════════════════════════════════════════════════════════════════════════ */

function IntakeChatContent({
  chatRef,
  messages,
  phase,
  stepIndex,
  answers,
  summaryRef,
  handleUserResponse,
  onClose,
  isModal,
}: {
  chatRef: RefObject<HTMLDivElement | null>;
  messages: Message[];
  phase: Phase;
  stepIndex: number;
  answers: Answers;
  summaryRef: string;
  handleUserResponse: (val: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}) {
  const isDone = phase.kind === "done" || phase.kind === "summary";
  const displayStep = isDone
    ? STEPS.length
    : Math.min(stepIndex + 1, STEPS.length);
  const progress = Math.round((displayStep / STEPS.length) * 100);

  return (
    <div
      className={`bg-surface ${
        isModal
          ? "flex flex-col h-full"
          : "border border-accent/40 rounded-[14px] overflow-hidden h-[460px] flex flex-col"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-accent/40 bg-bg/30 flex-shrink-0">
        {!isModal && (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-term-red" />
            <span className="w-2.5 h-2.5 rounded-full bg-term-yellow" />
            <span className="w-2.5 h-2.5 rounded-full bg-term-green" />
          </>
        )}
        {isModal && (
          <div className="w-7 h-7 rounded-md bg-accent-lit/10 border border-accent-lit/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-accent-lit font-mono font-semibold">
              H
            </span>
          </div>
        )}
        <span className="font-mono text-xs text-dim ml-1 sm:ml-2 flex-1">
          {isModal ? "Intake Agent" : "~/intake-agent"}
        </span>
        {stepIndex > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-[80px] sm:w-[100px] h-[3px] bg-accent/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-lit rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-dim">
              {displayStep}/{STEPS.length}
            </span>
          </div>
        )}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-dim hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close intake form"
          >
            <svg
              width="16"
              height="16"
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

      {/* Chat body — flex-1 with min-h-0 for scroll isolation */}
      <div
        ref={chatRef}
        className={`p-4 sm:p-6 font-mono text-sm leading-relaxed overflow-y-auto scroll-smooth intake-scroll flex-1 min-h-0`}
      >
        {messages.map((msg, i) =>
          msg.from === "agent" ? (
            <AgentMessage key={i} text={msg.text} />
          ) : (
            <UserMessage key={i} text={msg.text} />
          )
        )}

        {phase.kind === "typing" && <AgentMessage isTyping />}

        {phase.kind === "options" && (
          <OptionButtons
            options={phase.options}
            onSelect={handleUserResponse}
          />
        )}

        {phase.kind === "input" && (
          <TextInput
            inputType={phase.inputType}
            placeholder={phase.placeholder}
            onSubmit={handleUserResponse}
          />
        )}

        {(phase.kind === "summary" || phase.kind === "done") &&
          summaryRef && <SummaryCard answers={answers} refId={summaryRef} />}
      </div>

      {/* Input area bottom spacer — shrink-0 to keep it pinned */}
      <div className="flex-shrink-0">
        {/* Safe area spacer for modal on notched devices */}
        {isModal && (
          <div className="pb-[env(safe-area-inset-bottom,0px)]" />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Modal — rendered via React Portal
   ═══════════════════════════════════════════════════════════════════════════ */

function IntakeModal({
  isOpen,
  chatRef,
  messages,
  phase,
  stepIndex,
  answers,
  summaryRef,
  handleUserResponse,
  onClose,
  prefersReducedMotion,
}: {
  isOpen: boolean;
  chatRef: RefObject<HTMLDivElement | null>;
  messages: Message[];
  phase: Phase;
  stepIndex: number;
  answers: Answers;
  summaryRef: string;
  handleUserResponse: (val: string) => void;
  onClose: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useFocusTrap(modalRef, isOpen, onClose);
  useScrollLock(isOpen);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — z-[60] */}
          <motion.div
            key="intake-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 md:hidden"
            onClick={onClose}
          />
          {/* Modal — z-[61] */}
          <motion.div
            key="intake-modal"
            ref={modalRef}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
            }
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }
            }
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[61] md:hidden flex flex-col"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Project intake form"
          >
            <IntakeChatContent
              chatRef={chatRef}
              messages={messages}
              phase={phase}
              stepIndex={stepIndex}
              answers={answers}
              summaryRef={summaryRef}
              handleUserResponse={handleUserResponse}
              onClose={onClose}
              isModal
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function IntakeAgent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { messages, phase, stepIndex, answers, summaryRef, sessionId } = state;

  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const desktopChatRef = useRef<HTMLDivElement>(null);
  const modalChatRef = useRef<HTMLDivElement>(null);
  const hasStartedDesktop = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef(sessionId);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  // Keep sessionIdRef in sync with reducer state
  sessionIdRef.current = sessionId;

  // Pick a random greeting once per component mount
  const [greeting] = useState(() =>
    INTAKE_GREETINGS[Math.floor(Math.random() * INTAKE_GREETINGS.length)]
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (desktopChatRef.current) {
        desktopChatRef.current.scrollTop =
          desktopChatRef.current.scrollHeight;
      }
      if (modalChatRef.current) {
        modalChatRef.current.scrollTop = modalChatRef.current.scrollHeight;
      }
    });
  }, []);

  // Auto-scroll on state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, phase, scrollToBottom]);

  const handleUserResponse = useCallback(
    (val: string) => {
      const resolver = inputResolvers.get(sessionId);
      if (resolver) {
        inputResolvers.delete(sessionId);
        resolver(val);
      }
    },
    [sessionId]
  );

  const startSession = useCallback(() => {
    // Abort any previous session
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: "START_SESSION" });

    // Use ref to read the latest sessionId, avoiding stale-closure on double-tap.
    // START_SESSION increments by 1 in the reducer, so the new ID is ref + 1.
    const newSessionId = sessionIdRef.current + 1;

    runConversation(dispatch, newSessionId, controller.signal, greeting).catch(
      (err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Session was intentionally aborted — no-op
          return;
        }
        // eslint-disable-next-line no-console
        console.error("Intake conversation error:", err);
      }
    );
  }, [greeting]);

  const resetConversation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch({ type: "RESET" });
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    resetConversation();
    hasStartedDesktop.current = false;
  }, [resetConversation]);

  // Desktop: auto-start once when section scrolls into view
  useEffect(() => {
    if (!isInView || hasStartedDesktop.current) return;
    hasStartedDesktop.current = true;
    startSession();
  }, [isInView, startSession]);

  // Mobile: listen for open-intake-modal custom event
  useEffect(() => {
    const handler = () => {
      setModalOpen(true);
      startSession();
    };
    window.addEventListener("open-intake-modal", handler);
    return () => window.removeEventListener("open-intake-modal", handler);
  }, [startSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      inputResolvers.delete(sessionIdRef.current);
    };
  }, []);

  return (
    <>
      {/* Embedded section */}
      <section className="py-16 sm:py-32 sm:pb-16" ref={sectionRef}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="w-full max-w-[900px] mx-auto">
            <p className="font-mono text-[13px] font-medium tracking-widest uppercase text-accent-lit mb-5 sm:mb-6">
              03 // CONTACT
            </p>

            <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-3 sm:mb-4">
              {COPY.contact.heading}
            </h2>

            <p className="text-base sm:text-[17px] text-dim leading-relaxed max-w-[540px] mb-8 sm:mb-10">
              {COPY.contact.sub}
            </p>

            <div id="contact" className="scroll-mt-20" />

            {/* Desktop terminal — hidden on mobile */}
            <div className="hidden md:block mb-6">
              <IntakeChatContent
                chatRef={desktopChatRef}
                messages={messages}
                phase={phase}
                stepIndex={stepIndex}
                answers={answers}
                summaryRef={summaryRef}
                handleUserResponse={handleUserResponse}
              />
            </div>

            {/* Mobile prompt — tap to open fullscreen */}
            <div className="md:hidden mb-6">
              <button
                onClick={() => {
                  setModalOpen(true);
                  startSession();
                }}
                className="w-full bg-surface border border-accent/40 rounded-[14px] p-5 text-left group hover:border-accent-lit/30 active:scale-[0.99] transition-[color,border-color,transform]"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-md bg-accent-lit/10 border border-accent-lit/20 flex items-center justify-center">
                    <span className="text-xs text-accent-lit font-mono font-semibold">
                      H
                    </span>
                  </div>
                  <span className="font-mono text-[13px] text-text">
                    Intake Agent
                  </span>
                </div>
                <p className="font-mono text-[13px] text-dim leading-relaxed">
                  Tap to start a conversation. I&apos;ll ask a few quick
                  questions so Hershey knows what you need.
                </p>
                <span className="inline-block mt-3 font-mono text-xs text-accent-lit group-hover:translate-x-1 transition-transform">
                  Open chat →
                </span>
              </button>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-[13px] text-dim">
                <span className="w-1.5 h-1.5 rounded-full bg-term-success animate-pulse" />
                Typical reply time: under 24h
              </div>
              <a
                href="mailto:hello@hersheyg.com?subject=Project%20Inquiry"
                className="font-mono text-[13px] text-dim hover:text-accent-lit transition-colors"
              >
                hello@hersheyg.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen mobile modal — rendered as portal (AnimatePresence lives inside the portal) */}
      <IntakeModal
        isOpen={modalOpen}
        chatRef={modalChatRef}
        messages={messages}
        phase={phase}
        stepIndex={stepIndex}
        answers={answers}
        summaryRef={summaryRef}
        handleUserResponse={handleUserResponse}
        onClose={closeModal}
        prefersReducedMotion={prefersReducedMotion ?? false}
      />
    </>
  );
}
