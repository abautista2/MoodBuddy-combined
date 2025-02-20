import axios from "axios";
import dataset from "../../assets/rule_based_data.json" // Import the dataset

// Load dataset into rule-based responses
const ruleBasedResponses = {};
dataset.forEach((conversation) => {
  const userMessage = conversation[0].user.toLowerCase().trim();
  const systemResponse = conversation[1].system;
  ruleBasedResponses[userMessage] = systemResponse;
});

// Add additional rule-based responses
ruleBasedResponses["hello"] = "Hi! How are you feeling today?";
ruleBasedResponses["i am sad"] = "I'm sorry to hear that. Do you want to talk about it?";
ruleBasedResponses["yes"] = "I'm here for you. Can you tell me more?";
ruleBasedResponses["no"] = "That's okay. Remember, you're not alone.";
ruleBasedResponses["help"] = "If you need urgent help, please reach out to a professional or call a helpline.";

// Crisis keywords for escalation
const crisisKeywords = ["suicide", "self-harm", "end my life", "can't go on"];

export const detectCrisis = (message) => {
  return crisisKeywords.some((word) => message.toLowerCase().includes(word));
};

// Function to get chatbot response
export const getResponse = async (message) => {
  const normalizedMessage = message.toLowerCase().trim();

  // Crisis detection
  if (detectCrisis(normalizedMessage)) {
    return {
      type: "crisis",
      response:
        "I'm really sorry you're feeling this way. Please reach out to a professional or call a helpline immediately."
    };
  }

  // Rule-based response
  if (ruleBasedResponses[normalizedMessage]) {
    return { type: "rule", response: ruleBasedResponses[normalizedMessage] };
  }

  // AI fallback
  return { type: "ai", response: await aiFallback(message) };
};

export const aiFallback = async (message) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium-therapy",
      {
        inputs: {
          text: message,
          past_user_inputs: [],
          generated_responses: []
        },
        parameters: {
          max_length: 100,
          temperature: 0.9
        }
      },
      {
        headers: {
          Authorization: `Bearer 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`,
        },
      }
    );

    return response.data.generated_text;
  } catch (error) {
    console.error("Therapy Model Error:", error.response?.data || error.message);
    return "Could you rephrase that? I want to make sure I understand.";
  }
};