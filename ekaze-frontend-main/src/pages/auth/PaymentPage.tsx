import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/landing/Header';
import api from '@/lib/api';

type PaymentStatus = 'idle' | 'initiating' | 'polling' | 'SUCCESSFUL' | 'FAILED' | 'TIMEOUT';

const formatPaymentError = (reason?: string): string => {
  if (!reason) return 'Payment was declined or cancelled.';
  const upper = String(reason).toUpperCase();
  if (upper.includes('PAYER_LIMIT_REACHED')) {
    return 'Your MTN Mobile Money wallet has reached its daily/monthly transaction limit, or your account cannot receive more debit prompts today. Please use another phone number.';
  }
  if (upper.includes('NOT_ENOUGH_FUNDS')) {
    return 'Insufficient balance on your MTN Mobile Money account. Please top up and try again.';
  }
  if (upper.includes('APPROVAL_REJECTED') || upper.includes('REJECTED')) {
    return 'The payment was declined or cancelled on your phone.';
  }
  if (upper.includes('PAYER_NOT_FOUND')) {
    return 'This phone number is not registered on MTN Mobile Money.';
  }
  return reason;
};

export const PaymentPage = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  useEffect(() => {
    if (!state?.transaction_id) {
      navigate('/auth/login', { replace: true });
    }
  }, []);

  if (!state?.transaction_id) return null;

  const amount        = state?.amount         || 1000;
  const transactionId = state?.transaction_id || '';
  const initialPhone  = state?.phone          || '';
  const cycle         = state?.cycle          || '';
  const isTrialExpired = state?.trial_expired  || false;

  const [phone,     setPhone]     = useState(initialPhone);
  const [status,    setStatus]    = useState<PaymentStatus>(state?.auto_pay ? 'initiating' : 'idle');
  const [errorMsg,  setErrorMsg]  = useState('');
  const [countdown, setCountdown] = useState(5);

  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current)    clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  useEffect(() => () => { stopPolling(); stopCountdown(); }, []);

  useEffect(() => {
    if (transactionId && initialPhone && state?.auto_pay) {
      handlePayWithPhone(initialPhone);
    }
  }, [transactionId]);

  const handlePayWithPhone = async (phoneToPay: string) => {
    if (!phoneToPay || phoneToPay.length < 9) return;
    setStatus('initiating');
    setErrorMsg('');
    try {
      const res = await api.post('/payment/initiate', {
        phone: phoneToPay,
        transaction_id: transactionId,
      });
      if (res.data?.success) {
        setStatus('polling');
        startPolling(res.data.reference_id || transactionId);
      } else {
        setStatus('FAILED');
        setErrorMsg(formatPaymentError(res.data?.reason || res.data?.message));
        startCountdown();
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; reason?: string } } };
      setStatus('FAILED');
      setErrorMsg(formatPaymentError(err?.response?.data?.reason || err?.response?.data?.message));
      startCountdown();
    }
  };

  const startCountdown = () => {
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopCountdown();
          setStatus('idle');
          setErrorMsg('');
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPolling = (refId: string) => {
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setStatus('TIMEOUT');
      startCountdown();
    }, 1 * 60 * 1000);

    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/payment/status/${refId}`);
        const ps  = (res.data?.payment_status || res.data?.status || res.data?.transaction?.status || '').toUpperCase();

        if (ps === 'SUCCESSFUL') {
          stopPolling();
          setStatus('SUCCESSFUL');
          setTimeout(() => navigate('/auth/login', {
            state: { message: 'Payment complete! You can now login.' },
          }), 2500);

        } else if (ps === 'FAILED') {
          stopPolling();
          setStatus('FAILED');
          setErrorMsg(formatPaymentError(res.data?.reason || res.data?.message || 'Payment was declined.'));
          startCountdown();
        }
      } catch {}
    }, 5000);
  };

  const handlePay = () => {
    handlePayWithPhone(phone);
  };

  const isLoading = status === 'initiating' || status === 'polling';

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white">
        <div
          className="animate-spin"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '6px solid #BFDFEF',
            borderTopColor: '#0078B4',
            borderLeftColor: '#0078B4',
          }}
        />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-gray-800">
            Check your phone for a pop-up and confirm
          </p>
          <p className="text-xs text-muted-foreground">
            No pop-up? Dial <strong className="text-gray-700">*182*7*1#</strong> and confirm the payment
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please don't leave this page.
          </p>
        </div>
        <button
          type="button"
          className="w-64 h-10 border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-[6px] transition-colors cursor-pointer"
          onClick={() => { stopPolling(); setStatus('idle'); }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-sm">

          {status === 'SUCCESSFUL' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
              <p className="font-semibold text-green-700">Payment Successful!</p>
              <p className="text-xs text-muted-foreground">Redirecting you to login...</p>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="font-semibold text-destructive">Payment Failed</p>
              {errorMsg && (
                <p className="text-xs text-muted-foreground">{errorMsg}</p>
              )}
              <button
                type="button"
                onClick={() => { stopCountdown(); setStatus('idle'); setErrorMsg(''); }}
                className="w-full h-11 bg-[#0073bb] hover:bg-[#005f9e] active:bg-[#004e82] text-white font-semibold text-sm sm:text-base rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Try Again Now
              </button>
            </div>
          )}

          {status === 'TIMEOUT' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <Clock className="h-12 w-12 text-yellow-500" />
              <p className="font-semibold">Payment Timed Out</p>
              <p className="text-xs text-muted-foreground">
                No confirmation received within 1 minute.
              </p>
              <button
                type="button"
                onClick={() => { stopCountdown(); setStatus('idle'); setErrorMsg(''); }}
                className="w-full h-11 bg-[#0073bb] hover:bg-[#005f9e] active:bg-[#004e82] text-white font-semibold text-sm sm:text-base rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Try Again Now
              </button>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-5">
              {isTrialExpired && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-[6px] text-left space-y-1">
                  <p className="text-xs font-semibold text-slate-800">Free Trial Expired</p>
                  <p className="text-[11px] text-slate-600">
                    Your company's free trial has ended. Complete your {cycle ? `${cycle} ` : ''}subscription payment of {Math.round(amount).toLocaleString()} RWF to access your account.
                  </p>
                </div>
              )}

              <h3 className="text-sm font-medium text-gray-800 text-left">
                Please enter your Mobile Money number
              </h3>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">🇷🇼</span>
                <input
                  id="momo_phone"
                  type="tel"
                  placeholder="078XXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  className="w-full h-11 pl-9 pr-3 rounded-[6px] border border-slate-300 focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] outline-none text-sm text-slate-800 transition-colors bg-white"
                />
              </div>

              <p className="text-xs text-muted-foreground text-left">
                You will receive a payment prompt on this number
              </p>

              <button
                type="button"
                onClick={handlePay}
                disabled={!phone || phone.length < 9}
                className="w-full h-11 bg-[#0073bb] hover:bg-[#005f9e] active:bg-[#004e82] disabled:opacity-50 text-white font-semibold text-sm sm:text-base rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Pay {Math.round(amount).toLocaleString()} RWF
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};
