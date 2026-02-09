/**
 * Act API 工具函数 - 发送 actionControl 并解析 SSE JSON 结果
 */
export async function callActStream(
  accessToken: string,
  message: string,
  actionControl: string,
  options?: {
    sessionId?: string;
    systemPrompt?: string;
  }
): Promise<{ sessionId: string; result: unknown }> {
  const baseUrl = process.env.SECONDME_API_BASE_URL!;

  const res = await fetch(`${baseUrl}/api/secondme/act/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      actionControl,
      sessionId: options?.sessionId,
      systemPrompt: options?.systemPrompt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Act API error: ${res.status}`);
  }

  const text = await res.text();
  const lines = text.split("\n");

  let sessionId = "";
  let content = "";

  for (const line of lines) {
    if (line.startsWith("event: session")) {
      const nextLine = lines[lines.indexOf(line) + 1];
      if (nextLine?.startsWith("data: ")) {
        const sessionData = JSON.parse(nextLine.slice(6));
        sessionId = sessionData.sessionId;
      }
    } else if (line.startsWith("data: ") && !line.includes("[DONE]")) {
      try {
        const data = JSON.parse(line.slice(6));
        const delta = data?.choices?.[0]?.delta?.content;
        if (delta) content += delta;
      } catch {
        // skip non-JSON lines
      }
    }
  }

  let result: unknown;
  try {
    result = JSON.parse(content);
  } catch {
    result = content;
  }

  return { sessionId, result };
}
