import React from 'react';
import { Calendar, Clock, MapPin, Navigation, ExternalLink, Car, Bus, Info } from 'lucide-react';

interface EventLocationMapProps {
  compact?: boolean;
}

export const EventLocationMap: React.FC<EventLocationMapProps> = ({ compact = false }) => {
  const googleMapsSearchUrl = 'https://www.google.com/maps/search/?api=1&query=Met+Sports+Park+Pasay';
  const googleMapsDirectionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Met+Sports+Park+Pasay';
  const wazeUrl = 'https://waze.com/ul?q=Met%20Sports%20Park%20Pasay';

  // Embed URL for Met Sports Park, Metropolitan Park, Pasay City
  const mapEmbedUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.8546114138136!2d120.9856!3d14.5362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cb324b17f9fb%3A0xbce5c1562b66ca09!2sMet%20Sports%20Park!5e0!3m2!1sen!2sph!4v1';

  return (
    <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-[0_20px_50px_rgba(0,56,168,0.08)] overflow-hidden relative">
      {/* Accent Header Banner */}
      <div className="bg-gradient-to-r from-[#0038A8] via-[#002b80] to-[#001f5c] text-white p-6 sm:p-7 relative overflow-hidden">
        {/* Festive background accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFCD00]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-32 h-32 bg-[#CE1126]/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFCD00] text-[#0038A8] flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 font-black">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCD00] block">
                Opisyal na Lokasyon ng Palaro (Event Venue)
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Met Sports Park
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                Metropolitan Park, Diosdado Macapagal Blvd / EDSA Ext., Pasay City
              </p>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FFCD00] animate-ping" />
            <span>Venue Confirmed</span>
          </div>
        </div>
      </div>

      {/* Date & Time Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/80 border-b border-slate-100">
        {/* Date */}
        <div className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0038A8] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Petsa ng Palaro (Event Date)
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              Oct. 13, 2026
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              Martes (Tuesday) • Buong Araw
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Oras ng Kaganapan (Event Time)
            </span>
            <span className="text-base sm:text-lg font-black text-[#0038A8]">
              8:00 am - 9:00 pm
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              Assembly & Call Time: 7:30 AM
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Google Map Frame */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-inner">
          <iframe
            title="Met Sports Park Location Map"
            src={mapEmbedUrl}
            width="100%"
            height={compact ? '260' : '380'}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full block"
          />
          {/* Legal map source indicator */}
          <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-slate-500 font-semibold bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
            Google Maps
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] px-4 py-3 bg-[#0038A8] hover:bg-[#002d86] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-900/15 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Direksyon (Directions)</span>
          </a>

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Buksan sa Google Maps</span>
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Waze</span>
          </a>
        </div>

        {/* Helpful Travel & Parking Reminders */}
        {!compact && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <Car className="w-4 h-4 text-[#0038A8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">Parking & Drop-off</strong>
                May parking space sa loob ng Met Sports Park at katabing commercial lots sa Metropolitan Park.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <Bus className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">Commuter Access</strong>
                Accessible via EDSA Carousel Bus (Roxas Blvd/Macapagal) o jeepneys/taxis mula sa Pasay Rotonda / MOA.
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>Pakisigurong makarating bago mag-8:00 AM para sa parade of colors at briefing ng inyong koponan.</span>
        </div>
      </div>
    </div>
  );
};
