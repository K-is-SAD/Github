import { MongoClient } from "mongodb";
import getEmbeddings from "../dbutils/getEmbeddings";

export async function getQueryResults(query : string){
    const client = new MongoClient(process.env.MONGODB_URI as string);

    try {
        await client.connect();

        const db = client.db("github-promax");
        const collection = db.collection("reposummarymodels");        
        
        const queryVector = await getEmbeddings(query);

        const pipeline = [
            {
                "$vectorSearch" : {
                    "index" : "repoSummaryVectorIndex",
                    "queryVector" : queryVector,
                    "path" : "repoSummaryEmbeddings.embeddings",
                    "numCandidates" : 150,
                    "limit" : 10
                }
            },
            {
                $project : {
                    "_id" : 0,
                    "document.pageContent" : 1,
                    "score" : { "$meta": "vectorSearchScore" }
                }
            }
        ]

        const result = await collection.aggregate(pipeline);

        console.log("Results:");
        // for await (const doc of result) {
        //     console.dir(JSON.stringify(doc, null, 2));
        // }

        const arrayOfQueryDocs = [];
        for await (const doc of result) {
            arrayOfQueryDocs.push(doc);
        }

        return arrayOfQueryDocs;

    } catch (error) {
        console.log("Error occurred:", error);
    } finally {
        await client.close();
    }
}
