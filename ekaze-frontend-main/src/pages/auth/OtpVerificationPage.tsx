import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVerifyOtp, useResendOtp } from '@/hooks/useRegistration';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/landing/Header';

export const OtpVerificationPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { t }     = useLanguage();

  const phone = state?.phone || '';

  if (!phone) {
    navigate('/', { replace: true, state: { error: 'No phone number found. Please register again.' } });
  }
  const resends_initial  = state?.resends_remaining ?? 5;
  const role             = state?.role             || 'worker';
  const amount           = state?.amount           || 0;

  const [otpCode, setOtpCode] = useState('');
  const [resends, setResends] = useState(resends_initial);

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending  } = useResendOtp();
  const transaction_id   = state?.transaction_id   || '';

  const handleVerify = () => {
    if (otpCode.length !== 6) return;
    verifyOtp(
      { phone, otp_code: otpCode },
      {
        onSuccess: (res: any) => {
          const resData = res?.data;
          const userRole = resData?.role || role;
          const requiresPayment = resData?.requires_payment ?? (userRole !== 'worker');
          const txId = resData?.transaction_id || transaction_id;
          const payAmount = resData?.amount || amount || (userRole === 'company' ? 5000 : 1000);

          if (res?.token) {
            localStorage.setItem('auth_token', res.token);
          }
          if (resData?.user) {
            localStorage.setItem('user', JSON.stringify(resData.user));
          }

          if (userRole === 'worker' || !requiresPayment) {
            navigate('/', { replace: true });
          } else {
            navigate('/auth/payment', {
              state: {
                amount: payAmount,
                role: userRole,
                transaction_id: txId,
                phone,
              },
              replace: true,
            });
          }
        },
      }
    );
  };

  const handleResend = () => {
    resendOtp(
      { phone },
      {
        onSuccess: (response) => {
          setResends(response.data?.otp_resends_remaining || 0);
          setOtpCode('');
        },
      }
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-muted/20 px-4">
        <div className="w-full max-w-sm bg-white border border-border/60 rounded-lg shadow-sm p-8 space-y-5">

          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("otp.title")}</h3>
          </div>

          <p className="text-sm text-muted-foreground">
            {t("otp.sent")} <strong>{phone}</strong>
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="otp_code">{t("otp.enterCode")}</Label>
            <Input
              id="otp_code"
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("otp.remaining")} <strong>{resends}/5</strong>
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={isResending || resends === 0}
              className="p-0 h-auto"
            >
              {isResending ? (
                <><Loader2 className="animate-spin h-4 w-4 mr-1" />{t("otp.resending")}</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-1" />{t("otp.resend")}</>
              )}
            </Button>
          </div>

          <Button
            onClick={handleVerify}
            disabled={isVerifying || otpCode.length !== 6}
            className="w-full"
          >
            {isVerifying && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            {t("otp.verify")}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{' '}
            <a href="/auth/login" className="text-primary hover:underline">{t("auth.login")}</a>
          </p>
        </div>
      </div>
    </>
  );
};
