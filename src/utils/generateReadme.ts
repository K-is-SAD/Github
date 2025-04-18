import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function generateReadme(prompt : string, context : string) {
    try {

        // // chunking the text into parts
        // const textSplitter = new RecursiveCharacterTextSplitter({
        //     chunkSize: 400,
        //     chunkOverlap: 20,
        // });
        // const docs = await textSplitter.splitText(context);
        // console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

        const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
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

        return result.toDataStreamResponse({
        getErrorMessage: error => {
            if (error == null) {
            return 'unknown error';
            }

            if (typeof error === 'string') {
            return error;
            }

            if (error instanceof Error) {
            return error.message;
            }

            return JSON.stringify(error);
        }
        });
    } catch (error : any) {
        console.error('Error in POST request to /api/chat:', error);
        throw new Error(error.message);
    }
}
