import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Integrations from "@/components/landing/Integrations";
import Footer from "@/components/landing/Footer";
import { GoogleOneTap } from "@/components/landing/GoogleOneTap";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlWorkerId =
        searchParams.get("workerId") ||
        searchParams.get("autoOpenWorkerId") ||
        sessionStorage.getItem("auto_open_worker_id");

      const roleRoutes: Record<string, string> = {
        admin: '/admin',
        employer: '/employer',
        worker: '/worker',
        police: '/police',
        company: '/company',
        supervisor: '/supervisor',
      };

      if (urlWorkerId && user.role === 'employer') {
        sessionStorage.setItem("auto_open_worker_id", urlWorkerId);
        navigate(`/employer?workerId=${encodeURIComponent(urlWorkerId)}`, { replace: true });
      } else {
        navigate(roleRoutes[user.role] || '/employer', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <GoogleOneTap />
      <Header />
      <main>
        <Hero />
        <Features />
        <Integrations />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
