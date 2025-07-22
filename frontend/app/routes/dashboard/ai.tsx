import { useState } from "react";
import ReactMarkdown from "react-markdown"; // npm install react-markdown
import { useChatHistory } from "@/hooks/useChatHistory";
import { fetchData, postData, deleteData } from "@/lib/fetch-util";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const sessionId = "user-session-unique-id"; // ideally, generate per case

const bubbleStyles = {
  user: "bg-blue-50 rounded-lg p-3 my-2 self-end max-w-[80%]",
  ai: "bg-green-50 rounded-lg p-3 my-2 self-start max-w-[80%] border-l-4 border-green-400",
};

// ✅ Add this inside the component file or in a reusable component
const ThinkingLoader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/60 dark:bg-black/60 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-primary mb-2" />
    <span className="text-primary text-sm font-medium animate-pulse">
      Thinking about your legal question…
    </span>
  </div>
);

const AILawAssistant = () => {
  const [input, setInput] = useState("");
  const { messages, sendPrompt, loading } = useChatHistory(sessionId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) await sendPrompt(input);
    setInput("");
  };

  const handleRestart = async () => {
    const confirmed = confirm("Are you sure you want to restart this chat?");
    if (!confirmed) return;

    await deleteData(`/ai/history?sessionId=${sessionId}`);
    window.location.reload();
  };

  return (
    <div className="p-6 flex flex-col h-[90vh] relative">
      {/* Top header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold">Law AI Assistant</h1>
        <button
          onClick={handleRestart}
          className="text-red-600 underline text-sm hover:text-red-800"
          title="Clear entire conversation"
        >
          Restart Chat
        </button>
      </div>

      {/* Chat UI */}
      <div className="relative flex-1 flex flex-col overflow-y-auto mb-6 px-2">
        {messages.length === 0 && !loading && (
          <p className="text-gray-500 text-sm text-center mt-10">
            Start your legal questions and get help instantly.
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={msg.role === "user" ? bubbleStyles.user : bubbleStyles.ai}>
              <ReactMarkdown
                components={{
                  ul: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-6">{children}</ol>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  h2: ({ children }) => (
                    <h2 className="mt-2 mb-1 text-lg font-bold text-green-700">{children}</h2>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {/* ✅ Centered animated loader overlay while loading */}
        {loading && <ThinkingLoader />}
      </div>

      {/* Prompt UI */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          placeholder="Describe your legal scenario or respond to AI questions..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask Law AI"}
        </Button>
      </form>
    </div>
  );
};

export default AILawAssistant;
