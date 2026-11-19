import { useState, ReactNode } from "react";
import { Languages, HelpCircle, Check } from "lucide-react";
import logo from "@/assets/reallogo.png";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const languages = [
  { code: "kin" as const, label: "Kinyarwanda", short: "KIN" },
  { code: "eng" as const, label: "English", short: "EN" },
];

const helpTopics = [
  "Account & Login Issues",
  "Worker Identity & NIDA Verification",
  "Payments & MTN MoMo Setup",
  "Placement Agencies & Companies",
  "General Inquiry & Support",
];

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languages.find((l) => l.code === language);
  const { toast } = useToast();

  // Help Modal state
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState(helpTopics[0]);
  const [helpName, setHelpName] = useState("");
  const [helpContact, setHelpContact] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please write a description of your issue or question.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingHelp(true);
    setTimeout(() => {
      setIsSubmittingHelp(false);
      setIsHelpOpen(false);
      toast({
        title: "Help Request Submitted",
        description: "Our support team will contact you shortly.",
      });
      setHelpDescription("");
      setHelpName("");
      setHelpContact("");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-white text-[#2b2b2b] flex flex-col justify-between font-coursera selection:bg-blue-100">

      {/* Top Header Bar (Identical across Auth pages) */}
      <header className="w-full bg-white px-6 py-4 flex items-center justify-between">
        <a href={ROUTES.HOME} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src={logo} alt="Ekaze" className="h-9 w-auto" />
        </a>

        {/* Right Side: Language Selector */}
        <CustomDropdown
          widthClass="w-28 min-w-[7rem]"
          trigger={
            <button className="bg-transparent hover:opacity-80 transition-all cursor-pointer flex items-center gap-1.5 px-2 py-1 border-0 shadow-none outline-none">
              <Languages className="w-4 h-4 text-[#1677ff]" />
              <span className="text-sm font-semibold text-slate-700 tracking-tight">
                {currentLanguage?.short || (language === 'kin' ? 'KIN' : 'EN')}
              </span>
              <span className="text-[#1677ff] text-[10px] transform scale-y-75 font-bold">▼</span>
            </button>
          }
          items={languages.map((lang) => ({
            label: lang.short,
            active: language === lang.code,
            onClick: () => setLanguage(lang.code),
          }))}
        />
      </header>

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 w-full bg-white">
        {children}
      </main>

      {/* Bottom Minimalist Footer (Identical across Auth pages) */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">

        {/* Left Side: Help */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="font-bold text-slate-700 hover:text-[#1677ff] cursor-pointer transition-colors"
          >
            Need help?
          </button>
        </div>

        {/* Center / Right Links */}
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <a href="/" className="hover:text-slate-600 transition-colors">ekaze.rw</a>
          <span>|</span>
          <a href="/who-we-are" className="hover:text-slate-600 transition-colors">Who We Are</a>
          <span>|</span>
          <a href="/terms-of-service" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          <span>|</span>
          <a href="/terms-and-conditions" className="hover:text-slate-600 transition-colors">General Terms and Conditions</a>
          <span>|</span>
          <a href="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <span>|</span>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))} className="hover:text-slate-600 transition-colors cursor-pointer">Cookie Policy</button>
        </div>

        {/* Copyright */}
        <div className="w-full sm:w-auto text-slate-400 text-center sm:text-right">
          © {new Date().getFullYear()} ekaze.rw, a Beno Finance Ltd brand
        </div>
      </footer>

      {/* Clean White Theme Help & Support Popup Modal */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
                <HelpCircle className="w-5 h-5 text-slate-800" />
              </div>
              <DialogTitle className="text-lg font-extrabold text-[#2d3748] tracking-tight">
                Ekaze Help & Support Desk
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#4f687a] font-medium">
              Submit your question or issue description below. Our team is available 24/7 to assist you.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleHelpSubmit} className="space-y-4 pt-2">

            {/* Custom Orange/Yellow Highlighted Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">Select Topic / Category</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#1677ff]/30 cursor-pointer shadow-2xs"
                  >
                    <span>{helpTopic}</span>
                    <span className="text-slate-400">▼</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[390px] max-w-[90vw] bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl space-y-1 z-50">
                  {helpTopics.map((topic) => (
                    <DropdownMenuItem
                      key={topic}
                      onClick={() => setHelpTopic(topic)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${helpTopic === topic
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {helpTopic === topic && <Check className="w-4 h-4 text-white shrink-0" />}
                        <span>{topic}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jean Dupont"
                  value={helpName}
                  onChange={(e) => setHelpName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1677ff]/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone or Email</label>
                <input
                  type="text"
                  placeholder="e.g. +250 788... / user@domain.com"
                  value={helpContact}
                  onChange={(e) => setHelpContact(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1677ff]/30"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">Description of your request or issue *</label>
              <textarea
                rows={4}
                placeholder="Write your question, request options, or describe the issue in detail here..."
                value={helpDescription}
                onChange={(e) => setHelpDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1677ff]/30 leading-relaxed"
                required
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingHelp}
                className="bg-[#1677ff] hover:bg-[#1260cc] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-sm transition-all cursor-pointer"
              >
                {isSubmittingHelp ? "Submitting..." : "Submit Help Request"}
              </button>
            </div>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
