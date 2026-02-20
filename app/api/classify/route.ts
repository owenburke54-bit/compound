import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 10000;
const MAX_TOPICS = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const debugId = crypto.randomUUID?.() ?? String(Date.now());

  try {
    const hasKey = Boolean(process.env.OPENAI_API_KEY);
    if (!hasKey) {
      console.error(`[${debugId}] Missing OPENAI_API_KEY`);
      return NextResponse.json(
        { error: "OpenAI API key not configured", debugId },
        { status: 500 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", debugId },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      console.error(`[${debugId}] Invalid JSON body`);
      return NextResponse.json(
        { error: "Invalid request body (must be JSON)", debugId },
        { status: 400 }
      );
    }

    const { text, topics, inboxTopicId } = (body ?? {}) as {
      text?: string;
      topics?: { id: string; name: string; category: string }[];
      inboxTopicId?: string;
    };

    console.log(`[${debugId}] classify request`, {
      textLen: typeof text === "string" ? text.length : null,
      topicsCount: Array.isArray(topics) ? topics.length : null,
      hasInbox: typeof inboxTopicId === "string",
    });

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return NextResponse.json(
        { error: "Text cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'topics' array" },
        { status: 400 }
      );
    }

    if (topics.length > MAX_TOPICS) {
      return NextResponse.json(
        { error: `Topics array exceeds maximum of ${MAX_TOPICS}` },
        { status: 400 }
      );
    }

    if (!inboxTopicId || typeof inboxTopicId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'inboxTopicId'" },
        { status: 400 }
      );
    }

    const validTopicIds = new Set([inboxTopicId, ...topics.map((t) => t.id)]);
    const topicList = topics
      .map((t) => `- ${t.id}: "${t.name}" (${t.category})`)
      .join("\n");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const topicIdsStr = Array.from(validTopicIds).join(", ");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a classification assistant. Given a note and a list of topics, you MUST choose exactly ONE topic ID from the provided list. You MUST NOT invent new topics or IDs. If uncertain, return the inbox topic ID with low confidence (e.g. 0.3). Valid topic IDs: ${topicIdsStr}. Respond ONLY with valid JSON: {"topicId": "<one of the valid IDs>", "confidence": <0-1>, "tags": ["tag1", "tag2"]}.`,
        },
        {
          role: "user",
          content: `Topics:\n${topicList}\n\nInbox ID: ${inboxTopicId}\n\nNote to classify:\n"${trimmedText}"\n\nReturn JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      console.error(`[${debugId}] Empty OpenAI response`);
      return NextResponse.json(
        { error: "No response from classifier", debugId },
        { status: 500 }
      );
    }

    let result: { topicId: string; confidence: number; tags: string[] };
    try {
      result = JSON.parse(raw) as { topicId: string; confidence: number; tags: string[] };
    } catch (e) {
      console.error(`[${debugId}] Model returned non-JSON:`, raw);
      return NextResponse.json(
        { error: "Invalid classifier response (non-JSON)", debugId, raw: raw.slice(0, 200) },
        { status: 500 }
      );
    }

    if (!validTopicIds.has(result.topicId)) {
      result.topicId = inboxTopicId;
      result.confidence = Math.min(result.confidence ?? 0, 0.5);
    }

    result.confidence = Math.max(0, Math.min(1, result.confidence ?? 0));
    result.tags = Array.isArray(result.tags) ? result.tags.slice(0, 10) : [];

    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number; code?: string; response?: { text?: () => Promise<string> } };
    console.error(`[${debugId}] Classify error:`, {
      message: e?.message,
      status: e?.status,
      code: e?.code,
    });
    if (e?.response?.text) {
      try {
        const txt = await e.response.text();
        console.error(`[${debugId}] OpenAI response body:`, txt?.slice(0, 500));
      } catch {
        // ignore
      }
    }
    const msg = e?.message?.includes("API") ? e.message : "Classification failed";
    return NextResponse.json(
      { error: msg, debugId },
      { status: 500 }
    );
  }
}

