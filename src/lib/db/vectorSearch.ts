import { MongoClient } from "mongodb";
import getEmbeddings from "../dbutils/getEmbeddings";

export async function getQueryResults(userId : string, repoUrl : string, query : string){
    const client = new MongoClient(process.env.MONGODB_URI as string);

    try {
        await client.connect();

        const db = client.db("github-promax");
        const collection = db.collection("repoembeddingmodels");        
        
        const queryVector = await getEmbeddings(query);

        if (!queryVector || !Array.isArray(queryVector)) {
            console.log('No query vector generated, returning empty results.');
            return [];
        }

        const pipeline = [
            {
                "$vectorSearch": {
                    "index": "repoSummaryVectorIndex",
                    "path": "embeddings",
                    "queryVector": queryVector,
                    "filter": {
                        "$and": [
                            { "repoUrl": repoUrl },
                            { "userId": userId }
                        ]
                    },
                    "numCandidates": 150
                    ,"limit": 10
                }
            },
            {
                $project: {
                    "repoUrl": "$repoUrl",
                    "pageContent": "$pageContent",
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ];

        const cursor = collection.aggregate(pipeline);
        const results = await cursor.toArray();

        console.log("Results:", results);
        // for await (const doc of result) {
        //     console.dir(JSON.stringify(doc, null, 2));
        // }

        return results;

    } catch (error) {
        console.log("Error occurred in Vector Search :", error);
    } finally {
        await client.close();
    }
}
