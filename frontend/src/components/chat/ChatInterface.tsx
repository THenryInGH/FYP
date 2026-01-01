import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import IntentInput from "./IntentInput";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { onosApi } from "../../utils/onosApi"; // ✅ Assuming you already have this
import { useAuth } from "../../auth/AuthContext";
import {
  createConversation,
  listConversations,
  listMessages,
  sendMessage,
  type Conversation,
  type Message as DbMessage,
} from "../../utils/chatApi";

type Message = {
  role: "User" | "Agent";
  text: string;
  latencyMs?: number;
  model?: string;
  useRag?: boolean;
};

const MODEL_OPTIONS = [
  { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B" },
  { value: "qwen/qwen3-32b", label: "Qwen3 32B" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
  { value: "whisper-large-v3", label: "OpenAI Whisper 3" },
  
];

const ChatInterface: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(33);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].value);
  const [useRag, setUseRag] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contextExceeded, setContextExceeded] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.conversation_id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  function dbToUiMessages(rows: DbMessage[]): Message[] {
    return rows
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "user" ? "User" : "Agent",
        text: m.content,
      }));
  }

  async function refreshConversations(selectId?: number | null) {
    const list = await listConversations();
    setConversations(list);
    const nextId = selectId ?? activeConversationId ?? (list.length ? list[0].conversation_id : null);
    setActiveConversationId(nextId);
    return list;
  }

  async function ensureConversation() {
    const list = await refreshConversations();
    if (!list.length) {
      const convo = await createConversation();
      setConversations([convo]);
      setActiveConversationId(convo.conversation_id);
      return convo.conversation_id;
    }
    return (activeConversationId ?? list[0].conversation_id) as number;
  }

  async function loadConversationMessages(conversationId: number) {
    const rows = await listMessages(conversationId);
    setMessages(dbToUiMessages(rows));
  }

  useEffect(() => {
    if (!isOpen) return;
    if (!user) return;
    ensureConversation().catch((e: any) => setError(e?.message || "Failed to load chats"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.user_id]);

  useEffect(() => {
    if (!isOpen) return;
    if (!user) return;
    if (activeConversationId == null) return;
    loadConversationMessages(activeConversationId).catch((e: any) =>
      setError(e?.message || "Failed to load messages")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, isOpen, user?.user_id]);

  const handleSubmit = async (message: string) => {
    if (!user) {
      setError("Login required to use the chat.");
      setIsOpen(true);
      nav("/login");
      return;
    }
    const convoId = activeConversationId ?? (await ensureConversation());
    setContextExceeded(false);
    setMessages((prev) => [...prev, { role: "User", text: message }]);
    setIsSubmitting(true);
    setError(null);

    const start = performance.now();

    try {
      const res = await sendMessage(convoId, {
        content: message,
        model: selectedModel,
        use_rag: useRag,
      });
      const latency = performance.now() - start;

      setLastLatencyMs(latency);
      setConversations((prev) => {
        const next = prev.slice();
        const idx = next.findIndex((c) => c.conversation_id === res.conversation.conversation_id);
        if (idx >= 0) next[idx] = res.conversation;
        else next.unshift(res.conversation);
        return next;
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "Agent",
          text: res.assistant_message.content,
          latencyMs: latency,
          model: selectedModel,
          useRag: useRag,
        },
      ]);
    } catch (err) {
      console.error("Error contacting LLM API:", err);
      const msg = (err as any)?.message || "";
      if (msg.toLowerCase().includes("not authenticated") || msg.includes("401")) {
        setError("Login required to use the chat.");
        nav("/login");
      } else if (msg.toLowerCase().includes("context too long")) {
        setError(msg);
        setContextExceeded(true);
      } else {
        setError(msg || "Unable to contact LLM Agent. Please try again.");
      }
      setMessages((prev) => [
        ...prev,
        { role: "Agent", text: "Error: Unable to contact LLM Agent." },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyConfiguration = async (configText: string) => {
    if (!user) {
      alert("Login required to apply configuration.");
      nav("/login");
      return;
    }
    const result = await onosApi.applyConfiguration(configText);
    if (result) {
      alert("Intent applied successfully!");
    } else {
      alert("Intent installation failed or was blocked.");
    }
  };


  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 z-40 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-l-lg shadow-lg hover:bg-gray-700 transition"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed top-0 right-0 h-full z-30 bg-white/80 backdrop-blur-md border-l border-gray-300 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: `${width}vw` }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col gap-2 p-3 border-b border-gray-200 bg-gray-100/60">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">FYP Agent</h2>
                {lastLatencyMs !== null && (
                  <p className="text-xs text-gray-600">
                    Last response: {Math.round(lastLatencyMs)} ms
                  </p>
                )}
                {activeConversation ? (
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Chat: {activeConversation.title ?? `#${activeConversation.conversation_id}`}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWidth((w) => Math.max(20, w - 5))}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setWidth((w) => Math.min(60, w + 5))}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-gray-700 flex items-center gap-2">
                Model
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="rounded border border-gray-300 bg-white/80 px-2 py-1 text-xs text-gray-800"
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={useRag}
                  onChange={(e) => setUseRag(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Enable RAG
              </label>

              {error && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                  {error}
                </span>
              )}
              {contextExceeded && user ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
                  onClick={async () => {
                    const convo = await createConversation();
                    setConversations((prev) => [convo, ...prev]);
                    setActiveConversationId(convo.conversation_id);
                    setMessages([]);
                    setContextExceeded(false);
                    setError(null);
                  }}
                >
                  Start new chat
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 min-h-0 flex">
            {/* Left: conversations list */}
            <div className="w-44 border-r bg-white/70 overflow-y-auto">
              <div className="p-2 border-b flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-gray-700">Chats</div>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-60"
                  disabled={!user}
                  onClick={async () => {
                    if (!user) {
                      nav("/login");
                      return;
                    }
                    const convo = await createConversation();
                    setConversations((prev) => [convo, ...prev]);
                    setActiveConversationId(convo.conversation_id);
                    setMessages([]);
                    setError(null);
                    setContextExceeded(false);
                  }}
                >
                  New
                </button>
              </div>
              <div className="divide-y">
                {conversations.map((c) => (
                  <button
                    key={c.conversation_id}
                    type="button"
                    className={`w-full text-left px-2 py-2 text-xs hover:bg-gray-50 ${
                      c.conversation_id === activeConversationId ? "bg-gray-50" : ""
                    }`}
                    onClick={() => setActiveConversationId(c.conversation_id)}
                  >
                    <div className="font-medium text-gray-900 truncate">
                      {c.title ?? `Chat #${c.conversation_id}`}
                    </div>
                  </button>
                ))}
                {!conversations.length ? (
                  <div className="p-3 text-xs text-gray-500">
                    {user ? "No chats yet." : "Login to see chats."}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right: messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              {messages.map((msg, i) => (
                <div key={i}>
                  <p
                    className={`${
                      msg.role === "User"
                        ? "text-blue-700"
                        : "text-green-800 font-medium"
                    }`}
                  >
                    <strong>{msg.role}:</strong> {msg.text.split("```json")[0].trim()}
                  </p>

                  {msg.role === "Agent" && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      {msg.latencyMs !== undefined && (
                        <span>Response time: {Math.round(msg.latencyMs)} ms</span>
                      )}
                      {msg.model && <span> · Model: {msg.model}</span>}
                      {msg.useRag !== undefined && (
                        <span> · RAG {msg.useRag ? "on" : "off"}</span>
                      )}
                    </p>
                  )}

                  {/* JSON container if exists */}
                  {msg.text.includes("```json") && (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-2 shadow-inner overflow-x-auto">
                      <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap">
                        {msg.text.match(/```json\s*([\s\S]*?)```/)?.[1] ?? ""}
                      </pre>

                      {/* Apply button */}
                      <button
                        onClick={() =>
                          handleApplyConfiguration(
                            msg.text.match(/```json\s*([\s\S]*?)```/)?.[1] ?? ""
                          )
                        }
                        className="mt-3 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                      >
                        Apply Configuration
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!messages.length ? (
                <div className="text-sm text-gray-500">
                  {user ? "Start by sending a message." : "Login to start chatting."}
                </div>
              ) : null}
            </div>
          </div>


          {/* Input area */}
          <div className="p-3 border-t border-gray-200 bg-gray-100/60">
            <IntentInput onSubmit={handleSubmit} disabled={isSubmitting || !user} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
