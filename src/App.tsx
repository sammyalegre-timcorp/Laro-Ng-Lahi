import React, { useState, useEffect } from 'react';
import { Banderitas } from './components/Banderitas';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { AdminPortal } from './components/AdminPortal';
import { TShirtPortal } from './components/TShirtPortal';
import { Footer } from './components/Footer';
import { Registration, Team, DEFAULT_TEAMS, EventConfig, DEFAULT_EVENT_CONFIG } from './types';
import { subscribeToRegistrations } from './firebase/registrations';
import { subscribeToTeams } from './firebase/teams';
import { subscribeToEventConfig } from './firebase/eventConfig';

function getInitialRoute(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  if (
    pathname === '/admin' ||
    pathname.endsWith('/admin') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    searchParams.get('page')?.toLowerCase() === 'admin' ||
    searchParams.get('tab')?.toLowerCase() === 'admin' ||
    searchParams.has('admin')
  ) {
    return '/admin';
  }

  if (
    pathname === '/tshirt' ||
    pathname === '/tshirts' ||
    pathname === '/tshirt-sizes' ||
    pathname.endsWith('/tshirt') ||
    pathname.endsWith('/tshirt-sizes') ||
    hash === '#tshirt' ||
    hash === '#/tshirt' ||
    hash === '#tshirts' ||
    hash === '#tshirt-sizes' ||
    searchParams.get('page')?.toLowerCase() === 'tshirt' ||
    searchParams.get('tab')?.toLowerCase() === 'tshirt' ||
    searchParams.has('tshirt')
  ) {
    return '/tshirt';
  }

  return '/';
}

export default function App() {
  // Routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getInitialRoute();
  });

  // Registrations state from Firebase Firestore
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [eventConfig, setEventConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Success view state for latest registrant
  const [submittedRegistration, setSubmittedRegistration] = useState<Registration | null>(null);

  // Synchronize browser history and path changes
  const navigate = (path: string) => {
    setCurrentPath(path);
    try {
      if (path === '/admin') {
        window.history.pushState({}, '', '/admin');
      } else if (path === '/tshirt') {
        window.history.pushState({}, '', '/tshirt');
      } else {
        window.history.pushState({}, '', '/');
      }
    } catch (e) {
      // Fallback for strict iframe environments
      if (path === '/admin') {
        window.location.hash = 'admin';
      } else if (path === '/tshirt') {
        window.location.hash = 'tshirt';
      } else {
        window.location.hash = '';
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getInitialRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Real-time Firestore Subscription for Registrations, Teams & Event Configuration
  useEffect(() => {
    setLoading(true);
    const unsubscribeRegistrations = subscribeToRegistrations(
      (data) => {
        setRegistrations(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Real-time database connection error:', err);
        setError('Nagkaroon ng problema sa koneksyon sa database. Sinusubukang muling kumonekta...');
        setLoading(false);
      }
    );

    const unsubscribeTeams = subscribeToTeams(
      (data) => {
        if (data && data.length > 0) {
          setTeams(data);
        }
      },
      (err) => {
        console.error('Teams subscription error:', err);
      }
    );

    const unsubscribeConfig = subscribeToEventConfig(
      (cfg) => {
        setEventConfig(cfg);
      },
      (err) => {
        console.error('Event config subscription error:', err);
      }
    );

    return () => {
      unsubscribeRegistrations();
      unsubscribeTeams();
      unsubscribeConfig();
    };
  }, []);

  const handleRegistrationSuccess = (newReg: Registration) => {
    setSubmittedRegistration(newReg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterAnother = () => {
    setSubmittedRegistration(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-slate-900 selection:bg-[#FFCD00] selection:text-[#0038A8] font-sans p-3 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between">
      {/* Outer Centered Container with spacious margins on all four sides */}
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1">
        {/* Festive Banderitas Top Streamer */}
        <div className="mb-3 print:hidden">
          <Banderitas />
        </div>

        {/* Main Navbar */}
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          attendeeCount={registrations.length}
        />

        {/* Main Body Content with generous top and bottom spacing */}
        <main className="flex-1 my-6 sm:my-8 md:my-10">
          {currentPath === '/admin' ? (
            /* Separate Admin Page at /admin */
            <AdminPortal
              registrations={registrations}
              teams={teams}
              loading={loading}
              error={error}
              eventConfig={eventConfig}
            />
          ) : currentPath === '/tshirt' ? (
            /* Dedicated T-Shirt & Polo Sizes Page at /tshirt */
            <TShirtPortal
              registrations={registrations}
              teams={teams}
              onNavigate={navigate}
            />
          ) : (
            /* Registration Portal Page at / */
            submittedRegistration ? (
              <RegistrationSuccess
                registration={submittedRegistration}
                onRegisterAnother={handleRegisterAnother}
                onNavigate={navigate}
              />
            ) : (
              <RegistrationForm
                onSuccess={handleRegistrationSuccess}
                attendeeCount={registrations.length}
                registrations={registrations}
                onNavigate={navigate}
                eventConfig={eventConfig}
              />
            )
          )}
        </main>

        {/* Footer with matched margins and subtle admin navigation */}
        <Footer currentPath={currentPath} onNavigate={navigate} />
      </div>
    </div>
  );
}
