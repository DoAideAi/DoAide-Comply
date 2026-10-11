import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import RobotFace from './RobotFace.jsx';
import { getToken } from '../api.js';

export default function Layout({ children }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const link = ({ isActive }) => (isActive ? 'text-da font-semibold' : 'text-ink-3 hover:text-da');
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-ink">
            <RobotFace size={28} /> DoAide <span className="text-da">|</span> <span className="text-da">Comply</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <div className="relative">
              <button onClick={() => setToolsOpen(!toolsOpen)} onBlur={() => setTimeout(() => setToolsOpen(false), 150)} className="text-ink-3 hover:text-da">
                Free Tools ▾
              </button>
              {toolsOpen && (
                <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <Link to="/tools/gst-deadline-checker" className="block px-4 py-2 text-sm text-ink-2 hover:bg-surface-3 hover:text-da">GST Deadline Checker</Link>
                  <Link to="/tools/tds-rate-finder" className="block px-4 py-2 text-sm text-ink-2 hover:bg-surface-3 hover:text-da">TDS Rate Finder</Link>
                  <Link to="/tools/compliance-score" className="block px-4 py-2 text-sm text-ink-2 hover:bg-surface-3 hover:text-da">Compliance Health Quiz</Link>
                  <Link to="/tools/roc-filing-tracker" className="block px-4 py-2 text-sm text-ink-2 hover:bg-surface-3 hover:text-da">ROC Filing Tracker</Link>
                  <Link to="/tools/compliance-calendar" className="block px-4 py-2 text-sm text-ink-2 hover:bg-surface-3 hover:text-da">Compliance Calendar</Link>
                  <Link to="/tools/industry-checklist" className="block px-4 py-2 text-sm text-ink-2 hover:bg-surface-3 hover:text-da">Industry Checklist</Link>
                </div>
              )}
            </div>
            <NavLink to="/pricing" className={link}>Pricing</NavLink>
            <NavLink to="/blog" className={link}>Blog</NavLink>
            <NavLink to="/widget" className={link}>Widget</NavLink>
            <Link to={getToken() ? '/dashboard' : '/login'} className="btn !py-1.5">{getToken() ? 'Dashboard' : 'Log in'}</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-surface-2 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-xs text-ink-3">
                Dates are statutory defaults for FY 2026-27 and exclude government extensions. Verify with your CA before filing.
              </p>
              <p className="mt-1 text-xs text-ink-3">&copy; {new Date().getFullYear()} DoAide Comply</p>
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-ink-3">
                A <span className="font-bold text-da">DoAide</span> Product
              </span>
              <div className="flex gap-4 text-xs text-ink-3">
                <a href="https://doaide.com" target="_blank" rel="noopener noreferrer" className="hover:text-da">DoAide Home</a>
                <a href="https://comply.doaide.com" className="hover:text-da">Comply</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
