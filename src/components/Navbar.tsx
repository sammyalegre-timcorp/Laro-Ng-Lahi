import React from 'react';
import { Users } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  attendeeCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, attendeeCount = 0 }) => {
  const isAdmin = currentPath === '/admin';

  return (
    <header className="sticky top-3 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl shadow-[0_10px_30px_rgba(0,56,168,0.06)] overflow-hidden">
      {/* Top Tri-Color Edge */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#0038A8]"></div>
        <div className="w-16 bg-[#FFCD00]"></div>
        <div className="flex-1 bg-[#CE1126]"></div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            {/* Official Logo */}
            <div className="w-13 h-13 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden bg-white shadow-sm border border-slate-100 p-0.5 shrink-0">
              <img
                src="https://marketing.timcorp.net.ph/hubfs/Employee%20Appreciation%202026/laro%20ng%20lahi%20logo.png"
                alt="Laro ng Lahi Official Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#0038A8] tracking-tight">
                  LARO NG <span className="text-[#CE1126]">LAHI</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#FFCD00]/20 text-[#0038A8] text-[10px] font-black uppercase tracking-wider">
                  2026 Sportsfest
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                {isAdmin ? 'Admin Management & Operations Portal' : 'Corporate Inter-Departmental Sports • Palarong Pinoy'}
              </p>
            </div>
          </div>

          {/* Right Side Header Controls */}
          <div className="flex items-center gap-3">
            {/* Live attendee count indicator - only on admin view */}
            {isAdmin && attendeeCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
                <Users className="w-3.5 h-3.5 text-[#0038A8]" />
                <span>{attendeeCount} Registered</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
