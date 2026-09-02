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
            <Heart className="w-3.5 h-3.5 text-[#CE1126] fill-[#CE1126]" />
            <span>para sa Palarong Pinoy</span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-xs text-[#0038A8] hover:underline font-bold"
            >
              ← Bumalik sa Registration
            </button>
          )}
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
