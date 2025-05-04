import Groq from "groq-sdk";
import { generatePPTSystemPrompt, generatePPTUserPrompt } from "@/prompts/generatePPT_prompt";

export const generatePPTContent = async(context: string, prompt: string) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    messages: [
        {
        role: 'system',
        content: generatePPTSystemPrompt,
        },
        {
        role: "user",
        content: generatePPTUserPrompt.replace("{{context}}", context).replace("{{prompt}}", prompt),
        },
    ],
    model: 'llama-3.3-70b-versatile',
    });

    return chatCompletions?.choices[0]?.message?.content || "";
};
