import Groq from "groq-sdk";
import { generatedemandsystemprompt, generatedemanduserprompt } from "@/prompts/generatedemandprompt";

export const generatedemandcontent = async(context : string, prompt : string)=>{
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages : [
        {
        role : 'system',
        content : generatedemandsystemprompt
        },
        {
        role: "user",
        content: generatedemanduserprompt.replace("{{context}}", context).replace("{{prompt}}", prompt),
        },
    ],
    });

    return chatCompletions?.choices[0]?.message?.content || "";
}