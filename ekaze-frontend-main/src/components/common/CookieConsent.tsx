import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronRight, Check } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  consentGiven: boolean;
  timestamp: string | null;
}

const STORAGE_KEY = "ekaze_cookie_consent";

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  performance: true,
  consentGiven: false,
  timestamp: null,
};

const setCookie = (name: string, value: string, days = 365) => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to set cookie:", err);
  }
};

export const getCookieConsent = (): CookiePreferences => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Failed to read cookie consent:", err);
  }
  return DEFAULT_PREFERENCES;
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [expandedSection, setExpandedSection] = useState<string | null>("necessary");

  useEffect(() => {
    const current = getCookieConsent();
    setPreferences(current);
    if (!current.consentGiven) {
      setShowBanner(true);
    }

    const handleOpenModal = () => {
      setShowModal(true);
      setShowBanner(false);
    };

    window.addEventListener("open-cookie-preferences", handleOpenModal);
    return () => {
      window.removeEventListener("open-cookie-preferences", handleOpenModal);
    };
  }, []);

  const saveConsent = (updated: CookiePreferences) => {
    const finalPrefs: CookiePreferences = {
      ...updated,
      necessary: true, // Always required
      consentGiven: true,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPrefs));
      setCookie(STORAGE_KEY, JSON.stringify(finalPrefs), 365);
    } catch (e) {
      console.error("Error saving cookie preferences", e);
    }

    setPreferences(finalPrefs);
    setShowBanner(false);
    setShowModal(false);

    // Trigger custom event so real-time scripts/tracking can react
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: finalPrefs }));
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      performance: true,
      consentGiven: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      performance: false,
      consentGiven: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* 1. Bottom-Left Floating Cookie Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 text-slate-800 font-sans animate-in slide-in-from-bottom-5 duration-300">
          <h3 className="text-base font-extrabold text-slate-900 mb-2">
            We value your privacy
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
            We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowModal(true);
                setShowBanner(false);
              }}
              className="flex-1 py-2 px-3 rounded-lg border border-[#0062b8] text-[#0062b8] hover:bg-[#0062b8]/5 font-semibold text-xs text-center transition-all cursor-pointer"
            >
              Customise
            </button>
            <button
              type="button"
              onClick={handleRejectAll}
              className="flex-1 py-2 px-3 rounded-lg border border-[#0062b8] text-[#0062b8] hover:bg-[#0062b8]/5 font-semibold text-xs text-center transition-all cursor-pointer"
            >
              Reject All
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-3 rounded-lg bg-[#0062b8] hover:bg-[#00509a] text-white font-semibold text-xs text-center transition-all cursor-pointer shadow-xs"
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      {/* 2. Customise Consent Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[70vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans text-slate-800">
            
            {/* Modal Header - Pure White */}
            <div className="px-8 pt-6 pb-2 flex items-center justify-between bg-white">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Customise Consent Preferences
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  if (!preferences.consentGiven) setShowBanner(true);
                }}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-4 overflow-y-auto space-y-4 text-left flex-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                The cookies that are categorised as "Necessary" are stored on your browser as they are essential for enabling the basic functionalities of the site.
              </p>

              {/* Accordion Categories */}
              <div className="space-y-3 pt-1">
                
                {/* 1. Necessary */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div
                    onClick={() => toggleSection("necessary")}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSection === "necessary" ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-sm font-bold text-slate-900">Necessary</span>
                    </div>
                  </div>
                  {expandedSection === "necessary" && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.
                    </div>
                  )}
                </div>

                {/* 2. Functional */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div
                    onClick={() => toggleSection("functional")}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSection === "functional" ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-sm font-bold text-slate-900">Functional</span>
                    </div>
                    
                    {/* Tick Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreferences({ ...preferences, functional: !preferences.functional });
                      }}
                      className="flex items-center gap-2 cursor-pointer p-1"
                    >
                      {preferences.functional ? (
                        <div className="w-5 h-5 rounded border border-[#0062b8] bg-[#0062b8] text-white flex items-center justify-center font-bold transition-all shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white hover:border-slate-400 transition-all" />
                      )}
                    </div>
                  </div>
                  {expandedSection === "functional" && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.
                    </div>
                  )}
                </div>

                {/* 3. Analytics */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div
                    onClick={() => toggleSection("analytics")}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSection === "analytics" ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-sm font-bold text-slate-900">Analytics</span>
                    </div>

                    {/* Tick Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreferences({ ...preferences, analytics: !preferences.analytics });
                      }}
                      className="flex items-center gap-2 cursor-pointer p-1"
                    >
                      {preferences.analytics ? (
                        <div className="w-5 h-5 rounded border border-[#0062b8] bg-[#0062b8] text-white flex items-center justify-center font-bold transition-all shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white hover:border-slate-400 transition-all" />
                      )}
                    </div>
                  </div>
                  {expandedSection === "analytics" && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.
                    </div>
                  )}
                </div>

                {/* 4. Performance */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div
                    onClick={() => toggleSection("performance")}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSection === "performance" ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-sm font-bold text-slate-900">Performance</span>
                    </div>

                    {/* Tick Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreferences({ ...preferences, performance: !preferences.performance });
                      }}
                      className="flex items-center gap-2 cursor-pointer p-1"
                    >
                      {preferences.performance ? (
                        <div className="w-5 h-5 rounded border border-[#0062b8] bg-[#0062b8] text-white flex items-center justify-center font-bold transition-all shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white hover:border-slate-400 transition-all" />
                      )}
                    </div>
                  </div>
                  {expandedSection === "performance" && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Footer - Pure White */}
            <div className="px-8 pb-6 pt-2 bg-white flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#0062b8] text-[#0062b8] hover:bg-[#0062b8]/5 font-bold text-xs transition-all cursor-pointer text-center"
              >
                Reject All
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#0062b8] text-[#0062b8] hover:bg-[#0062b8]/5 font-bold text-xs transition-all cursor-pointer text-center"
              >
                Save My Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#0062b8] hover:bg-[#00509a] text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-[#0062b8]/20 text-center"
              >
                Accept All
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
