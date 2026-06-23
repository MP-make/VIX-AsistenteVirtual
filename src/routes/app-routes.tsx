import { AuthLayout } from '@/layouts/auth-layout';
import { AppLayout } from '@/layouts/app-layout';
import { ProtectedRoute } from '@/routes/protected-route';

export function AppRoutes() {
  const path = window.location.pathname;

  if (path === '/login') {
    return <AuthLayout />;
  }

  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}
