import { createAgent } from "langchain"
import { model } from "../model/model.js"
import { calculatorTool, weatherTool, knowledgeBaseTool, webSearchTool } from "../tools/tools.js"

export const agent = createAgent({
    model,
    tools:[calculatorTool,weatherTool,knowledgeBaseTool,webSearchTool]
})