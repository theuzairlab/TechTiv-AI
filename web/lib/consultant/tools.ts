export const CONSULTANT_TOOLS = [
  {
    name: "research_web",
    description:
      "Search the live web (Tavily) when the blueprint is not enough — vendors, how-tos, recent product facts.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Focused search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "research_google",
    description:
      "Google search via SerpAPI for competitors, rankings, and people-also-ask.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Google query" },
      },
      required: ["query"],
    },
  },
  {
    name: "fetch_page",
    description: "Fetch and extract a specific public URL with Firecrawl.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "https URL to read" },
      },
      required: ["url"],
    },
  },
  {
    name: "deep_research",
    description:
      "Run Tavily and SerpAPI together for a harder research question. Use sparingly.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Research question" },
      },
      required: ["query"],
    },
  },
] as const;

export type ConsultantToolName = (typeof CONSULTANT_TOOLS)[number]["name"];
