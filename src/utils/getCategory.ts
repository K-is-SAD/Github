import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getCategory(text : string) {
  const chatCompletions = await groq.chat.completions.create({
    messages: [
      {
        role : "system",
        content : "You are an efficient LLM. You will be provided with a text or a question and you need to extract the category from the prompt. Like if user asks for a readme post, then category wil be 'Readme'. If user asks for a linkedIn post, then category will be 'LinkedIn'. If user asks for a blog post, then category will be 'Blog'. If user asks for a tweet, then category will be 'Tweet'. If user asks for an article, then category will be 'Article', etc",
      },
      {
        role: "user",
        content: `Extract the category from the text/question: ${text}. You need to give a single word as a category. You are not allowed to use any other format. Just return a string. Examples : 'Blog', `,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  return chatCompletions?.choices[0]?.message?.content || ""
}
