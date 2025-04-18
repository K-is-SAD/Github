import Groq from "groq-sdk";
import { findKeywordsSystemPrompt, findKeywordsUserPrompt } from '../prompts/findkeywords_prompt';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getKeywords(text : string) {
  const chatCompletions = await groq.chat.completions.create({
    messages: [
      {
        role : "system",
        content : findKeywordsSystemPrompt,
      },
      {
        role: "user",
        content: findKeywordsUserPrompt.replace("{{text}}", text),
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  return chatCompletions?.choices[0]?.message?.content || ""
}
