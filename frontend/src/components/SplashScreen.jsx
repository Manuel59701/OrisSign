import { useEffect, useState } from 'react';
import './SplashScreen.css';

const SHOW_MS = 2000;
const EXIT_MS = 600;

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('show');

  useEffect(() => {
    const t = setTimeout(() => setPhase('exit'), SHOW_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'exit') return;
    const t = setTimeout(onDone, EXIT_MS);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  return (
    <div className={`splash-overlay ${phase === 'exit' ? 'exit' : ''}`}>
      <div className="splash-inner">
        <div className="splash-mark">
          <span className="splash-ring"></span>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#141414" stroke="#d4af37" strokeWidth="3" />
            <rect x="16" y="24" width="32" height="28" rx="3" fill="#0d0d0d" stroke="#d4af37" strokeWidth="1.5" />
            <path d="M16 26 L32 17 L48 26" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect className="sw" x="20" y="30" width="6" height="6" rx="1.5" fill="#d4af37" />
            <rect className="sw" x="29" y="30" width="6" height="6" rx="1.5" fill="#d4af37" />
            <rect className="sw" x="38" y="30" width="6" height="6" rx="1.5" fill="#d4af37" />
            <rect x="20" y="40" width="6" height="6" rx="1.5" fill="#3a3a3a" />
            <rect x="29" y="40" width="6" height="6" rx="1.5" fill="#3a3a3a" />
            <rect x="38" y="40" width="6" height="6" rx="1.5" fill="#3a3a3a" />
            <rect x="29" y="47" width="6" height="5" rx="1.5" fill="#d4af37" />
          </svg>
        </div>

        <div className="splash-word">ORIS SIGNATURES</div>
        <div className="splash-tag">Luxury Hotel &amp; Suites</div>

        <div className="splash-loader"></div>
      </div>
    </div>
  );
}