import Groq from "groq-sdk";
import { generateReadmeUserPrompt , generateReadmeSystemPrompt} from "@/prompts/generateReadme_prompt";

export const generateReadme = async(context : string, prompt : string)=>{
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    messages : [
        {
        role : 'system',
        content : generateReadmeSystemPrompt,
        },
        {
        role: "user",
        content: generateReadmeUserPrompt.replace("{{context}}", context).replace("{{prompt}}", prompt),
        },
    ],
    model: 'llama-3.3-70b-versatile',
    });

    console.log("==================================================")
    console.log("README GENERATED : ", chatCompletions?.choices[0]?.message?.content || "")

    return chatCompletions?.choices[0]?.message?.content || "";
}