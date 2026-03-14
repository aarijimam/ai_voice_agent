// This function was written by ai to help ensure that the JSON output from the LLM is always parseable, even if the LLM sometimes forgets to close braces or leaves trailing commas. It also strips markdown formatting if present. This way, we can avoid crashes due to JSON parsing errors and handle them gracefully instead.
export function repairJSON(raw: string): string {
  let cleaned = raw
    .replace(/```json|```/g, "") // strip markdown
    .trim();

  // count opening and closing braces
  const opens = (cleaned.match(/{/g) || []).length;
  const closes = (cleaned.match(/}/g) || []).length;

  // add missing closing braces
  if (opens > closes) {
    cleaned += "}".repeat(opens - closes);
  }

  // remove trailing commas before closing brace
  cleaned = cleaned.replace(/,\s*}/g, "}");

  return cleaned;
}