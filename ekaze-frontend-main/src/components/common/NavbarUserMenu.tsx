import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserCircle,
  Lock,
  HelpCircle,
  Languages,
  ChevronRight,
  Power,
} from "lucide-react";
import { useAuth, useLogout, useCurrentUser } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FeedbackModal } from "@/components/common/FeedbackModal";

const languages = [
  { code: "kin" as const, label: "Kinyarwanda", short: "KIN" },
  { code: "eng" as const, label: "English", short: "EN" },
];

interface NavbarUserMenuProps {
  className?: string;
  avatarSizeClass?: string;
  onNavigateAction?: () => void;
}

export const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({
  className = "",
  avatarSizeClass = "w-10 h-10",
  onNavigateAction,
}) => {
  const { language, setLanguage } = useLanguage();
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const queryClient = useQueryClient();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser;
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();

  const [avatarError, setAvatarError] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const rawPhoto = user?.profile_photo || user?.avatar || user?.avatar_url || user?.picture;
  const userPhoto =
    !avatarError &&
    typeof rawPhoto === "string" &&
    rawPhoto.trim() &&
    rawPhoto !== "null" &&
    rawPhoto !== "undefined"
      ? rawPhoto
      : null;

  useEffect(() => {
    setAvatarError(false);
  }, [rawPhoto]);

  useEffect(() => {
    const handleUserUpdate = () => {
      setAvatarError(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    };

    window.addEventListener("user_updated", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);
    return () => {
      window.removeEventListener("user_updated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, [queryClient]);

  const handleProfileClick = () => {
    if (onNavigateAction) onNavigateAction();
    const currentRole = user?.role || "admin";
    const roleRoutes: Record<string, string> = {
      admin: "/dashboard/admin",
      employer: "/dashboard/employer",
      worker: "/dashboard/worker",
      police: "/dashboard/police",
      company: "/dashboard/company",
      supervisor: "/dashboard/supervisor",
    };
    const keyMap: Record<string, string> = {
      admin: "admin_active_tab",
      employer: "employer_active_tab",
      worker: "worker_active_tab",
      police: "police_active_tab",
      company: "company_active_tab",
      supervisor: "supervisor_active_tab",
    };
    const eventMap: Record<string, string> = {
      admin: "admin-tab-change",
      employer: "employer-navigate",
      worker: "worker-navigate",
      police: "police-navigate",
      company: "company-navigate",
      supervisor: "supervisor-navigate",
    };

    const tabKey = keyMap[currentRole] || "admin_active_tab";
    const eventName = eventMap[currentRole] || "admin-tab-change";

    localStorage.setItem(tabKey, "profile");
    window.dispatchEvent(new CustomEvent(eventName, { detail: "profile" }));
    window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "profile" }));

    navigate(roleRoutes[currentRole] || "/dashboard/admin");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center p-0.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer outline-none ${className}`}>
            <div className={`${avatarSizeClass} rounded-full overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center bg-slate-100`}>
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={user?.name || "User Avatar"}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <DefaultAvatarSVG className="w-full h-full" />
              )}
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-72 bg-white rounded border border-slate-300 shadow-md p-0 z-[99999] overflow-hidden"
        >
          {/* Header user identity */}
          <div className="px-4 py-3.5 border-b border-slate-200 bg-white text-left">
            <p className="text-[15px] font-bold text-[#1f2937] truncate leading-snug">
              {user?.name || "No names available"}
            </p>
            <p className="text-[13px] font-normal text-[#4b5563] truncate mt-0.5">
              {user?.email || "employer@test.rw"}
            </p>
          </div>

          <div className="py-0 text-left">
            {/* Profile */}
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 bg-[#e9ecef] text-[#1f2937] text-[14px] font-semibold hover:bg-[#e2e6ea] transition-colors cursor-pointer"
            >
              <UserCircle className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
              <span>Profile</span>
            </button>

            {/* Change Password */}
            <button
              onClick={() => {
                if (onNavigateAction) onNavigateAction();
                navigate("/auth/forgot-password");
              }}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] transition-colors cursor-pointer"
            >
              <Lock className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
              <span>Change password</span>
            </button>

            {/* Feedback (Not shown for admin) */}
            {!isAdmin && (
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
                <span>Feedback</span>
              </button>
            )}

            {/* Change language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] transition-colors cursor-pointer outline-none">
                  <Languages className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
                  <span>Change language</span>
                  <ChevronRight className="w-4 h-4 text-[#374151] stroke-[2.5] ml-auto shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 bg-white rounded border border-slate-300 p-1 shadow-md z-[100000]"
              >
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onSelect={() => setLanguage(lang.code)}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                      language === lang.code
                        ? "bg-slate-100 text-[#1677ff]"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span>{lang.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout */}
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Power className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
              <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Feedback & Screenshot Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        user={user}
      />
    </>
  );
};
