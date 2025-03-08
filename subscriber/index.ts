import { nanoid } from "nanoid";
import { processMessage } from "./processMessage";
import { actualQuery } from "./z";
import { z } from "./z";

actualQuery.addListener((messages, resultType) => {
    if (resultType === 'complete') {
        actualQuery.data.forEach((message) => {
            const aiMessageID = nanoid();
            z.mutate.message.insert({
                id: aiMessageID,
                role: 'assistant',
                content: '',
                isMessageFinished: false,
                isResponseGenerated: false,
                userID: message.userID,
                chatID: message.chatID,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });

            // z.mutate.message.update({
            //     id: message.id,
            //     isResponseGenerated: true,
            //     isMessageFinished: true,
            // });

            console.log('Processing new message: ', message.id);
            processMessage(message, aiMessageID);

        })

    }
});




Bun.serve({
    port: 3001,
    fetch(req) {
        return new Response("OK", { status: 200 });
    },
});



// cleanup code
const cleanup = () => {
    console.log("Destroying query! And exiting!");
    actualQuery.destroy();
    z.close();
    process.exit();
}


// Handle Ctrl+C (SIGINT)
process.on('SIGINT', () => {
    cleanup();
    process.exit(1);
});

// Handle termination signal (SIGTERM)
process.on('SIGTERM', () => {
    cleanup();
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
    cleanup();
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    cleanup();
    process.exit(1);
});
