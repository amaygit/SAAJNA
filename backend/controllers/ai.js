// controllers/ai.js
import axios from "axios";

export const askLawAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Optional: Basic Indian legal keyword filter.
    const legalKeywords = /(law|ipc|petition|legal|case|advocate|court|section|judge|bail|indian)/i;
    if (!legalKeywords.test(prompt)) {
      return res.json({
        response:
          "I can only answer questions related to Indian law and legal matters.",
      });
    }

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro", // ✅ Recommended Perplexity-supported model
        messages: [
          {
            role: "system",
            content:
              "You are a helpful and accurate assistant specialized in Indian law. Only answer questions about Indian legal systems, IPC, CrPC, court procedures, and law-related topics.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 512,
        temperature: 0.5,
        web_search_options: {
          user_location: {
            country: "IN",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    res.json({
      response:
        content || "No valid answer received. Please try rephrasing your query.",
    });
  } catch (error) {
    console.error("Perplexity API Error:", error.response?.data || error.message);
    res.status(500).json({
      response:
        "Something went wrong while processing your request. Please try again later.",
    });
  }
};
