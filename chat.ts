import {ollama} from 'ai-sdk-ollama'
import {generateText} from 'ai'

type Message = {
    role: "user" | "assistant",
    content: string
}

export async function messageChat(message: string): Promise<Message> {

    try{
        const {text} = await generateText({
            model: ollama('llama3.1'),
            prompt: message,
        })
        return {role: 'assistant', content: text}

    } catch (err){
        //console.log("Error messaging model: ", err)
        console.error("Error messaging model:", err);
        throw err;
    }
};
