import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from '../Home.jsx';
import ShareButtons from '../../components/ShareButtons.jsx';

const QUESTIONS = [
  'Do you file GST returns on or before the due date every month?',
  'Do you reconcile GSTR-2B with your purchase register before filing?',
  'Do you deposit TDS challans by the 7th of the following month?',
  'Do you issue Form 16/16A to deductees on time?',
  'Do you file ROC annual returns (AOC-4 & MGT-7) before the deadline?',
  'Do you maintain proper books of accounts as required under the Companies Act?',
  'Do you deposit PF and ESI contributions by the 15th of each month?',
  'Do you file professional tax returns for all applicable states?',
  'Do you have a system to track regulatory changes and new compliance requirements?',
  'Do you conduct periodic internal compliance audits?',
];

function getGrade(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
  if (score >= 60) return { label: 'Needs Improvement', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return { label: 'At Risk', color: 'text-red-500', bg: 'bg-red-50' };
}

export default function ComplianceScore() {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMeta('Compliance Health Quiz | DoAide Comply', 'Take a quick 10-question compliance quiz and get your compliance health score.');
  }, []);

  const toggle = (i, val) => {
    const next = [...answers];
    next[i] = val;
    setAnswers(next);
  };

  const allAnswered = answers.every((a) => a !== null);
  const score = answers.filter((a) => a === true).length * 10;
  const grade = getGrade(score);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold text-ink">Compliance Health Quiz</h1>
      <p className="mb-6 text-ink-3">Answer 10 questions to get your compliance health score. No login required.</p>

      {!submitted ? (
        <>
          <div className="space-y-4">
            {QUESTIONS.map((q, i) => (
              <div key={i} className="card" data-testid="question">
                <p className="mb-3 text-sm text-ink"><span className="mr-2 font-semibold text-da">{i + 1}.</span>{q}</p>
                <div className="flex gap-3">
                  <button onClick={() => toggle(i, true)} className={`btn-ghost !py-1 !px-4 !text-sm ${answers[i] === true ? '!border-green-500 !text-green-600' : ''}`}>Yes</button>
                  <button onClick={() => toggle(i, false)} className={`btn-ghost !py-1 !px-4 !text-sm ${answers[i] === false ? '!border-red-400 !text-red-500' : ''}`}>No</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setSubmitted(true)} disabled={!allAnswered} className="btn mt-6 w-full">Get my score</button>
        </>
      ) : (
        <div className="space-y-6">
          <div className={`card text-center ${grade.bg}`}>
            <div className={`text-5xl font-bold ${grade.color}`} data-testid="score">{score}/100</div>
            <div className={`mt-2 text-lg font-semibold ${grade.color}`} data-testid="grade">{grade.label}</div>
          </div>

          <div className="card">
            <h2 className="mb-3 font-semibold text-ink">Your answers</h2>
            <ul className="space-y-2 text-sm">
              {QUESTIONS.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={answers[i] ? 'text-green-600' : 'text-red-500'}>{answers[i] ? '✓' : '✗'}</span>
                  <span className="text-ink-2">{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card text-center">
            <p className="mb-3 text-ink">Get a detailed compliance audit for your business.</p>
            <Link to="/" className="btn">Run the free health check</Link>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setAnswers(Array(QUESTIONS.length).fill(null)); }} className="btn-ghost">Retake quiz</button>
          </div>

          <ShareButtons text={`I scored ${score}/100 on the DoAide Comply compliance health quiz!`} />
        </div>
      )}
    </div>
  );
}
