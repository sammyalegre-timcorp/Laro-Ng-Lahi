import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentPath, onNavigate }) => {
  const isAdmin = currentPath === '/admin';

  return (
    <footer className="mt-12 bg-white border border-slate-200/90 rounded-3xl shadow-[0_10px_30px_rgba(0,56,168,0.04)] text-slate-600 text-xs overflow-hidden print:hidden">
      {/* Upper Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left branding */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="text-xl">🇵🇭</span>
          <div>
            <p className="font-black text-slate-900 tracking-tight">
              LARO NG LAHI 2026 • PALARONG PINOY CORPORATE SPORTSFEST
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Buhayin ang Diwang Bayanihan, Palakasin ang Samahan ng Bawat Kawani
            </p>
          </div>
        </div>

        {/* Right footer status */}
        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium select-none">
            <span>Gawa nang may</span>
            <button
              type="button"
              onClick={() => onNavigate(isAdmin ? '/' : '/admin')}
              aria-label={isAdmin ? 'Pumunta sa Registration' : 'Admin Portal'}
              title={isAdmin ? 'Bumalik sa Registration' : 'Admin Portal'}
              className="inline-flex items-center justify-center p-0.5 rounded-full hover:scale-125 active:scale-90 transition-transform cursor-pointer focus:outline-none"
            >
              <Heart className="w-3.5 h-3.5 text-[#CE1126] fill-[#CE1126]" />
            </button>
            <span>para sa Palarong Pinoy</span>
          </div>
        </div>
      </div>

      {/* Decorative Signature Bottom Tri-Color Bar from Artistic Flair Theme */}
      <div className="h-2 w-full flex">
        <div className="flex-1 bg-[#0038A8]"></div>
        <div className="w-24 bg-[#FFCD00]"></div>
        <div className="flex-1 bg-[#CE1126]"></div>
      </div>
    </footer>
  );
};
