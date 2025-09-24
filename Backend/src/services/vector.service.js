// Import the Pinecone library
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

let cohortChatGptIndex = null;

/**
 * Lazy initializes and returns the Pinecone index.
 */
async function getIndex() {
    if (!cohortChatGptIndex) {
        try {
            // List indexes
            const indexesResponse = await pc.listIndexes();
            const indexes = indexesResponse.indexes || [];
            const indexExists = indexes.some(idx => idx.name === 'chat');

            if (!indexExists) {
                throw new Error(
                    'Index "chat" not found. ' +
                    'Create it in Pinecone Console: ' +
                    'Name: chat, Dimensions: 1024, Metric: cosine (Serverless).'
                );
            }

            // Initialize index
            cohortChatGptIndex = pc.index('chat');

        } catch (error) {
            console.error('Pinecone Initialization Error:', error.message);
            throw error;
        }
    }
    return cohortChatGptIndex;
}

async function createMemory({ vectors, metadata, messageId }) {
    try {
        if (!messageId || !vectors || !Array.isArray(vectors)) {
            throw new Error("Invalid input: messageId and vectors are required, and vectors must be an array.");
        }

        if (vectors.length !== 1024) {
            throw new Error("Vector dimensionality mismatch: Expected 1024 dimensions.");
        }

        console.log("Upserting memory with messageId:", messageId);

        // ✅ Always fetch the initialized index here
        const index = await getIndex();

        await index.upsert([
            {
                id: messageId.toString(), // ensure string id
                values: vectors,
                metadata,
            },
        ]);

        console.log("Memory upserted successfully for messageId:", messageId);
    } catch (error) {
        console.error("Error in createMemory:", error);
        throw new Error(`Failed to create memory: ${error.message}`);
    }
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
    const index = await getIndex();
    const data = await index.query({
        vector: queryVector,
        topK: limit,
        filter: metadata || undefined,
        includeMetadata: true
    });

    return data.matches;
}

export { createMemory, queryMemory };
