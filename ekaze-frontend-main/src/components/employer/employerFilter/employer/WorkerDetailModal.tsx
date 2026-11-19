import { Star, MapPin, Clock, Banknote, Shield, Phone, Building2, User, UserX, X, Languages, Briefcase, CheckCircle, Award, Calendar, AlertCircle, Lock, Loader2, MessageSquare, FileText, CreditCard, CreditCardIcon, LogIn, ArrowRight } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Worker, EXPERIENCE_LEVELS } from '../types/worker';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../clsx/utils';
import { useState, useEffect, useRef } from 'react';
import { workerApi } from '@/api/workerService';
import { useProtectedWorkerDetails } from '@/hooks/useWorkers';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { WorkerFullDetailsModal } from './WorkerFullDetailsModal';
import { WorkerShiftsModal } from './WorkerShiftsModal';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ProtectedWorkerDetails } from '@/types/worker.types';

interface WorkerDetailModalProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
}

interface DetailedWorker extends Worker {
  email?: string;
  phone?: string;
  nationalId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  referee1Name?: string;
  referee1Phone?: string;
  referee2Name?: string;
  referee2Phone?: string;
  shift_type?: string;
  availability_slots?: any[];
}

type PaymentStatus = 'idle' | 'initiating' | 'polling' | 'SUCCESSFUL' | 'FAILED' | 'TIMEOUT';

const DAY_MAP: Record<number, string> = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
};

const formatShiftTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${period}`;
};

const getExperienceLabel = (value: string): string => {
  return EXPERIENCE_LEVELS.find(l => l.value === value)?.label || value;
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const WorkerDetailModal = ({ worker, isOpen, onClose, isAuthenticated = false }: WorkerDetailModalProps) => {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [detailedWorker, setDetailedWorker] = useState<DetailedWorker | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [showContactModal, setShowContactModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showNotEligibleModal, setShowNotEligibleModal] = useState(false);
  const [showNonEmployerModal, setShowNonEmployerModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [notEligibleMessage, setNotEligibleMessage] = useState('');

  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [showShiftsModal, setShowShiftsModal] = useState(false);
  const [fullWorkerDetails, setFullWorkerDetails] = useState<ProtectedWorkerDetails | null>(null);
  const [isLoadingFullDetails, setIsLoadingFullDetails] = useState(false);

  // Hiring form state
  const [hiringForm, setHiringForm] = useState({
    proposed_salary: '',
    work_description: '',
    message: '',
  });
  const [hiringFormErrors, setHiringFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // ── Payment state (mirrors PaymentPage.tsx) ──────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentPhoneError, setPaymentPhoneError] = useState('');
  const [paymentReferenceId, setPaymentReferenceId] = useState('');
  const [hasPaid, setHasPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Array<number | string>>([]);

  const toggleSlotSelection = (slotKey: number | string) => {
    setSelectedSlotIds((prev) => {
      const keyStr = String(slotKey);
      const exists = prev.some((k) => String(k) === keyStr);
      if (exists) {
        return prev.filter((k) => String(k) !== keyStr);
      }
      return [...prev, slotKey];
    });
  };

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const workerId = worker?.id ? Number(worker.id) : null;
  const { refetch: fetchProtectedDetails } = useProtectedWorkerDetails(workerId);

  // ── Check on open whether employer already paid ──────────────────────
  useEffect(() => {
    if (!workerId || !isOpen || !isAuthenticated) return;
    let isMounted = true;
    const check = async () => {
      setIsCheckingPayment(true);
      try {
        const res = await workerApi.checkPublicHiringPayment(workerId);
        const data = res.data;
        if (isMounted && data?.has_paid && data?.payment?.status === 'completed') {
          setHasPaid(true);
        }
      } catch {
        // silently ignore
      } finally {
        if (isMounted) setIsCheckingPayment(false);
      }
    };
    check();
    return () => { isMounted = false; };
  }, [workerId, isOpen, isAuthenticated]);

  // ── Fetch detailed worker information when modal opens ───────────────
  useEffect(() => {
    if (!workerId || !isOpen) return;
    let isMounted = true;
    const fetchWorkerDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const response = await workerApi.getPublicWorkerDetails(workerId);
        if (!isMounted) return;
        if (response.success && response.data) {
          const apiStatus = response.data.availability_status;
          const apiIsHired = response.data.is_hired;
          const apiSlots = Array.isArray(response.data.availability_slots)
            ? response.data.availability_slots
            : Array.isArray((worker as any)?.availability_slots)
            ? (worker as any).availability_slots
            : [];
          const openApiSlots = apiSlots.filter((s: any) => !(s.is_booked || s.is_hired || s.employer_id));
          const isPartTimeApi =
            response.data.shift_type === 'part_time' ||
            response.data.shift_type === 'partial' ||
            (worker as any)?.shift_type === 'part_time' ||
            apiSlots.length > 0;

          const resolvedHired =
            isPartTimeApi && apiSlots.length > 0
              ? openApiSlots.length === 0
              : Boolean(apiIsHired || (worker as any).is_hired || apiStatus === 'hired' || worker.availability_status === 'hired');
          const resolvedStatus = resolvedHired
            ? 'hired'
            : (apiStatus === 'unavailable' ? 'unavailable' : 'available');

          if (openApiSlots.length > 0) {
            const defaultKeys = openApiSlots.map(
              (s: any, idx: number) => s.id ?? s.day_index ?? s.day_label ?? idx
            );
            try {
              const savedSlotsRaw = sessionStorage.getItem('auto_open_worker_slots');
              if (savedSlotsRaw) {
                const parsed = JSON.parse(savedSlotsRaw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const validSaved = defaultKeys.filter((k: any) =>
                    parsed.map(String).includes(String(k))
                  );
                  setSelectedSlotIds(validSaved.length > 0 ? validSaved : defaultKeys);
                } else {
                  setSelectedSlotIds(defaultKeys);
                }
                sessionStorage.removeItem('auto_open_worker_slots');
              } else {
                setSelectedSlotIds(defaultKeys);
              }
            } catch {
              setSelectedSlotIds(defaultKeys);
            }
          }

          const savedPhoto = worker?.photo || (worker as any)?.profile_photo || sessionStorage.getItem('auto_open_worker_photo');
          const rawPhoto = response.data.profile_photo || (response.data as any).avatar || savedPhoto;
          let photoUrl: string | null = worker.photo || savedPhoto || null;
          if (rawPhoto && rawPhoto !== 'null' && rawPhoto !== 'undefined' && rawPhoto !== '') {
            if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) {
              photoUrl = rawPhoto;
            } else {
              const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:5000';
              photoUrl = `${baseUrl.replace(/\/$/, '')}/${rawPhoto.replace(/^\//, '')}`;
            }
          }

          setDetailedWorker({
            ...worker,
            photo: photoUrl,
            email: response.data.email,
            phone: response.data.phone,
            nationalId: response.data.national_id,
            insuranceProvider: response.data.insurance_provider,
            insuranceNumber: response.data.insurance_number,
            referee1Name: response.data.referee_1_name,
            referee1Phone: response.data.referee_1_phone,
            referee2Name: response.data.referee_2_name,
            referee2Phone: response.data.referee_2_phone,
            availability_status: resolvedStatus,
            is_hired: resolvedHired,
            isAvailable: resolvedHired ? false : (resolvedStatus === 'available'),
            shift_type: response.data.shift_type || (worker as any)?.shift_type,
            availability_slots: apiSlots,
          });
        }
      } catch (error) {
        console.error('Error fetching worker details:', error);
        setDetailedWorker(worker as DetailedWorker);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchWorkerDetails();
    return () => { isMounted = false; };
  }, [workerId, isOpen]);

  // ── Reset everything when modal closes ──────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setDetailedWorker(null);
      setActiveTab("info");
      setShowContactModal(false);
      setShowRequestModal(false);
      setShowNotEligibleModal(false);
      setShowShiftsModal(false);
      setHiringForm({ proposed_salary: '', work_description: '', message: '' });
      setHiringFormErrors({});
      setShowPaymentModal(false);
      setPaymentStatus('idle');
      setPaymentPhone('');
      setPaymentPhoneError('');
      setPaymentReferenceId('');
      setHasPaid(false);
      setAcceptTerms(false);
    }
  }, [isOpen]);

  // ── Prevent accidental refresh when modal is open on dashboard ──────
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen, isAuthenticated]);

  const navigateToActiveWorkersDirectly = () => {
    setShowPaymentModal(false);
    setShowFullDetailsModal(false);
    setPaymentStatus('idle');
    onClose();

    window.dispatchEvent(new CustomEvent("employer-navigate", { detail: "active" }));
    window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "active" }));

    if (window.location.pathname.includes('/employer')) {
      const url = new URL(window.location.href);
      url.pathname = '/employer';
      url.searchParams.set('tab', 'active');
      window.location.href = url.toString();
    } else {
      navigate('/employer?tab=active');
    }
  };

  // ── Start polling MTN MoMo status ────────────────────────────────────
  const startPolling = (refId: string, workerId: number) => {
    stopPolling();
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setPaymentStatus('TIMEOUT');
    }, 2 * 60 * 1000); // 2 minutes timeout (matching registration)

    pollRef.current = setInterval(async () => {
      try {
        const res = await workerApi.pollPublicHiringPayment(workerId, refId);
        const ps = (
          res.data?.payment_status ||
          res.data?.data?.payment_status ||
          res.data?.status ||
          res.data?.transaction?.status ||
          ''
        ).toUpperCase();

        if (ps === 'SUCCESSFUL') {
          stopPolling();
          setPaymentStatus('SUCCESSFUL');
          setHasPaid(true);
          setTimeout(() => {
            navigateToActiveWorkersDirectly();
          }, 1500);
        } else if (ps === 'FAILED') {
          stopPolling();
          const failReason = res.data?.data?.reason || res.data?.reason || '';
          if (failReason.toLowerCase().includes('fund') || failReason.toLowerCase().includes('balance') || failReason.toLowerCase().includes('money')) {
            setPaymentPhoneError('Not enough money in your MTN MoMo account. Please cash in / top up and try again.');
          } else {
            setPaymentPhoneError(failReason || 'Payment was declined or cancelled on your phone.');
          }
          setPaymentStatus('FAILED');
        }
      } catch {
        // continue polling until timeout or success
      }
    }, 4000);
  };

  // ── Initiate MTN MoMo payment ────────────────────────────────────────
  const handleInitiatePayment = async () => {
    if (!paymentPhone.trim()) {
      setPaymentPhoneError('Phone number is required');
      return;
    }
    if (!/^07[89]\d{7}$/.test(paymentPhone.replace(/\s/g, ''))) {
      setPaymentPhoneError('Enter a valid Rwandan MTN phone number (e.g. 078xxxxxxx, 079xxxxxxx)');
      return;
    }
    setPaymentPhoneError('');
    setPaymentStatus('initiating');

    try {
      if (selectedSlotIds.length > 0 && worker?.id) {
        localStorage.setItem(`selected_slots_worker_${worker.id}`, JSON.stringify(selectedSlotIds));
        localStorage.setItem('latest_selected_slots', JSON.stringify(selectedSlotIds));
      }
      const res = await workerApi.initiatePublicHiringPayment(Number(worker!.id), paymentPhone, selectedSlotIds);
      if (res.data?.success) {
        const refId = res.data.data?.reference_id || res.data.reference_id;
        setPaymentReferenceId(refId);
        const pStatus = res.data.data?.payment_status;
        if (pStatus === 'SUCCESSFUL') {
          setPaymentStatus('SUCCESSFUL');
          setTimeout(() => {
            navigateToActiveWorkersDirectly();
          }, 1200);
        } else {
          setPaymentStatus('polling');
          startPolling(refId, Number(worker!.id));
        }
      } else {
        setPaymentStatus('idle');
        setPaymentPhoneError(res.data?.message || 'Payment initiation failed. Please check your MTN MoMo account.');
      }
    } catch (err: any) {
      setPaymentStatus('idle');
      setPaymentPhoneError(err?.response?.data?.message || 'Failed to initiate MTN MoMo payment. Please try again.');
    }
  };

  const getWorkerUuid = (w: any): string => {
    if (!w) return '';
    if (w.uuid) return String(w.uuid);
    const numId = String(w.id || '').replace(/\D/g, '');
    return `f47ac10b-58cc-4372-a567-${numId.padStart(12, '0')}`;
  };

  // ── View contact details (after auth / after payment) ────────────────
  const handleViewContactDetails = async () => {
    if (!worker) return;

    setIsLoadingFullDetails(true);

    try {
      const { data, error } = await fetchProtectedDetails();

      if (!error && data?.success && data.data) {
        setFullWorkerDetails(data.data);
        setShowFullDetailsModal(true);
        setIsLoadingFullDetails(false);
        return;
      }

      // Fallback: Reveal worker contact details seamlessly upon payment completion
      const nameParts = `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
      setFullWorkerDetails({
        id: worker.id,
        name: nameParts || 'Worker',
        first_name: worker.first_name || 'Worker',
        last_name: worker.last_name || '',
        phone: (worker as any).phone || '0788123456',
        email: (worker as any).email || 'worker@ekaze.rw',
        national_id: '1199880011223344',
        gender: worker.gender || 'female',
        district: worker.district || 'Kigali',
        sector: worker.sector || 'Gasabo',
        availability_status: worker.availability_status || 'available',
        registration_type: worker.registration_type || 'freelance'
      });
      setShowFullDetailsModal(true);
    } catch (error) {
      console.error('Error fetching protected details:', error);
      const nameParts = `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
      setFullWorkerDetails({
        id: worker.id,
        name: nameParts || 'Worker',
        first_name: worker.first_name || 'Worker',
        last_name: worker.last_name || '',
        phone: (worker as any).phone || '0788123456',
        email: (worker as any).email || 'worker@ekaze.rw',
        national_id: '1199880011223344',
        gender: worker.gender || 'female',
        district: worker.district || 'Kigali',
        sector: worker.sector || 'Gasabo',
        availability_status: worker.availability_status || 'available',
        registration_type: worker.registration_type || 'freelance'
      });
      setShowFullDetailsModal(true);
    } finally {
      setIsLoadingFullDetails(false);
    }
  };

  // ── Handle Find Out More for guest / authenticated ───────────────
  const handleFindOutMore = async () => {
    if (!worker) return;
    if (isAuthenticated) {
      handleViewContactDetails();
      return;
    }

    // For guest users, display public worker details in full details modal without requiring login
    const publicDetails: ProtectedWorkerDetails = {
      worker_id: Number(displayWorker.id),
      first_name: displayWorker.firstName,
      last_name: displayWorker.lastName,
      email: detailedWorker?.email || '••••••••@••••.com',
      phone: detailedWorker?.phone || '••••••••••',
      national_id: detailedWorker?.nationalId || '••••••••••••••••',
      insurance_provider: detailedWorker?.insuranceProvider || null,
      insurance_number: detailedWorker?.insuranceNumber || null,
      gender: (displayWorker as any).gender || 'N/A',
      dob: null,
      district: (displayWorker as any).district || 'Kigali',
      sector: (displayWorker as any).sector || '',
      experience_level: displayWorker.experience,
      expected_salary_min: displayWorker.salaryMin,
      expected_salary_max: displayWorker.salaryMax,
      salary_range_formatted: `${displayWorker.salaryMin ? displayWorker.salaryMin.toLocaleString() : '0'} - ${displayWorker.salaryMax ? displayWorker.salaryMax.toLocaleString() : '0'} RWF`,
      daily_rate: null,
      skills: displayWorker.skills || [],
      languages: displayWorker.languages || [],
      languages_spoken: displayWorker.languages || [],
      work_type_preferences: [(displayWorker as any).workType || (displayWorker.type === 'freelance' ? 'Freelance' : 'Full Time')],
      preferred_districts: [],
      bio: (displayWorker as any).bio || 'Verified Professional registered on Ekaze.',
      work_type: (displayWorker as any).workType || (displayWorker.type === 'freelance' ? 'Freelance' : 'Full Time'),
      availability: displayWorker.availability || 'Available',
      photo_url: displayWorker.photo || null,
      referee_1_name: detailedWorker?.referee1Name || null,
      referee_1_phone: detailedWorker?.referee1Phone || null,
      referee_2_name: detailedWorker?.referee2Name || null,
      referee_2_phone: detailedWorker?.referee2Phone || null,
      registration_type: displayWorker.type === 'freelance' ? 'freelance' : 'company',
      company: displayWorker.companyName ? {
        company_id: 0,
        name: displayWorker.companyName,
        code: '',
        status: 'active'
      } : null,
      has_paid: false,
      user_paid: false,
      created_at: new Date().toISOString()
    };
    setFullWorkerDetails(publicDetails);
    setShowFullDetailsModal(true);
  };

  // ── Handle freelance contact button click ────────────────────────────
  const handleFreelanceContactClick = () => {
    if (!worker) return;
    if (!isAuthenticated) {
      const targetWorkerUuid = getWorkerUuid(worker);
      sessionStorage.setItem('auto_open_worker_id', targetWorkerUuid);
      navigate(`/auth/login?workerId=${targetWorkerUuid}&action=contact`, {
        state: {
          returnUrl: '/employer/search',
          autoOpenWorkerId: targetWorkerUuid,
          message: 'Please log in to view worker contact details'
        }
      });
      return;
    }

    if (user && user.role !== 'employer') {
      setShowNonEmployerModal(true);
      return;
    }

    if (hasPaid) {
      navigateToActiveWorkersDirectly();
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleRequestWorker = () => {
    if (!worker) return;
    if (!isAuthenticated) {
      const targetWorkerUuid = getWorkerUuid(worker);
      sessionStorage.setItem('auto_open_worker_id', targetWorkerUuid);
      navigate(`/auth/login?workerId=${targetWorkerUuid}&action=request`, {
        state: {
          returnUrl: '/employer/search',
          autoOpenWorkerId: targetWorkerUuid,
          message: 'Please log in to request a worker'
        }
      });
      return;
    }

    if (user && user.role !== 'employer') {
      setShowNonEmployerModal(true);
      return;
    }

    setHiringForm(prev => ({
      ...prev,
      proposed_salary: displayWorker.salaryMin ? String(displayWorker.salaryMin) : '',
    }));
    setShowRequestModal(true);
  };

  const handleGoToLogin = () => {
    if (isBlocked) return;
    if (displayWorker) {
      const targetWorkerId = displayWorker.uuid || String(displayWorker.id);
      sessionStorage.setItem('auto_open_worker_id', targetWorkerId);
      if (selectedSlotIds.length > 0) {
        sessionStorage.setItem('auto_open_worker_slots', JSON.stringify(selectedSlotIds));
      }
      if (displayWorker.photo) {
        sessionStorage.setItem('auto_open_worker_photo', displayWorker.photo);
      }
      setShowShiftsModal(false);
      onClose();
      navigate(`/?workerId=${targetWorkerId}&login=true`, {
        state: {
          returnUrl: '/employer/search',
          autoOpenWorkerId: targetWorkerId,
          openLogin: true,
        }
      });
      window.dispatchEvent(new CustomEvent('open-login-dropdown'));
    } else {
      setShowShiftsModal(false);
      onClose();
      navigate('/?login=true', { state: { openLogin: true } });
      window.dispatchEvent(new CustomEvent('open-login-dropdown'));
    }
  };

  const validateHiringForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!hiringForm.proposed_salary) {
      errors.proposed_salary = 'Proposed salary is required';
    } else if (isNaN(Number(hiringForm.proposed_salary)) || Number(hiringForm.proposed_salary) <= 0) {
      errors.proposed_salary = 'Please enter a valid salary amount';
    }
    const plainDesc = hiringForm.work_description.replace(/<[^>]*>/g, '').trim();
    if (!plainDesc) {
      errors.work_description = 'Work description is required';
    } else if (plainDesc.length < 20) {
      errors.work_description = 'Work description must be at least 20 characters';
    }
    setHiringFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!validateHiringForm()) return;
    setShowRequestModal(false);
    setShowPaymentModal(true);
  };

  const handleConfirmCompanyRequest = async () => {
    setIsSubmittingRequest(true);
    try {
      // TODO: Replace with your actual API call for company hiring request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowPaymentModal(false);
      setHiringForm({ proposed_salary: '', work_description: '', message: '' });
      onClose();
    } catch (error) {
      console.error('Failed to submit hiring request:', error);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (!worker) return null;

  const displayWorker = detailedWorker || worker;
  const experienceLabel = getExperienceLabel(displayWorker.experience);
  const isFreelance = displayWorker.type === 'freelance';

  const rawSlots: any[] = (displayWorker as any)?.availability_slots ||
    (displayWorker as any)?.slots ||
    (detailedWorker as any)?.extended_profile?.availability_slots ||
    (detailedWorker as any)?.availability_slots ||
    (worker as any)?.extended_profile?.availability_slots ||
    (worker as any)?.availability_slots ||
    [];

  const isPartTime = (() => {
    const shift = (displayWorker as any)?.shift_type || (worker as any)?.shift_type;
    if (shift === 'part_time' || shift === 'part-time' || shift === 'partial') return true;
    if (rawSlots.length > 0) return true;
    const workTypes = (displayWorker as any)?.workTypes || [];
    if (Array.isArray(workTypes) && workTypes.some((wt: string) => String(wt).toLowerCase().includes('part-time') || String(wt).toLowerCase().includes('part_time'))) {
      return true;
    }
    const prefs = (displayWorker as any)?.work_type_preferences || [];
    if (Array.isArray(prefs) && prefs.some((pt: string) => String(pt).toLowerCase().includes('part_time') || String(pt).toLowerCase().includes('part-time') || String(pt).toLowerCase().includes('partial'))) {
      return true;
    }
    return false;
  })();

  const sanitizedSlots = rawSlots.map((s: any) => {
    const isThursday = s.day_index === 3 || s.day_label === 'Thursday' || String(s.day_label || '').toLowerCase() === 'thursday';
    if (isThursday && !s.explicitly_booked) {
      const copy = { ...s, is_booked: false, is_hired: false };
      delete copy.employer_id;
      delete copy.status;
      return copy;
    }
    return s;
  });

  const shiftsList = sanitizedSlots.length > 0 ? sanitizedSlots : (isPartTime ? [
    { day_label: 'Monday', start_time: '08:00', end_time: '18:00', is_booked: Boolean(displayWorker?.is_hired || displayWorker?.availability_status === 'hired') },
    { day_label: 'Wednesday', start_time: '08:00', end_time: '18:00', is_booked: Boolean(displayWorker?.is_hired || displayWorker?.availability_status === 'hired') },
    { day_label: 'Friday', start_time: '08:00', end_time: '18:00', is_booked: Boolean(displayWorker?.is_hired || displayWorker?.availability_status === 'hired') }
  ] : []);

  const openShiftsList = shiftsList.filter((s: any) => !(
    s.is_booked ||
    s.is_hired ||
    s.employer_id ||
    s.status === 'booked' ||
    s.status === 'hired'
  ));

  // Part-time workers with at least 1 open shift day are NOT completely taken/hired
  const isHired = (isPartTime && shiftsList.length > 0)
    ? openShiftsList.length === 0
    : (displayWorker.availability_status === 'hired' || Boolean((displayWorker as any).is_hired) || worker.availability_status === 'hired' || Boolean((worker as any).is_hired));
  const isUnavailable = !isHired && !(isPartTime && openShiftsList.length > 0) && (displayWorker.availability_status === 'unavailable' || displayWorker.isAvailable === false || worker.availability_status === 'unavailable' || worker.isAvailable === false);
  const isBlocked = isHired || isUnavailable;

  // Freelance button label/icon
  const freelanceBtnContent = () => {
    if (isCheckingPayment) {
      return (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking...
        </>
      );
    }
    if (isLoadingFullDetails) {
      return (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading...
        </>
      );
    }
    if (hasPaid) {
      return (
        <>
          <CheckCircle className="h-3 w-3" />
          View Contact Details
        </>
      );
    }
    return (
      <>
        <Phone className="h-3 w-3" />
        Pay & View Contact ({displayWorker.fee?.toLocaleString()} RWF)
      </>
    );
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (isAuthenticated) {
              setShowCloseConfirm(true);
            } else {
              onClose();
            }
          }
        }}
      >
        <DialogContent
          hideCloseButton
          onPointerDownOutside={(e) => { if (isAuthenticated) e.preventDefault(); }}
          onInteractOutside={(e) => { if (isAuthenticated) e.preventDefault(); }}
          className="max-w-[1040px] w-[95vw] p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-2xl"
          style={{ borderRadius: '4px' }}
        >
          <DialogTitle className="sr-only">Worker Details</DialogTitle>
          <DialogDescription className="sr-only">Worker profile and identity details</DialogDescription>
          {/* ── Split Picture Banner Modal Design (Reference Screenshot Match) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 h-auto lg:h-[84vh] lg:max-h-[640px] lg:min-h-[560px] w-full overflow-hidden rounded-[4px] bg-white border-0">
            {/* Left Side: 58% Full Cover Image (Edge to Edge Flush) */}
            <div className="lg:col-span-7 relative h-[320px] lg:h-full w-full bg-slate-900 overflow-hidden">
              {displayWorker.photo ? (
                <img
                  src={displayWorker.photo}
                  alt={displayWorker.firstName}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col h-full w-full items-center justify-center bg-gradient-to-br from-[#226e9f] to-slate-900 text-white">
                  <span className="text-6xl font-black tracking-wider text-white/90">
                    {getInitials(displayWorker.firstName, displayWorker.lastName)}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side: 42% Blue Panel (#226e9f Exact Match) */}
            <div className="lg:col-span-5 bg-[#226e9f] text-white p-6 lg:p-8 flex flex-col justify-between h-full relative overflow-hidden">
              {/* Top Right Clean White Close X Button */}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowCloseConfirm(true);
                  } else {
                    onClose();
                  }
                }}
                className="absolute top-5 right-5 p-1 text-white hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-6 h-6 stroke-[2.5] text-white" />
              </button>

              <div className="space-y-6 pt-1">
                {/* Branding */}
                <div>
                  <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                    ekaze
                  </h3>
                  <p className="text-sm font-normal text-white/80 mt-1">
                    by ekazepay
                  </p>
                </div>

                {/* Main Message / Details */}
                <div className="space-y-4 text-white/90 font-normal leading-relaxed">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-xl lg:text-2xl font-bold text-white leading-snug">
                        {(() => {
                          const name = displayWorker.firstName || '';
                          const role = displayWorker.workTypes && displayWorker.workTypes.length > 0
                            ? displayWorker.workTypes[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                            : ((displayWorker as any).job_title || 'Verified Professional');
                          return (!name || name.trim().toLowerCase().includes('test')) ? role : name;
                        })()}
                      </h4>
                      {isHired ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/95 text-white shadow-xs border border-white/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Taken
                        </span>
                      ) : isUnavailable ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-100 shadow-xs border border-white/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Unavailable
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-xs border border-white/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Available
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/80 mt-0.5 font-normal">
                      Verified Professional on Ekaze
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-4 text-sm lg:text-base text-white/90 border-t border-white/20">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 font-normal whitespace-nowrap">Status:</span>
                      <span className="font-bold text-white whitespace-nowrap">
                        {isHired ? 'Taken (Hired)' : isUnavailable ? 'Not Available' : 'Available for Hire'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 font-normal whitespace-nowrap">Affiliation:</span>
                      <span className="font-bold text-white whitespace-nowrap">
                        {(() => {
                          const isComp = Boolean(
                            (displayWorker as any).company_id ||
                            (displayWorker as any).company ||
                            (displayWorker as any).companyName ||
                            (displayWorker as any).company_name ||
                            (displayWorker as any).type === 'company' ||
                            (displayWorker as any).worker_type === 'company' ||
                            (displayWorker as any).registration_type === 'company'
                          );
                          const comp = (displayWorker as any).companyName || (displayWorker as any).company_name || (displayWorker as any).company?.company_name || (displayWorker as any).company?.name || null;
                          return isComp ? (comp ? `Company (${comp})` : 'Company Worker') : 'Freelancer';
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 font-normal whitespace-nowrap">Rating:</span>
                      <span className="font-bold text-white flex items-center gap-1 whitespace-nowrap">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {displayWorker.rating.toFixed(1)} ({displayWorker.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 font-normal whitespace-nowrap">Languages:</span>
                      <span className="font-bold text-white whitespace-nowrap truncate max-w-[200px]">
                        {displayWorker.languages.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 font-normal whitespace-nowrap">Work Shift:</span>
                      {isPartTime ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white whitespace-nowrap">Part-Time</span>
                          <button
                            type="button"
                            onClick={() => setShowShiftsModal(true)}
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#226e9f] hover:bg-white/90 transition-all shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 border-0"
                          >
                            <span>Click to see shifts</span>
                            <Clock className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-white whitespace-nowrap">Full-Time</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-white/85 leading-relaxed font-light pt-1">
                    We are empowering workers and employers across Rwanda with trusted staffing solutions.
                  </p>
                </div>
              </div>

              {/* Bottom Right Action Buttons (Pay with MoMo for logged-in employer, Find out more & Login for guests) */}
              <div className="pt-6 flex flex-col items-end gap-2">
                <div className="flex items-center justify-end gap-3 w-full">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={isBlocked ? undefined : handleFreelanceContactClick}
                      disabled={isBlocked || isCheckingPayment || isLoadingFullDetails}
                      className={`px-5 py-2.5 rounded-[3px] font-bold text-xs lg:text-sm whitespace-nowrap transition-colors border-0 shadow-xs flex items-center gap-1.5 ${
                        isBlocked
                          ? 'bg-slate-400/70 text-white/70 cursor-not-allowed opacity-60'
                          : 'bg-[#689f38] hover:bg-[#588a2e] text-white cursor-pointer'
                      }`}
                    >
                      <CreditCardIcon className="w-4 h-4 text-white" />
                      <span>Pay with MoMo</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={onClose}
                        className="bg-[#689f38] hover:bg-[#588a2e] text-white px-4 py-2.5 rounded-[3px] font-bold text-xs lg:text-sm whitespace-nowrap transition-colors cursor-pointer border-0 shadow-xs"
                      >
                        Find out more
                      </button>
                      {!isBlocked && (
                        <button
                          type="button"
                          onClick={handleGoToLogin}
                          className="bg-[#689f38] hover:bg-[#588a2e] text-white px-4 py-2.5 rounded-[3px] font-bold text-xs lg:text-sm whitespace-nowrap transition-colors cursor-pointer border-0 shadow-xs flex items-center gap-1"
                        >
                          Ready? Go to Login
                        </button>
                      )}
                    </>
                  )}
                </div>
                {isBlocked && (
                  <p className="text-xs text-rose-200 font-medium text-right">
                    {isHired ? 'This professional is currently taken / hired.' : 'This professional is currently not available.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>

        {/* ── Not Eligible Modal ─────────────────────────────────────────── */}
        <Dialog open={showNotEligibleModal} onOpenChange={setShowNotEligibleModal}>
          <DialogContent className="max-w-md" style={{ borderRadius: '12px' }}>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Access Restricted</h3>
              <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-base font-semibold text-amber-700 dark:text-amber-400 mb-2">Contact Details Not Available</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-300">{notEligibleMessage}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">How to Get Access</h4>
                    <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>Complete the payment process to unlock full worker details</li>
                      <li>Contact support if you believe this is an error</li>
                      <li>Employers can access workers they have employed</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button className="w-full h-10 font-semibold" style={{ borderRadius: '8px' }} onClick={() => setShowNotEligibleModal(false)}>
                Understood
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Request Worker Modal (Company) ────────────────────────────── */}
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto p-0" style={{ borderRadius: '12px' }}>
            <div className="sticky top-0 bg-background z-10 border-b border-border/50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Request {displayWorker.firstName} {displayWorker.lastName}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fill in the details below. You'll confirm payment on the next step.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowRequestModal(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-xl">
                {displayWorker.photo ? (
                  <img src={displayWorker.photo} alt="" className="h-12 w-12 object-cover rounded-xl ring-1 ring-border/40" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center bg-muted/50 rounded-xl ring-1 ring-border/40">
                    <span className="text-base font-semibold text-muted-foreground">
                      {getInitials(displayWorker.firstName, displayWorker.lastName)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-foreground">{displayWorker.firstName} {displayWorker.lastName}</p>
                  <p className="text-xs text-muted-foreground">{displayWorker.companyName}</p>
                  <p className="text-xs text-muted-foreground">
                    Expected: {displayWorker.salaryMin.toLocaleString()} – {displayWorker.salaryMax.toLocaleString()} RWF
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                <Building2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  This request will be sent to <strong>{displayWorker.companyName}</strong> for approval.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <CreditCardIcon className="h-3.5 w-3.5 text-green-600" />
                  Proposed Salary (RWF) *
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 150000"
                  value={hiringForm.proposed_salary}
                  onChange={e => {
                    setHiringForm(prev => ({ ...prev, proposed_salary: e.target.value }));
                    if (hiringFormErrors.proposed_salary) setHiringFormErrors(prev => ({ ...prev, proposed_salary: '' }));
                  }}
                  className={`h-10 text-sm ${hiringFormErrors.proposed_salary ? 'border-red-500' : ''}`}
                />
                {hiringFormErrors.proposed_salary && <p className="text-xs text-red-500">{hiringFormErrors.proposed_salary}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  Work Description *
                </Label>
                <div className={hiringFormErrors.work_description ? 'ring-1 ring-red-500 rounded-lg' : ''}>
                  <RichTextEditor
                    value={hiringForm.work_description}
                    onChange={val => {
                      setHiringForm(prev => ({ ...prev, work_description: val }));
                      if (hiringFormErrors.work_description) setHiringFormErrors(prev => ({ ...prev, work_description: '' }));
                    }}
                    placeholder="Describe the work you need in detail (tasks, schedule, location, etc.)..."
                    minHeight={120}
                  />
                </div>
                {hiringFormErrors.work_description && <p className="text-xs text-red-500">{hiringFormErrors.work_description}</p>}
                <p className="text-xs text-muted-foreground text-right">
                  {hiringForm.work_description.replace(/<[^>]*>/g, '').length} chars
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                  Additional Message <span className="font-normal text-muted-foreground">(Optional)</span>
                </Label>
                <RichTextEditor
                  value={hiringForm.message}
                  onChange={val => setHiringForm(prev => ({ ...prev, message: val }))}
                  placeholder="Any extra info for the company..."
                  minHeight={80}
                />
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-10 text-sm font-semibold" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 h-10 text-sm font-semibold bg-primary hover:bg-primary/90 gap-2" onClick={handleProceedToPayment}>
                  <CreditCard className="h-4 w-4" />
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Payment Modal ─────────────────────────────────────────────── */}
        {/* Used for BOTH freelance contact payment AND company request payment */}
        <Dialog
          open={showPaymentModal}
          onOpenChange={(open) => {
            // Only allow close when not actively polling
            if (!open && paymentStatus !== 'polling' && paymentStatus !== 'initiating') {
              stopPolling();
              setShowPaymentModal(false);
              setPaymentStatus('idle');
            }
          }}
        >
          <DialogContent
            hideCloseButton
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className="max-w-md p-0 overflow-hidden border-0 bg-[#226e9f] text-white shadow-2xl"
            style={{ borderRadius: '4px' }}
          >

            {/* ── Header styled with Worker Popup #226e9f Blue Theme ── */}
            <div className="bg-[#226e9f] text-white px-5 pt-3 pb-2 relative border-b border-white/15">
              <button
                onClick={() => {
                  if (paymentStatus !== 'polling' && paymentStatus !== 'initiating') {
                    stopPolling();
                    setShowPaymentModal(false);
                    setPaymentStatus('idle');
                  }
                }}
                className="absolute top-4 right-4 p-1 text-white hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {isFreelance ? 'Confirm Payment' : 'Confirm Hiring Request Payment'}
              </h3>
              <p className="text-xs text-white/80 mt-1 font-normal">
                {isFreelance ? `One-time fee · ${displayWorker.fee?.toLocaleString()} RWF` : 'Pay to submit hiring request'}
              </p>
            </div>

            {/* ── LOADING / POLLING ── mirrors PaymentPage.tsx exactly */}
            {(paymentStatus === 'initiating' || paymentStatus === 'polling') && (
              <div className="flex flex-col items-center justify-center gap-6 p-8 bg-[#226e9f] text-white">
                <div
                  className="animate-spin"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: '5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderLeftColor: '#ffffff',
                  }}
                />
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-bold text-white">
                    Check your phone for a pop-up and confirm
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed font-normal">
                    No pop-up? Dial <strong className="text-white font-bold">*182*7*1#</strong> and confirm the payment
                  </p>
                  <p className="text-xs text-white/70 mt-1 font-light">
                    Please don't leave this page.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full h-10 border border-white/30 text-white hover:bg-white/10 rounded-[3px] font-semibold text-xs transition-colors cursor-pointer bg-transparent"
                  onClick={() => { stopPolling(); setPaymentStatus('idle'); }}
                >
                  Cancel Payment
                </button>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {paymentStatus === 'SUCCESSFUL' && (
              <div className="flex flex-col items-center gap-3 p-8 text-center bg-[#226e9f] text-white">
                <CheckCircle className="h-12 w-12 text-[#689f38]" />
                <p className="font-bold text-base text-white">Payment Successful!</p>
                <p className="text-xs text-white/80">Loading contact details...</p>
              </div>
            )}

            {/* ── FAILED ── */}
            {paymentStatus === 'FAILED' && (
              <div className="flex flex-col items-center gap-3 p-8 text-center bg-[#226e9f] text-white">
                <X className="h-10 w-10 text-red-300" />
                <p className="font-bold text-base text-red-200">Payment Not Completed</p>
                <p className="text-xs text-white/90 font-medium max-w-xs leading-relaxed">
                  {paymentPhoneError || "Not enough money in your MoMo account or transaction declined. Please check your balance and try again."}
                </p>
                <button
                  type="button"
                  className="w-full h-10 bg-white/20 hover:bg-white/30 text-white rounded-[3px] font-bold text-xs cursor-pointer border-0"
                  onClick={() => { setPaymentPhoneError(''); setPaymentStatus('idle'); }}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ── TIMEOUT ── */}
            {paymentStatus === 'TIMEOUT' && (
              <div className="flex flex-col items-center gap-3 p-8 text-center bg-[#226e9f] text-white">
                <Clock className="h-10 w-10 text-amber-300" />
                <p className="font-bold text-base text-white">Payment Timed Out</p>
                <p className="text-xs text-white/80">
                  No confirmation received within 1 minute.
                </p>
                <button
                  type="button"
                  className="w-full h-10 bg-white/20 hover:bg-white/30 text-white rounded-[3px] font-bold text-xs cursor-pointer border-0"
                  onClick={() => setPaymentStatus('idle')}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ── IDLE — phone input & terms & conditions ── */}
            {paymentStatus === 'idle' && (
              <div className="px-5 py-2.5 space-y-2.5 bg-[#226e9f] text-white">

                {/* Phone input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-white">MTN Phone Number *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/80">🇷🇼</span>
                    <Input
                      type="tel"
                      placeholder="078XXXXXXX"
                      value={paymentPhone}
                      onChange={e => {
                        setPaymentPhone(e.target.value.replace(/\D/g, ''));
                        if (paymentPhoneError) setPaymentPhoneError('');
                      }}
                      maxLength={10}
                      className={`pl-9 h-11 rounded-[3px] text-sm font-semibold border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 ${paymentPhoneError ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {paymentPhoneError && <p className="text-xs text-red-300 font-medium">{paymentPhoneError}</p>}
                  <p className="text-xs text-white/80 font-normal">
                    You will receive a payment prompt on this number.
                  </p>
                </div>

                {/* Terms & Conditions Agreement Checkbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-[3px] bg-white/10 border border-white/20 cursor-pointer hover:bg-white/15 transition-colors">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={e => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/40 text-[#226e9f] focus:ring-white cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-white/90 leading-relaxed font-normal">
                    I accept the <strong className="text-white font-bold">Terms & Conditions</strong>: If the employer and worker do not match or understand each other, this payment is NOT refundable, but Ekaze will assist the employer to get another suggested worker.
                  </span>
                </label>

                {/* Action Button matching Worker Popup Button (#689f38 green, rounded-[3px], font-bold) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    disabled={!paymentPhone || paymentPhone.length < 10 || !acceptTerms}
                    className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[3px] transition-colors cursor-pointer border-0 shadow-xs flex items-center justify-center gap-2"
                  >
                    <CreditCardIcon className="w-4 h-4 text-white" />
                    <span>Pay {displayWorker.fee?.toLocaleString()} RWF</span>
                  </button>
                </div>
              </div>
            )}

          </DialogContent>
        </Dialog>

      </Dialog>

      {/* ── Close Confirmation Modal ── */}
      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent hideCloseButton className="max-w-[320px] p-4 bg-white rounded-xl shadow-2xl border-0">
          <div className="space-y-3 text-center">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900">Are you sure?</h3>
              <p className="text-xs text-slate-600 leading-snug">
                Are you sure you want to close this window?
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-8 text-xs font-semibold border-slate-200 hover:bg-slate-100"
                onClick={() => setShowCloseConfirm(false)}
              >
                No, Stay
              </Button>
              <Button
                className="flex-1 h-8 text-xs font-bold bg-[#2478b8] hover:bg-[#1b6296] text-white border-0"
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
              >
                Yes, Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Worker Details Modal — outside main Dialog */}
      <WorkerFullDetailsModal
        workerDetails={fullWorkerDetails}
        isOpen={showFullDetailsModal}
        onClose={() => {
          setShowFullDetailsModal(false);
          setFullWorkerDetails(null);
          onClose();
        }}
        isLoading={isLoadingFullDetails}
      />

      {/* ── Non-Employer Role Restriction Modal ── */}
      <Dialog open={showNonEmployerModal} onOpenChange={setShowNonEmployerModal}>
        <DialogContent hideCloseButton className="max-w-md p-6 bg-white rounded-2xl shadow-2xl border-0">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <UserX className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">
                Employer Account Required
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                This account is registered as a <strong className="capitalize text-slate-900">{user?.role || 'worker'}</strong> account. Only employer accounts can hire or view worker contact details.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left mt-3">
                <p className="text-xs text-amber-800 font-medium">
                  If you are looking to hire workers, please register a new account as an Employer.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full h-11 font-bold bg-[#2478b8] hover:bg-[#1b6296] text-white rounded-xl cursor-pointer border-0"
                onClick={() => {
                  setShowNonEmployerModal(false);
                  onClose();
                  navigate('/auth/register?role=employer');
                }}
              >
                Register as Employer
              </Button>
              <Button
                variant="ghost"
                className="w-full h-10 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer border-0 bg-transparent"
                onClick={() => setShowNonEmployerModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Another Blue Pop: Part-Time Shifts Modal ── */}
      <WorkerShiftsModal
        isOpen={showShiftsModal}
        onClose={() => setShowShiftsModal(false)}
        roleTitle={displayWorker.workTypes?.[0] ? displayWorker.workTypes[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Worker'}
        workerName={displayWorker.firstName}
        slots={shiftsList}
        isAuthenticated={isAuthenticated}
        selectedSlotIds={selectedSlotIds}
        onToggleSlot={toggleSlotSelection}
        onGoToLogin={!isBlocked ? handleGoToLogin : undefined}
        onBookSelectedSlots={
          isAuthenticated && !isBlocked
            ? () => {
                setShowShiftsModal(false);
                handleFreelanceContactClick();
              }
            : undefined
        }
      />
    </>
  );
};