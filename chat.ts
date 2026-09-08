import {ollama} from 'ai-sdk-ollama'
import {generateText} from 'ai'

export type Message = {
    role: "user" | "assistant",
    content: string
}

export async function messageChat(messages: Message[]): Promise<Message> {

    try{
        const {text} = await generateText({
            model: ollama('llama3.1'),
            messages: messages
        })
        return {role: 'assistant', content: text}

    } catch (err){
        //console.log("Error messaging model: ", err)
        console.error("Error messaging model:", err);
        throw err;
    }
};
