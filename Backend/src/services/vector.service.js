import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv"
dotenv.config()
const pc=new Pinecone({apiKey:process.env.PINECONE_API_KEY})

const cohortChatgptIndex=pc.Index("cohort-chatgpt-clone")

async function createMemory({vectors,metadata,messageId}){
  await cohortChatgptIndex.upsert([{
    id:messageId,
    values:vectors,
    metadata
  }])
}
async function queryMemory({queryVector,limit=5,metadata}){
const data=await cohortChatgptIndex.query({
  vector:queryVector,
  topK:limit,
  filter:metadata ? {metadata}:undefined,
  includeMetadata:true
})
return data.matches
}

export {createMemory,queryMemory}
