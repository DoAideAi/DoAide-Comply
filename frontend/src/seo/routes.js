// Every indexable URL. scripts/prerender.mjs renders each one to dist/<route>/index.html
// and writes dist/sitemap.xml from this list, so the sitemap can't drift from the app.
// /embed (duplicate of /widget) and the auth/dashboard pages are deliberately absent:
// they get the noindex app shell.
import { staticPosts } from '../data/blogPosts.js';
import { INDUSTRIES } from '../pages/tools/industryChecklistData.js';

export const routes = [
  '/',
  '/pricing',
  '/widget',
  '/tools/gst-deadline-checker',
  '/tools/tds-rate-finder',
  '/tools/compliance-score',
  '/tools/roc-filing-tracker',
  '/tools/compliance-calendar',
  '/tools/industry-checklist',
  ...Object.keys(INDUSTRIES).map((key) => `/tools/industry-checklist/${key}`),
  '/blog',
  ...staticPosts.map((p) => `/blog/${p.slug}`),
];
