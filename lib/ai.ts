import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
})

export async function getAIInsights(data: any) {
  const { text } = await generateText({
    model: perplexity("sonar"),
    messages: [
      { role: "system", content: "You are a business analyst." },
      { role: "user", content: `Analyze this data: ${JSON.stringify(data)}` },
    ],
  })

  return text
}
