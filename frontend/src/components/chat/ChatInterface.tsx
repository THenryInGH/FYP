import React, { useState } from "react";
import IntentInput from "./IntentInput";
import { sendPromptToLLM } from "../../utils/llmApi";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { onosApi } from "../../utils/onosApi"; // ✅ Assuming you already have this

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(33);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);


  const handleSubmit = async (message: string) => {
    setMessages((prev) => [...prev, { role: "User", text: message }]);
    const reply = await sendPromptToLLM(message);
    setMessages((prev) => [...prev, { role: "Agent", text: reply }]);
  };

  const handleApplyConfiguration = async (configText: string) => {
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
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-100/60">
            <h2 className="text-sm font-semibold text-gray-800">FYP Agent</h2>
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

          {/* Chat messages */}
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
          </div>


          {/* Input area */}
          <div className="p-3 border-t border-gray-200 bg-gray-100/60">
            <IntentInput onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
