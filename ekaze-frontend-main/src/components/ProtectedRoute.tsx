import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [showMfaPrompt, setShowMfaPrompt] = useState(false);

  useEffect(() => {
    if (token && user) {
      // If user has NOT enabled MFA yet, prompt them once per login session
      const isMfaEnabled = !!user.mfa_enabled;
      if (!isMfaEnabled) {
        const sessionKey = `mfa_post_login_shown_${user.id}`;
        const hasBeenShown = sessionStorage.getItem(sessionKey);
        if (!hasBeenShown) {
          setShowMfaPrompt(true);
        }
      } else {
        setShowMfaPrompt(false);
      }
    }
  }, [token, user?.id, user?.mfa_enabled]);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if user has the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard based on role
    const roleRoutes: Record<string, string> = {
      admin: ROUTES.ADMIN_DASHBOARD,
      employer: ROUTES.EMPLOYER_DASHBOARD,
      worker: ROUTES.WORKER_DASHBOARD,
      police: ROUTES.POLICE_DASHBOARD,
      company: ROUTES.COMPANY_DASHBOARD,
      supervisor: ROUTES.SUPERVISOR_DASHBOARD,
    };

    return <Navigate to={roleRoutes[user.role] || ROUTES.HOME} replace />;
  }

  if (showMfaPrompt) {
    sessionStorage.setItem(`mfa_post_login_shown_${user?.id}`, 'true');
    sessionStorage.setItem('mfa_prompt_skipped', 'true');
    return <Navigate to="/mfa-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;