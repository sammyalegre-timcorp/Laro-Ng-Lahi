import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Navigation, ExternalLink, Car, Bus, Info, Layers, Check, Crosshair } from 'lucide-react';

interface EventLocationMapProps {
  compact?: boolean;
}

export const EventLocationMap: React.FC<EventLocationMapProps> = ({ compact = false }) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [showCenterPin, setShowCenterPin] = useState(true);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Exact coordinates for Met Sports Park Center (MET Park Sports Center, Pasay)
  const coordinates = '14.532391, 120.985929';
  const coordsDisplay = '14.5324° N, 120.9859° E';

  // Direct pinned links with place identity
  const googleMapsPlaceUrl =
    'https://www.google.com/maps/place/Met+Park+Sports+Center/@14.532391,120.985929,17z/data=!3m1!4b1!4m6!3m5!1s0x3397cbf6d43d1797:0x22806ceb528b931!8m2!3d14.532391!4d120.985929!16s%2Fg%2F11b6_c8x0k';
  const googleMapsDirectionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=14.532391,120.985929&destination_place_name=Met+Sports+Park+Center';
  const wazeUrl = 'https://waze.com/ul?ll=14.532391,120.985929&navigate=yes';

  // Google Maps Embed directly centered and pinned on Met Sports Park Center (Place ID: 0x3397cbf6d43d1797:0x22806ceb528b931)
  const mapEmbedRoadmap =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1930.96!2d120.985929!3d14.532391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cbf6d43d1797%3A0x22806ceb528b931!2sMet%20Sports%20Park%20Center!5e0!3m2!1sen!2sph!4v1741000000000!5m2!1sen!2sph';

  const mapEmbedSatellite =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1930.96!2d120.985929!3d14.532391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cbf6d43d1797%3A0x22806ceb528b931!2sMet%20Sports%20Park%20Center!5e1!3m2!1sen!2sph!4v1741000000000!5m2!1sen!2sph';

  const currentEmbedUrl = mapType === 'roadmap' ? mapEmbedRoadmap : mapEmbedSatellite;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(coordinates);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

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
                Met Sports Park Center
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                Metrobank Avenue, Met Park, Diosdado Macapagal Blvd / EDSA Ext., Pasay City
              </p>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FFCD00] animate-ping" />
            <span>Pinned Location Confirmed</span>
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
              Oktubre 13, 2026
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
              8:00 am - 5:00 pm
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              Assembly & Call Time: 7:30 AM
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Google Map Frame */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Top Controls: Pin Indicator & Layer Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          {/* Active Pin Label */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 rounded-full bg-red-500/20 animate-ping" />
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  Naka-pin sa Mapa: Met Sports Park Center
                </span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black uppercase">
                  Pinned Venue
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>{coordsDisplay}</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="text-[#0038A8] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedCoords ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Kopyado!</span>
                    </>
                  ) : (
                    <span>Kopyahin ang Coordinates</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Controls: Center Pin Toggle & Layer Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Center Pin Indicator Toggle */}
            <button
              type="button"
              onClick={() => setShowCenterPin(!showCenterPin)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                showCenterPin
                  ? 'bg-red-50 text-red-700 border-red-200 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="I-toggle ang Center Pin Marker"
            >
              <Crosshair className="w-3.5 h-3.5 text-red-600" />
              <span>Pin Marker: {showCenterPin ? 'Aktibo' : 'Nakatago'}</span>
            </button>

            {/* Map Layer Switcher */}
            <div className="inline-flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapType === 'roadmap'
                    ? 'bg-[#0038A8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Roadmap
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-[#0038A8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Satellite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-inner">
          <iframe
            title="Met Sports Park Center Pinned Location Map"
            src={currentEmbedUrl}
            width="100%"
            height={compact ? '280' : '420'}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full block"
          />

          {/* Dynamic Visual Center Pin Overlay */}
          {showCenterPin && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center select-none filter drop-shadow-md">
              {/* Animated Venue Badge */}
              <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-xl text-xs font-black tracking-tight border border-amber-400/60 flex items-center gap-1.5 whitespace-nowrap shadow-xl mb-1 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-[#FFCD00] animate-ping" />
                <span className="text-[#FFCD00]">PIN:</span>
                <span>Met Sports Park Center</span>
              </div>
              
              {/* Pin Icon and pointer */}
              <div className="relative flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#CE1126] to-red-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-red-600/40">
                  <MapPin className="w-5 h-5 fill-white text-white" />
                </div>
                <div className="w-1.5 h-2 bg-[#CE1126] -mt-0.5 rounded-b-sm" />
                <div className="w-4 h-1.5 bg-black/40 rounded-full blur-[1.5px] mt-0.5 animate-pulse" />
              </div>
            </div>
          )}

          {/* Floating Venue Card on top of map */}
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-3 max-w-[85%] sm:max-w-xs pointer-events-auto">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-5 h-5 fill-white" />
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-slate-900 truncate">
                Met Sports Park Center
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Metrobank Ave., Met Park, Pasay
              </div>
            </div>
          </div>

          {/* Legal map source indicator */}
          <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-slate-500 font-semibold bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded z-10">
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
            href={googleMapsPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Buksan ang Pin sa Google Maps</span>
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Waze Pin</span>
          </a>
        </div>

        {/* Helpful Travel & Parking Reminders */}
        {!compact && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <Car className="w-4 h-4 text-[#0038A8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">Parking & Drop-off</strong>
                May parking space sa loob ng Met Sports Park Center at katabing commercial lots sa Metropolitan Park.
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
