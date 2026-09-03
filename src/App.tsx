import React, { useState, useEffect } from 'react';
import { Banderitas } from './components/Banderitas';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { Registration, Team, DEFAULT_TEAMS } from './types';
import { subscribeToRegistrations } from './firebase/registrations';
import { subscribeToTeams } from './firebase/teams';

function checkIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  return (
    pathname === '/admin' ||
    pathname.endsWith('/admin') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    searchParams.get('page')?.toLowerCase() === 'admin' ||
    searchParams.get('tab')?.toLowerCase() === 'admin' ||
    searchParams.has('admin')
  );
}

export default function App() {
  // Routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return checkIsAdminRoute() ? '/admin' : '/';
  });

  // Registrations state from Firebase Firestore
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
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
      } else {
        window.history.pushState({}, '', '/');
      }
    } catch (e) {
      // Fallback for strict iframe environments
      if (path === '/admin') {
        window.location.hash = 'admin';
      } else {
        window.location.hash = '';
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(checkIsAdminRoute() ? '/admin' : '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Real-time Firestore Subscription for Registrations
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

    return () => {
      unsubscribeRegistrations();
      unsubscribeTeams();
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
        <div className="mb-3">
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
            />
          ) : (
            /* Registration Portal Page at / */
            submittedRegistration ? (
              <RegistrationSuccess
                registration={submittedRegistration}
                onRegisterAnother={handleRegisterAnother}
              />
            ) : (
              <RegistrationForm
                onSuccess={handleRegistrationSuccess}
                attendeeCount={registrations.length}
                registrations={registrations}
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
