import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getKeywords(text : string) {
  const chatCompletions = await groq.chat.completions.create({
    messages: [
      {
        role : "system",
        content : "You are an efficient LLM. You will be provided with a text or a question and you need to extract the keywords from the text. You need to give a list of keywords just separated by space. Remember these keywords will be given as queries for vector search and semantic searches, so choose accordingly. You are not allowed to use any other format. Just return a string.Mostly the text/question will be related to coding or some codebases or queries regarding github repos. So dont include any unnecessary information in the keywords. Just give the keywords.",
      },
      {
        role: "user",
        content: `Extract the keywords from the text/question: ${text}. You need to give a list of keywords just separated by space. You are not allowed to use any other format. Just return a string. Dont use unnecessary information in the keywords. Avoid words like 'Coding', 'Programmig', 'Codebase', 'Github', 'Repo', 'Query', 'Text', 'Question' etc.`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  return chatCompletions?.choices[0]?.message?.content || ""
}
