import React, { useState, useEffect } from 'react';
import { Banderitas } from './components/Banderitas';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { Registration } from './types';
import { subscribeToRegistrations } from './firebase/registrations';

export default function App() {
  // Helper to check if URL or storage requests the admin view
  const checkIfAdminRoute = (): boolean => {
    try {
      const pathname = window.location.pathname;
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);

      // Direct URL matching: /admin, /admin.html, etc.
      if (pathname.includes('/admin')) return true;

      // Hash route matching: #admin, #/admin, #portal, etc.
      if (hash.includes('admin') || hash.includes('portal')) return true;

      // Query parameters: ?admin, ?page=admin, ?tab=admin, ?view=admin, ?p=admin, ?mode=admin
      if (
        search.includes('admin') ||
        searchParams.get('page') === 'admin' ||
        searchParams.get('tab') === 'admin' ||
        searchParams.get('view') === 'admin' ||
        searchParams.get('portal') === 'admin' ||
        searchParams.get('mode') === 'admin' ||
        searchParams.get('p') === 'admin'
      ) {
        return true;
      }

      // LocalStorage session memory (allows users to reload or reopen admin directly)
      const storedView = localStorage.getItem('palaro_view_preference');
      if (storedView === 'admin' && !search.includes('view=register') && !hash.includes('register')) {
        return true;
      }
    } catch (e) {
      // safe fallback
    }
    return false;
  };

  // Routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return checkIfAdminRoute() ? '/admin' : '/';
  });

  // Registrations state from Firebase Firestore
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Success view state for latest registrant
  const [submittedRegistration, setSubmittedRegistration] = useState<Registration | null>(null);

  // Synchronize browser history and path changes
  const navigate = (path: string) => {
    setCurrentPath(path);
    try {
      if (path === '/admin') {
        localStorage.setItem('palaro_view_preference', 'admin');
        window.history.pushState({}, '', '/admin');
      } else {
        localStorage.setItem('palaro_view_preference', 'register');
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
      if (checkIfAdminRoute()) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Global keyboard shortcut to access Admin Portal directly: (Alt + A or Ctrl + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        navigate(currentPath === '/admin' ? '/' : '/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPath]);

  // Real-time Firestore Subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToRegistrations(
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

    return () => unsubscribe();
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
