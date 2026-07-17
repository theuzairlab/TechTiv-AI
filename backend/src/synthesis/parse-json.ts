export function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim()
    ? fencedMatch[1].trim()
    : (() => {
        const firstBrace = trimmed.indexOf("{");
        const lastBrace = trimmed.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          return trimmed.slice(firstBrace, lastBrace + 1);
        }
        return trimmed;
      })();

  try {
    return JSON.parse(candidate);
  } catch {
    const repaired = repairTruncatedJson(candidate);
    return JSON.parse(repaired);
  }
}

/** Best-effort close of truncated JSON objects/arrays from LLM cutoffs. */
function repairTruncatedJson(input: string): string {
  let text = input.trim();

  // Drop a trailing incomplete string fragment if cut mid-value.
  text = text.replace(/,\s*"[^"]*$/s, "");
  text = text.replace(/,\s*[^,{}\[\]]+$/s, "");

  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") stack.push(char);
    if (char === "}" || char === "]") stack.pop();
  }

  if (inString) text += '"';

  // Remove trailing commas before closing.
  text = text.replace(/,\s*$/s, "");

  while (stack.length > 0) {
    const open = stack.pop();
    text += open === "{" ? "}" : "]";
  }

  return text;
}
