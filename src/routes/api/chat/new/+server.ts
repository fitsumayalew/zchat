import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { message, chat, model } from '../../../../drizzle.schema';
import { eq } from 'drizzle-orm';
import { createAiResponseStream, generateTitle, type ModelSlug } from '$lib/server/ai';

export async function POST({ request, locals }) {
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { chatID, aiMessageID, userMessage, modelID }: {
            chatID: string,
            userMessage: string,
            aiMessageID: string,
            modelID: ModelSlug
        } = await request.json();


        // get model using model id
        const currentModel = await db.query.model.findFirst({
            where:eq(model.id, modelID)
        })

        if (!currentModel) {
            return json({ error: 'Model not found' }, { status: 404 });
        }

        
        processResponeIntheBackground({ chatID, aiMessageID, userMessage, modelSlug:currentModel.slug });

        return json({
            chatID,
        });

    } catch (error) {
        console.error('Error generating response:', error);
        return json({ error: 'Failed to generate response' }, { status: 500 });
    }
}


async function processResponeIntheBackground(
    { userMessage, chatID, aiMessageID ,modelSlug}:
        { userMessage: string, chatID: string, aiMessageID: string,modelSlug:ModelSlug }) {


    console.log('generating response');



    // generate ai response first
    const textStream = createAiResponseStream(modelSlug,[{
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
        aiMessage: content,
        modelSlug
    })

    await db.update(chat).set({
        title
    }).where(eq(chat.id, chatID))


    console.log('response generated!');



}