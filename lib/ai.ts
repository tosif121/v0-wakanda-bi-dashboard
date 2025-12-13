import { createOpenAI } from "@ai-sdk/openai"

const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
})

export async function getAIInsights(data: any) {
  const response = await perplexity.chat.completions.create({
    model: "sonar",
    messages: [
      { role: "system", content: "You are a business analyst." },
      { role: "user", content: `Analyze this data: ${JSON.stringify(data)}` },
    ],
  })

  return response.choices[0].message.content
}
