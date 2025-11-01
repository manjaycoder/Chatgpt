     import { GoogleGenerativeAI } from "@google/generative-ai";
     import dotenv from "dotenv";

     dotenv.config();

     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

     async function generateResponse(content) {
       try {
         if (!process.env.GEMINI_API_KEY) {
           throw new Error("GEMINI_API_KEY not set in environment");
         }
         if (!content || typeof content !== "string") {
           throw new Error("Content must be a non-empty string");
         }
         // Trim and validate
         const trimmedContent = content.trim();
         if (trimmedContent.length === 0) {
           throw new Error("Content cannot be empty");
         }

         console.log("Generating AI response for:", trimmedContent);  // Debug log

         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
         // Pass as string (auto-converted to [{ parts: [{ text: trimmedContent }] }] – no "role" needed)
         const result = await model.generateContent(trimmedContent);
         const response = await result.response;
         const text = response.text();
         console.log("AI generated:", text);  // Debug log
         return text;
       } catch (error) {
         console.error("Error generating AI response:", error);
         throw new Error(`Failed to generate response from AI service: ${error.message}`);
       }
     }
 async function generateVector(content){
  const response=await genAI.getEmdding({
    model:"gemini-embedding-001",
    contents:content,
    config:{
      outputDimensionality:1028,
    }
  })
  return response.embeddings[0].values
 }
     export {generateResponse,generateVector};
     