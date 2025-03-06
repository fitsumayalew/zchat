import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { message, model } from '../../../../drizzle.schema';
import { and, asc, eq, ne } from 'drizzle-orm';
import { createAiResponseStream, type ModelSlug } from '$lib/server/ai';

export async function POST({ request, locals }) {
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { chatID, aiMessageID, userMessage, userMessageID, modelID }: {
            chatID: string,
            aiMessageID: string,
            userMessage: string,
            userMessageID: string,
            modelID: string
        } = await request.json();


         // get model using model id
         const currentModel = await db.query.model.findFirst({
            where:eq(model.id, modelID)
        })

        if (!currentModel) {
            return json({ error: 'Model not found' }, { status: 404 });
        }

        processResponeIntheBackground({ chatID, aiMessageID, userMessageID, userMessage, modelSlug:currentModel.slug });

        return json({
            chatID,
            aiMessageID,
        });

    } catch (error) {
        console.error('Error generating response:', error);
        return json({ error: 'Failed to generate response' }, { status: 500 });
    }
}



async function processResponeIntheBackground({ chatID, aiMessageID, userMessageID, userMessage, modelSlug }:
    { chatID: string, aiMessageID: string, userMessageID: string, userMessage: string, modelSlug: ModelSlug }) {


    // get all messages from the chat
    const messages = await db.query.message.findMany({
        where: and(eq(message.chatID, chatID), ne(message.id, aiMessageID)),
        orderBy: [asc(message.createdAt)]
    });
    // check if the last message is the user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.id !== userMessageID) {
        messages.push({
            id: userMessageID,
            role: 'user',
            content: userMessage,
            createdAt: new Date(),
            chatID,
            userID: lastMessage.userID,
            isMessageFinished: true,
            updatedAt: new Date(),
        });
    }

    console.log('processing response in the background');
    console.log('chatID', chatID);
    console.log('aiMessageID', aiMessageID);


    console.log('messages length', messages.length);


    // Generate AI response using Vercel AI SDK
    const textStream = createAiResponseStream(modelSlug, messages.map((m) => ({
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