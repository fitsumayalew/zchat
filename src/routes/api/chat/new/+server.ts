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
        const { chatID, aiMessageID, userMessage }: {
            chatID: string,
            userMessage: string,
            aiMessageID: string
        } = await request.json();






        processResponeIntheBackground({ chatID, aiMessageID, userMessage });

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