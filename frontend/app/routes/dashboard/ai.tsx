import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { postData } from "@/lib/fetch-util"; // ✅ use postData instead of fetch()

const AILawAssistant = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse("Thinking... 🤖");

    try {
      const data = await postData<{ response: string }>("/ai/ask", {
        prompt: query,
      });

      setResponse(data.response || "Sorry, AI returned no message.");
    } catch (err) {
      console.error("AI Error:", err);
      setResponse("Sorry, the AI is unavailable at the moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Law AI Assistant</h1>
      <p className="text-muted-foreground">
        Ask legal questions related to Indian law or your ongoing cases.
      </p>

      <Card className="w-full">
        <CardHeader className="font-medium">Your Question</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="e.g., What is Section 302 IPC?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Asking..." : "Ask Law AI"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {response && (
        <Card className="w-full mt-4">
          <CardHeader className="font-medium">Law AI Response</CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-line">
            {response}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AILawAssistant;
