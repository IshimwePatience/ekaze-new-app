import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import EmployerLayout from "@/components/employer/EmployerLayout";
import EmployerStats from "@/components/employer/EmployerStats";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { EmployerTabType } from "@/types/employer.types";
import { WorkerDetailModal } from "@/components/employer/employerFilter/employer/WorkerDetailModal";
import { usePublicWorkerSearch, useAuthenticatedWorkerSearch } from "@/hooks/useWorkerSearch";
import { workerApi } from "@/api/workerService";
import ActiveWorkers from "@/components/employer/ActiveWorkers";
import IncidentManagement from "@/components/employer/IncidentManagement";
import TransactionHistory from "@/components/employer/TransactionHistory";
import HiringRequestManagement from "@/components/employer/HiringRequestManagement";
import EmployerProfilePage from "@/components/employer/EmployerProfile";
import EmployerPaymentSchedules from "@/components/employer/EmployerPaymentSchedules";
import EmployerWorkerMap from "@/components/employer/EmployerWorkerMap";
import EmployerCalendar from "@/components/employer/EmployerCalendar";

const formatWorkerForModal = (w: any, fallbackPhoto?: string | null): any => {
  if (!w) return null;
  const rawPhoto = w.photo || w.profile_photo || w.user?.profile_photo || w.user?.avatar || w.avatar || fallbackPhoto || (typeof window !== 'undefined' ? sessionStorage.getItem('auto_open_worker_photo') : null);
  let photoUrl: string | null = null;
  if (rawPhoto && rawPhoto !== 'null' && rawPhoto !== 'undefined' && rawPhoto !== '') {
    if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) {
      photoUrl = rawPhoto;
    } else {
      const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:5000';
      photoUrl = `${baseUrl.replace(/\/$/, '')}/${rawPhoto.replace(/^\//, '')}`;
    }
  }

  const slots = Array.isArray(w.availability_slots)
    ? w.availability_slots
    : Array.isArray(w.extended_profile?.availability_slots)
    ? w.extended_profile.availability_slots
    : [];
  const openSlots = slots.filter((s: any) => !(s.is_booked || s.is_hired || s.employer_id));
  const isPartTime =
    w.shift_type === 'part_time' ||
    w.shift_type === 'partial' ||
    (Array.isArray(w.work_type_preferences) &&
      (w.work_type_preferences.includes('part_time') || w.work_type_preferences.includes('partial')) &&
      !w.work_type_preferences.includes('full_time')) ||
    slots.length > 0;

  const isHired =
    isPartTime && slots.length > 0
      ? openSlots.length === 0
      : w.availability_status === 'hired' || Boolean(w.is_hired);
  const isAvailable = isHired ? false : (w.availability_status === 'available' || w.isAvailable === true || (isPartTime && openSlots.length > 0));

  return {
    id: w.id,
    uuid: w.uuid || `f47ac10b-58cc-4372-a567-${String(w.id).padStart(12, '0')}`,
    firstName: w.first_name || w.user?.name || w.firstName || 'Worker',
    lastName: w.last_name || w.lastName || '',
    first_name: w.first_name || w.user?.name || w.firstName || 'Worker',
    last_name: w.last_name || w.lastName || '',
    photo: photoUrl,
    profile_photo: photoUrl,
    rating: parseFloat(String(w.average_rating || w.rating || 5.0)),
    reviewCount: w.total_ratings || w.review_count || w.reviewCount || 0,
    total_ratings: w.total_ratings || w.review_count || w.reviewCount || 0,
    salaryMin: parseFloat(w.min_salary || w.salary_min || w.expected_salary || 50000),
    salaryMax: parseFloat(w.max_salary || w.salary_max || (w.expected_salary ? Math.round(w.expected_salary * 1.5) : 100000)),
    min_salary: String(w.min_salary || w.salary_min || w.expected_salary || 50000),
    max_salary: String(w.max_salary || w.salary_max || (w.expected_salary ? Math.round(w.expected_salary * 1.5) : 100000)),
    experienceLevel: w.experience_level || w.experience || 'Experienced',
    experience_level: w.experience_level || w.experience || 'intermediate',
    location: w.district || w.location || 'Kigali',
    district: w.district || w.location || 'Kigali',
    sector: w.sector || 'Gasabo',
    languages: w.languages || w.languages_spoken || ['Kinyarwanda', 'English'],
    languages_spoken: w.languages || w.languages_spoken || ['Kinyarwanda', 'English'],
    availability_status: isHired ? 'hired' : (w.availability_status === 'unavailable' ? 'unavailable' : 'available'),
    is_hired: isHired,
    isAvailable: isAvailable,
    age: w.age || 25,
    fee: w.contact_unlock_fee || w.fee || 5000,
    skills: w.skills || [],
    workTypes: w.workTypes || w.work_type_preferences || [w.category || 'Worker'],
    work_type_preferences: w.work_type_preferences || w.workTypes || [w.category || 'Worker'],
    type: w.registration_type === 'company' ? 'company' : 'freelance',
    registration_type: w.registration_type || 'freelance',
    shift_type: isPartTime ? 'part_time' : (w.shift_type || 'full_time'),
    availability_slots: slots,
  };
};

const EmployerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedWorkerForModal, setSelectedWorkerForModal] = useState<any>(null);
  const handledWorkerRef = useRef<string | null>(null);

  const publicSearch = usePublicWorkerSearch({ per_page: 50 });
  const authenticatedSearch = useAuthenticatedWorkerSearch({ per_page: 50 });

  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
  };

  const realWorkers = useMemo(() => {
    return extractArray(publicSearch.data).concat(extractArray(authenticatedSearch.data));
  }, [publicSearch.data, authenticatedSearch.data]);

  const defaultAvailableWorker = useMemo(() => {
    const available = realWorkers.find(
      (w: any) => w.availability_status !== 'hired' && !w.is_hired && w.isAvailable !== false
    );
    return formatWorkerForModal(available || realWorkers[0]);
  }, [realWorkers]);

  const normalizeEmployerTab = (tab: string | null): EmployerTabType => {
    if (!tab) return "overview";
    if (tab === "workers" || tab === "active") return "active";
    if (tab === "calendar" || tab === "schedule") return "calendar";
    if (tab === "transactions" || tab === "payments") return "payments";
    if (tab === "hiring-requests" || tab === "requests" || tab === "request") return "request";
    if (tab === "payment-schedules" || tab === "schedules") return "schedules";
    if (tab === "incidents") return "incidents";
    if (tab === "profile" || tab === "settings") return "profile";
    if (tab === "map") return "map";
    if (tab === "overview" || tab === "dashboard") return "overview";
    return (tab as EmployerTabType) || "overview";
  };

  const getInitialTab = (): EmployerTabType => {
    const rawTab = searchParams.get("tab");
    if (rawTab && rawTab !== "search") return normalizeEmployerTab(rawTab);
    const localTab = localStorage.getItem("employer_active_tab");
    if (localTab && localTab !== "search") return normalizeEmployerTab(localTab);
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<EmployerTabType>(getInitialTab);

  const workerIdFromUrl = searchParams.get("workerId") || searchParams.get("autoOpenWorkerId");
  const tabFromUrl = searchParams.get("tab");

  useEffect(() => {
    const rawWorkerId =
      workerIdFromUrl ||
      sessionStorage.getItem("auto_open_worker_id");
    const storedPhoto = sessionStorage.getItem("auto_open_worker_photo");
    const normalizedTab = normalizeEmployerTab(tabFromUrl);

    if (rawWorkerId && handledWorkerRef.current !== rawWorkerId) {
      handledWorkerRef.current = rawWorkerId;
      sessionStorage.removeItem("auto_open_worker_id");
      let numericId = rawWorkerId;
      if (rawWorkerId.startsWith("f47ac10b-58cc-4372-a567-")) {
        numericId = String(parseInt(rawWorkerId.replace("f47ac10b-58cc-4372-a567-", ""), 10));
      }

      // Open the modal if found in list
      const foundInList = realWorkers.find(
        (w: any) => String(w.id) === String(numericId) || String(w.uuid) === String(rawWorkerId)
      );

      if (foundInList) {
        setSelectedWorkerForModal(formatWorkerForModal(foundInList, storedPhoto));
        setIsSearchModalOpen(true);
      }

      // Fetch fresh details from API once
      workerApi
        .getPublicWorkerDetails(Number(numericId))
        .then((res) => {
          if (res.success && res.data) {
            setSelectedWorkerForModal(formatWorkerForModal(res.data, storedPhoto));
            setIsSearchModalOpen(true);
          }
        })
        .catch((err) => {
          console.error("Failed to load selected worker for modal:", err);
        });

      // Clean workerId from URL after initiating open so future tab switches don't re-trigger
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("workerId");
      nextParams.delete("autoOpenWorkerId");
      if (tabFromUrl === "search") {
        nextParams.set("tab", "overview");
      }
      setSearchParams(nextParams, { replace: true });

      if (tabFromUrl && normalizedTab !== "overview" && tabFromUrl !== "search") {
        setActiveTab(normalizedTab);
      }
    } else if (tabFromUrl === "search") {
      setIsSearchModalOpen(true);
      setActiveTab("overview");
      setSearchParams({ tab: "overview" }, { replace: true });
    } else if (tabFromUrl) {
      setActiveTab(normalizedTab);
      localStorage.setItem("employer_active_tab", normalizedTab);
    }
  }, [workerIdFromUrl, tabFromUrl, realWorkers]);

  const handleTabChange = (tab: EmployerTabType) => {
    if (tab === "search") {
      setIsSearchModalOpen(true);
      return;
    }
    setActiveTab(tab);
    localStorage.setItem("employer_active_tab", tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const tab = e?.detail || localStorage.getItem("employer_active_tab");
      if (tab === "search" || tab === "open-worker-search") {
        setIsSearchModalOpen(true);
      } else if (tab) {
        handleTabChange(tab as EmployerTabType);
      }
    };
    const handleOpenSearch = () => setIsSearchModalOpen(true);

    window.addEventListener("employer-navigate", handleNavigate as EventListener);
    window.addEventListener("dashboard-navigate", handleNavigate as EventListener);
    window.addEventListener("open-worker-search", handleOpenSearch as EventListener);
    return () => {
      window.removeEventListener("employer-navigate", handleNavigate as EventListener);
      window.removeEventListener("dashboard-navigate", handleNavigate as EventListener);
      window.removeEventListener("open-worker-search", handleOpenSearch as EventListener);
    };
  }, []);

  const getSidebar = () => {
    return <EmployerSidebar />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
      case "search":
        return <EmployerStats onOpenWorkerSearch={() => setIsSearchModalOpen(true)} />;
      case "active":
        return <ActiveWorkers />;
      case "calendar":
        return <EmployerCalendar />;
      case "verify":
        return <ActiveWorkers initialTab="verify" />;
      case "request":
        return <HiringRequestManagement />;
      case "incidents":
        return <IncidentManagement />;
      case "payments":
        return <TransactionHistory />;
      case "profile":
        return <EmployerProfilePage />;
      case "schedules":
        return <EmployerPaymentSchedules />;
      case "map":
        return <EmployerWorkerMap />;
      default:
        return <EmployerStats onOpenWorkerSearch={() => setIsSearchModalOpen(true)} />;
    }
  };

  return (
    <>
      <EmployerLayout 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        sidebar={getSidebar()}
      >
        {renderContent()}
      </EmployerLayout>

      {/* Direct Split Cover Modal for Real Worker on Dashboard */}
      <WorkerDetailModal
        worker={selectedWorkerForModal || defaultAvailableWorker}
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSelectedWorkerForModal(null);
        }}
        isAuthenticated={true}
      />
    </>
  );
};

export default EmployerDashboard;
