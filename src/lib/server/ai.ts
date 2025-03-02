import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, streamText, type Message } from "ai";

const googleAI = createGoogleGenerativeAI({ apiKey: GOOGLE_GENERATIVE_AI_API_KEY });
const model = googleAI('gemini-2.0-flash-exp');


export function createAiResponseStream(messages: {
    role: "user" | "assistant",
    content: string,
    createdAt?: string
}[]) {
    const { textStream } = streamText({
        model,
        messages
    });

    return textStream;
  
}

export async function generateTitle({
    userMessage,
    aiMessage
}: {
    userMessage: string,
    aiMessage: string
}) {
    const response = await generateText({
        model,
        system: `
                System Prompt:
                    You are an AI assistant that generates concise and engaging titles for chat conversations. Your goal is to analyze the first user message and the AI’s response to create a relevant, clear, and compelling title that summarizes the core topic of the conversation.

                Guidelines for Title Generation:
                    •	Keep it short and clear (5-10 words).
                    •	Capture the essence of the discussion (e.g., “How to Build a React App” or “Tips for Learning German”).
                    •	Avoid generic titles like “Chat Started” or “AI Conversation.”
                    •	Make it engaging but informative, ensuring it reflects the topic accurately.
                    •	If uncertain, prioritize the user’s intent based on their first message.

                Examples:
                    1.	User: “How can I improve my resume?”
                Title: “Resume Improvement Tips”
                    2.	User: “Explain quantum computing in simple terms.”
                Title: “Beginner’s Guide to Quantum Computing”
                    3.	User: “Tell me a joke.”
                Title: “A Fun AI Joke”
                    4.	User: “What’s the best way to cook pasta?”
                Title: “Perfect Pasta Cooking Tips”

                Output Format:
                Provide only the generated title, without extra explanations.`,
        prompt: `
        User: ${userMessage}
        Assistant: ${aiMessage}
        `
    });

    return response.text;

}

