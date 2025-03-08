import { createAiResponseStream, generateTitle, ModelSlug } from "./ai";
import { z } from "./z";

import { db } from "./db"
import { and, asc, eq, ne } from "drizzle-orm";
import { message } from "../src/drizzle.schema";
import { PROCESSING_MESSAGES } from ".";
export async function processMessage(chatID: string, modelSlug: ModelSlug, aiMessageID: string) {
    // get all messages from the chat
    // couldn't get messages from zero because can't guareente completness
    // const messages = z.query.message.where('chatID', '=', message.chatID!).where('userID', '=', message.userID!).orderBy('createdAt', 'asc').run();


    const messages = await db.query.message.findMany({
        where: and(eq(message.chatID, chatID), ne(message.id, aiMessageID)),
        orderBy: [asc(message.createdAt)]
    });


    console.log("============================ essages====");
    console.log(messages.length);


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


    if (messages.length == 1) {
        // if there is only one message, we need to generate the title
        const title = await generateTitle({
            userMessage: messages[0].content,
            aiMessage: content,
            modelSlug
        })
        z.mutate.chat.update({
            id: chatID,
            title,
        })
    }

    PROCESSING_MESSAGES.splice(PROCESSING_MESSAGES.indexOf(aiMessageID), 1);

    console.log('Done processing message:', aiMessageID);
}
