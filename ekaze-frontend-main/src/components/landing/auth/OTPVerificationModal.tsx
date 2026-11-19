import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Phone, RefreshCw } from 'lucide-react';
import { useVerifyOtp, useResendOtp } from '@/hooks/useRegistration';
import { useLanguage } from '@/contexts/LanguageContext';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  initialOtp?: string; // For testing
  remainingResends: number;
  onSuccess: () => void;
}

export const OTPVerificationModal = ({
  isOpen,
  onClose,
  phone,
  initialOtp,
  remainingResends,
  onSuccess,
}: OTPVerificationModalProps) => {
  const { t } = useLanguage();
  const [otpCode, setOtpCode] = useState('');
  const [resends, setResends] = useState(remainingResends);
  
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  const handleVerify = () => {
    if (otpCode.length !== 6) {
      return;
    }

    verifyOtp(
      { phone, otp_code: otpCode },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" style={{ borderRadius: '12px' }}>
        <Card style={{ borderRadius: '12px', border: 'none', boxShadow: 'none' }}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t("otp.title")}</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              {t("otp.sent")} <strong>{phone}</strong>
            </p>

            {/* Show OTP for testing */}
            {initialOtp && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 font-medium">
                  {t("otp.testing")} <span className="font-bold text-lg">{initialOtp}</span>
                </p>
              </div>
            )}

            <div>
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
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                    {t("otp.resending")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t("otp.resend")}
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isVerifying}
                className="flex-1"
              >
                {t("otp.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || otpCode.length !== 6}
                className="flex-1"
              >
                {isVerifying && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {t("otp.verify")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};