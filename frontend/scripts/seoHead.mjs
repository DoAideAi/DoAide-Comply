// Head fix-ups applied to every prerendered page (pure DOM functions, unit-tested).
export const SITE_URL = 'https://comply.doaide.com'

export function canonicalUrl(route) {
  const clean = route.replace(/\/+$/, '')
  return clean ? SITE_URL + clean : SITE_URL + '/'
}

function upsert(document, selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

function hasSchemaType(document, type) {
  return [...document.head.querySelectorAll('script[type="application/ld+json"]')].some(el => {
    try {
      const data = JSON.parse(el.textContent)
      return (Array.isArray(data) ? data : [data]).some(d => d && d['@type'] === type)
    } catch {
      return false
    }
  })
}

export function pageName(title) {
  return (title || '').split(/ [—|] /)[0].trim()
}

const SECTION_NAMES = { blog: 'Blog', tools: 'Free Tools' }

// Canonical and og:url always point at the route itself, and every sub-page gets a
// BreadcrumbList. The middle crumb is only added when that section page exists
// (Comply has /blog but no /tools index), so the trail never links to a 404.
export function finalizeHead(document, route, knownRoutes = []) {
  const url = canonicalUrl(route)
  const link = upsert(document, 'link[rel="canonical"]', () => {
    const el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    return el
  })
  link.setAttribute('href', url)
  const ogUrl = upsert(document, 'meta[property="og:url"]', () => {
    const el = document.createElement('meta')
    el.setAttribute('property', 'og:url')
    return el
  })
  ogUrl.setAttribute('content', url)

  if (route !== '/' && !hasSchemaType(document, 'BreadcrumbList')) {
    const segments = route.split('/').filter(Boolean)
    const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' }]
    const section = '/' + segments[0]
    if (segments.length > 1 && knownRoutes.includes(section)) {
      items.push({
        '@type': 'ListItem', position: 2,
        name: SECTION_NAMES[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1),
        item: SITE_URL + section,
      })
    }
    items.push({ '@type': 'ListItem', position: items.length + 1, name: pageName(document.title), item: url })
    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items })
    document.head.appendChild(script)
  }
  addToolSchema(document, route)
}

// Free tool pages are web apps: mark them up as such unless the page already did.
export function addToolSchema(document, route) {
  if (!route.startsWith('/tools/') || hasSchemaType(document, 'WebApplication')) return
  const description = document.head.querySelector('meta[name="description"]')?.getAttribute('content')
  const script = document.createElement('script')
  script.setAttribute('type', 'application/ld+json')
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: pageName(document.title),
    description: description || pageName(document.title),
    url: canonicalUrl(route),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    publisher: { '@type': 'Organization', name: 'DoAide', url: 'https://doaide.com' },
  })
  document.head.appendChild(script)
}

// The shell served for non-prerendered URLs: no homepage canonical or homepage-only
// structured data, and noindex so stray URLs never compete with real pages.
export function appShellHead(document) {
  document.head.querySelectorAll('link[rel="canonical"], meta[property="og:url"], script[data-home-only]').forEach(el => el.remove())
  const robots = document.head.querySelector('meta[name="robots"]')
  if (robots) robots.setAttribute('content', 'noindex, follow')
}

export function sitemapXml(routes, lastmod) {
  const priority = route => route === '/' ? '1.0' : route.startsWith('/tools/') ? '0.9' : route.startsWith('/blog/') ? '0.7' : '0.8'
  const urls = routes.map(route =>
    `  <url><loc>${canonicalUrl(route)}</loc><lastmod>${lastmod}</lastmod><priority>${priority(route)}</priority></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}
