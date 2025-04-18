import Groq from "groq-sdk";
import { generateArticleSystemPrompt, generateArticleUserPrompt } from "@/prompts/generateArticle_pompt";

export const generateArticle = async(context : string, prompt : string)=>{
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages : [
        {
        role : 'system',
        content : generateArticleSystemPrompt,
        },
        {
        role: "user",
        content: generateArticleUserPrompt.replace("{{context}}", context).replace("{{prompt}}", prompt),
        },
    ],
    });

    return chatCompletions?.choices[0]?.message?.content || "";
}