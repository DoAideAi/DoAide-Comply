// @vitest-environment node
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, beforeAll } from 'vitest'
import { JSDOM } from 'jsdom'
import { appShellHead, canonicalUrl, finalizeHead, pageName, sitemapXml } from './seoHead.mjs'
import { cacheControl, contentType, resolveRequest } from './static-server.mjs'

const HEAD = `<!DOCTYPE html><html><head>
<meta name="robots" content="index, follow">
<meta name="description" content="Look up TDS rates by section.">
<meta property="og:url" content="https://comply.doaide.com/">
<link rel="canonical" href="https://comply.doaide.com/">
<script type="application/ld+json" data-home-only>{"@type":"FAQPage"}</script>
<title>TDS Rate Finder — Indian TDS Rates 2026-27 | DoAide Comply</title>
</head><body><div id="root"></div></body></html>`

const schemas = doc => [...doc.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent))
const ldTypes = doc => schemas(doc).map(d => d['@type'])

describe('finalizeHead', () => {
  it('points canonical and og:url at the route itself', () => {
    const { document } = new JSDOM(HEAD).window
    finalizeHead(document, '/tools/tds-rate-finder')
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://comply.doaide.com/tools/tds-rate-finder')
    expect(document.querySelector('meta[property="og:url"]').getAttribute('content')).toBe('https://comply.doaide.com/tools/tds-rate-finder')
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
  })

  it('only adds a section crumb when that section page exists', () => {
    const { document: tool } = new JSDOM(HEAD).window
    finalizeHead(tool, '/tools/tds-rate-finder', ['/', '/blog'])
    expect(schemas(tool).find(d => d['@type'] === 'BreadcrumbList').itemListElement.map(i => i.name))
      .toEqual(['Home', 'TDS Rate Finder'])

    const { document: post } = new JSDOM(HEAD).window
    finalizeHead(post, '/blog/common-tds-filing-mistakes', ['/', '/blog'])
    const crumbs = schemas(post).find(d => d['@type'] === 'BreadcrumbList').itemListElement
    expect(crumbs.map(i => i.name)).toEqual(['Home', 'Blog', 'TDS Rate Finder'])
    expect(crumbs[1].item).toBe('https://comply.doaide.com/blog')
  })

  it('marks tool pages up as a free WebApplication', () => {
    const { document } = new JSDOM(HEAD).window
    finalizeHead(document, '/tools/tds-rate-finder')
    const app = schemas(document).find(d => d['@type'] === 'WebApplication')
    expect(app).toMatchObject({ name: 'TDS Rate Finder', description: 'Look up TDS rates by section.', isAccessibleForFree: true })

    const { document: blog } = new JSDOM(HEAD).window
    finalizeHead(blog, '/blog')
    expect(ldTypes(blog)).not.toContain('WebApplication')
  })

  it('keeps the homepage canonical with a trailing slash and no breadcrumb', () => {
    const { document } = new JSDOM(HEAD).window
    finalizeHead(document, '/')
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://comply.doaide.com/')
    expect(ldTypes(document)).not.toContain('BreadcrumbList')
  })
})

describe('appShellHead', () => {
  it('strips canonical and homepage-only data and sets noindex', () => {
    const { document } = new JSDOM(HEAD).window
    appShellHead(document)
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.querySelector('script[data-home-only]')).toBeNull()
    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex, follow')
  })
})

describe('helpers', () => {
  it('builds canonical URLs without trailing slashes', () => {
    expect(canonicalUrl('/tools/tds-rate-finder/')).toBe('https://comply.doaide.com/tools/tds-rate-finder')
    expect(pageName('Pricing | DoAide Comply')).toBe('Pricing')
  })

  it('writes one sitemap entry per route', () => {
    const xml = sitemapXml(['/', '/tools/tds-rate-finder', '/blog/x'], '2026-10-22')
    expect(xml.match(/<loc>/g)).toHaveLength(3)
    expect(xml).toContain('<loc>https://comply.doaide.com/</loc><lastmod>2026-10-22</lastmod><priority>1.0</priority>')
    expect(xml).toContain('<loc>https://comply.doaide.com/tools/tds-rate-finder</loc><lastmod>2026-10-22</lastmod><priority>0.9</priority>')
  })
})

describe('static server resolution', () => {
  let root
  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'comply-dist-'))
    await mkdir(join(root, 'tools', 'tds-rate-finder'), { recursive: true })
    await mkdir(join(root, 'assets'))
    await writeFile(join(root, 'index.html'), 'home')
    await writeFile(join(root, 'app-shell.html'), 'shell')
    await writeFile(join(root, 'tools', 'tds-rate-finder', 'index.html'), 'tds')
    await writeFile(join(root, 'assets', 'app.js'), 'js')
  })

  it('serves prerendered route directories', async () => {
    expect((await resolveRequest(root, '/tools/tds-rate-finder')).file).toBe(join(root, 'tools', 'tds-rate-finder', 'index.html'))
    expect((await resolveRequest(root, '/tools/tds-rate-finder/')).file).toBe(join(root, 'tools', 'tds-rate-finder', 'index.html'))
    expect((await resolveRequest(root, '/')).file).toBe(join(root, 'index.html'))
  })

  it('falls back to the SPA shell for unknown routes and 404s missing assets', async () => {
    expect(await resolveRequest(root, '/dashboard')).toEqual({ status: 200, file: join(root, 'app-shell.html') })
    expect(await resolveRequest(root, '/assets/missing.js')).toEqual({ status: 404, file: null })
  })

  it('refuses path traversal', async () => {
    expect((await resolveRequest(root, '/../../etc/passwd')).file).not.toMatch(/passwd/)
  })

  it('sets types and caching', () => {
    expect(contentType('/x/sitemap.xml')).toMatch(/application\/xml/)
    expect(cacheControl('/assets/app.js')).toMatch(/immutable/)
    expect(cacheControl('/tools/tds-rate-finder')).toBe('no-cache')
  })
})
