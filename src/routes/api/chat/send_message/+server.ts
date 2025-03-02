import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { message, chat } from '../../../../drizzle.schema';
import { nanoid } from 'nanoid';
import { and, asc, eq, ne } from 'drizzle-orm';
import { createAiResponseStream } from '$lib/server/ai';

export async function POST({ request, locals }) {
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { chatID, userMessage } = await request.json();

        const existingChat = await db.query.chat.findFirst({
            where: and(eq(chat.id, chatID), eq(chat.userID, locals.user.id))
        });

        if (!existingChat) {
            return json({ error: 'Chat not found' }, { status: 404 });
        }

        // Save user message to database
        const userMessageID = nanoid();
        await db.insert(message).values({
            id: userMessageID,
            chatID,
            userID: locals.user.id,
            role: 'user',
            content: userMessage,
        });


        const aiMessageID = nanoid();

        await db.insert(message).values({
            id: aiMessageID,
            chatID,
            userID: locals.user.id,
            role: 'assistant',
            content: '',
        });


        // processResponeIntheBackground({ chatID, aiMessageID });
        const url = new URL(request.url);
        const origin = url.origin;
        // send message to background
        fetch(`${origin}/api/chat/gen`, {
            method: 'POST',
            body: JSON.stringify({ chatID, aiMessageID })
        });


        return json({
            chatID,
            userMessageID,
            aiMessageID,
        });

    } catch (error) {
        console.error('Error generating response:', error);
        return json({ error: 'Failed to generate response' }, { status: 500 });
    }
}



async function processResponeIntheBackground({ chatID, aiMessageID }:
    { chatID: string, aiMessageID: string }) {

    // get all messages from the chat
    const messages = await db.query.message.findMany({
        where: and(eq(message.chatID, chatID), ne(message.id, aiMessageID)),
        orderBy: [asc(message.createdAt)]
    });

    // Generate AI response using Vercel AI SDK
    const textStream = createAiResponseStream(messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString()
    })))

    let content = ''
    for await (const textPart of textStream) {
        content += textPart
        await db.update(message).set({
            content,
        }).where(eq(message.id, aiMessageID));
    }

    await db.update(message).set({
        isMessageFinished: true
    }).where(eq(message.id, aiMessageID));

}