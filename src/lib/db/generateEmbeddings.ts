import { MongoClient } from 'mongodb';
import getEmbeddings from '../dbutils/getEmbeddings';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const generateEmbeddings = async (repoUrl : string, text: any) => {
    const client = new MongoClient(process.env.MONGODB_URI as string);
   
    try {
        await client.connect();

        const database = client.db("github-promax");
        const collection = database.collection("reposummarymodels");

        // chunking the text into parts
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 400,
            chunkOverlap: 20,
        });
        const docs = await textSplitter.splitText(text);
        console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

        // generating embeddings for each chunk of text
        console.log("Generating embeddings and inserting documents.");
        let docCount = 0;
        let embeddingDocument : any= [];
        await Promise.all(docs.map(async (doc) => {
            const embeddings = await getEmbeddings(doc);

            console.log(`Embeddings for document ${docCount + 1}:`, embeddings);
            embeddingDocument.push({
                pageContent: doc,
                embeddings: embeddings
            })
            docCount += 1;
        }))
        console.log(`Successfully inserted ${docCount} documents.`);

        const updatedrepourldocs = await collection.updateOne(
            { repoUrl: repoUrl },
            { $set: { repoSummaryEmbeddings: embeddingDocument } },
            { upsert: true } 
        );

        console.log("Embeddings generated and stored successfully.");
        return {
            success: true,
            message: "Embeddings generated and stored successfully.",
            updatedrepourldocs: updatedrepourldocs,
        }

    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error("Failed to generate embeddings.");
    } finally { 
        await client.close();
    }
}