import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { ThemeProvider } from './components/ThemeProvider';
import { FallingPattern } from './components/ui/falling-pattern';

// Pages
import { Overview } from './pages/Overview';
import { EventsPage } from './pages/EventsPage';
import { TeamPage } from './pages/TeamPage';
import { BlogsPage } from './pages/BlogsPage';
import { ProjectsPage } from './pages/ProjectsPage';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <FallingPattern color="#3b82f6" />
      </div>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Overview />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/blogs" element={<BlogsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
