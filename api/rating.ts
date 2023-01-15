import { VercelRequest, VercelResponse } from '@vercel/node'
import { MarketResult } from '@koishijs/registry'

const endpoint = 'https://raw.githubusercontent.com/koishijs/registry/dist/market.json'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { path } = request.query
  const query = mapAttrs(request.query, (key, value) =>
    Array.isArray(value) ? value[0]: value)
  const market: MarketResult = await fetch(endpoint).then(res => res.json())
  const object = market.objects.find(p => p.name === path)
  const rating = encodeURIComponent(object
    ? star(Math.min(Math.max((object.score.final - 0.25) * 10, 0), 5))
    : 'package not found')
  const color = object.insecure ? 'red' : object.manifest.preview ? 'yellow' : 'green'
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
