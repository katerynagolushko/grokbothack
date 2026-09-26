/**
 * Optional xAI polish. Demo must run with no keys — returns null if unset.
 * Never required for verdicts or journey structure.
 */
export async function maybePolishLine(
  line: string,
): Promise<string | null> {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          {
            role: "system",
            content:
              "You are Miranda, a blunt UK fashion editor. Rewrite in one short original line. No film quotes. UK spelling.",
          },
          { role: "user", content: line },
        ],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}
