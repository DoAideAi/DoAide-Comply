import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

const calendar = [
  { id: 'a', category: 'GST', form: 'GSTR-3B', title: 'GSTR-3B for Mar 2026', due_date: '2026-04-20', description: 'Summary return', penalty: 'Rs 50/day', conditional: false },
  { id: 'b', category: 'ROC', form: 'AOC-4', title: 'AOC-4 financial statements', due_date: '2026-10-30', description: 'Within 30 days of AGM', penalty: 'Rs 100/day', conditional: false },
];

function mockFetch() {
  global.fetch = vi.fn(async (url) => {
    const ok = (data) => ({ ok: true, status: 200, json: async () => data });
    if (url === '/api/public/meta') return ok({ states: ['Maharashtra', 'Karnataka'] });
    if (url === '/api/public/health-check') return ok({ calendar, summary: { total_obligations: 2, due_next_30_days: 1, penalty_exposure_30_days_late: 4500 }, share: { whatsapp_url: 'https://wa.me/?text=hi' }, disclaimer: 'Verify.' });
    if (url === '/api/public/blog') return ok([{ slug: 'x', title: 'GST Due Dates', description: 'd', published: '2026-04-01' }]);
    return { ok: false, status: 404, json: async () => ({ detail: 'nope' }) };
  });
}
const renderAt = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('Comply app', () => {
  beforeEach(mockFetch);
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

  it('runs the free health check without login and shows WhatsApp share', async () => {
    renderAt('/');
    await userEvent.click(screen.getByRole('button', { name: /get my compliance calendar/i }));
    expect(await screen.findAllByTestId('calendar-item')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /share on whatsapp/i })).toHaveAttribute('href', 'https://wa.me/?text=hi');
    expect(screen.getByText('₹4,500')).toBeInTheDocument();
  });

  it('filters the calendar by category', async () => {
    renderAt('/');
    await userEvent.click(screen.getByRole('button', { name: /get my compliance calendar/i }));
    await screen.findAllByTestId('calendar-item');
    await userEvent.click(screen.getByRole('tab', { name: 'ROC' }));
    expect(screen.getAllByTestId('calendar-item')).toHaveLength(1);
  });

  it('shows pricing for all three plans', async () => {
    renderAt('/pricing');
    expect(await screen.findByTestId('plan-free')).toHaveTextContent('₹0');
    expect(screen.getByTestId('plan-pro')).toHaveTextContent('₹499');
    expect(screen.getByTestId('plan-enterprise')).toHaveTextContent('₹1,499');
  });

  it('lists blog posts including static articles', async () => {
    renderAt('/blog');
    expect(await screen.findByText('GST Due Dates')).toBeInTheDocument();
    expect(screen.getByText(/Complete GST Compliance Calendar/)).toBeInTheDocument();
  });

  it('renders a static blog post directly without API', async () => {
    renderAt('/blog/gst-compliance-calendar-fy-2026-27');
    expect(await screen.findByRole('heading', { name: /Complete GST Compliance Calendar/ })).toBeInTheDocument();
    expect(screen.getByText(/compliance calendar for Financial Year 2026-27 is packed/i)).toBeInTheDocument();
  });

  it('generates widget embed code', async () => {
    renderAt('/widget');
    expect((await screen.findByLabelText(/embed code/i)).value).toContain('data-doaide-comply');
  });

  it('routes /embed to the widget page', async () => {
    renderAt('/embed');
    expect((await screen.findByLabelText(/embed code/i)).value).toContain('data-doaide-comply');
  });

  it('routes to GST deadline checker', async () => {
    renderAt('/tools/gst-deadline-checker');
    expect(await screen.findByRole('heading', { name: /GST Deadline Checker/i })).toBeInTheDocument();
  });

  it('routes to TDS rate finder', async () => {
    renderAt('/tools/tds-rate-finder');
    expect(await screen.findByRole('heading', { name: /TDS Rate Finder/i })).toBeInTheDocument();
  });

  it('routes to compliance score quiz', async () => {
    renderAt('/tools/compliance-score');
    expect(await screen.findByRole('heading', { name: /Compliance Health Quiz/i })).toBeInTheDocument();
  });

  it('redirects dashboard to login when signed out', async () => {
    renderAt('/dashboard');
    await waitFor(() => expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument());
  });

  it('routes to compliance calendar', async () => {
    renderAt('/tools/compliance-calendar');
    expect(await screen.findByRole('heading', { name: /Compliance Calendar FY 2026-27/i })).toBeInTheDocument();
  });

  it('routes to industry checklist', async () => {
    renderAt('/tools/industry-checklist');
    expect(await screen.findByRole('heading', { name: /Industry Compliance Checklist/i })).toBeInTheDocument();
  });

  it('renders new blog posts in the static list', async () => {
    renderAt('/blog/compliance-checklist-new-company-india');
    expect(await screen.findByRole('heading', { name: /Ultimate Compliance Checklist for Newly Incorporated/i })).toBeInTheDocument();
  });

  it('renders MSME blog post', async () => {
    renderAt('/blog/msme-compliance-requirements-india');
    expect(await screen.findByRole('heading', { name: /MSME Compliance Requirements/i })).toBeInTheDocument();
  });

  it('home page has no fabricated testimonials', () => {
    renderAt('/');
    expect(screen.queryByText(/Trusted by/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sneha Patel/)).not.toBeInTheDocument();
  });

  it('shows a styled 404 page with a home link', async () => {
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });
});
