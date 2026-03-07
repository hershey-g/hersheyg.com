"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { STEPS, AGENT_RESPONSES, type AgentStep } from "./intake-agent-constants";
import { DEMO_SCRIPTS, DEMO_TIMING, createRotation, type DemoMessage } from "./conversation-constants";

// Types

interface Message {
  from: "agent" | "user";
  text: string;
}

type Answers = Record<string, string>;

type Phase =
  | { kind: "demo" }
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
      <div className="bg-black/20 border border-slate-700 rounded-xl px-4 py-3 max-w-[85%]">
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
      <div className="bg-sky-400/10 border border-sky-400/15 rounded-xl px-4 py-3 max-w-[85%]">
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
    <div className="flex flex-wrap gap-2 ml-[38px] mt-3 intake-animate-in">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="font-mono text-xs px-4 py-2 border border-slate-700 rounded-lg
                     text-slate-400 hover:border-sky-400 hover:text-sky-400
                     hover:bg-sky-400/10 hover:-translate-y-px transition-all duration-200"
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
    inputRef.current?.focus();
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
    <div className="flex gap-2 ml-[38px] mt-3 intake-animate-in">
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
    <div className="bg-black/25 border border-slate-700 rounded-xl p-4 px-5 ml-[38px] mt-3 intake-animate-in">
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-3 font-mono">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Brief sent · ref {refId}
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-xs font-mono">
        {rows.map((row, i) =>
          row === "divider" ? (
            <div key={i} className="col-span-2 h-px bg-slate-700 my-1" />
          ) : (
            <div key={i} className="contents">
              <span className="text-slate-400">{row[0]}</span>
              <span className="text-slate-200">{row[1]}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Main Component

export default function IntakeAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: "demo" });
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [summaryRef, setSummaryRef] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);
  const getNextScript = useRef(createRotation(DEMO_SCRIPTS)).current;
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([]);
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

  const playDemo = useCallback(async () => {
    const script = getNextScript();
    setPhase({ kind: "demo" });

    for (const msg of script.messages) {
      if (msg.from === "visitor") {
        await new Promise<void>((r) => trackedTimeout(r, DEMO_TIMING.visitorDelay));
        setDemoMessages((prev) => [...prev, msg]);
        scrollToBottom();
        await new Promise<void>((r) => trackedTimeout(r, DEMO_TIMING.messageReveal));
      } else {
        setPhase({ kind: "typing" });
        scrollToBottom();
        await new Promise<void>((r) => trackedTimeout(r, DEMO_TIMING.agentTypingShow));
        setDemoMessages((prev) => [...prev, msg]);
        setPhase({ kind: "demo" });
        scrollToBottom();
        await new Promise<void>((r) => trackedTimeout(r, DEMO_TIMING.agentDelay));
      }
    }

    await new Promise<void>((r) => trackedTimeout(r, DEMO_TIMING.pauseAfterScript));
    setDemoMessages([]);
  }, [getNextScript, scrollToBottom, trackedTimeout]);

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

  // Run the full agent flow
  const runFlow = useCallback(async () => {
    const currentAnswers: Answers = {};

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];

      // Build the agent message
      let msg = step.agentMsg;
      if (step.id === "contact") {
        msg = `Last one, ${currentAnswers.name || "friend"}. Where should Hershey actually reach you?`;
      }

      // Show typing, then message
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

      // Wait for user response
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

        // Store the resolver so handlers can call it
        resolverRef.current = resolve;
      });

      // Record the answer
      currentAnswers[step.id] = userAnswer;
      setAnswers({ ...currentAnswers });

      // Add user message
      setMessages((prev) => [...prev, { from: "user", text: userAnswer }]);
      scrollToBottom();

      // Agent contextual response (if exists for this step)
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

    // Final summary
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

    // POST to API
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
      // Show error as agent message
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

    // Closing message after successful submission
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
  }, [scrollToBottom, trackedTimeout]);

  // Kick off agent when section enters viewport
  useEffect(() => {
    if (!isInView || hasRun.current) return;
    hasRun.current = true;

    // Skip demo choice for reduced motion — go straight to intake
    if (prefersReducedMotion) {
      setPhase({ kind: "typing" });
      runFlow();
      return;
    }

    (async () => {
      // Show greeting with choice
      setPhase({ kind: "typing" });
      scrollToBottom();
      await new Promise<void>((r) => trackedTimeout(r, 800));
      setMessages([{
        from: "agent",
        text: "Hey — I'm the intake agent. I'll ask a few quick questions so Hershey knows what you need.\n\nWant to see a recent project conversation first?",
      }]);
      scrollToBottom();

      // Wait for user choice
      const choice = await new Promise<string>((resolve) => {
        setPhase({
          kind: "options",
          stepId: "demo-choice",
          options: ["Show me an example", "Let's get started"],
        });
        scrollToBottom();
        resolverRef.current = resolve;
      });

      // Add user response
      setMessages((prev) => [...prev, { from: "user", text: choice }]);
      scrollToBottom();

      if (choice === "Show me an example") {
        await playDemo();
      }

      // Clear pre-step messages for clean intake start
      setMessages([]);
      runFlow();
    })();

    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  // Auto-scroll on message/phase changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, phase, demoMessages, scrollToBottom]);

  const isDone = phase.kind === "done" || phase.kind === "summary";
  const displayStep = isDone ? STEPS.length : Math.min(stepIndex + 1, STEPS.length);
  const progress = Math.round((displayStep / STEPS.length) * 100);

  return (
    <section className="py-16 sm:py-32" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="w-full max-w-[900px] mx-auto">
          <p className="font-mono text-[13px] font-medium tracking-widest uppercase text-sky-400 mb-6">
            03 // CONTACT
          </p>

          <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-4">
            Got a system that needs building?
          </h2>

          <p className="text-[17px] text-slate-400 leading-relaxed max-w-[540px] mb-10">
            I take on a limited number of projects at a time. No pitch decks required. Just tell me what
            you need built.
          </p>

          <div id="contact" className="scroll-mt-20" />
          {/* Terminal */}
          <div className="bg-[#162232] border border-[#1e3348] rounded-[14px] overflow-hidden mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1e3348] bg-black/15">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="font-mono text-xs text-slate-400 ml-2 flex-1">~/intake-agent</span>
              {stepIndex > 0 && phase.kind !== "demo" && (
                <div className="flex items-center gap-2">
                  <div className="w-[100px] h-[3px] bg-[#1e3348] rounded-full overflow-hidden">
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
            </div>

            {/* Chat body */}
            <div
              ref={chatRef}
              className="p-6 font-mono text-sm leading-relaxed min-h-[380px] max-h-[520px] overflow-y-auto scroll-smooth intake-scroll"
            >
              {(phase.kind === "demo" || (phase.kind === "typing" && demoMessages.length > 0 && messages.length === 0)) && (
                <>
                  {demoMessages.map((msg, i) =>
                    msg.from === "agent" ? (
                      <AgentMessage key={`demo-${i}`} text={msg.text} />
                    ) : (
                      <UserMessage key={`demo-${i}`} text={msg.text} />
                    )
                  )}
                </>
              )}

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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 font-mono text-[13px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Currently accepting new projects.
            </div>
            <a
              href="mailto:hello@hersheyg.com?subject=Project%20Inquiry"
              className="font-mono text-[13px] text-slate-400 hover:text-sky-400 transition-colors"
            >
              or just email hello@hersheyg.com →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
