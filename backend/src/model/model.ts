import { ChatOpenAI, OpenAI } from "@langchain/openai";
import "dotenv/config";

export const model = new  ChatOpenAI({
    model:"gpt-4o-mini",
    configuration:{baseURL: process.env.AI_ENDPOINT},
    apiKey:process.env.AI_API_KEY
})

