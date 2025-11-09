import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Map } from './components/Map';
import { AlertCenter } from './components/AlertCenter';
import { BiometricCharts } from './components/BiometricCharts';
import { Timeline } from './components/Timeline';
import { ProfileEditor } from './components/ProfileEditor';
import { ComingSoon } from './components/ComingSoon';
import { Toaster } from './components/Toaster';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <Auth onAuthSuccess={() => window.location.href = '/dashboard'} />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <Layout>
          <Dashboard />
        </Layout>
      </AuthGuard>
    ),
  },
  {
    path: '/loved-one/:id/map',
    element: (
      <AuthGuard>
        <Map />
      </AuthGuard>
    ),
  },
  {
    path: '/alerts',
    element: (
      <AuthGuard>
        <Layout>
          <AlertCenter />
        </Layout>
      </AuthGuard>
    ),
  },
  {
    path: '/settings',
    element: (
      <AuthGuard>
        <Layout>
          <ComingSoon title="Definições" description="Configure notificações, preferências e gerencie contactos de emergência." />
        </Layout>
      </AuthGuard>
    ),
  },
  {
    path: '/loved-one/:id/metrics',
    element: (
      <AuthGuard>
        <Layout>
          <BiometricCharts />
        </Layout>
      </AuthGuard>
    ),
  },
  {
    path: '/loved-one/:id/timeline',
    element: (
      <AuthGuard>
        <Layout>
          <Timeline />
        </Layout>
      </AuthGuard>
    ),
  },
  {
    path: '/loved-one/:id/profile',
    element: (
      <AuthGuard>
        <Layout>
          <ProfileEditor />
        </Layout>
      </AuthGuard>
    ),
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
