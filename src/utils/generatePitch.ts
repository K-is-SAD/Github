import Groq from "groq-sdk";
import { generatePitchSystemPrompt, generatePitchUserPrompt } from "@/prompts/generatePitch_prompt";

export const generatePitch = async(context : string, prompt : string)=>{
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    messages : [
        {
        role : 'system',
        content : generatePitchSystemPrompt,
        },
        {
        role: "user",
        content: generatePitchUserPrompt.replace("{{context}}", context).replace("{{prompt}}", prompt),
        },
    ],
    model: 'llama-3.3-70b-versatile',
    });

    return chatCompletions?.choices[0]?.message?.content || "";
}