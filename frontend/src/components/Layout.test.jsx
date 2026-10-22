import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Layout from './Layout.jsx';

describe('Free Tools navigation', () => {
  it('keeps links available while keyboard focus is inside and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Layout>Content</Layout></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: /Free Tools/ });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.tab();
    expect(screen.getByRole('link', { name: 'GST Deadline Checker' })).toHaveFocus();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes after following a tool link', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Layout>Content</Layout></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: /Free Tools/ });
    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'GST Deadline Checker' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
