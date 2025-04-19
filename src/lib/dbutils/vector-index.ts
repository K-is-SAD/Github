/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from 'mongodb';

export async function initialiseVectorIndex() {
    const client = new MongoClient(process.env.MONGODB_URI as string);

    try {
        await client.connect();

        const database = client.db("github-promax");
        const collection = database.collection("repoembeddingmodels");

        const allIndexes = await collection.listSearchIndexes();
        for await (const index of allIndexes) {
            if (index.name === "repoSummaryVectorIndex") {
                console.log("Index already exists. Exiting.");
                return;
            }
        }

        const index = {
            name: "repoSummaryVectorIndex",
            type: "vectorSearch",
            definition: {
                "fields": [
                {
                    "type": "vector",
                    "numDimensions": 768,
                    "path": "embeddings",
                    "similarity": "cosine"
                },
                {
                    "type" : "filter",
                    "path" : "repoUrl"
                },
                {
                    "type" : "filter",
                    "path" : "userId"
                }
                ]
            }
        }
 
        const result = await collection.createSearchIndex(index); 
        console.log(`New search index named ${result} is building.`);

        // wait for the index to be ready to query
        console.log("Polling to check if the index is ready. This may take up to a minute.")
        let isQueryable = false;
        while (!isQueryable) {
        const allIndexes = await collection.listSearchIndexes(); //lists all the vector search indexes of that collection
        for await (const index of allIndexes) {
            console.log(index);
            if (index.name === result) {
                if ((index as any).queryable) {
                    console.log(`${result} is ready for querying.`);
                    isQueryable = true;
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            }
        }
        }

    } catch(error){
        console.error("Error occurred: ", error);
    }finally {
      await client.close();
    }
}