import React, { useState } from "react";
import IntentInput from "./IntentInput";
import IntentOutput from "./IntentOutput";
import { ChevronLeft, ChevronRight } from "lucide-react";

// React.FC: typescript type helper that tells compiler this is a React Functional Component, will return JSX.Element

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(33); // percentage of screen width
  const [messages, setMessages] = useState<string[]>([]); // a hook of a string array

  // function to handle message submission by appending to messages array
  const handleSubmit = (message: string) => {
    setMessages((prev) => [...prev, `User: ${message}`, "Agent: (mock reply)"]);
  };

  return (
    <>
      {/* Toggle button (floating on the right middle) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 z-40 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-l-lg shadow-lg hover:bg-gray-700 transition"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed top-0 right-0 h-full z-30 bg-white/70 backdrop-blur-md border-l border-gray-300 shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: `${width}vw` }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-100/60">
            <h2 className="text-sm font-semibold text-gray-800">FYP Agent</h2>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <p key={i} className="text-gray-800">{msg}</p>
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
