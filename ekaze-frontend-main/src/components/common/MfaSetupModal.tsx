import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { QRCode } from 'antd';
import { SiGoogleauthenticator, SiGmail, SiIcloud } from 'react-icons/si';
import { FaMicrosoft } from 'react-icons/fa6';
import { mfaService } from '@/api/mfaService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

// Real Smartphone with Dark Screen and SMS Notification Icon
const RealPhoneSmsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" title="Phone SMS Verification">
    <rect x="8" y="2" width="20" height="32" rx="4.5" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
    <rect x="9.5" y="4.5" width="17" height="25" rx="2.5" fill="#1E293B" />
    <rect x="15" y="3.2" width="6" height="1" rx="0.5" fill="#64748B" />
    <rect x="11.5" y="10" width="13" height="9.5" rx="3" fill="#22C55E" />
    <polygon points="14,19.5 12,22.5 15.5,19.5" fill="#22C55E" />
    <circle cx="15" cy="14.7" r="1.1" fill="#FFFFFF" />
    <circle cx="18" cy="14.7" r="1.1" fill="#FFFFFF" />
    <circle cx="21" cy="14.7" r="1.1" fill="#FFFFFF" />
    <line x1="14" y1="31" x2="22" y2="31" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  canSkip?: boolean;
}

export const MfaSetupModal: React.FC<MfaSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  canSkip = true,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [deviceName, setDeviceName] = useState(() => {
    const name = user?.name || user?.username || 'My Device';
    return `${name}'s MFA`;
  });
  const [method, setMethod] = useState<'authenticator' | 'sms' | 'email'>('authenticator');
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Initialize MFA details when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSetupData(method);
    }
  }, [isOpen, method]);

  const loadSetupData = async (selectedMethod: 'authenticator' | 'sms' | 'email') => {
    setIsLoading(true);
    try {
      const res = await mfaService.setup(selectedMethod);
      if (res.data?.secret) {
        setSecret(res.data.secret);
      }
      if (res.data?.qr_code_uri) {
        setQrCodeUri(res.data.qr_code_uri);
      }
    } catch (err) {
      console.warn('MFA setup error, check network or retry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret.replace(/-/g, ''));
    setCopied(true);
    toast.success('Secret key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCode = async () => {
    try {
      await mfaService.sendCode(method);
      setCodeSent(true);
      toast.success(`Verification code sent to your ${method === 'sms' ? 'phone' : 'email'}!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send verification code.');
    }
  };

  const handleVerify = async () => {
    if (!code || code.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      await mfaService.verify(code.trim(), method);
      toast.success('Two-Factor Authentication (MFA) successfully enabled!');

      // Update cached user in queryClient and localStorage
      queryClient.invalidateQueries({ queryKey: ['user'] });
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.mfa_enabled = true;
          parsed.mfa_method = method;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) {
          // ignore
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('mfa_prompt_skipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const userPhone = user?.phone || '0788000005';
  const userEmail = user?.email || user?.google_email || 'user@ihirwe.rw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* AWS Style Clean Card Modal */}
      <div className="max-w-2xl w-full my-6 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 text-left overflow-hidden relative flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Keep your account secure
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* AWS Style Red/Amber Alert Box */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-red-400 rounded-md shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-800 font-semibold leading-relaxed">
              Registering your MFA is strongly recommended to protect your funds, worker contracts, and identity.
            </p>
          </div>

          {/* Description Paragraph */}
          <p className="text-xs text-slate-600 leading-relaxed">
            Improve the security of your account by registering <strong>multi-factor authentication (MFA)</strong> using one of the options below. This provides a second means of verifying your identity in addition to your password.
          </p>

          {/* MFA Device Name Input (AWS Style) */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-800">
              MFA device name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Device Name"
              className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Maximum 128 characters. Use alphanumeric and '+ = , . @ - _' characters.
            </p>
          </div>

          {/* AWS Style Radio Cards for MFA Options */}
          <div className="space-y-3">
            {/* OPTION 1: Authenticator App */}
            <div
              onClick={() => {
                setMethod('authenticator');
                setCode('');
              }}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                method === 'authenticator'
                  ? 'border-[#0073bb] bg-blue-50/20 ring-1 ring-[#0073bb]'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Radio Circle */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      method === 'authenticator'
                        ? 'border-[#0073bb] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {method === 'authenticator' && (
                      <div className="w-2 h-2 rounded-full bg-[#0073bb]" />
                    )}
                  </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[#EA4335] text-base">
                    <SiGoogleauthenticator />
                  </div>
                  <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[#00A4EF] text-xs">
                    <FaMicrosoft />
                  </div>
                  <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[#369EEF] text-base">
                    <SiIcloud />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Authenticator app
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Authenticate using a code generated by an app installed on your mobile device or computer (Google Authenticator, Microsoft Authenticator, Apple Passwords).
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                    Recommended by Ihirwe as an authenticator device providing reliable offline verification.
                  </p>
                </div>
              </div>

              {/* Expanded Authenticator QR and Secret Configuration */}
              {method === 'authenticator' && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="w-[104px] h-[104px] bg-white p-1.5 rounded-md shrink-0 flex items-center justify-center border border-slate-200 shadow-2xs">
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#0073bb]" />
                      ) : (
                        <QRCode
                          value={
                            qrCodeUri ||
                            `otpauth://totp/IhirwePay:${encodeURIComponent(userEmail)}?secret=${secret.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}&issuer=IhirwePay&algorithm=SHA1&digits=6&period=30`
                          }
                          size={94}
                          bordered={false}
                          errorLevel="M"
                        />
                      )}
                    </div>
                    <div className="space-y-1 text-left flex-1">
                      <p className="text-xs font-semibold text-slate-800">
                        1. Scan QR code in your Authenticator app
                      </p>
                      <p className="text-xs text-slate-500">
                        Or enter this secret key manually:
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <code className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-slate-300 text-slate-900 tracking-wider">
                          {secret || 'GENERATING-KEY...'}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySecret();
                          }}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors border border-slate-300 cursor-pointer bg-white"
                          title="Copy Secret"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 2: SMS Verification */}
            <div
              onClick={() => {
                setMethod('sms');
                setCode('');
                setCodeSent(false);
              }}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                method === 'sms'
                  ? 'border-[#0073bb] bg-blue-50/20 ring-1 ring-[#0073bb]'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Radio Circle */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      method === 'sms'
                        ? 'border-[#0073bb] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {method === 'sms' && (
                      <div className="w-2 h-2 rounded-full bg-[#0073bb]" />
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                  <RealPhoneSmsIcon className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    SMS Verification
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Instant one-time 6-digit passcode sent directly to your registered mobile phone number.
                  </p>
                </div>
              </div>

              {/* Expanded SMS Configuration */}
              {method === 'sms' && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-xs text-slate-500 block">Registered Mobile:</span>
                      <span className="text-xs font-mono font-bold text-slate-800">{userPhone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendCode();
                      }}
                      className="px-4 py-2 bg-[#0073bb] hover:bg-[#005f9e] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
                    >
                      {codeSent ? 'Resend SMS Code' : 'Send SMS Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 3: Email Verification */}
            <div
              onClick={() => {
                setMethod('email');
                setCode('');
                setCodeSent(false);
              }}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                method === 'email'
                  ? 'border-[#0073bb] bg-blue-50/20 ring-1 ring-[#0073bb]'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Radio Circle */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      method === 'email'
                        ? 'border-[#0073bb] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {method === 'email' && (
                      <div className="w-2 h-2 rounded-full bg-[#0073bb]" />
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[#EA4335] text-base shrink-0 mt-0.5">
                  <SiGmail />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Email Verification
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    One-time 6-digit confirmation code delivered safely to your registered email address.
                  </p>
                </div>
              </div>

              {/* Expanded Email Configuration */}
              {method === 'email' && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-xs text-slate-500 block">Registered Email:</span>
                      <span className="text-xs font-mono font-bold text-slate-800 truncate max-w-[240px] block">{userEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendCode();
                      }}
                      className="px-4 py-2 bg-[#0073bb] hover:bg-[#005f9e] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
                    >
                      {codeSent ? 'Resend Email Code' : 'Send Email Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6-Digit Code Input Section */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-800">
              Enter 6-Digit Verification Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full h-11 px-4 text-center tracking-[0.4em] font-mono text-lg font-bold rounded-md border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-all"
            />
          </div>
        </div>

        {/* Modal Bottom Footer with AWS Pill Buttons */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/60 flex items-center justify-end gap-3 shrink-0">
          {canSkip && (
            <button
              type="button"
              onClick={handleSkip}
              className="h-9 px-6 rounded-full border border-[#0073bb] text-[#0073bb] hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying}
            className="h-9 px-6 rounded-full bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Enable MFA</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MfaSetupModal;
