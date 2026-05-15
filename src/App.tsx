import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { LandingPage } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Processing } from './pages/Processing';
import { Reader } from './pages/Reader';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { cn } from './lib/utils';

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const showSidebar = location.pathname.startsWith('/dashboard') || 
                      location.pathname === '/processing';
  
  // Reader view is full screen except for Navbar
  const isReader = location.pathname === '/reader';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="atmosphere" />
      <Navbar />
      <div className="flex-1 flex w-full">
        {showSidebar && <Sidebar />}
        <main className={cn(
          "flex-1",
          showSidebar && "md:ml-64 p-8",
          !showSidebar && !isReader && "w-full",
          isReader && "w-full overflow-hidden"
        )}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/reader" element={<Reader />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
      <Analytics />
    </Router>
  );
}
