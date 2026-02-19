import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const { text, topics, inboxTopicId } = body as {
      text?: string;
      topics?: { id: string; name: string; category: string }[];
      inboxTopicId?: string;
    };

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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

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
      return NextResponse.json(
        { error: "No response from classifier" },
        { status: 500 }
      );
    }

    let result: { topicId: string; confidence: number; tags: string[] };
    try {
      result = JSON.parse(raw) as { topicId: string; confidence: number; tags: string[] };
    } catch {
      return NextResponse.json(
        { error: "Invalid classifier response" },
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
  } catch (err) {
    console.error("Classify error:", err);
    return NextResponse.json(
      { error: "Classification failed" },
      { status: 500 }
    );
  }
}

