import axios from "axios";
import { tool } from "langchain";
import { evaluate } from "mathjs";
import * as z from "zod";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { supabaseClient } from "../utils/supabase.js";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
});

const weatherTool = tool(
    async (input) => {
        try {
            const units =
                input.units === "fahrenheit" ? "imperial" : "metric";

            const { data } = await axios.get(
                "https://api.openweathermap.org/data/2.5/weather",
                {
                    params: {
                        q: input.city,
                        appid: "73df9d0c29ba19db54166e4965ed4749",
                        units,
                    },
                }
            );

            const tempUnit = input.units === "fahrenheit" ? "°F" : "°C";

            return `
Current weather in ${data.name}, ${data.sys.country}:
- Temperature: ${data.main.temp}${tempUnit}
- Feels Like: ${data.main.feels_like}${tempUnit}
- Condition: ${data.weather[0].description}
- Humidity: ${data.main.humidity}%
- Wind Speed: ${data.wind.speed} ${units === "imperial" ? "mph" : "m/s"}
      `.trim();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return `Unable to fetch weather for "${input.city}". Please verify the city name.`;
            }

            return "An unexpected error occurred while fetching weather data.";
        }
    },
    {
        name: "weather",
        description:
            "Get current weather for a specific city. Returns temperature, conditions, humidity, and wind speed.",
        schema: z.object({
            city: z
                .string()
                .describe("The city name, e.g., 'Paris' or 'Tokyo'"),
            units: z
                .enum(["celsius", "fahrenheit"])
                .describe("Temperature unit to return"),
        }),
    }
);

const calculatorTool = tool(async (input: any) => {
    try {
        const result = evaluate(input.expression);
        if (typeof result === "object" && result !== null) {
            return JSON.stringify(result);
        }
        return `${result}`;
    } catch (error) {
        return `Error evaluating expression: ${error instanceof Error ? error.message : String(error)}`;
    }
}, {
    name: "calculator",
    description: "Perform mathematical calculations",
    schema: z.object({
        expression: z.string().describe("Math expression to evaluate")
    })
});


const getDateTool = tool(async (input: any) => {
    const date = new Date()
    return date.toISOString()
}, {
    name: "get_date",
    description: "Get the current date and time"
});


const knowledgeBaseTool = tool(async (input: any, config?: any) => {
    const supabaseVectorStore = await SupabaseVectorStore.fromExistingIndex(
        embeddings,
        {
            client: supabaseClient,
            tableName: "documents",
            queryName: "match_documents",
        }
    );

    const userId = config?.configurable?.userId;

    const result = await supabaseVectorStore.similaritySearch(
        input.query,
        5,
        userId ? { userId } : undefined
    );

    return result.map((doc: any) => doc.pageContent).join("\n\n");
}, {
    name: "get_knowledge_base",
    description: "Queries the user's uploaded knowledge base (PDF documents, files, resume, etc.) to retrieve relevant information and facts for a given search query.",
    schema: z.object({
        query: z.string().describe("The search query to look up in the knowledge base documents")
    })
});
export { calculatorTool, weatherTool, knowledgeBaseTool }