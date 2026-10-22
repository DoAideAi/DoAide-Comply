import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { setMeta } from '../Home.jsx';
import ShareButtons from '../../components/ShareButtons.jsx';
import { INDUSTRIES } from './industryChecklistData.js';


export { INDUSTRIES };

export default function IndustryChecklist() {
  const [params] = useSearchParams();
  // /tools/industry-checklist/:industry is the indexable URL; ?industry= is kept for old links.
  const routeIndustry = useParams().industry || params.get('industry');
  const initialIndustry = INDUSTRIES[routeIndustry] ? routeIndustry : 'manufacturing';
  const [selected, setSelected] = useState(initialIndustry);
  const [areaFilter, setAreaFilter] = useState('All');

  const industry = INDUSTRIES[selected];

  useEffect(() => {
    if (INDUSTRIES[routeIndustry]) {
      setMeta(
        `${industry.name} Compliance Checklist India | DoAide Comply`,
        industry.description,
        `/tools/industry-checklist/${routeIndustry}`
      );
    } else {
      setMeta(
        'Industry Compliance Checklists for Indian Businesses | DoAide Comply',
        'Free GST, labour, licensing and ROC compliance checklists for manufacturing, IT services, retail and healthcare businesses in India.',
        '/tools/industry-checklist'
      );
    }
  }, [industry, routeIndustry]);

  const areas = useMemo(() => {
    const set = new Set(industry.items.map((i) => i.area));
    return ['All', ...Array.from(set)];
  }, [industry]);

  const filtered = useMemo(() => {
    if (areaFilter === 'All') return industry.items;
    return industry.items.filter((i) => i.area === areaFilter);
  }, [industry, areaFilter]);

  const areaStats = useMemo(() => {
    const map = {};
    for (const item of industry.items) {
      map[item.area] = (map[item.area] || 0) + 1;
    }
    return map;
  }, [industry]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-ink">Industry Compliance Checklist</h1>
      <p className="mb-6 text-ink-3">
        Complete compliance checklist by industry. Select your industry to see all applicable regulations, filing requirements, and penalties.
      </p>

      <div className="card mb-6">
        <label htmlFor="industry" className="label">Select your industry</label>
        <select id="industry" className="input" value={selected} onChange={(e) => { setSelected(e.target.value); setAreaFilter('All'); }}>
          {Object.entries(INDUSTRIES).map(([key, ind]) => (
            <option key={key} value={key}>{ind.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(areaStats).slice(0, 4).map(([area, count]) => (
          <div key={area} className="card !p-3 text-center" data-testid="area-stat">
            <div className="text-lg font-bold text-da">{count}</div>
            <div className="text-xs text-ink-3">{area}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by compliance area">
        {areas.map((a) => (
          <button key={a} role="tab" aria-selected={areaFilter === a} onClick={() => setAreaFilter(a)}
            className={`rounded-full border px-3 py-1 text-xs ${areaFilter === a ? 'border-da bg-da text-white' : 'border-slate-300 text-ink-2 hover:border-da'}`}>
            {a}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <div key={i} className="card !p-4" data-testid="checklist-item">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded border border-slate-300" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-da">{item.area}</span>
                  <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-ink-3">{item.frequency}</span>
                </div>
                <p className="mt-1 text-sm text-ink">{item.task}</p>
                <p className="mt-1 text-xs text-red-500/80">Penalty: {item.penalty}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-10 text-center">
        <p className="mb-3 text-ink">Get automated deadline reminders for your {industry.name.toLowerCase()} business.</p>
        <Link to="/" className="btn">Run the free health check</Link>
      </div>

      <div className="mt-6">
        <ShareButtons text={`${industry.name} compliance checklist for Indian businesses — free tool by DoAide Comply`} />
      </div>
    </div>
  );
}
