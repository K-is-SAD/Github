import axios from 'axios'

export default async function getEmbeddings(data:string){

    try {
        const url = process.env.GEMINI_EMBEDDING_URL!;

        const response = await axios.post(url, {
            model : process.env.GEMINI_EMBEDDING_MODEL,
            content : {
                parts : [{
                    text : data
                }]
            }
        });
        console.log('Embeddings fetched successfully:', response.data);
        if(response.status === 200){
            return response.data.embedding.values;
        }else{
            console.error('Error fetching embeddings:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error occurred while fetching embeddings:', error);
        return null;
    }

}
