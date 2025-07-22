import axios from "axios";

export const askLawAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a professional assistant for Indian law. Only answer questions about Indian law, court cases, statutes, IPC, CrPC, legal procedures, and legal topics relevant to India. If a question is not related to Indian law, legal matters, or legal cases, politely respond: 'I can only answer questions related to Indian law and legal cases.'"
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        max_tokens: 512,
        temperature: 0.5,
        web_search_options: {
          user_location: { country: "IN" }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const content = response.data?.choices?.[0]?.message?.content;
    res.json({
      response: content || "No valid answer received. Please try rephrasing your query."
    });
  } catch (error) {
    console.error("Perplexity API Error:", error.response?.data || error.message);
    res.status(500).json({
      response: "Something went wrong while processing your request. Please try again later."
    });
  }
};
