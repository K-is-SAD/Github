import axios from 'axios'

type EmbeddingError = {
    response?: {
        status?: number;
        data?: unknown;
    };
    message?: string;
};

export default async function getEmbeddings(data: string) {
    try {
        const rawUrl = process.env.GEMINI_EMBEDDING_URL;
        const apiKey = process.env.GOOGLE_API_KEY;
        const embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
        const outputDimensionality = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768);

        if (!rawUrl) {
            console.error('GEMINI_EMBEDDING_URL not set');
            return null;
        }

        const requestUrl = new URL(rawUrl);

        // Always target the current Gemini embedding model, regardless of what is stored in env.
        // The retired text-embedding-004 endpoint 404s; gemini-embedding-001 supports 768 dims.
        requestUrl.pathname = `/v1beta/models/${embeddingModel}:embedContent`;

        // Some environments strip query parameters from env vars or deploy with a base URL only.
        // Ensure the Google API key is always attached when available.
        if (!requestUrl.searchParams.get('key') && apiKey) {
            requestUrl.searchParams.set('key', apiKey);
        }

        // Try to call the embeddings endpoint. Different providers return different shapes,
        // so accept multiple response formats and normalize to a plain number[] vector.
        const response = await axios.post(
            requestUrl.toString(),
            // Common Google embedContent shape if using :embedContent
            {
                content: { parts: [{ text: data }] },
                taskType: 'RETRIEVAL_QUERY',
                outputDimensionality,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'x-goog-api-key': apiKey } : {}),
                },
                timeout: 30_000,
            }
        );

        console.log('Embeddings fetched successfully:', response.status);

        const body = response.data || {};

        // Handle several possible response shapes
        // 1) Google-style: { embedding: { values: [...] } }
        if (body.embedding && Array.isArray(body.embedding.values)) {
            return body.embedding.values as number[];
        }

        // 2) OpenAI-like: { data: [ { embedding: [...] } ] }
        if (Array.isArray(body.data) && body.data[0] && Array.isArray(body.data[0].embedding)) {
            return body.data[0].embedding as number[];
        }

        // 3) Some Google variants: { embeddings: [ { embedding: { values: [...] } } ] }
        if (Array.isArray(body.embeddings) && body.embeddings[0]) {
            if (body.embeddings[0].embedding && Array.isArray(body.embeddings[0].embedding.values)) {
                return body.embeddings[0].embedding.values as number[];
            }
            if (Array.isArray(body.embeddings[0].embedding)) {
                return body.embeddings[0].embedding as number[];
            }
        }

        console.error('Unrecognized embedding response shape:', Object.keys(body));
        return null;
    } catch (err: unknown) {
        const error = err as EmbeddingError;
        // Log richer error details if available
        if (error.response) {
            console.error('Embedding API error:', error.response.status, error.response.data);
        } else {
            console.error('Error occurred while fetching embeddings:', error.message || error);
        }
        return null;
    }
}
