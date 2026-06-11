import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuthStore } from './stores/authStore';

// Lazy load screens for code splitting
const SplashScreen = lazy(() => import('./components/screens/SplashScreen'));
const LoginScreen = lazy(() => import('./components/screens/LoginScreen'));
const PatientDashboard = lazy(() => import('./components/screens/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./components/screens/DoctorDashboard'));
const ReceptionistDashboard = lazy(() => import('./components/screens/ReceptionistDashboard'));
const QueueStatusScreen = lazy(() => import('./components/screens/QueueStatusScreen'));
const AppointmentBookingScreen = lazy(() => import('./components/screens/AppointmentBookingScreen'));
const ProfileScreen = lazy(() => import('./components/screens/ProfileScreen'));
const NotificationsScreen = lazy(() => import('./components/screens/NotificationsScreen'));
const AnalyticsScreen = lazy(() => import('./components/screens/AnalyticsScreen'));
const QueueDetailsScreen = lazy(() => import('./components/screens/QueueDetailsScreen'));
const SettingsScreen = lazy(() => import('./components/screens/SettingsScreen'));
const EmergencyPriorityScreen = lazy(() => import('./components/screens/EmergencyPriorityScreen'));
const ChatbotScreen = lazy(() => import('./components/screens/ChatbotScreen'));

// TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    const dashboardPath = user.role === 'doctor' ? '/doctor' : user.role === 'receptionist' ? '/receptionist' : '/patient';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

// Public Route Wrapper (redirect if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role) {
    const dashboardPath = user.role === 'doctor' ? '/doctor' : user.role === 'receptionist' ? '/receptionist' : '/patient';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

// Dashboard redirect based on role
const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'doctor': return <Navigate to="/doctor" replace />;
    case 'receptionist': return <Navigate to="/receptionist" replace />;
    default: return <Navigate to="/patient" replace />;
  }
};

// Page transition wrapper
const PageSuspense = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-navy">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

// Animated routes
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <PageSuspense>
                <SplashScreen />
              </PageSuspense>
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <PageSuspense>
                <LoginScreen />
              </PageSuspense>
            </PublicRoute>
          }
        />

        {/* Dashboard redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <AppLayout>
                <PageSuspense>
                  <PatientDashboard />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <AppLayout>
                <PageSuspense>
                  <DoctorDashboard />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Receptionist Routes */}
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <AppLayout>
                <PageSuspense>
                  <ReceptionistDashboard />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Shared Routes (accessible by authenticated users) */}
        <Route
          path="/queue"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageSuspense>
                  <QueueStatusScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/queue/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageSuspense>
                  <QueueDetailsScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <AppLayout>
                <PageSuspense>
                  <AppointmentBookingScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageSuspense>
                  <ChatbotScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageSuspense>
                  <ProfileScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageSuspense>
                  <NotificationsScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
              <AppLayout>
                <PageSuspense>
                  <AnalyticsScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageSuspense>
                  <SettingsScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
              <AppLayout>
                <PageSuspense>
                  <EmergencyPriorityScreen />
                </PageSuspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gradient-navy">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-teal-400/30 mb-4">404</h1>
                <p className="text-gray-400 mb-6">Page not found</p>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-400 hover:bg-teal-500/30 transition-colors"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AnimatedRoutes />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
