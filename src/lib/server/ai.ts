import { GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY } from "$env/static/private";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText, type Message } from "ai";

export type ModelSlug = 'gemini-2.0-flash-exp' | 'gemini-1.5-pro' | 'gpt-4o-mini';
const googleAI = createGoogleGenerativeAI({ apiKey: GOOGLE_GENERATIVE_AI_API_KEY });
const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
});



function getModel(modelSlug: ModelSlug) {
    if (modelSlug === 'gemini-2.0-flash-exp') {
        return googleAI('gemini-2.0-flash-exp');
    }
    if (modelSlug === 'gpt-4o-mini') {
        return openai('gpt-4o-mini');
    }

    if (modelSlug === 'gemini-1.5-pro') {
        return googleAI('gemini-1.5-pro');
    }

    throw new Error(`Model ${modelSlug} not found`);
}

export function createAiResponseStream(modelSlug: ModelSlug, messages: {
    role: "user" | "assistant",
    content: string,
    createdAt?: string,
}[],) {

    const model = getModel(modelSlug);


    console.log('creating ai response stream');
    console.log(messages);
    const { textStream } = streamText({
        model,
        messages,
        system: `
        You are an AI assistant called zChat.
        You are a helpful assistant that can help with a wide range of tasks.
        Be very friendly and engaging.
        You are able to understand the user's intent and provide a helpful response.
        If you are not sure about the user's intent, you can ask for more information.
        Don't ever reply with an empty message.
        You are made using sveltekit and zero.
        `
    });

    return textStream;

}

export async function generateTitle({
    userMessage,
    aiMessage,
    modelSlug
}: {
    userMessage: string,
    aiMessage: string,
    modelSlug: ModelSlug
}) {
    const model = getModel(modelSlug);
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

