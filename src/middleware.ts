import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_BOT_PATTERNS = [
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /slack-imgproxy/i,
  /telegrambot/i,
  /whatsapp/i,
  /discordbot/i,
  /pinterest/i,
  /embedly/i,
  /googlebot/i,
  /bingbot/i,
  /applebot/i,
  /viber/i,
  /redditbot/i,
  /tumblr/i,
  /line-poker/i,
  /line-crawler/i,
  /kakaotalk/i,
  /skype/i,
  /wechat/i,
  /flipboard/i,
  /medium/i,
  /bitlybot/i,
  /quora link preview/i,
  /discord/i,
]

const BLOCKED_BOT_PATTERNS = [
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /go-http-client/i,
  /postman/i,
  /insomnia/i,
  /selenium/i,
  /webdriver/i,
  /puppeteer/i,
  /playwright/i,
  /phantom/i,
  /headlesschrome/i,
  /chrome-lighthouse/i,
  /prerender/i,
  /browsershot/i,
  /wkhtmltopdf/i,
  /html2pdf/i,
  /uptimerobot/i,
  /pingdom/i,
  /site24x7/i,
  /statuscake/i,
  /nagios/i,
  /rogerbot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /dotbot/i,
  /mj12bot/i,
  /petalbot/i,
  /libwww/i,
  /lwp-trivial/i,
  /php\/\d/i,
  /^java\s/i,
  /datadog/i,
  /sentry\/\d/i,
  /archive\.org/i,
  /wayback/i,
  /ia_archiver/i,
]

function isAllowedBot(ua: string): boolean {
  return ALLOWED_BOT_PATTERNS.some((p) => p.test(ua))
}

function isBlockedBot(ua: string): boolean {
  return BLOCKED_BOT_PATTERNS.some((p) => p.test(ua))
}

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") || ""
  if (isAllowedBot(ua)) return NextResponse.next()
  if (isBlockedBot(ua)) return new NextResponse("Forbidden", { status: 403 })
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff2?)$).*)"],
}

