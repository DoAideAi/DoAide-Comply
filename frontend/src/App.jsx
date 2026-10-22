import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import FeedbackWidget from './components/FeedbackWidget.jsx';
import Home from './pages/Home.jsx';

const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx').then((m) => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/Blog.jsx').then((m) => ({ default: m.BlogPost })));
const Widget = lazy(() => import('./pages/Widget.jsx'));
const Login = lazy(() => import('./pages/Auth.jsx').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth.jsx').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const GstDeadlineChecker = lazy(() => import('./pages/tools/GstDeadlineChecker.jsx'));
const TdsRateFinder = lazy(() => import('./pages/tools/TdsRateFinder.jsx'));
const ComplianceScore = lazy(() => import('./pages/tools/ComplianceScore.jsx'));
const RocFilingTracker = lazy(() => import('./pages/tools/RocFilingTracker.jsx'));
const ComplianceCalendar = lazy(() => import('./pages/tools/ComplianceCalendar.jsx'));
const IndustryChecklist = lazy(() => import('./pages/tools/IndustryChecklist.jsx'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-da border-t-transparent" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 text-ink-3">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn mt-6 inline-flex min-h-12 items-center">Back to home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/widget" element={<Widget />} />
          <Route path="/embed" element={<Widget />} />
          <Route path="/tools/gst-deadline-checker" element={<GstDeadlineChecker />} />
          <Route path="/tools/tds-rate-finder" element={<TdsRateFinder />} />
          <Route path="/tools/compliance-score" element={<ComplianceScore />} />
          <Route path="/tools/roc-filing-tracker" element={<RocFilingTracker />} />
          <Route path="/tools/compliance-calendar" element={<ComplianceCalendar />} />
          <Route path="/tools/industry-checklist" element={<IndustryChecklist />} />
          <Route path="/tools/industry-checklist/:industry" element={<IndustryChecklist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <FeedbackWidget />
    </Layout>
  );
}
