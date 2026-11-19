import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ConfigProvider } from 'antd';
import { useEffect } from "react";
import "./App.css";
import 'antd/dist/reset.css';

// Page Imports from Subfolders
import Index from "@/pages/common/Index";
import NotFound from "@/pages/common/NotFound";
import WorkerCardsPrintPage from "@/pages/common/WorkerCardsPrintPage";
import WorkerVerificationPage from "@/pages/common/WorkerVerificationPage";
import AppDownloadPage from "@/pages/common/AppDownloadPage";

import EmployerDashboard from "@/pages/dashboards/EmployerDashboard";
import WorkerDashboard from "@/pages/dashboards/WorkerDashboard";
import CompanyDashboard from "@/pages/dashboards/CompanyDashboard";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import PoliceDashboard from "@/pages/dashboards/PoliceDashboard";
import SupervisorDashboard from "@/pages/dashboards/SupervisorDashboard";

import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import { RegisterSelectPage } from "@/pages/auth/RegisterSelectPage";
import { RegisterFormPage } from "@/pages/auth/RegisterFormPage";
import { OtpVerificationPage } from "@/pages/auth/OtpVerificationPage";
import { PaymentPage } from "@/pages/auth/PaymentPage";
import MfaSetupPage from "@/pages/auth/MfaSetupPage";

// Component Imports
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployerSearch from "@/components/employer/employerFilter/pages/EmployerSearch";
import WorkerSearch from "@/components/employer/WorkerSearch";

import TermsOfService from "@/pages/legal/TermsOfService";
import GeneralTerms from "@/pages/legal/GeneralTerms";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import WhoWeAre from "@/pages/common/WhoWeAre";
import HowItWorksPage from "@/components/landing/HowItWorksPage";
import { CookieConsent } from "@/components/common/CookieConsent";
import HelpCenterPage from "@/pages/help/HelpCenterPage";
import UserActivityLogsPage from "@/pages/logs/UserActivityLogsPage";

const queryCache = new QueryCache({
  onError: () => {
    // If request query failed and offline, reload
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      window.location.reload();
    }
  },
});

const queryClient = new QueryClient({
  queryCache,
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const NavigationNetworkSync = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 2. When navigating and no internet, trigger window.location.reload()
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      window.location.reload();
    }
  }, [location.pathname, location.search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          borderRadius: 6,
          borderRadiusLG: 8,
          borderRadiusSM: 4,
          colorPrimary: '#1677ff',
        },
      }}
    >
      <TooltipProvider>
        <Toaster />
        <CookieConsent />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <NavigationNetworkSync />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/employer"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/employer"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer-search"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerSearch statusSearch={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/worker"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/police"
              element={
                <ProtectedRoute allowedRoles={['police']}>
                  <PoliceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/police"
              element={
                <ProtectedRoute allowedRoles={['police']}>
                  <PoliceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/company"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/supervisor"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/search-worker" element={<WorkerSearch />} />
            <Route path="/employer/search" element={<WorkerSearch />} />
            <Route path="/auth/register" element={<RegisterSelectPage />} />
            <Route path="/auth/register/:type" element={<RegisterFormPage />} />
            <Route path="/auth/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/auth/payment" element={<PaymentPage />} />
            <Route path="/mfa-setup" element={<MfaSetupPage />} />
            <Route path="/auth/mfa-setup" element={<MfaSetupPage />} />
            <Route path="/company/workers/print-cards" element={<WorkerCardsPrintPage />} />
            <Route path="/verify-worker/:id" element={<WorkerVerificationPage />} />
            <Route path="/verify/:id" element={<WorkerVerificationPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/who-we-are" element={<WhoWeAre />} />
            <Route path="/download" element={<AppDownloadPage />} />
            <Route path="/get-app" element={<AppDownloadPage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/terms-and-conditions" element={<GeneralTerms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy-and-terms" element={<HelpCenterPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/user-logs" element={<UserActivityLogsPage />} />
            <Route path="/privacy-logs" element={<UserActivityLogsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;