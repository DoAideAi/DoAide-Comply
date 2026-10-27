import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from './Home.jsx';

export const PLANS = [
  { id: 'free', name: 'Free', price: '₹0', features: ['Compliance health check', '1 business calendar', 'Penalty estimates', 'WhatsApp sharing'] },
  { id: 'pro', name: 'Pro', price: '₹499', featured: true, features: ['Everything in Free', 'Up to 3 businesses', 'Email and WhatsApp reminders', 'Team assignment and status tracking'] },
  { id: 'enterprise', name: 'Enterprise', price: '₹1,499', features: ['Everything in Pro', 'Up to 25 businesses', 'CA collaboration', 'Priority support'] },
];

function usePricingSchema() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'DoAide Comply',
      description: 'Compliance calendar and deadline reminders for Indian businesses.',
      url: 'https://comply.doaide.com/pricing',
      brand: { '@type': 'Organization', name: 'DoAide', url: 'https://doaide.com' },
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'INR', description: 'Compliance health check, 1 business calendar, penalty estimates' },
        { '@type': 'Offer', name: 'Pro', price: '499', priceCurrency: 'INR', description: 'Up to 3 businesses, email and WhatsApp reminders', priceSpecification: { '@type': 'UnitPriceSpecification', price: '499', priceCurrency: 'INR', billingDuration: 'P1M' } },
        { '@type': 'Offer', name: 'Enterprise', price: '1499', priceCurrency: 'INR', description: 'Up to 25 businesses, CA collaboration, priority support', priceSpecification: { '@type': 'UnitPriceSpecification', price: '1499', priceCurrency: 'INR', billingDuration: 'P1M' } },
      ],
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);
}

export default function Pricing() {
  useEffect(() => setMeta('Pricing — Free, Pro & Enterprise Plans | DoAide Comply', 'Free, Pro ₹499/mo and Enterprise ₹1,499/mo compliance calendar plans for Indian businesses.'), []);
  usePricingSchema();
  return (
    <div>
      <h1 className="mb-8 text-center text-3xl font-bold text-ink">Simple pricing</h1>
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.id} className={`card flex flex-col ${p.featured ? '!border-da' : ''}`} data-testid={`plan-${p.id}`}>
            <h2 className="text-xl font-semibold text-ink">{p.name}</h2>
            <div className="my-3 text-3xl font-bold text-da">{p.price}<span className="text-sm font-normal text-ink-3">{p.id === 'free' ? '' : '/mo'}</span></div>
            <ul className="mb-6 flex-1 space-y-2 text-sm text-ink-2">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <Link to={`/register?plan=${p.id}`} className={p.featured ? 'btn' : 'btn-ghost'}>{p.id === 'free' ? 'Start free' : `Choose ${p.name}`}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
