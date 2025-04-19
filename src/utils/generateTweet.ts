import Groq from "groq-sdk";
import { generateXSystemPrompt, generateXUserPrompt } from "@/prompts/generateX_prompt";

export const generateTweet = async(context : string, prompt : string)=>{
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    messages : [
        {
        role : 'system',
        content : generateXSystemPrompt
        },
        {
        role: "user",
        content: generateXUserPrompt.replace("{{context}}", context).replace("{{prompt}}", prompt),
        },
    ],
    model: 'llama-3.3-70b-versatile',
    });

    return chatCompletions?.choices[0]?.message?.content || "";
}