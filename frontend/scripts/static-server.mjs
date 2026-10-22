// Serves the built, prerendered site (web/dist). Zero dependencies, adapted from
// GSTBot's deploy/static-server.mjs.
//
//   node scripts/static-server.mjs --root /opt/DoAide-Comply/frontend/dist \
//                                  --host 172.18.0.1 --port 3034
//
// Replaces `serve -s dist`: single mode rewrites every extension-less URL to
// index.html before looking at the filesystem, so the per-route pages written by
// scripts/prerender.mjs (dist/<route>/index.html) were never served. Lookup order:
//   1. an existing file            /favicon.svg
//   2. a directory's index.html    /tools/tds-rate-finder -> tools/tds-rate-finder/index.html
//   3. unknown routes -> app-shell.html (noindex SPA shell), or index.html
//   4. unknown paths with an extension -> 404
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

export function contentType(file) {
  return TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
}

// Vite fingerprints /assets, so those are immutable; HTML must never be cached
// or users get pinned to a bundle that is no longer on disk.
export function cacheControl(pathname) {
  return pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
}

async function isFile(p) {
  try {
    return (await stat(p)).isFile()
  } catch {
    return false
  }
}

// Returns { status, file } for a request path. Throws URIError on bad encoding.
export async function resolveRequest(root, pathname) {
  // normalize() collapses `..` before the prefix check, so /../../etc/passwd cannot escape root.
  const candidate = join(root, normalize(decodeURIComponent(pathname)))
  if (candidate !== root && !candidate.startsWith(root + sep)) return { status: 404, file: null }
  try {
    const s = await stat(candidate)
    if (s.isFile()) return { status: 200, file: candidate }
    if (s.isDirectory() && await isFile(join(candidate, 'index.html'))) {
      return { status: 200, file: join(candidate, 'index.html') }
    }
  } catch {
    /* fall through */
  }
  // A missing asset is a genuine 404; only unknown routes get the SPA shell.
  if (extname(pathname)) return { status: 404, file: null }
  const shell = join(root, 'app-shell.html')
  return { status: 200, file: await isFile(shell) ? shell : join(root, 'index.html') }
}

export function createHandler(root) {
  return async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method Not Allowed')
      return
    }
    let resolved
    let pathname
    try {
      pathname = new URL(req.url, 'http://localhost').pathname
      resolved = await resolveRequest(root, pathname)
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Bad Request')
      return
    }
    if (!resolved.file) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found')
      return
    }
    res.writeHead(resolved.status, {
      'Content-Type': contentType(resolved.file),
      'Cache-Control': cacheControl(pathname),
      'X-Content-Type-Options': 'nosniff',
    })
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    createReadStream(resolved.file).on('error', () => res.destroy()).pipe(res)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`)
    return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
  }
  const root = resolve(arg('root', 'dist'))
  const host = arg('host', '127.0.0.1')
  const port = Number(arg('port', '3034'))
  createServer(createHandler(root)).listen(port, host, () => {
    console.log(`serving ${root} on http://${host}:${port}`)
  })
}
