import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

const TIMEOUT_MS = 8000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

/** WhatsApp-friendly types. Prefer jpeg/webp from CDNs (no avif in Accept). */
const IMAGE_TYPE = /^image\/(jpeg|jpg|png|webp)$/i;

function refererFor(host: string): string {
  const h = host.toLowerCase();
  if (h.includes("asos")) return "https://www.asos.com/";
  if (h.includes("zara")) return "https://www.zara.com/";
  if (h.includes("mango")) return "https://shop.mango.com/";
  if (h.includes("hm.com") || h.includes("lpstatic")) return "https://www2.hm.com/";
  if (h.includes("cos")) return "https://www.cos.com/";
  return `https://${host}/`;
}

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
        // Prefer jpeg/webp so WhatsApp can render; many CDNs honour Accept.
        Accept: "image/webp,image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5",
        "Accept-Language": "en-GB,en;q=0.9",
        Referer: refererFor(target.hostname),
      },
      signal: ctrl.signal,
      redirect: "follow",
      cache: "force-cache",
    });
    if (!upstream.ok) {
      return new NextResponse(null, { status: 502 });
    }
    const rawType = (upstream.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
    let contentType = rawType;

    // Sniff when CDN lies (e.g. .jpg path serving avif) or omits type.
    if (!IMAGE_TYPE.test(contentType)) {
      if (/^image\/avif$/i.test(contentType) || /\.avif(\?|$)/i.test(target.pathname)) {
        // WhatsApp often rejects AVIF; still stream if that is all we got.
        contentType = "image/avif";
      } else if (/\.webp(\?|$)/i.test(target.pathname)) contentType = "image/webp";
      else if (/\.png(\?|$)/i.test(target.pathname)) contentType = "image/png";
      else if (/\.jpe?g(\?|$)/i.test(target.pathname)) contentType = "image/jpeg";
      else if (/^application\/octet-stream$/i.test(rawType) || !rawType) {
        contentType = "image/jpeg";
      } else {
        return NextResponse.json({ error: "not an image" }, { status: 415 });
      }
    }

    const bytes = await upstream.arrayBuffer();
    if (!bytes.byteLength) {
      return new NextResponse(null, { status: 502 });
    }

    // Magic-byte sniff when extension lied (jpg URL → avif body).
    const head = new Uint8Array(bytes.slice(0, 12));
    const isAvif =
      head.length >= 12 &&
      head[4] === 0x66 &&
      head[5] === 0x74 &&
      head[6] === 0x79 &&
      head[7] === 0x70 &&
      head[8] === 0x61 &&
      head[9] === 0x76 &&
      head[10] === 0x69 &&
      head[11] === 0x66;
    const isWebp =
      head.length >= 12 &&
      head[0] === 0x52 &&
      head[1] === 0x49 &&
      head[2] === 0x46 &&
      head[3] === 0x46 &&
      head[8] === 0x57 &&
      head[9] === 0x45 &&
      head[10] === 0x42 &&
      head[11] === 0x50;
    const isJpeg = head[0] === 0xff && head[1] === 0xd8;
    const isPng =
      head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
    if (isAvif) contentType = "image/avif";
    else if (isWebp) contentType = "image/webp";
    else if (isJpeg) contentType = "image/jpeg";
    else if (isPng) contentType = "image/png";
    else if (!IMAGE_TYPE.test(contentType) && contentType !== "image/avif") {
      return NextResponse.json({ error: "not an image" }, { status: 415 });
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
