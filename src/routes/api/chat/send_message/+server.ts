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
        const { chatID, aiMessageID } = await request.json();

        

        processResponeIntheBackground({ chatID, aiMessageID });
   
        return json({
            chatID,
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
    console.log('processing response in the background');
    console.log('chatID', chatID);
    console.log('aiMessageID', aiMessageID);


    console.log('messages length', messages.length);
 

    // Generate AI response using Vercel AI SDK
    const textStream = createAiResponseStream(messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
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

    
    console.log('generated response and updated message, aiMessageID', aiMessageID);
    console.log('content', content);

}