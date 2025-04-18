import Groq from "groq-sdk";

import { getCategorySystemPrompt, getCategoryUserPrompt } from "@/prompts/getCategory_prompt";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getCategory(text : string) {
  const chatCompletions = await groq.chat.completions.create({
    messages: [
      {
        role : "system",
        content : getCategorySystemPrompt,
      },
      {
        role: "user",
        content: getCategoryUserPrompt.replace("{{text}}", text),
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  return chatCompletions?.choices[0]?.message?.content || ""
}
