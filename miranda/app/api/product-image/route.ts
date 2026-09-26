import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

const TIMEOUT_MS = 8000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const IMAGE_TYPE = /^image\/(jpeg|jpg|png|webp)$/i;

/**
 * Proxy a retailer CDN image so WhatsApp / clients fetch from our origin
 * (retailer CDNs often 403 hotlinks). GET ?u=<encoded https image url>
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  if (!raw) {
    return NextResponse.json({ error: "missing u" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "bad protocol" }, { status: 400 });
  }
  if (target.protocol === "http:") target.protocol = "https:";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(target.href, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: ctrl.signal,
      redirect: "follow",
      cache: "force-cache",
    });
    if (!upstream.ok) {
      return new NextResponse(null, { status: 502 });
    }
    const rawType = (upstream.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
    // Some CDNs omit type or use octet-stream; sniff from URL extension.
    let contentType = rawType;
    if (!IMAGE_TYPE.test(contentType)) {
      if (/\.webp(\?|$)/i.test(target.pathname)) contentType = "image/webp";
      else if (/\.png(\?|$)/i.test(target.pathname)) contentType = "image/png";
      else if (/\.jpe?g(\?|$)/i.test(target.pathname)) contentType = "image/jpeg";
      else if (/^application\/octet-stream$/i.test(rawType) || !rawType) {
        contentType = "image/jpeg";
      } else {
        return NextResponse.json({ error: "not an image" }, { status: 415 });
      }
    }
    if (!IMAGE_TYPE.test(contentType)) {
      return NextResponse.json({ error: "not an image" }, { status: 415 });
    }

    const bytes = await upstream.arrayBuffer();
    if (!bytes.byteLength) {
      return new NextResponse(null, { status: 502 });
    }

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType.toLowerCase() === "image/jpg" ? "image/jpeg" : contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
