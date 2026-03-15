// Repairs small formatting issues from LLM output so JSON.parse is less likely to fail.
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