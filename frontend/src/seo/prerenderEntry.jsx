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
  // Let passive effects (setMeta, JSON-LD effects) run.
  for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0));
  return root;
}
