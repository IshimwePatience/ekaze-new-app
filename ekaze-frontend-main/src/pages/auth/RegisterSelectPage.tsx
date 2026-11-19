import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ArrowRight } from 'lucide-react';

const GeometricMotif = ({ color }: { color: 'red' | 'blue' | 'green' }) => {
  const colorStyles = {
    red: 'text-red-500',
    blue: 'text-[#1677ff]',
    green: 'text-emerald-500',
  };

  return (
    <div className={`w-9 h-9 ${colorStyles[color]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
        <g transform="translate(50,50)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path
                d="M -9,-24 C -16,-24 -17,-38 0,-40 C 17,-38 16,-24 9,-24 Z"
              />
              <circle cx="0" cy="-14" r="3" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

const options = [
  {
    key: 'worker',
    color: 'red' as const,
    label: 'for Workers',
    hoverBorder: 'hover:border-red-500 hover:ring-2 hover:ring-red-500/10',
    hoverText: 'group-hover:text-red-500',
  },
  {
    key: 'employer',
    color: 'blue' as const,
    label: 'for Employers',
    hoverBorder: 'hover:border-[#1677ff] hover:ring-2 hover:ring-[#1677ff]/10',
    hoverText: 'group-hover:text-[#1677ff]',
  },
  {
    key: 'company',
    color: 'green' as const,
    label: 'for Companies',
    hoverBorder: 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/10',
    hoverText: 'group-hover:text-emerald-500',
  },
];

export const RegisterSelectPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    navigate("/?join=true", { replace: true, state: { openRegister: true } });
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col items-center justify-center max-w-[760px] mx-auto w-full py-8 px-4">
        <div className="text-center mb-8 space-y-1.5">
          <h1 className="text-2xl sm:text-[30px] font-normal text-slate-900 tracking-tight leading-tight max-w-sm mx-auto">
            Create new account
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            {t("registration.modal.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {options.map(({ key, color, label, hoverBorder, hoverText }) => (
            <button
              key={key}
              onClick={() => navigate(`/auth/register/${key}`)}
              className={`group flex flex-col items-start justify-between p-6 min-h-[128px] bg-white rounded-2xl border border-slate-200/90 shadow-2xs ${hoverBorder} hover:shadow-md transition-all duration-200 text-left cursor-pointer`}
            >
              {/* Colored Geometric Motif Icon Top Left */}
              <div className="mb-4">
                <GeometricMotif color={color} />
              </div>

              {/* Title + Right Arrow */}
              <div className={`w-full flex items-center justify-between text-slate-900 font-bold text-base ${hoverText} transition-colors`}>
                <span>{label}</span>
                <ArrowRight className={`w-4 h-4 text-slate-400 ${hoverText} group-hover:translate-x-1 transition-all`} />
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 text-center text-xs sm:text-sm font-medium text-slate-700 mt-8">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-[#2478b8] font-bold hover:underline transition-all ml-1"
          >
            Login
          </a>
        </div>
      </div>
    </AuthLayout>
  );
};
