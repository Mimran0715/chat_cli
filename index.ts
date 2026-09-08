import {messageChat, type Message} from './chat.js'
import * as readline from 'readline/promises';

async function main(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let running = true;

    rl.on("SIGINT", () => {
        console.log("\nGoodbye!");
        running = false;
        rl.close();
    });

    const messages: Message[] = [];
    
    try{
        while (running){
            const userMessage = await rl.question('User:');
            if (!running) break;

            messages.push({
                role: "user",
                content: userMessage
            });

            const response = await messageChat(messages);
            messages.push(response);
            console.log("AI:", response.content);
        } // end while
    } finally{
            rl.close()
    }
};

main();