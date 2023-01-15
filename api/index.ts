import { VercelRequest, VercelResponse } from '@vercel/node'
import Scanner from '@koishijs/registry'

const REGISTRY = 'https://raw.githubusercontent.com/koishijs/registry/dist/index.json'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { path } = request.query
  const query = mapAttrs(request.query, (key, value) =>
    Array.isArray(value) ? value[0]: value)
  const registry: Scanner = await fetch(REGISTRY).then(res => res.json())
  const object = registry.objects.find(p => p.package.name === path)
  const rating = encodeURIComponent(object
    ? star(Math.round(object.score.final * 5))
    : 'package not found')
  const url = `https://img.shields.io/badge/rating-${rating}-green?` + new URLSearchParams({
    style: 'flat-square',
    ...query,
  })
  const badge = await fetch(url).then(res => res.text())
  return response.setHeader('content-type', 'image/svg+xml').end(badge)
}

function star(count: number) {
  let stars = ''
  for (let i = 0; i < 5; i++) {
    stars += i < count ? '★' : '☆'
  }
  return stars
}

function mapAttrs<T, U>(obj: Record<string, T>, cb: (key: string, value: T) => U): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, cb(key, value)]))
}