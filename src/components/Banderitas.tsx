import React from 'react';

export const Banderitas: React.FC = () => {
  const flagsRow1 = [
    { color: 'bg-red-500', alt: false },
    { color: 'bg-amber-400', alt: true },
    { color: 'bg-blue-600', alt: false },
    { color: 'bg-emerald-500', alt: true },
    { color: 'bg-rose-500', alt: false },
    { color: 'bg-yellow-400', alt: true },
    { color: 'bg-sky-500', alt: false },
    { color: 'bg-orange-500', alt: true },
    { color: 'bg-indigo-600', alt: false },
    { color: 'bg-lime-500', alt: true },
    { color: 'bg-red-600', alt: false },
    { color: 'bg-amber-300', alt: true },
    { color: 'bg-blue-500', alt: false },
    { color: 'bg-purple-500', alt: true },
    { color: 'bg-emerald-600', alt: false },
    { color: 'bg-orange-400', alt: true },
    { color: 'bg-rose-600', alt: false },
    { color: 'bg-yellow-500', alt: true },
    { color: 'bg-teal-500', alt: false },
    { color: 'bg-red-500', alt: true },
  ];

  return (
    <div className="w-full overflow-hidden pointer-events-none select-none relative z-10">
      {/* String line */}
      <div className="w-full h-1 bg-amber-700/30 border-b border-amber-900/20" />
      {/* Flags row */}
      <div className="flex justify-between w-full -mt-0.5 px-1 animate-fiesta-wave">
        {flagsRow1.map((flag, idx) => (
          <div
            key={idx}
            className={`w-6 sm:w-10 md:w-14 h-8 sm:h-12 md:h-16 ${flag.color} shadow-sm transition-transform duration-300 hover:scale-110 ${
              flag.alt ? 'banderitas-flag-alt' : 'banderitas-flag'
            }`}
            style={{
              animationDelay: `${idx * 0.1}s`,
              transformOrigin: 'top center',
            }}
          />
        ))}
      </div>
    </div>
  );
};
