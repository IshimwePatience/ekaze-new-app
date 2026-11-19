import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  HelpCircle,
  Download,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Scale,
  Users,
  CreditCard,
  Building2,
  Lock,
  Languages,
} from 'lucide-react';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { NavbarUserMenu } from '@/components/common/NavbarUserMenu';
import logo from '@/assets/reallogo.png';

const languages = [
  { code: 'kin' as const, label: 'Kinyarwanda', short: 'KIN' },
  { code: 'eng' as const, label: 'English', short: 'EN' },
];

type MainSectionTab = 'overview' | 'privacy-policy' | 'terms-of-service' | 'legal-help';

interface SubSection {
  id: string;
  label: string;
}

interface TabData {
  badge: string;
  label: string;
  headline: string;
  description: string;
  sections: SubSection[];
}

const getTabConfig = (isRw: boolean): Record<MainSectionTab, TabData> => ({
  overview: {
    badge: isRw ? "Incamake y'Urubuga" : 'Platform Overview',
    label: isRw ? 'Incamake' : 'Overview',
    headline: isRw
      ? "Urubuga rwizewe rwo guhuza abakoresha n'abakozi bo mu ngo babifitiye ibyangombwa."
      : 'Trusted, verified domestic workforce and legal labor contracts.',
    description: isRw
      ? "Guhuza abakozi b'umwuga n'ingo mu Rwanda bishingiye ku irangamuntu (NIDA), amasezerano y'akazi yemewe, no kwishyura imishahara mu mutekano kuri MTN Mobile Money."
      : 'Connecting verified domestic workers with households across Rwanda through authenticated National ID records, secure monthly wage escrow, and digital contracts.',
    sections: [
      {
        id: 'platform-mission',
        label: isRw ? "Intego n'Amahame y'Urubuga" : 'Mission and Principles',
      },
      {
        id: 'nida-verification',
        label: isRw ? "Igenzura ry'Irangamuntu (NIDA)" : 'National ID (NIDA) Verification',
      },
      {
        id: 'escrow-protection',
        label: isRw ? 'Umutekano wo Kwishyura Imishahara' : 'Guaranteed Escrow Payments',
      },
      {
        id: 'digital-contracts',
        label: isRw ? "Amasezerano y'Akazi Yemewe" : 'Standardized Labor Contracts',
      },
      {
        id: 'police-safety',
        label: isRw ? 'Umutekano no Guhamagara Polisi' : 'Safety and Police Escalation',
      },
    ],
  },
  'privacy-policy': {
    badge: isRw ? 'Politiki yo Kurinda Amakuru' : 'Privacy Policy',
    label: isRw ? 'Kurinda Amakuru' : 'Privacy Policy',
    headline: isRw
      ? 'Iyo ukoresha serivisi zacu, uba utugiriye icyizere cyo kurinda amakuru yawe bwite.'
      : 'When you use our services, you trust us with your personal records.',
    description: isRw
      ? "Ibisobanuro birambuye ku buryo amakuru y'umwirondoro, amasezerano y'akazi, n'ibyemezo by'igenzura bicungwa hubahirizwa itegeko ririnda amakuru bwite mu Rwanda."
      : 'This policy explains how personal information, employment contracts, and verification records are collected, protected, and used in accordance with Rwandan data privacy laws.',
    sections: [
      { id: 'privacy-intro', label: isRw ? 'Intangiriro' : 'Introduction' },
      { id: 'data-collected', label: isRw ? 'Amakuru Akusanywa' : 'Information Collected' },
      { id: 'data-purpose', label: isRw ? 'Impamvu Amakuru Akusanywa' : 'Why Data is Collected' },
      { id: 'privacy-controls', label: isRw ? 'Uburenganzira ku Makuru' : 'Your Privacy Controls' },
      { id: 'data-sharing', label: isRw ? 'Gusangiza Amakuru n’Inzego' : 'Authorized Data Sharing' },
      { id: 'data-security', label: isRw ? 'Umutekano w’Amakuru' : 'Data Security and Storage' },
      { id: 'data-retention', label: isRw ? 'Kubika Amakuru no Gusiba' : 'Retention and Deletion Rights' },
      { id: 'regulatory-compliance', label: isRw ? 'Kubahiriza Amategeko' : 'Compliance with Regulators' },
    ],
  },
  'terms-of-service': {
    badge: isRw ? "Amasezerano n'Amabwiriza y'Akazi" : 'Terms of Service',
    label: isRw ? 'Amasezerano' : 'Terms of Service',
    headline: isRw
      ? "Amabwiriza asobanutse arinda uburenganzira bw'umukoresha n'umukozi wo mu rugo."
      : 'Clear standards that safeguard employers and domestic workers.',
    description: isRw
      ? "Inshingano z'impande zombi, umucyo ku mishahara, amasezerano y'akazi no kubahiriza amategeko agenga umurimo mu Rwanda."
      : 'These terms outline mutual commitments, wage transparency, contract guidelines, and compliance with the Labor Law of Rwanda.',
    sections: [
      { id: 'terms-acceptance', label: isRw ? 'Ibyemererwa n’Ibisabwa' : 'Acceptance and Eligibility' },
      { id: 'employer-standards', label: isRw ? "Inshingano z'Umukoresha" : 'Employer Responsibilities' },
      { id: 'worker-standards', label: isRw ? "Inshingano z'Umukozi" : 'Domestic Worker Commitments' },
      { id: 'momo-escrow', label: isRw ? 'Kwishyura kuri MoMo (Escrow)' : 'Mobile Money and Placement Escrow' },
      { id: 'dispute-escalation', label: isRw ? 'Gukemura Amakimbirane' : 'Disputes and Incident Escalation' },
      { id: 'account-termination', label: isRw ? 'Guhagarika Amasezerano' : 'Contract Termination and Suspension' },
      { id: 'governing-law', label: isRw ? 'Amategeko y’u Rwanda' : 'Governing Law of Rwanda' },
    ],
  },
  'legal-help': {
    badge: isRw ? "Ubufasha mu Mategeko n'Iby'Umurimo" : 'Legal Help & Compliance',
    label: isRw ? "Ubufasha bw'Amategeko" : 'Legal Help',
    headline: isRw
      ? "Ubufasha mu mategeko, amasezerano y'akazi, no gukemura amakimbirane."
      : 'Legal guidance, contract compliance, and dispute mediation.',
    description: isRw
      ? "Ubufasha bwemewe ku bakoresha, abakozi bo mu ngo n'ibigo bishaka akazi bujyanye n'amategeko y'umurimo mu Rwanda."
      : 'Official resources for households, workers, and agencies seeking guidance on domestic labor standards, incident reviews, and regulatory inquiries.',
    sections: [
      { id: 'legal-overview', label: isRw ? 'Incamake ku Mategeko' : 'Legal Assistance Overview' },
      { id: 'contract-mediation', label: isRw ? 'Ubuhuza mu Masezerano' : 'Contract Mediation and Rights' },
      { id: 'police-cooperation', label: isRw ? 'Gukurikirana na Polisi' : 'Police and Incident Reviews' },
      { id: 'labor-standards', label: isRw ? 'Amategeko ya MIFOTRA' : 'Rwandan Labor Law Compliance' },
      { id: 'contact-legal', label: isRw ? "Kuvugana n'Ishami ry'Amategeko" : 'Contact Legal Support' },
    ],
  },
});

export const HelpCenterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const isRw = language === 'kin' || (language as string) === 'rw';
  const currentLanguage =
    languages.find((l) => l.code === language) || (isRw ? languages[0] : languages[1]);

  const TAB_CONFIG = getTabConfig(isRw);

  // Normalize initial tab from query parameter
  const getInitialTab = (): MainSectionTab => {
    const rawTab = (searchParams.get('tab') || '').toLowerCase();
    if (rawTab.includes('system') || rawTab.includes('account') || rawTab.includes('overview'))
      return 'overview';
    if (rawTab.includes('term')) return 'terms-of-service';
    if (rawTab.includes('legal') || rawTab.includes('faq')) return 'legal-help';
    return 'privacy-policy';
  };

  const [activeTab, setActiveTab] = useState<MainSectionTab>(getInitialTab);
  const [activeSubSection, setActiveSubSection] = useState<string>('');

  // Authentication persistence across new tab
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser;

  // Sync tab when search params change
  useEffect(() => {
    const newTab = getInitialTab();
    setActiveTab(newTab);
    setActiveSubSection(TAB_CONFIG[newTab].sections[0]?.id || '');
  }, [searchParams]);

  const currentTabConfig = TAB_CONFIG[activeTab];

  // Scroll Spy: Automatically updates activeSubSection as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const sections = currentTabConfig.sections;
      if (!sections || sections.length === 0) return;

      const scrollY =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );

      // Auto-shift to last section when at bottom
      if (scrollY + windowHeight >= docHeight - 250) {
        setActiveSubSection(sections[sections.length - 1].id);
        return;
      }

      const readingLine = Math.max(260, windowHeight * 0.35);
      let bestMatch = sections[0].id;
      let minDistance = Infinity;

      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - readingLine);
        if (rect.top <= readingLine + 80 && dist < minDistance) {
          minDistance = dist;
          bestMatch = sec.id;
        }
      }

      setActiveSubSection(bestMatch);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentTabConfig]);

  const handleSelectTab = (tab: MainSectionTab) => {
    setActiveTab(tab);
    setActiveSubSection(TAB_CONFIG[tab].sections[0]?.id || '');
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (secId: string) => {
    setActiveSubSection(secId);
    const element = document.getElementById(secId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-[#202124] flex flex-col selection:bg-[#c2e7ff] selection:text-[#004380]"
      style={{ fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}
    >
      {/* Top Google-style Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 lg:px-12 flex items-center justify-between h-16 shrink-0 shadow-xs">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <img src={logo} alt="Ekaze" className="h-6 w-auto" />
            <span className="text-[17px] font-medium text-[#202124] tracking-tight">
              {isRw ? 'Amabwiriza n’Umutekano' : 'Privacy & Terms'}
            </span>
          </a>

          {/* Top 4 Main Tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-4 h-16">
            {(
              [
                'overview',
                'privacy-policy',
                'terms-of-service',
                'legal-help',
              ] as MainSectionTab[]
            ).map((tabKey) => {
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => handleSelectTab(tabKey)}
                  className={`relative h-full px-4 text-[16px] font-medium transition-colors flex items-center cursor-pointer ${isActive ? 'text-[#0062b8]' : 'text-[#3c4043] hover:text-[#202124]'
                    }`}
                >
                  <span>{TAB_CONFIG[tabKey].label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062b8] rounded-t-full shadow-xs" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Language Selector & Authenticated User Avatar */}
        <div className="flex items-center gap-3.5">
          {/* Landing Page Style Language Switcher */}
          <CustomDropdown
            widthClass="w-28 min-w-[7rem]"
            trigger={
              <button className="bg-transparent hover:opacity-80 transition-all cursor-pointer flex items-center gap-1.5 px-2 py-1 border-0 shadow-none outline-none text-[#202124]">
                <Languages className="w-4 h-4 text-[#202124]" />
                <span className="text-[15px] font-medium text-[#202124] tracking-tight">
                  {currentLanguage?.short || (isRw ? 'KIN' : 'EN')}
                </span>
                <span className="text-[#202124] text-[10px] transform scale-y-75 font-bold">▼</span>
              </button>
            }
            items={languages.map((lang) => ({
              label: lang.short,
              active: (lang.code === 'kin' && isRw) || (lang.code === 'eng' && !isRw),
              onClick: () => setLanguage(lang.code),
            }))}
          />

          {/* User Avatar Dropdown (Exact Dashboard Design) */}
          {user ? (
            <NavbarUserMenu avatarSizeClass="w-9 h-9" />
          ) : (
            <a
              href="/auth/login"
              className="px-5 py-2 rounded-full text-[14px] font-medium bg-[#0062b8] text-white hover:bg-[#00509a] transition-colors"
            >
              {isRw ? 'Injira' : 'Sign In'}
            </a>
          )}
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 border-r border-gray-200 md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-y-auto p-4 md:py-8 bg-white">
          <div className="space-y-4">
            {(
              [
                'overview',
                'privacy-policy',
                'terms-of-service',
                'legal-help',
              ] as MainSectionTab[]
            ).map((tabKey) => {
              const isTabActive = activeTab === tabKey;
              const cfg = TAB_CONFIG[tabKey];

              return (
                <div key={tabKey} className="space-y-1">
                  {/* Category Header Button */}
                  <button
                    onClick={() => handleSelectTab(tabKey)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[17px] font-medium transition-all flex items-center justify-between cursor-pointer ${isTabActive
                        ? 'bg-gray-100 text-[#202124] font-medium'
                        : 'text-[#202124] hover:bg-gray-50'
                      }`}
                  >
                    <span>{cfg.label}</span>
                  </button>

                  {/* Section list when active */}
                  {isTabActive && (
                    <div className="pl-3.5 space-y-1 border-l border-gray-200 ml-2 pt-1">
                      {cfg.sections.map((sec) => {
                        const isSubActive = activeSubSection === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => handleScrollToSection(sec.id)}
                            className={`w-full text-left px-3.5 py-2 rounded-md text-[15px] font-normal transition-all block truncate cursor-pointer ${isSubActive
                                ? 'text-[#202124] font-medium bg-gray-100'
                                : 'text-[#3c4043] hover:text-[#202124] hover:bg-gray-50'
                              }`}
                          >
                            {sec.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-10 max-w-4xl text-left space-y-10 text-[#202124]">
          {/* Header Title & Statement */}
          <div className="space-y-3">
            <span className="text-[14px] font-medium text-[#0062b8]">
              {currentTabConfig.badge}
            </span>

            <h1 className="text-[28px] sm:text-[34px] font-normal text-[#202124] leading-tight tracking-tight">
              {currentTabConfig.headline}
            </h1>

            <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
              {currentTabConfig.description}
            </p>
          </div>

          {/* Privacy Checkup Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="min-w-0">
              <h3 className="text-[22px] font-normal text-[#202124] leading-[28px] mb-2">
                {isRw ? "Igenzura ry'Umutekano w'Amakuru" : 'Privacy Checkup'}
              </h3>
              <p className="text-[16px] leading-[26px] font-normal text-[#202124] mb-3">
                {isRw
                  ? "Genzura amakuru yawe bwite, ibyangombwa byemejwe, n'amateka y'amasezerano yawe."
                  : 'Review your privacy settings, verified documents, or placement history.'}
              </p>
              <a
                href={user ? '/dashboard/admin' : '/auth/login'}
                className="text-[15px] font-medium text-[#0062b8] hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{isRw ? "Kora Igenzura ry'Umutekano ↗" : 'Take the Privacy Checkup ↗'}</span>
              </a>
            </div>
          </div>

          {/* Effective Date Meta Line */}
          <div className="text-[15px] text-[#202124] flex flex-wrap items-center gap-3 pt-1 border-b border-gray-200 pb-4">
            <span>{isRw ? 'Bikurikizwa kuva ku ya 16 Ukwakira 2026' : 'Effective October 16, 2026'}</span>
            <span>&bull;</span>
            <span className="text-[#0062b8] hover:underline cursor-pointer">
              {isRw ? 'Inyandiko zabanje' : 'Archived versions'}
            </span>
            <span>&bull;</span>
            <button
              onClick={() => window.print()}
              className="text-[#0062b8] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isRw ? 'Kura PDF hano' : 'Download PDF'}</span>
            </button>
          </div>

          {/* Embedded Real YouTube Video Player */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
            <div className="relative aspect-video w-full bg-gray-100">
              <iframe
                className="w-full h-full border-0"
                src="https://www.youtube-nocookie.com/embed/KGghlPmebCY?rel=0&modestbranding=1"
                title={isRw ? "Umutekano n'Amabwiriza y'Urubuga" : "Platform Privacy and Security Overview"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* SECTION CONTENTS */}
          <div className="space-y-12 pt-4">
            {/* OVERVIEW CONTENT */}
            {activeTab === 'overview' && (
              <>
                <section id="platform-mission" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? "Intego n'Amahame y'Urubuga" : 'Mission and Principles'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Urubuga rwa Ekaze rugamije kuvugurura no gushyira ku murongo umurimo w'abakozi bo mu ngo mu Rwanda. Twiyemeje guhuza ingo n'abakozi babifitiye uburambe n'umutekano, duharanira umushahara ukwiye, amasezerano yanditse, n'uburinzi bw'umutekano w'abakoresha n'abakozi."
                      : 'Our platform modernizes domestic workforce management in Rwanda by providing a secure, verified, and dignified environment. We connect households with vetted domestic workers while ensuring fair wages, written agreements, and safety for all parties.'}
                  </p>
                </section>

                <section id="nida-verification" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? "Igenzura ry'Irangamuntu (NIDA)" : 'National ID (NIDA) Verification'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Kumenya neza umwirondoro w'umuntu ni umusingi w'umutekano wacu. Buri mukozi wo mu rugo na buri mukoresha anyura mu igenzura ry'irangamuntu ry'imibare 16 rihuzwa n'ububiko bwa NIDA kugira ngo hirindwe ubujura cyangwa kwiyitirira abandi."
                      : 'Identity authentication is central to our security guarantee. Every worker profile and employer account is validated against official National Identification Agency (NIDA) records, preventing impersonation and ensuring full accountability.'}
                  </p>
                </section>

                <section id="escrow-protection" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Umutekano wo Kwishyura Imishahara' : 'Guaranteed Escrow Payments'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Amafaranga yo gushaka umukozi n'imishahara ya buri kwezi bicungirwa mu buryo bwizewe bw'ikoranabuhanga binyuze kuri MTN Mobile Money. Amafaranga ahabwa umukozi ku gihe cyateganyijwe bityo bikarinda amakimbirane n'ibibazo by'imishahara itinda."
                      : 'Placement fees and monthly wages are handled through transparent MTN Mobile Money escrow workflows. Funds are disbursed accurately and on schedule, eliminating salary disputes and ensuring domestic workers receive their earned compensation.'}
                  </p>
                </section>

                <section id="digital-contracts" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? "Amasezerano y'Akazi Yemewe n'Amategeko" : 'Standardized Labor Contracts'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Buri kazi gakorwa hashingiwe ku masezerano yanditse y'ikoranabuhanga. Ayo masezerano asobanura neza inshingano z'akazi, amasaha yo gukora, imishahara yemerejweho, iminsi y'ikiruhuko, n'uburyo bwo guhagarika amasezerano hubahirijwe amategeko y'umurimo mu Rwanda."
                      : 'Every household placement includes a formalized digital employment contract. The agreement clearly outlines daily duties, agreed working hours, monthly remuneration, rest days, and mutual termination notices in compliance with Rwandan labor standards.'}
                  </p>
                </section>

                <section id="police-safety" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Umutekano no Guhamagara Polisi' : 'Safety and Police Escalation'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Iyo habayeho ikibazo cy'umutekano cyangwa imyitwarire mibi, raporo itangwa ako kanya binyuze kuri paji y'umukoresha cyangwa umukozi hamwe n'ibimenyetso bifatika. Ibyo bibazo bihita byoherezwa ku nzego z'umutekano za Polisi y'Igihugu n'Ubugenzacyaha (RIB) kugira ngo bikurikiranwe byihuse."
                      : 'When security or misconduct incidents occur, reports are submitted directly through the dashboard with timestamped logs and file attachments. Incidents are channeled to designated Rwanda National Police liaisons for swift investigation.'}
                  </p>
                </section>
              </>
            )}

            {/* PRIVACY POLICY CONTENT */}
            {activeTab === 'privacy-policy' && (
              <>
                <section id="privacy-intro" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Intangiriro' : 'Introduction'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Duha agaciro gakomeye umutekano w'amakuru yawe bwite. Iyi politiki isobanura ubwoko bw'amakuru akusanywa igihe wiyandikisha, igihe ushaka akazi cyangwa umukozi, n'ingamba z'ikoranabuhanga zikoreshwa mu kuyarinda."
                      : 'We take the protection of personal data seriously. This Privacy Policy details the types of data collected during onboarding, placement, and payments, as well as the technical safeguards deployed to keep records confidential.'}
                  </p>
                </section>

                <section id="data-collected" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Amakuru Akusanywa' : 'Information Collected'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? 'Kugira ngo dutange serivisi zizewe kandi zizewe, dukusanya amakuru akurikira:'
                      : 'To deliver verified workforce services, the following records are securely gathered:'}
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-[16px] leading-[26px] text-[#202124]">
                    <li>
                      <strong className="text-gray-900">
                        {isRw ? "Umwirondoro w'Irangamuntu: " : 'National Identification: '}
                      </strong>
                      {isRw
                        ? "Imibare 16 y'irangamuntu (NIDA), amazina yose, itariki y'amavuko, n'ifoto y'ifashishwa mu irangamuntu."
                        : 'NIDA 16-digit identity numbers, names, birth dates, and biometric registration photos.'}
                    </li>
                    <li>
                      <strong className="text-gray-900">
                        {isRw ? "Aderesi n'Imyirondoro yo Gutumanaho: " : 'Household and Contact Details: '}
                      </strong>
                      {isRw
                        ? 'Nimero za terefone, umurenge n’akarere uherereyemo, n’umuntu wagutabara mu gihe cy’impanuka.'
                        : 'Contact phone numbers, residential sector addresses, and emergency points of contact.'}
                    </li>
                    <li>
                      <strong className="text-gray-900">
                        {isRw ? "Amakuru y'Amasezerano: " : 'Employment Contracts: '}
                      </strong>
                      {isRw
                        ? "Umushahara wumvikanyweho, itariki yo gutangira, n'inyandiko y'ikigo cyashatse umukozi."
                        : 'Agreed wages, start dates, placement agency vouchers, and contractual milestones.'}
                    </li>
                    <li>
                      <strong className="text-gray-900">
                        {isRw ? "Amakuru yo Kwishyura: " : 'Payment Records: '}
                      </strong>
                      {isRw
                        ? "Inomero za tranzagisiyo za MTN Mobile Money n'ibimenyetso by'ubwishyu."
                        : 'Mobile Money transaction reference codes and escrow settlement timestamps.'}
                    </li>
                  </ul>
                </section>

                <section id="data-purpose" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Impamvu Amakuru Akusanywa' : 'Why Data is Collected'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Amakuru akusanywa akoreshwa gusa mu kwemeza imyirondoro y'abakozi, gutegura amasezerano yemewe, guhererekanya imishahara, gufasha Polisi n'ubugenzacyaha mu gihe hari raporo y'ikibazo yatanzwe, no kubahiriza amategeko y'igihugu."
                      : 'Collected records are used exclusively to verify worker identities, generate legal contracts, process wage disbursements, support police investigations when incidents are filed, and ensure regulatory compliance.'}
                  </p>
                </section>

                <section id="privacy-controls" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Uburenganzira ku Makuru Yawe' : 'Your Privacy Controls'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Ufite uburenganzira bwo kureba amakuru yakwanditsweho, gukuraho inyandiko za PDF z'amasezerano wasinye, no guhindura uburyo bwo kwakira ubutumwa binyuze kuri konti yawe."
                      : 'You can inspect your registered information, download signed PDF contracts, and manage notification channels at any time through your authenticated user account.'}
                  </p>
                </section>

                <section id="data-sharing" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Gusangiza Amakuru n’Inzego Zemewe' : 'Authorized Data Sharing'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Ntidushobora kugurisha amakuru yawe na rimwe. Amakuru asangizwa gusa n'abafatanyabikorwa bemewe n'amategeko: NIDA mu kwemeza irangamuntu, MTN Rwanda mu guhererekanya imishahara kuri Mobile Money, n'inzego z'umutekano igihe hari ikirego cyatanzwe mu buryo bwemewe."
                      : 'We never sell personal information. Data is shared strictly with authorized partners: NIDA for identity validation, MTN Rwanda for Mobile Money payouts, and law enforcement agencies when a formal incident report is lodged.'}
                  </p>
                </section>

                <section id="data-security" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Umutekano n’Ububiko bw’Amakuru' : 'Data Security and Storage'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Ububiko bw'amakuru burinzwe hakoreshejwe uburyo bwa TLS 1.3 mu ihererekanya n'uburyo bwa AES-256 mu kubika. Kugeraho amakuru bigengwa n'inzira zikomeye z'uburenganzira bwa buri rwego."
                      : 'Sensitive databases are protected using TLS 1.3 encryption in transit and AES-256 encryption at rest. Access controls enforce strict role-based authorization to prevent unauthorized viewing.'}
                  </p>
                </section>

                <section id="data-retention" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Kubika Amakuru no Gusiba Konti' : 'Retention and Deletion Rights'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Inyandiko z'amasezerano n'ibimenyetso by'ubwishyu bibikwa mu gihe giteganywa n'amategeko y'umurimo mu Rwanda. Umukoresha cyangwa umukozi ashobora gusaba gufunga konti igihe amasezerano yose yarangiye nta makimbirane ahari."
                      : 'Employment contracts and financial ledgers are preserved in accordance with statutory Rwandan labor retention periods. Users may request account deactivation and personal data removal upon completion of active contracts.'}
                  </p>
                </section>

                <section id="regulatory-compliance" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Gukurikiza Amategeko y’u Rwanda' : 'Compliance with Regulators'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Imikorere yacu yubahiriza Itegeko No 058/2021 ryo ku wa 13/10/2021 rigenga kurinda amakuru bwite n'imibereho bwite y'umuntu mu Rwanda, rigengwa n'Urwego rw'Igihugu rushinzwe Umutekano w'Ikoranabuhanga (NCSA)."
                      : 'Our operations adhere to Law No. 058/2021 relating to the protection of personal data and privacy in Rwanda, supervised by the National Cyber Security Authority (NCSA).'}
                  </p>
                </section>
              </>
            )}

            {/* TERMS OF SERVICE CONTENT */}
            {activeTab === 'terms-of-service' && (
              <>
                <section id="terms-acceptance" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Ibyemererwa n’Ibisabwa' : 'Acceptance and Eligibility'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Iyo wiyandikishije nka nyirurugo, umukozi wo mu rugo, cyangwa ikigo gishaka abakozi, uba wemeye kugengwa n'aya mategeko n'amabwiriza. Buri mukoresha agomba kuba afite nibura imyaka 18 y'amavuko kandi afite indangamuntu yemewe yatanzwe na NIDA."
                      : 'By registering an account as an employer, domestic worker, or placement agency, you accept these Terms of Service. All participants must be at least 18 years old and hold a verified Rwandan National ID card.'}
                  </p>
                </section>

                <section id="employer-standards" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? "Inshingano z'Umukoresha" : 'Employer Responsibilities'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Umukoresha yiyemeje gutanga umutekano n'isuku ahabera akazi, kwishyura umushahara wumvikanyweho buri kwezi abicishije kuri konti y'urubuga, kubaha amasaha yo kuruhuka, no kutafatira ibyangombwa by'umukozi ku gahato."
                      : 'Employers agree to provide safe working conditions, pay agreed monthly salaries through the platform escrow, respect statutory rest periods, and refrain from withholding personal documents or identity cards.'}
                  </p>
                </section>

                <section id="worker-standards" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? "Inshingano z'Umukozi wo mu Rugo" : 'Domestic Worker Commitments'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Umukozi wo mu rugo yiyemeje gukora inshingano ze mu bunyangamugayo no kubaha amasezerano, kubaha ibanga n'umutungo w'urugo akoreramo, no gutanga integuza igihe yifuza guhagarika akazi."
                      : 'Domestic workers commit to performing duties professionally in accordance with the agreed contract, respecting household privacy and property, and providing standard notice in the event of resignation.'}
                  </p>
                </section>

                <section id="momo-escrow" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Kwishyura no Kubika Amafaranga kuri MoMo' : 'Mobile Money and Placement Escrow'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Amafaranga yo gushaka umukozi abikwa neza kugeza igihe ibyangombwa byemejwe. Imishahara ya buri kwezi yoherezwa mu buryo butaziguye kuri nimero ya MTN Mobile Money y'umukozi ikaza iherekejwe n'ubutumwa bwemeza ubwishyu."
                      : "Placement fees are held in escrow until verification is finalized. Monthly salaries are transferred securely to the worker's registered MTN Mobile Money account with automated transaction receipts."}
                  </p>
                </section>

                <section id="dispute-escalation" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Gukemura Impaka n’Amakimbirane' : 'Disputes and Incident Escalation'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Kurenga ku masezerano cyangwa amakimbirane hagati y'umukoresha n'umukozi bishyikirizwa ubuyobozi bwa Ekaze mu buryo bw'ikoranabuhanga. Ibibazo bikomeye cyangwa ibyaha byoherezwa kuri sitasiyo ya Polisi y'u Rwanda n'ubugenzacyaha bibifitiye ububasha."
                      : 'Any breach of contract, property grievance, or workplace dispute must be logged via the platform. Unresolved or severe cases are escalated directly to authorized Rwanda National Police stations.'}
                  </p>
                </section>

                <section id="account-termination" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Guhagarika Amasezerano na Konti' : 'Contract Termination and Suspension'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Amasezerano ashobora guhagarikwa mu bwumvikane bw'impande zombi cyangwa hatanzwe integuza iteganywa n'amasezerano. Konti yose igaragayeho uburiganya, gukoresha irangamuntu itari iyawe, cyangwa kwanga kwishyura umukozi ihagarikwa ako kanya."
                      : 'Contracts may be ended upon mutual agreement or with notice as stipulated in the agreement. Accounts found submitting fraudulent identities or engaging in wage theft are subject to immediate suspension.'}
                  </p>
                </section>

                <section id="governing-law" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Amategeko Agenga u Rwanda' : 'Governing Law of Rwanda'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Aya mabwiriza n'amasezerano agengwa n'amategeko ya Repubulika y'u Rwanda, by'umwihariko Itegeko No 66/2018 ryo ku wa 30/08/2018 rigenga umurimo mu Rwanda."
                      : 'These terms are governed by and construed under the laws of the Republic of Rwanda, including Law No. 66/2018 regulating labor in Rwanda.'}
                  </p>
                </section>
              </>
            )}

            {/* LEGAL HELP CONTENT */}
            {activeTab === 'legal-help' && (
              <>
                <section id="legal-overview" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Incamake ku Bufasha bw’Amategeko' : 'Legal Assistance Overview'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Ikipe yacu ishinzwe gukurikirana iyubahirizwa ry'amategeko itanga ubufasha n'ubuhuza mu mibanire y'abakoresha n'abakozi bo mu ngo, ifasha impande zombi kubahiriza uburenganzira n'inshingano byabo."
                      : 'Our compliance team provides legal and mediation assistance for domestic employment relationships. We ensure labor agreements respect national legal standards and rights for all parties.'}
                  </p>
                </section>

                <section id="contract-mediation" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Ubuhuza n’Uburenganzira mu Masezerano' : 'Contract Mediation and Rights'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Iyo havutse impaka zishingiye ku nshingano, imiterere y'akazi, cyangwa kwishyurwa kw'imishahara, inzobere zacu zifasha impande zombi kugera ku bwumvikane mu mahoro bishingiye ku mategeko y'umurimo."
                      : 'If disagreements arise regarding duties, working conditions, or salary payouts, our support specialists facilitate amicable mediation in alignment with Rwandan labor regulations.'}
                  </p>
                </section>

                <section id="police-cooperation" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Gukurikirana Ibibazo na Polisi y’u Rwanda' : 'Police and Incident Reviews'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Dufite uburyo bworoshye bwo guhanahana amakuru n'inzego za Polisi y'Igihugu n'Ubugenzacyaha (RIB) kugira ngo zibashe gusuzuma dosiye, ibimenyetso byashyizweho, no gukurikirana ibirego byatanzwe."
                      : 'We maintain an integrated channel for Rwanda National Police officers to review case files, examine uploaded proofs, and follow up on formal reports.'}
                  </p>
                </section>

                <section id="labor-standards" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Kubahiriza Amategeko ya MIFOTRA' : 'Rwandan Labor Law Compliance'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
                    {isRw
                      ? "Amabwiriza yacu yubahiriza amabwiriza n'amabwiriza shingiro atangwa na Minisiteri y'Abakozi ba Leta n'Umurimo (MIFOTRA), hagamijwe kurinda umukozi wo mu rugo akarengane no guhabwa agaciro akwiye."
                      : 'Our policies incorporate regulations issued by the Ministry of Public Service and Labour (MIFOTRA), guaranteeing domestic workers fair compensation and safe working hours.'}
                  </p>
                </section>

                <section id="contact-legal" className="space-y-3 scroll-mt-24">
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw ? 'Kuvugana n’Ishami ry’Amategeko' : 'Contact Legal Support'}
                  </h2>
                  <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-2 text-[16px] leading-[26px] text-[#202124]">
                    <p>
                      <strong className="text-gray-900">
                        {isRw ? 'Imeli: ' : 'Email: '}
                      </strong>
                      legal@ekazepay.rw
                    </p>
                    <p>
                      <strong className="text-gray-900">
                        {isRw ? 'Ibiro: ' : 'Office: '}
                      </strong>
                      Kigali Innovation City, Gasabo, Kigali, Rwanda
                    </p>
                    <p>
                      <strong className="text-gray-900">
                        {isRw ? 'Ubutabazi bwihuse: ' : 'Emergency Support: '}
                      </strong>
                      {isRw
                        ? 'Buri munsi masaha 24/7 binyuze kuri ubu buryo bwo gutanga raporo.'
                        : 'Available 24/7 via the in-app feedback channel.'}
                    </p>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HelpCenterPage;
