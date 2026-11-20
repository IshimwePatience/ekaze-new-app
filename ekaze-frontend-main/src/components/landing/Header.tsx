import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, HelpCircle, Check, ArrowRight, Languages, User } from "lucide-react";
import { LoginDropdown } from "@/components/landing/LoginDropdown";
import { RegisterDropdown } from "@/components/landing/RegisterDropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import logo from "@/assets/reallogo.png";
import { useLogout, useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { helpFeedbackService } from "@/api/helpFeedbackService";

const languages = [
  { code: "kin" as const, label: "Kinyarwanda", short: "KIN" },
  { code: "eng" as const, label: "English", short: "EN" },
];

const helpTopics = [
  "General Inquiry & Platform Help",
  "Worker Identity & NIDA Verification",
  "Payments, Wages & MTN MoMo",
  "Placement Agencies & Companies",
  "Police Records & Incident Reports",
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);

  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState(helpTopics[0]);
  const [helpName, setHelpName] = useState("");
  const [helpContact, setHelpContact] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);

  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const currentLanguage = languages.find((l) => l.code === language);

  const { isAuthenticated, user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();

  // Automatically open login dropdown on logout or when ?login=true is in URL
  useEffect(() => {
    const handleOpenLogin = () => {
      setIsLoginDropdownOpen(true);
    };

    window.addEventListener("open-login-dropdown", handleOpenLogin);

    const searchParams = new URLSearchParams(location.search);
    const urlWorkerId = searchParams.get("workerId") || searchParams.get("autoOpenWorkerId");
    if (urlWorkerId) {
      sessionStorage.setItem("auto_open_worker_id", urlWorkerId);
    }

    if (searchParams.get("login") === "true" || (location.state as any)?.openLogin) {
      setIsLoginDropdownOpen(true);
    }

    if (
      searchParams.get("join") === "true" ||
      searchParams.get("register") === "true" ||
      (location.state as any)?.openRegister ||
      (location.state as any)?.openJoinNow
    ) {
      setIsRegisterDropdownOpen(true);
    }

    const handleOpenRegister = () => {
      setIsRegisterDropdownOpen(true);
    };
    window.addEventListener("open-register-dropdown", handleOpenRegister);

    const handleOpenHelp = () => {
      setIsHelpOpen(true);
    };
    window.addEventListener("open-landing-help", handleOpenHelp);

    return () => {
      window.removeEventListener("open-login-dropdown", handleOpenLogin);
      window.removeEventListener("open-register-dropdown", handleOpenRegister);
      window.removeEventListener("open-landing-help", handleOpenHelp);
    };
  }, [location.search, location.state]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    // Intersection Observer for scroll spy tab indicator
    const sectionIds = ["hero", "features", "services", "integrations"];
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-15% 0px -45% 0px",
      threshold: 0,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      if (window.scrollY < 80) {
        setActiveSection("#hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  /* PREVIOUS WORKER NAV LINKS:
  const navLinks = [
    { label: t("nav.home"), href: "#hero" },
    { label: language === "kin" ? "Ibyiciro by'Abakozi" : "Worker Categories", href: "#features" },
    { label: "Integrations", href: "#integrations" },
    { label: t("nav.findWorker"), href: "/search-worker" },
  ];
  */
  const navLinks = [
    { label: t("nav.home"), href: "#hero" },
    { label: language === "kin" ? "Ibyiciro by'Abashoferi" : "Driver Categories", href: "#features" },
    // PREVIOUS: { label: "Integrations", href: "#integrations" },
    { label: language === "kin" ? "Serivisi" : "Services", href: "#services" },
    { label: language === "kin" ? "Shaka Umushoferi" : "Find Driver", href: "/search-worker" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setActiveSection(href);

      const targetId = href.replace("#", "");

      const performScroll = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          element.classList.remove("section-slide-active");
          void element.offsetWidth;
          element.classList.add("section-slide-active");
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      };

      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(performScroll, 100);
      } else {
        performScroll();
      }
      setIsMenuOpen(false);
    } else {
      e.preventDefault();
      navigate(href);
      setIsMenuOpen(false);
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/search-worker") return location.pathname === "/search-worker";
    if (location.pathname === "/") {
      return activeSection === href;
    }
    return false;
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getDashboardRoute = () => {
    const roleRoutes: Record<string, string> = {
      admin: ROUTES.ADMIN_DASHBOARD,
      employer: ROUTES.EMPLOYER_DASHBOARD,
      worker: ROUTES.WORKER_DASHBOARD,
      police: ROUTES.POLICE_DASHBOARD,
      company: ROUTES.COMPANY_DASHBOARD,
      supervisor: ROUTES.SUPERVISOR_DASHBOARD,
    };
    return roleRoutes[user?.role] || ROUTES.HOME;
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpDescription.trim()) {
      toast.error("Please enter a description of your request or question.");
      return;
    }

    setIsSubmittingHelp(true);
    try {
      const contactVal = helpContact.trim();
      const isEmail = contactVal.includes("@");

      await helpFeedbackService.submitHelpFeedback({
        name: helpName.trim() || undefined,
        email: isEmail ? contactVal : undefined,
        phone: !isEmail && contactVal ? contactVal : undefined,
        category: helpTopic,
        type: 'support',
        subject: `Landing Page Help: ${helpTopic}`,
        message: helpDescription.trim(),
        page_url: window.location.href,
        role: 'guest',
      });

      setIsHelpOpen(false);
      toast.success("Help request submitted successfully! Our support team will reach out to you shortly.");
      setHelpDescription("");
      setHelpName("");
      setHelpContact("");
    } catch (err: any) {
      console.error("Landing help submission error:", err);
      toast.error(err?.response?.data?.message || "Failed to submit help request. Please try again.");
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* MTN-Style Two-Tier Floating Header: Transparent over Hero (No Black Background) */}
      <header
        className={`${isHomePage ? "fixed top-0 left-0 right-0" : "sticky top-0"
          } z-50 w-full bg-transparent transition-all duration-300 pointer-events-none`}
      >
        {/* Tier 1: Top Utility Bar (Transparent, hides cleanly on scroll so only the yellow pill floats) */}
        <div
          className={`container mx-auto max-w-6xl px-4 sm:px-6 transition-all duration-300 overflow-hidden pointer-events-auto ${scrolled ? "max-h-0 opacity-0 py-0" : "max-h-14 opacity-100 pt-2.5 pb-1.5"
            }`}
        >
          <div className="flex items-center justify-between text-xs sm:text-[13px]">
            <div className="flex items-center gap-4 sm:gap-7 overflow-x-auto no-scrollbar">
              <a
                href="#features"
                onClick={(e) => handleNavClick(e, "#features")}
                className={`font-semibold whitespace-nowrap transition-colors cursor-pointer drop-shadow-xs ${
                  isActiveLink("#features")
                    ? "text-[#60a5fa]"
                    : isHomePage
                      ? "text-white/95 hover:text-[#60a5fa]"
                      : "text-slate-800 hover:text-[#2478b8]"
                }`}
              >
                {language === "kin" ? "Abashoferi" : "Fleet & Drivers"}
              </a>
              <button
                type="button"
                onClick={() => navigate("/who-we-are")}
                className={`font-semibold whitespace-nowrap transition-colors cursor-pointer bg-transparent border-0 p-0 drop-shadow-xs ${
                  isHomePage ? "text-white/95 hover:text-[#60a5fa]" : "text-slate-800 hover:text-[#2478b8]"
                }`}
              >
                {language === "kin" ? "Ibiciro" : "Pricing"}
              </button>
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className={`font-semibold whitespace-nowrap transition-colors cursor-pointer bg-transparent border-0 p-0 drop-shadow-xs ${
                  isHomePage ? "text-white/95 hover:text-[#60a5fa]" : "text-slate-800 hover:text-[#2478b8]"
                }`}
              >
                {language === "kin" ? "Ubufasha" : "Support"}
              </button>
            </div>

            {/* Right Side: Language Selector */}
            <div className="flex items-center shrink-0 ml-3">
              <CustomDropdown
                widthClass="w-28 min-w-[7rem]"
                trigger={
                  <button
                    className={`bg-transparent hover:text-[#60a5fa] transition-all cursor-pointer flex items-center gap-1.5 px-2 py-0.5 border-0 shadow-none outline-none drop-shadow-xs ${
                      isHomePage ? "text-white" : "text-slate-800"
                    }`}
                  >
                    <Languages className="w-3.5 h-3.5 text-[#60a5fa]" />
                    <span className="text-xs font-bold tracking-tight">
                      {currentLanguage?.short || (language === "kin" ? "KIN" : "EN")}
                    </span>
                    <span className="text-[#60a5fa] text-[9px] transform scale-y-75 font-bold">▼</span>
                  </button>
                }
                items={languages.map((lang) => ({
                  label: lang.short,
                  active: language === lang.code,
                  onClick: () => setLanguage(lang.code),
                }))}
              />
            </div>
          </div>
        </div>

        {/* Tier 2: Floating Rounded Blue Pill Navbar (#2478b8 with crisp white text) */}
        <div className={`container mx-auto max-w-6xl px-4 sm:px-6 pointer-events-auto transition-all duration-300 ${scrolled ? "py-2.5" : "pb-3 pt-1"}`}>
          <div className="w-full h-[60px] sm:h-[64px] bg-[#2478b8] text-white rounded-xl sm:rounded-2xl shadow-lg border border-sky-400/25 px-4 sm:px-7 flex items-center justify-between">
            {/* Left Group: Brand Logo + Navigation Links */}
            <div className="flex items-center gap-5 lg:gap-8">
              <a
                href="/"
                onClick={(e) => handleNavClick(e, "#hero")}
                className="flex items-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <img src={logo} alt="Ekaze" className="h-7 md:h-8 w-auto brightness-0 invert" />
              </a>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                {navLinks.map((link) => {
                  const active = isActiveLink(link.href);
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`relative px-3.5 py-2 text-sm md:text-[14.5px] rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center gap-1 ${active
                        ? "bg-white/20 text-white font-bold shadow-2xs"
                        : "text-white/90 hover:text-white hover:bg-white/10 font-semibold"
                        }`}
                    >
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Right Group: Auth / Profile Controls */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <CustomDropdown
                  widthClass="w-48"
                  trigger={
                    <Button
                      variant="ghost"
                      className="h-9 gap-2 px-3 rounded-full transition-all shadow-none bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                    >
                      <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#2478b8]">{getUserInitials()}</span>
                      </div>
                      <span className="text-xs font-semibold">{user?.name}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                    </Button>
                  }
                  items={[
                    {
                      label: t("auth.dashboard"),
                      onClick: () => navigate(getDashboardRoute()),
                    },
                    "separator",
                    {
                      label: isLoggingOut ? t("auth.loggingOut") : t("auth.logout"),
                      danger: true,
                      disabled: isLoggingOut,
                      onClick: () => logout(),
                    },
                  ]}
                />
              ) : (
                <div className="relative">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                      className="border border-white bg-white hover:bg-blue-50 text-[#2478b8] font-bold text-sm px-4 py-2 rounded-full transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#2478b8] text-white flex items-center justify-center">
                        <User className="w-3 h-3 fill-white" />
                      </div>
                      <span>Log In</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#2478b8] transition-transform duration-200 ${
                          isLoginDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Login Dropdown Card */}
                  <LoginDropdown
                    isOpen={isLoginDropdownOpen}
                    onClose={() => {
                      setIsLoginDropdownOpen(false);
                      if (location.search.includes("login=true")) {
                        const params = new URLSearchParams(location.search);
                        params.delete("login");
                        const remaining = params.toString();
                        navigate(remaining ? `${location.pathname}?${remaining}` : location.pathname, { replace: true });
                      }
                    }}
                    onOpenRegister={() => {
                      setIsLoginDropdownOpen(false);
                      setIsRegisterDropdownOpen(true);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-lg bg-white/15 text-white hover:bg-white/25"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden pointer-events-auto border border-sky-400/25 mx-4 mb-3 rounded-xl p-4 space-y-2 bg-[#1b6296] text-white shadow-xl">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block text-sm py-2 px-3.5 rounded-xl cursor-pointer transition-colors ${isActiveLink(link.href)
                  ? "bg-white/20 text-white font-bold"
                  : "text-white/90 hover:text-white hover:bg-white/10 font-medium"
                  }`}
              >
                {link.label}
              </a>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 border-t border-white/15 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => { setIsLoginDropdownOpen(true); setIsMenuOpen(false); }}
                  className="text-center text-sm font-bold py-2.5 rounded-xl bg-white text-[#2478b8] hover:bg-blue-50 cursor-pointer"
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Two-Column Support Modal: Exact Clone of LoginDropdown Layout */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent
          hideCloseButton={true}
          className="sm:max-w-[720px] w-[95vw] max-w-[95vw] bg-white text-[#222222] border border-slate-200 rounded-lg p-0 shadow-2xl overflow-hidden text-left"
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-8 sm:p-9 pb-6">

            {/* LEFT COLUMN: CONTACT / SUPPORT REQUEST FORM */}
            <div className="md:pr-8 pb-6 md:pb-0 flex flex-col justify-between">
              <form onSubmit={handleHelpSubmit} className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#222222] tracking-tight mb-1">
                    {language === "kin" ? "Twandikire" : "Contact Us"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === "kin"
                      ? "Ohereza ikibazo cyawe cyangwa ubufasha ukeneye."
                      : "Send your question or issue and our team will reply promptly."}
                  </p>
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {language === "kin" ? "Imeri yawe *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    value={helpContact}
                    onChange={(e) => setHelpContact(e.target.value)}
                    placeholder={language === "kin" ? "Injiza imeri yawe" : "Enter your email address"}
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                    className="login-dropdown-input w-full px-3.5 rounded-[4px] border border-[#a5b2c0] focus:border-[#2478b8] focus:outline-none transition-colors bg-white"
                    required
                  />
                </div>

                {/* Description Textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {language === "kin" ? "Ibisobanuro by'ubufasha *" : "Description of your question *"}
                  </label>
                  <textarea
                    rows={4}
                    value={helpDescription}
                    onChange={(e) => setHelpDescription(e.target.value)}
                    placeholder={
                      language === "kin"
                        ? "Andika ikibazo cyawe cyangwa ubufasha ukeneye hano..."
                        : "Describe your question, request, or issue in detail here..."
                    }
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "auto", minHeight: "115px" }}
                    className="login-dropdown-input w-full p-3.5 rounded-[4px] border border-[#a5b2c0] focus:border-[#2478b8] focus:outline-none transition-colors bg-white leading-relaxed resize-none"
                    required
                  />
                </div>

                {/* Submit Button in Brand Blue */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingHelp}
                    className="w-full h-11 bg-[#2478b8] hover:bg-[#1b6296] text-white font-bold text-base rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isSubmittingHelp ? (
                      <span>{language === "kin" ? "Kohereza..." : "Submitting..."}</span>
                    ) : (
                      <span>{language === "kin" ? "Ohereza Ubutumwa" : "Submit Request"}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: CONTACT US, PHONE 0783202922 & BULLETS */}
            <div className="md:pl-8 pt-6 md:pt-0 relative flex flex-col justify-between">

              {/* Top Close '✕' Button: Exact same size and position as Login dropdown */}
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-0 right-0 text-slate-700 hover:text-black p-1 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>

              <div>
                <h3 className="text-[26px] font-bold text-[#222222] leading-tight mb-6 pr-8">
                  {language === "kin" ? (
                    <>
                      Ufite ikibazo? <br />
                      Tuvugishe kuri:
                    </>
                  ) : (
                    <>
                      If you have any <br />
                      question, contact us:
                    </>
                  )}
                </h3>


                {/* Bullet Points with Checkmarks */}
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>{language === "kin" ? "Ubufasha bwa telefoni: 0783202922" : "Phone & WhatsApp: 0783202922"}</span>
                  </li>

                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>{language === "kin" ? "Igisubizo mu minota 15" : "Quick response within 15 minutes"}</span>
                  </li>

                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>{language === "kin" ? "Igenzura ry'abakozi & amasezerano" : "Worker verification & contracts"}</span>
                  </li>

                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>{language === "kin" ? "Ubufasha bwihuse bwa 24/7" : "24/7 dedicated platform support"}</span>
                  </li>
                </ul>
              </div>

              {/* Branding Script Footer matching LoginDropdown */}
              <div className="pt-2 select-none">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-2xl font-bold italic tracking-tight text-[#2478b8]"
                    style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, sans-serif" }}
                  >
                    Ekaze
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans font-semibold">™</span>
                </div>
                <p className="text-[11px] text-[#2478b8] font-medium tracking-tight">
                  {language === "kin" ? "Genzura n'uhembe abakozi bo mu rugo igihe cyose" : "Earn trust whenever you manage with us"}
                </p>
              </div>

            </div>

          </div>

          {/* BOTTOM BAR: Direct WhatsApp Action */}
          <div className="border-t border-slate-200 px-8 py-3.5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[14px] text-[#333333] font-normal">
              {language === "kin"
                ? "Ukeneye ubufasha bwihuse mu buryo butaziguye?"
                : "Need urgent assistance right away?"}
            </span>
            <a
              href="https://wa.me/250783202922"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-5 bg-[#2478b8] hover:bg-[#1b6296] text-white font-bold text-xs sm:text-sm rounded-[6px] transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.18-.544-1.898-.788-3.13-2.73-3.224-2.856-.095-.126-.774-1.031-.774-1.968 0-.936.491-1.396.666-1.587.175-.19.382-.238.509-.238.127 0 .254.002.366.007.119.006.277-.045.433.328.16.381.545 1.332.593 1.43.048.098.08.212.016.339-.064.127-.096.207-.191.318-.095.111-.2.248-.286.333-.095.096-.195.2-.084.391.111.191.494.814 1.059 1.318.729.648 1.343.85 1.534.945.191.096.302.08.414-.047.111-.127.476-.556.603-.746.127-.19.254-.159.429-.095.175.064 1.11.523 1.301.618.191.096.318.143.366.223.048.079.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.174L2 22l4.981-1.306C8.423 21.532 10.15 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.273c-1.636 0-3.161-.489-4.439-1.328l-.318-.21-2.955.775.789-2.879-.231-.368C3.93 14.938 3.4 13.513 3.4 12c0-4.742 3.858-8.6 8.6-8.6 4.743 0 8.6 3.858 8.6 8.6 0 4.742-3.857 8.273-8.6 8.273z" />
              </svg>
              <span>WhatsApp 0783202922</span>
            </a>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;