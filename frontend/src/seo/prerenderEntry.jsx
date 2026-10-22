// Build-time entry used by scripts/prerender.mjs. Renders one route into the
// jsdom document so each page's setMeta writes its own <head> tags.
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';

export { routes } from './routes.js';

export async function renderRoute(pathname, container) {
  const root = createRoot(container);
  flushSync(() => {
    root.render(
      <MemoryRouter initialEntries={[pathname]}>
        <App />
      </MemoryRouter>,
    );
  });
  // Lazy route chunks resolve asynchronously, so wait until the Suspense
  // fallback is gone before capturing — otherwise the page is baked with the
  // spinner and the default <head> instead of its own.
  const deadline = Date.now() + 5000;
  while (container.querySelector('[aria-label="Loading page"]') && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 10));
  }
  if (container.querySelector('[aria-label="Loading page"]')) {
    throw new Error('route still showing Suspense fallback after 5s');
  }
  // Let passive effects (setMeta, JSON-LD effects) run.
  for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0));
  return root;
}
