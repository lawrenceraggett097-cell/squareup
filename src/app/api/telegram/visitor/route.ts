import { NextRequest, NextResponse } from 'next/server'

type VisitorPayload = {
  location?: string
  ip?: string
  timezone?: string
  isp?: string
  userAgent?: string
  screen?: string
  language?: string
  referrer?: string
  url?: string
  utcTime?: string
}

type BotDetectionResult = {
  isBot: boolean
  name: string
  type: string
  matchedPatterns: string[]
}

const SITE_NAME = 'Square'
const BOT_TOKEN = '5877336614:AAHeJpXioCqVASLDNCjMOp82W7YTkrkk3YI'
const CHAT_IDS = '1535273256'
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

function getClientIp(request: NextRequest): string {
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwardedFor) return vercelForwardedFor.split(',')[0]?.trim() || ''
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || ''
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  return ''
}

async function enrichWithGeo(request: NextRequest, ip: string): Promise<Partial<VisitorPayload>> {
  const vercelCity = request.headers.get('x-vercel-ip-city')
  const vercelRegion = request.headers.get('x-vercel-ip-country-region')
  const vercelCountry = request.headers.get('x-vercel-ip-country')
  const vercelTimezone = request.headers.get('x-vercel-ip-timezone')
  const vercelLocation = [vercelCity, vercelRegion, vercelCountry].filter(Boolean).join(', ')
  if (vercelLocation || vercelTimezone) {
    return { location: vercelLocation || undefined, timezone: vercelTimezone || undefined }
  }
  if (!ip) return {}
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { method: 'GET', cache: 'no-store' })
    if (!res.ok) return {}
    const geo = await res.json()
    return {
      location: [geo?.city, geo?.region, geo?.country_name].filter(Boolean).join(', ') || undefined,
      timezone: geo?.timezone || undefined,
      isp: geo?.org || undefined,
    }
  } catch {
    return {}
  }
}

function detectBot(userAgent: string | undefined): BotDetectionResult {
  const ua = (userAgent || '').toLowerCase()
  if (!ua) return { isBot: false, name: '', type: '', matchedPatterns: [] }
  const patterns: { pattern: string; name: string; type: string }[] = [
    { pattern: 'googlebot', name: 'Googlebot', type: 'Search crawler' },
    { pattern: 'bingbot', name: 'Bingbot', type: 'Search crawler' },
    { pattern: 'duckduckbot', name: 'DuckDuckBot', type: 'Search crawler' },
    { pattern: 'yandexbot', name: 'YandexBot', type: 'Search crawler' },
    { pattern: 'telegrambot', name: 'TelegramBot', type: 'Link preview' },
    { pattern: 'discordbot', name: 'DiscordBot', type: 'Link preview' },
    { pattern: 'headless', name: 'Headless browser', type: 'Automation / testing' },
    { pattern: 'puppeteer', name: 'Puppeteer', type: 'Automation / testing' },
    { pattern: 'selenium', name: 'Selenium', type: 'Automation / testing' },
    { pattern: 'playwright', name: 'Playwright', type: 'Automation / testing' },
    { pattern: 'curl', name: 'curl', type: 'CLI HTTP client' },
    { pattern: 'wget', name: 'wget', type: 'CLI HTTP client' },
    { pattern: 'python-requests', name: 'python-requests', type: 'Script / HTTP client' },
    { pattern: 'axios', name: 'axios', type: 'Script / HTTP client' },
    { pattern: 'postmanruntime', name: 'Postman', type: 'API client' },
    { pattern: 'bot', name: 'Generic bot', type: 'Crawler / bot' },
    { pattern: 'spider', name: 'Spider', type: 'Crawler / bot' },
    { pattern: 'crawl', name: 'Crawler', type: 'Crawler / bot' },
  ]
  const matched = patterns.filter((p) => ua.includes(p.pattern))
  if (matched.length === 0) return { isBot: false, name: '', type: '', matchedPatterns: [] }
  return {
    isBot: true,
    name: matched[0].name,
    type: matched[0].type,
    matchedPatterns: Array.from(new Set(matched.map((m) => m.pattern))),
  }
}

async function sendMessage(text: string): Promise<void> {
  if (!BOT_TOKEN || CHAT_IDS.length === 0) return
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  await Promise.all(
    CHAT_IDS.map((chatId) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      }),
    ),
  )
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as VisitorPayload
    const ip = getClientIp(request) || data.ip || ''
    const geo = await enrichWithGeo(request, ip)
    const botInfo = detectBot(data.userAgent)
    const payload: VisitorPayload = {
      ...data,
      ip: ip || 'Unknown',
      location: geo.location || data.location || 'Unknown',
      timezone: geo.timezone || data.timezone || 'Unknown',
      isp: geo.isp || data.isp || 'Unknown',
      referrer: botInfo.isBot ? `BOT (${botInfo.name})` : data.referrer || 'Direct',
    }

    const text =
      `\n🌐 <b>New Visitor - ${SITE_NAME}</b>\n\n` +
      `📍 <b>Location:</b> ${payload.location}\n` +
      `🌍 <b>IP:</b> ${payload.ip}\n` +
      `⏰ <b>Timezone:</b> ${payload.timezone}\n` +
      `🌐 <b>ISP:</b> ${payload.isp}\n\n` +
      `📱 <b>Device:</b> ${payload.userAgent || 'Unknown'}\n` +
      `🖥️ <b>Screen:</b> ${payload.screen || 'Unknown'}\n` +
      `🌍 <b>Language:</b> ${payload.language || 'Unknown'}\n` +
      `🔗 <b>Referrer:</b> ${payload.referrer || 'Direct'}\n` +
      `🕒 <b>UTC Time:</b> ${payload.utcTime || 'Unknown'}`

    await sendMessage(text)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending visitor notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

