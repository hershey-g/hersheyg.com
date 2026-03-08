"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { STEPS, AGENT_RESPONSES, INTAKE_GREETINGS } from "./intake-agent-constants";
import { COPY } from "@/lib/constants";

// Types

interface Message {
  from: "agent" | "user";
  text: string;
}

type Answers = Record<string, string>;

type Phase =
  | { kind: "idle" }
  | { kind: "typing" }
  | { kind: "options"; stepId: string; options: string[] }
  | { kind: "input"; stepId: string; inputType: "input" | "textarea"; placeholder: string }
  | { kind: "summary"; answers: Answers; ref: string }
  | { kind: "done" };

// Helpers

function generateRef() {
  return "#PRJ-" + Math.floor(1000 + Math.random() * 9000);
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// Sub-components

function TypingDots() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-500"
          style={{
            animation: "intake-bounce 1.2s infinite",
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

function AgentMessage({ text, isTyping }: { text?: string; isTyping?: boolean }) {
  return (
    <div className="flex gap-2.5 items-start mb-4 intake-animate-in">
      <div className="w-7 h-7 rounded-md bg-sky-400/10 border border-sky-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs text-sky-400 font-mono font-semibold">H</span>
      </div>
      <div className="bg-black/20 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[85%]">
        {isTyping ? (
          <TypingDots />
        ) : (
          <p className="text-[13px] leading-relaxed text-slate-200 font-mono whitespace-pre-line">
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
      <div className="bg-sky-400/10 border border-sky-400/15 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[85%]">
        <p className="text-[13px] leading-relaxed text-sky-400 font-mono">{text}</p>
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
          className="font-mono text-xs px-3.5 py-2 border border-slate-700 rounded-lg
                     text-slate-400 hover:border-sky-400 hover:text-sky-400
                     hover:bg-sky-400/10 hover:-translate-y-px transition-all duration-200
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
    // Small delay to let modal animation finish before focusing
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
    "font-mono text-[13px] flex-1 px-3.5 py-2.5 border border-slate-700 rounded-lg bg-black/25 text-slate-200 outline-none focus:border-sky-400 transition-colors placeholder:text-slate-500";

  return (
    <div className="flex gap-2 ml-0 sm:ml-[38px] mt-3 intake-animate-in">
      {inputType === "textarea" ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${sharedClasses} min-h-[72px] resize-y leading-relaxed`}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
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
        className="font-mono text-xs px-4 py-2.5 border border-sky-400 rounded-lg
                   bg-sky-400/10 text-sky-400 hover:bg-sky-400/20 transition-all
                   disabled:opacity-25 disabled:cursor-not-allowed self-end"
      >
        →
      </button>
    </div>
  );
}

function SummaryCard({ answers, refId }: { answers: Answers; refId: string }) {
  const rows: Array<[string, string] | "divider"> = [
    ["Project", answers.type ?? "\u2014"],
    ["Description", answers.describe ? truncate(answers.describe, 80) : "\u2014"],
    "divider",
    ["Timeline", answers.timeline ?? "\u2014"],
    ["Budget", answers.budget ?? "\u2014"],
    "divider",
    ["Name", answers.name ?? "\u2014"],
    ["Contact", answers.contact ?? "\u2014"],
  ];

  return (
    <div className="bg-black/25 border border-slate-700 rounded-xl p-4 px-4 sm:px-5 ml-0 sm:ml-[38px] mt-3 intake-animate-in">
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-3 font-mono">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Brief sent · ref {refId}
      </div>
      <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3 sm:gap-x-4 gap-y-2 text-xs font-mono">
        {rows.map((row, i) =>
          row === "divider" ? (
            <div key={i} className="col-span-2 h-px bg-slate-700 my-1" />
          ) : (
            <div key={i} className="contents">
              <span className="text-slate-400">{row[0]}</span>
              <span className="text-slate-200 break-words">{row[1]}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Chat content — shared between embedded and modal views
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
  chatRef: React.RefObject<HTMLDivElement | null>;
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
  const displayStep = isDone ? STEPS.length : Math.min(stepIndex + 1, STEPS.length);
  const progress = Math.round((displayStep / STEPS.length) * 100);

  return (
    <div className={`bg-[#162232] ${isModal ? "flex flex-col h-full" : "border border-[#1e3348] rounded-[14px] overflow-hidden"}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#1e3348] bg-black/15 flex-shrink-0">
        {!isModal && (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </>
        )}
        {isModal && (
          <div className="w-7 h-7 rounded-md bg-sky-400/10 border border-sky-400/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-sky-400 font-mono font-semibold">H</span>
          </div>
        )}
        <span className="font-mono text-xs text-slate-400 ml-1 sm:ml-2 flex-1">
          {isModal ? "Intake Agent" : "~/intake-agent"}
        </span>
        {stepIndex > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-[80px] sm:w-[100px] h-[3px] bg-[#1e3348] rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {displayStep}/{STEPS.length}
            </span>
          </div>
        )}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close intake form"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Chat body */}
      <div
        ref={chatRef}
        className={`p-4 sm:p-6 font-mono text-sm leading-relaxed overflow-y-auto scroll-smooth intake-scroll ${
          isModal ? "flex-1" : "min-h-[380px] max-h-[520px]"
        }`}
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
          <OptionButtons options={phase.options} onSelect={handleUserResponse} />
        )}

        {phase.kind === "input" && (
          <TextInput
            inputType={phase.inputType}
            placeholder={phase.placeholder}
            onSubmit={handleUserResponse}
          />
        )}

        {(phase.kind === "summary" || phase.kind === "done") && summaryRef && (
          <SummaryCard answers={answers} refId={summaryRef} />
        )}
      </div>

      {/* Safe area spacer for modal on notched devices */}
      {isModal && (
        <div className="flex-shrink-0 pb-[env(safe-area-inset-bottom,0px)]" />
      )}
    </div>
  );
}

// Main Component

export default function IntakeAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [summaryRef, setSummaryRef] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutIds.current.push(id);
    return id;
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
  }, []);

  // Resolver ref for async user input
  const resolverRef = useRef<((val: string) => void) | null>(null);

  const handleUserResponse = useCallback(
    (val: string) => {
      if (resolverRef.current) {
        resolverRef.current(val);
        resolverRef.current = null;
      }
    },
    []
  );

  // Pick a random greeting once per component mount
  const [greeting] = useState(() =>
    INTAKE_GREETINGS[Math.floor(Math.random() * INTAKE_GREETINGS.length)]
  );

  // Run the full agent flow
  const runFlow = useCallback(async () => {
    const currentAnswers: Answers = {};

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];

      let msg = step.agentMsg;
      if (step.id === "type") {
        msg = greeting;
      } else if (step.id === "contact") {
        msg = `Last one, ${currentAnswers.name || "friend"}. Where should Hershey actually reach you?`;
      }

      await new Promise<void>((resolve) => {
        setPhase({ kind: "typing" });
        scrollToBottom();

        const text = msg ?? "";
        const delay = 600 + Math.min(text.length * 8, 1200);
        trackedTimeout(() => {
          setMessages((prev) => [...prev, { from: "agent", text }]);
          setStepIndex(i + 1);
          scrollToBottom();
          resolve();
        }, delay);
      });

      const userAnswer = await new Promise<string>((resolve) => {
        if (step.options) {
          setPhase({ kind: "options", stepId: step.id, options: step.options });
        } else if (step.type) {
          setPhase({
            kind: "input",
            stepId: step.id,
            inputType: step.type,
            placeholder: step.placeholder ?? "",
          });
        }
        scrollToBottom();
        resolverRef.current = resolve;
      });

      currentAnswers[step.id] = userAnswer;
      setAnswers({ ...currentAnswers });
      setMessages((prev) => [...prev, { from: "user", text: userAnswer }]);
      scrollToBottom();

      const contextReply = AGENT_RESPONSES[step.id]?.[userAnswer];
      if (contextReply) {
        await new Promise<void>((resolve) => {
          setPhase({ kind: "typing" });
          scrollToBottom();

          const delay = 600 + Math.min(contextReply.length * 8, 1200);
          trackedTimeout(() => {
            setMessages((prev) => [...prev, { from: "agent", text: contextReply }]);
            scrollToBottom();
            resolve();
          }, delay);
        });
      }
    }

    setStepIndex(STEPS.length);

    await new Promise<void>((resolve) => {
      setPhase({ kind: "typing" });
      scrollToBottom();
      trackedTimeout(() => {
        const wrapMsg = "That's a wrap. Here's what I'm sending Hershey:";
        setMessages((prev) => [...prev, { from: "agent", text: wrapMsg }]);
        scrollToBottom();
        resolve();
      }, 1000);
    });

    const ref = generateRef();
    setSummaryRef(ref);
    setPhase({ kind: "summary", answers: currentAnswers, ref });
    scrollToBottom();

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentAnswers, ref }),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }
    } catch {
      await new Promise<void>((resolve) => {
        trackedTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              from: "agent",
              text: "Hmm, something went sideways sending that. No worries though \u2014 just email hello@hersheyg.com with what you told me and Hershey will pick it up.",
            },
          ]);
          setSummaryRef("");
          setPhase({ kind: "done" });
          scrollToBottom();
          resolve();
        }, 800);
      });
      return;
    }

    trackedTimeout(() => {
      const contact = currentAnswers.contact || "your inbox";
      const closingMsg = `You'll get a confirmation at ${contact} shortly. Hershey will personally follow up within a few hours. Probably sooner. The man lives in his terminal.`;

      setPhase({ kind: "typing" });
      scrollToBottom();

      trackedTimeout(() => {
        setMessages((prev) => [...prev, { from: "agent", text: closingMsg }]);
        setPhase({ kind: "done" });
        scrollToBottom();
      }, 1200);
    }, 1200);
  }, [scrollToBottom, trackedTimeout, greeting]);

  // Start flow when the section enters viewport (desktop)
  useEffect(() => {
    if (!isInView || hasRun.current) return;
    hasRun.current = true;
    runFlow();

    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  // Listen for mobile modal open requests
  useEffect(() => {
    const handler = () => {
      setModalOpen(true);
      if (!hasRun.current) {
        hasRun.current = true;
        runFlow();
      }
    };
    window.addEventListener("open-intake-modal", handler);
    return () => window.removeEventListener("open-intake-modal", handler);
  }, [runFlow]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  // Auto-scroll on message/phase changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, phase, scrollToBottom]);

  return (
    <>
      {/* Embedded section */}
      <section className="py-16 sm:py-32 sm:pb-16" ref={sectionRef}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="w-full max-w-[900px] mx-auto">
            <p className="font-mono text-[13px] font-medium tracking-widest uppercase text-sky-400 mb-5 sm:mb-6">
              03 // CONTACT
            </p>

            <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-3 sm:mb-4">
              {COPY.contact.heading}
            </h2>

            <p className="text-base sm:text-[17px] text-slate-400 leading-relaxed max-w-[540px] mb-8 sm:mb-10">
              {COPY.contact.sub}
            </p>

            <div id="contact" className="scroll-mt-20" />

            {/* Desktop terminal — hidden on mobile */}
            <div className="hidden md:block mb-6">
              <IntakeChatContent
                chatRef={chatRef}
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
                  if (!hasRun.current) {
                    hasRun.current = true;
                    runFlow();
                  }
                }}
                className="w-full bg-[#162232] border border-[#1e3348] rounded-[14px] p-5 text-left group hover:border-sky-400/30 transition-colors active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-md bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
                    <span className="text-xs text-sky-400 font-mono font-semibold">H</span>
                  </div>
                  <span className="font-mono text-[13px] text-slate-200">Intake Agent</span>
                </div>
                <p className="font-mono text-[13px] text-slate-400 leading-relaxed">
                  Tap to start a conversation. I&apos;ll ask a few quick questions so Hershey knows what you need.
                </p>
                <span className="inline-block mt-3 font-mono text-xs text-sky-400 group-hover:translate-x-1 transition-transform">
                  Open chat →
                </span>
              </button>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-[13px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Typical reply time: under 24h
              </div>
              <a
                href="mailto:hello@hersheyg.com?subject=Project%20Inquiry"
                className="font-mono text-[13px] text-slate-400 hover:text-sky-400 transition-colors"
              >
                hello@hersheyg.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen mobile modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[49] bg-black/60 md:hidden"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 z-50 md:hidden"
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
                onClose={() => setModalOpen(false)}
                isModal
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
