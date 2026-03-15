"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Conversation } from "@11labs/client";

type Status = "idle" | "connecting" | "listening" | "speaking" | "error";

// Inline SVG icons (no lucide-react dependency)
const MicIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const MicOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
    <path d="M5 10v2a7 7 0 0 0 12 5" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const Loader2Icon = () => (
  <motion.svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    aria-hidden="true"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </motion.svg>
);

const AGENT_ID = "agent_5801kkqge744f5e8pn1bg9th82jc";

const statusLabel: Record<Status, string> = {
  idle: "Talk to my AI",
  connecting: "Connecting...",
  listening: "Listening...",
  speaking: "Speaking...",
  error: "Mic denied",
};

export default function VoiceWidget() {
  const [status, setStatus] = useState<Status>("idle");
  const [conversation, setConversation] = useState<Conversation | null>(null);

  const startConversation = useCallback(async () => {
    setStatus("connecting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const conv = await Conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
        onConnect: () => setStatus("listening"),
        onDisconnect: () => {
          setStatus("idle");
          setConversation(null);
        },
        onError: () => {
          setStatus("idle");
          setConversation(null);
        },
        onModeChange: ({ mode }: { mode: string }) =>
          setStatus(mode === "speaking" ? "speaking" : "listening"),
      });
      setConversation(conv);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, []);

  const endConversation = useCallback(async () => {
    await conversation?.endSession();
    setConversation(null);
    setStatus("idle");
  }, [conversation]);

  const handleClick = () => {
    if (status === "idle" || status === "error") {
      startConversation();
    } else if (status === "listening" || status === "speaking") {
      endConversation();
    }
  };

  const isActive = status === "listening" || status === "speaking";
  const isConnecting = status === "connecting";
  const isError = status === "error";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Pulsing ring for active states */}
        <AnimatePresence>
          {(isActive) && (
            <motion.span
              key="pulse-ring"
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0.5, 0], scale: [1, 1.8] }}
              exit={{ opacity: 0 }}
              transition={{
                repeat: Infinity,
                duration: status === "speaking" ? 1.1 : 1.6,
                ease: "easeOut",
              }}
              style={{
                border: `1px solid ${status === "speaking" ? "rgba(91,155,213,0.7)" : "rgba(91,155,213,0.4)"}`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          onClick={handleClick}
          disabled={isConnecting}
          aria-label={statusLabel[status]}
          className="relative flex items-center gap-2 font-mono text-[13px] tracking-wide rounded-full px-7 py-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit select-none"
          style={{
            border: `1px solid ${
              isError
                ? "rgba(239,68,68,0.6)"
                : isActive
                ? "rgba(91,155,213,0.55)"
                : "rgba(91,155,213,0.25)"
            }`,
            background: isActive
              ? "rgba(30,58,95,0.35)"
              : "transparent",
            color: isError ? "rgb(252,165,165)" : "rgb(203,213,225)",
            cursor: isConnecting ? "not-allowed" : "pointer",
          }}
          whileHover={
            !isConnecting
              ? {
                  borderColor: isActive
                    ? "rgba(91,155,213,0.8)"
                    : "rgba(91,155,213,0.5)",
                  boxShadow: "0 0 14px rgba(91,155,213,0.15)",
                }
              : {}
          }
          whileTap={!isConnecting ? { scale: 0.97 } : {}}
          animate={
            isError
              ? {
                  borderColor: [
                    "rgba(239,68,68,0.6)",
                    "rgba(239,68,68,0.9)",
                    "rgba(239,68,68,0.6)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <Loader2Icon />
              ) : isActive ? (
                <MicOffIcon />
              ) : (
                <MicIcon />
              )}
              <span>{statusLabel[status]}</span>
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Disclaimer */}
      <p
        className="font-mono text-[10px] tracking-wide"
        style={{ color: "rgba(203,213,225,0.3)" }}
      >
        AI assistant — not the real Hershey
      </p>
    </div>
  );
}
