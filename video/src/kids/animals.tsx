import React from 'react';

// Bichinhos flat-design fofos, viewBox 0 0 100 100
export const Animals: Record<string, React.FC> = {
  duck: () => (
    <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
      <ellipse cx="52" cy="66" rx="30" ry="22" fill="#ffd93b" />
      <ellipse cx="66" cy="70" rx="14" ry="9" fill="#f7c62a" />
      <circle cx="34" cy="42" r="16" fill="#ffd93b" />
      <path d="M18 44 L4 48 L18 52 Z" fill="#ff8c42" />
      <circle cx="30" cy="38" r="3.2" fill="#333" />
      <circle cx="31" cy="37" r="1" fill="#fff" />
      <path d="M42 88 L38 96 M56 88 L52 96" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 60 C60 56 66 62 60 68" fill="none" stroke="#f0b429" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  cat: () => (
    <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
      <path d="M30 26 L24 8 L40 18 Z" fill="#9aa5b1" />
      <path d="M70 26 L76 8 L60 18 Z" fill="#9aa5b1" />
      <path d="M31 22 L28 13 L36 18 Z" fill="#ffb3d9" />
      <path d="M69 22 L72 13 L64 18 Z" fill="#ffb3d9" />
      <circle cx="50" cy="38" r="24" fill="#b8c2cc" />
      <ellipse cx="50" cy="76" rx="24" ry="18" fill="#b8c2cc" />
      <circle cx="41" cy="34" r="3.5" fill="#333" />
      <circle cx="59" cy="34" r="3.5" fill="#333" />
      <circle cx="42" cy="33" r="1.2" fill="#fff" />
      <circle cx="60" cy="33" r="1.2" fill="#fff" />
      <path d="M47 42 L50 46 L53 42 Z" fill="#ff8fab" />
      <path d="M50 46 C46 52 42 50 40 48 M50 46 C54 52 58 50 60 48" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 38 L10 34 M24 44 L10 44 M76 38 L90 34 M76 44 L90 44" stroke="#666" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M72 80 C86 84 88 70 80 66" fill="none" stroke="#9aa5b1" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  dog: () => (
    <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
      <ellipse cx="26" cy="36" rx="9" ry="17" fill="#8a5a3b" />
      <ellipse cx="74" cy="36" rx="9" ry="17" fill="#8a5a3b" />
      <circle cx="50" cy="40" r="24" fill="#c98a5b" />
      <ellipse cx="50" cy="78" rx="23" ry="16" fill="#c98a5b" />
      <ellipse cx="50" cy="48" rx="11" ry="8" fill="#f2d3ab" />
      <circle cx="41" cy="34" r="3.6" fill="#333" />
      <circle cx="59" cy="34" r="3.6" fill="#333" />
      <circle cx="42" cy="33" r="1.2" fill="#fff" />
      <circle cx="60" cy="33" r="1.2" fill="#fff" />
      <ellipse cx="50" cy="44" rx="4.5" ry="3.5" fill="#333" />
      <path d="M50 48 L50 52" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 52 C48 56 52 56 54 52" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 54 C50 62 56 62 58 58" fill="none" stroke="#ff8fab" strokeWidth="5" strokeLinecap="round" />
      <path d="M70 84 C82 88 86 76 78 72" fill="none" stroke="#8a5a3b" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  frog: () => (
    <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
      <circle cx="34" cy="24" r="12" fill="#7ed957" />
      <circle cx="66" cy="24" r="12" fill="#7ed957" />
      <circle cx="34" cy="22" r="7" fill="#fff" />
      <circle cx="66" cy="22" r="7" fill="#fff" />
      <circle cx="35" cy="23" r="3.4" fill="#333" />
      <circle cx="65" cy="23" r="3.4" fill="#333" />
      <ellipse cx="50" cy="58" rx="34" ry="28" fill="#7ed957" />
      <ellipse cx="50" cy="68" rx="22" ry="14" fill="#c9f2a7" />
      <path d="M30 52 C40 62 60 62 70 52" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="44" r="2" fill="#2e7d32" />
      <circle cx="58" cy="44" r="2" fill="#2e7d32" />
      <path d="M20 82 C12 88 16 94 24 92 M80 82 C88 88 84 94 76 92" fill="none" stroke="#5bc236" strokeWidth="7" strokeLinecap="round" />
    </svg>
  ),
  chick: () => (
    <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
      <circle cx="50" cy="54" r="30" fill="#ffe066" />
      <circle cx="50" cy="34" r="18" fill="#ffe066" />
      <path d="M46 12 C48 6 54 8 52 14 M52 12 C56 8 60 12 55 16" fill="none" stroke="#f7c62a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="43" cy="32" r="3" fill="#333" />
      <circle cx="57" cy="32" r="3" fill="#333" />
      <circle cx="44" cy="31" r="1" fill="#fff" />
      <circle cx="58" cy="31" r="1" fill="#fff" />
      <path d="M46 38 L50 42 L54 38 Z" fill="#ff8c42" />
      <ellipse cx="30" cy="56" rx="9" ry="14" fill="#ffd93b" transform="rotate(20 30 56)" />
      <ellipse cx="70" cy="56" rx="9" ry="14" fill="#ffd93b" transform="rotate(-20 70 56)" />
      <path d="M42 84 L42 94 M38 94 L46 94 M58 84 L58 94 M54 94 L62 94" stroke="#ff8c42" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  ),
};
