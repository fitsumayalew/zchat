import { json } from '@sveltejs/kit';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { db } from '$lib/server/db';
import { message, chat, model } from '../../../../drizzle.schema';
import { nanoid } from 'nanoid';
import { and, desc, eq, ne } from 'drizzle-orm';
import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { createAiResponseStream, generateTitle } from '$lib/server/ai';

export async function POST({ request, locals }) {
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userMessage, modelID }: {
            userMessage: string,
            modelID: string
        } = await request.json();


        // check if model exists
        const selectedModel = await db.query.model.findFirst({
            where: eq(model.id, modelID)
        });


        if (!selectedModel) {
            return json({ error: 'Model not found!' }, { status: 404 });
        }

        // create a new chat
        const chatID = nanoid();
        const userMessageID = nanoid();
        const aiMessageID = nanoid();

        await db.insert(chat).values({
            id: chatID,
            userID: locals.user.id,
            modelID,
        });

        // create message 

        await db.insert(message).values({
            id: userMessageID,
            chatID,
            userID: locals.user.id,
            role: 'user',
            content: userMessage,
        });

        // generate ai response message
        await db.insert(message).values({
            id: aiMessageID,
            chatID,
            userID: locals.user.id,
            role: 'assistant',
            content: '',
        });


        // processResponeIntheBackground({ chatID, aiMessageID, userMessage });

        const url = new URL(request.url);
        const origin = url.origin;

        // send message to background
        await fetch(`${origin}/api/chat/new_gen`, {
            method: 'POST',
            body: JSON.stringify({ chatID, aiMessageID })
        });


        return json({
            chatID,
        });

    } catch (error) {
        console.error('Error generating response:', error);
        return json({ error: 'Failed to generate response' }, { status: 500 });
    }
}


async function processResponeIntheBackground(
    { userMessage, chatID, aiMessageID }:
        { userMessage: string, chatID: string, aiMessageID: string }) {


    console.log('generating response');


    // generate ai response first
    const textStream = createAiResponseStream([{
        role: 'user',
        content: userMessage,
    }])

    let content = '';
    for await (const textPart of textStream) {
        content += textPart;
        await db.update(message).set({
            content
        }).where(eq(message.id, aiMessageID))
    }

    await db.update(message).set({
        isMessageFinished: true
    }).where(eq(message.id, aiMessageID));


    // generate title
    const title = await generateTitle({
        userMessage,
        aiMessage: content
    })

    await db.update(chat).set({
        title
    }).where(eq(chat.id, chatID))


    console.log('response generated!');



}