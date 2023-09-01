import { VercelRequest, VercelResponse } from '@vercel/node'
import { AnalyzedPackage, MarketResult } from '@koishijs/registry'

const endpoint = 'https://raw.githubusercontent.com/koishijs/registry-deploy/dist/index.json'

function getColor(object: AnalyzedPackage) {
  if (!object) return 'grey'
  if (object.verified) return 'green'
  if (object.insecure) return 'red'
  if (object.manifest.preview) return 'yellow'
  return 'blue'
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { path } = request.query
  const query = mapAttrs(request.query, (key, value) =>
    Array.isArray(value) ? value[0]: value)
  const market: MarketResult = await fetch(endpoint).then(res => res.json())
  const object = market.objects.find(p => p.name === path)
  const rating = encodeURIComponent(object ? star(object.rating) : 'package not found')
  const color = getColor(object)
  const url = `https://img.shields.io/badge/rating-${rating}-${color}?` + new URLSearchParams({
    style: 'flat-square',
    ...query,
  })
  const badge = await fetch(url).then(res => res.text())
  return response.setHeader('content-type', 'image/svg+xml').end(badge)
}

function star(count: number) {
  let stars = ''
  for (let i = 0; i < 5; i++) {
    stars += i + 0.5 < count ? '★' : '☆'
  }
  return stars
}

function mapAttrs<T, U>(obj: Record<string, T>, cb: (key: string, value: T) => U): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, cb(key, value)]))
}
