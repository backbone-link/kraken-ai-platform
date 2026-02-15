"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Welcome to Kraken AI. I can help you configure agents, inspect pipelines, explore model usage, or navigate settings. What would you like to do?",
  },
];

const suggestedPrompts = [
  "Show me active agents",
  "How do I add an integration?",
  "Summarize today's usage",
];

const cannedResponses: Record<string, string> = {
  "Show me active agents":
    "You currently have **3 active agents**: Sentinel, Classifier-v2, and Summarizer. Head to the **Agents** page to inspect their configurations and recent runs.",
  "How do I add an integration?":
    "Navigate to **Integrations** in the sidebar. Click **Add Integration**, choose your provider (Slack, PagerDuty, Datadog, etc.), then follow the auth flow. Most integrations are live in under 2 minutes.",
  "Summarize today's usage":
    "Today's usage so far: **1.2M tokens** across 3 agents with an estimated cost of **$48.20**. Sentinel accounts for ~60% of token volume. Check the **Usage** page for the full breakdown.",
};

const defaultResponse =
  "I can help with that. Try navigating to the relevant section using the sidebar, or ask me a more specific question about agents, pipelines, models, or settings.";

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white/90">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export const ChatPanel = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "j") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    const handleCustom = () => toggle();
    window.addEventListener("keydown", handleKey);
    window.addEventListener("toggle-chat", handleCustom);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("toggle-chat", handleCustom);
    };
  }, [open, toggle]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const reply = cannedResponses[trimmed] ?? defaultResponse;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
      ]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-[380px] bg-bg-secondary border-l border-border-subtle flex flex-col z-[100]"
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-[52px] border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={15}
                  strokeWidth={1.5}
                  className="text-accent"
                />
                <span className="text-[13px] font-semibold text-white/90">
                  AI Assistant
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/[0.07] transition-colors"
              >
                <X size={14} strokeWidth={1.5} className="text-white/50" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                      <Bot size={11} strokeWidth={2} className="text-accent/70" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-[1.55]",
                      msg.role === "user"
                        ? "bg-accent/15 text-white/85"
                        : "bg-white/[0.06] text-white/70"
                    )}
                  >
                    {parseBold(msg.content)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-start">
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    <Bot size={11} strokeWidth={2} className="text-accent/70" />
                  </div>
                  <div className="bg-white/[0.06] rounded-lg px-3 py-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-gentle-pulse" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-white/30 animate-gentle-pulse"
                      style={{ animationDelay: "0.3s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-white/30 animate-gentle-pulse"
                      style={{ animationDelay: "0.6s" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested prompts */}
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={typing}
                  className="text-[11px] text-white/50 bg-white/[0.05] hover:bg-white/[0.09] hover:text-white/65 rounded-md px-2.5 py-1 transition-colors disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 pb-4 pt-2 border-t border-border-subtle"
            >
              <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-accent/30 transition-shadow">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-[13px] text-white/85 placeholder:text-white/25 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-accent transition-colors disabled:opacity-30 disabled:hover:text-white/40"
                >
                  <Send size={13} strokeWidth={1.5} />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
