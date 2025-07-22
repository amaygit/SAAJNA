"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function LawAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai/law", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const data = await res.json();
    const botMessage: Message = { role: "assistant", content: data.reply };
    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Law AI - Indian Legal Chatbot</h1>
      <div className="space-y-3 max-h-[55vh] overflow-y-auto border rounded-md p-4 bg-muted mb-4">
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <strong className={m.role === "user" ? "text-blue-600" : "text-green-600"}>
              {m.role === "user" ? "You" : "Law AI"}:
            </strong>{" "}
            {m.content}
          </div>
        ))}
        {loading && <p className="text-gray-500 italic">Thinking...</p>}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder="Ask about Indian law, IPC, legal cases..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>
          <MessageCircle className="w-4 h-4 mr-1" />
          Send
        </Button>
      </div>
    </div>
  );
}
