import React, { useState } from "react";
import SubmitIntentButton from "./SubmitIntentButton";
interface IntentInputProps {
  onSubmit: (message: string) => void;
}

const IntentInput: React.FC<IntentInputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        placeholder="Type an intent..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 rounded-md border border-gray-300 bg-white/80 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <SubmitIntentButton />
    </form>
  );
};

export default IntentInput;
