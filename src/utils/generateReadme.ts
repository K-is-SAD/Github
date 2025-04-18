import Groq from "groq-sdk";

export const generatePosts = async(context : string, prompt : string)=>{
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletions = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages : [
        {
        role : 'system',
        content : `You are an efficient LLM that can answer questions about the codebase. You are also a helpful assistant that can help with any other questions regarding codes and codebases or related to codebases. You have to generate a Readme or provide a linkedIn post content for the repository provided by the user. The readme must be in markdown format, the readme must be of the format of an actual readme. The linkedIn post must also be genuine like an actual LinkedIn post. Dont provide unnecessary information.`,
        },
        {
        role: "user",
        content: `Generate a readme or a linkedIn post for the repo based on the context provided and the user prompt. You are given a prompt and the full context to the repository summary."
        Context :${context}, Question : ${prompt}`,
        },
    ],
    });

    return chatCompletions?.choices[0]?.message?.content || "";
}