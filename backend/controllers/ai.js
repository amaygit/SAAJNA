// controllers/ai.js
import axios from "axios";

export const askLawAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Filter: only allow Indian legal questions
    const legalFilter = /(law|ipc|crpc|legal|case|advocate|petition|court|section|bail|contract|indian)/i;
    if (!legalFilter.test(prompt)) {
      return res.json({
        response: "I can only help with questions related to Indian law and legal matters.",
      });
    }

    const result = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro", // or sonar-pro if supported
        messages: [
          {
            role: "system",
            content:
              "You are an Indian law expert. Only answer legal questions specific to Indian cases, laws, IPC, CrPC, court processes.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
        web_search_options: {
          user_location: {
            country: "IN", // Region preference
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

    const content = result.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      return res.json({
        response:
          "Sorry, no relevant response returned. Try rephrasing your legal query.",
      });
    }

    res.json({ response: content });
  } catch (error) {
    console.error("Perplexity API Error:", error.response?.data || error.message);
    res.status(500).json({
      response: "Something went wrong with the AI. Please try again later.",
    });
  }
};
