import Groq from "groq-sdk";
import { generateLinkedInSystemPrompt, generateLinkedInUserPrompt } from "@/prompts/generateLinkedIn_prompt";

export const generateLinkedin = async(context : string, prompt : string)=>{
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    messages : [
        {
        role : 'system',
        content : generateLinkedInSystemPrompt,
        },
        {
        role: "user",
        content: generateLinkedInUserPrompt.replace("{{context}}", context).replace("{{prompt}}", prompt),
        },
    ],
    model: 'llama-3.3-70b-versatile',
    });

    return chatCompletions?.choices[0]?.message?.content || "";
}