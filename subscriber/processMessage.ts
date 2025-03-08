import { createAiResponseStream, generateTitle, ModelSlug } from "./ai";
import { z, type newMessagesQueryType } from "./z";

import { db } from "./db"
import { and, asc, eq, ne } from "drizzle-orm";
import { message } from "../src/drizzle.schema";
export async function processMessage(newMessage: newMessagesQueryType, aiMessageID: string) {
    // get all messages from the chat
    // couldn't get messages from zero because can't guareente completness
    // const messages = z.query.message.where('chatID', '=', message.chatID!).where('userID', '=', message.userID!).orderBy('createdAt', 'asc').run();


    const messages = await db.query.message.findMany({
        where: and(eq(message.chatID!, newMessage.chatID!), ne(message.id, aiMessageID)),
        orderBy: [asc(message.createdAt)]
    });

    const modelSlug = newMessage.chat?.model?.slug as ModelSlug;

    const textStream = createAiResponseStream(modelSlug, messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: new Date(m.createdAt!).toISOString(),
    })))

    let content = ''
    for await (const textPart of textStream) {
        content += textPart
        z.mutate.message.update({
            id: aiMessageID,
            content,
        })
    }

    z.mutate.message.update({
        id: aiMessageID,
        isMessageFinished: true,
        isResponseGenerated: true,
    })


    z.mutate.message.update({
        id: newMessage.id,
        isMessageFinished: true,
        isResponseGenerated: true,
    })


    if (messages.length === 1) {
        const title = await generateTitle({
            userMessage: newMessage.content,
            aiMessage: content,
            modelSlug
        })
        z.mutate.chat.update({
            id: newMessage.chatID!,
            title,
        })
    }

    console.log('Done processing message:', newMessage.id);
}
