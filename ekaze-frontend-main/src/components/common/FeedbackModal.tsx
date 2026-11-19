import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Monitor,
  X,
  Trash2,
  Maximize2,
  Loader2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { helpFeedbackService } from '@/api/helpFeedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id?: number | string;
    full_name?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [optInUpdates, setOptInUpdates] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [tooltipStep, setTooltipStep] = useState(1);

  // States for the Google-style "Allow tab access" confirmation popup (Image 2)
  const [isCapturing, setIsCapturing] = useState(false);
  const [showAllowDialog, setShowAllowDialog] = useState(false);
  const [tempCapturedImage, setTempCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showSensitiveInfoModal, setShowSensitiveInfoModal] = useState(false);
  const [showSystemInfoModal, setShowSystemInfoModal] = useState(false);

  if (!isOpen) return null;

  // Step 1: Capture the tab behind the modal
  const handleInitiateCapture = async () => {
    try {
      setIsCapturing(true);

      // Hide tooltip if open
      setShowTooltip(false);

      // Brief delay so drawer fades out before capture
      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: window.devicePixelRatio > 1 ? 1.5 : 1,
        ignoreElements: (element) => {
          return element.classList?.contains('google-feedback-root') || false;
        },
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setTempCapturedImage(dataUrl);

      // Show the Google-style "Allow see this tab?" modal (Image 2)
      setShowAllowDialog(true);
    } catch (err: any) {
      console.error('Screenshot capture failed:', err);
      toast.error('Unable to capture screen. Please check browser permissions.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Step 2: Confirm / Allow screenshot
  const handleConfirmScreenshot = () => {
    if (tempCapturedImage) {
      setScreenshot(tempCapturedImage);
      setTempCapturedImage(null);
    }
    setShowAllowDialog(false);
  };

  const handleCancelScreenshot = () => {
    setTempCapturedImage(null);
    setShowAllowDialog(false);
  };

  // Submit Feedback
  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        type: 'feedback' as const,
        category: 'Google Feedback Clone',
        message: feedbackText.trim(),
        screenshot: screenshot || undefined,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        browser_info: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        name: user?.full_name || undefined,
        email: user?.email || undefined,
        phone: user?.phone || undefined,
        role: user?.role || 'user',
      };

      const res = await helpFeedbackService.submitHelpFeedback(payload);
      const ticketNumber = res?.data?.ticket_number || '';

      toast.success(
        `Thank you for your feedback! ${ticketNumber ? `(#${ticketNumber})` : ''}`
      );

      // Reset
      setFeedbackText('');
      setScreenshot(null);
      setOptInUpdates(false);
      onClose();
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      toast.error(
        err?.response?.data?.message ||
          'Failed to send feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'ekazepay.rw';
  const pageTitle = typeof document !== 'undefined' ? document.title : 'Ekaze Platform';

  return (
    <>
      {/* Dim Backdrop */}
      <div
        className="fixed inset-0 z-[99990] bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Main Google-Style Feedback Drawer (Image 1) */}
      <div
        className={`google-feedback-root fixed top-0 right-0 bottom-0 w-[420px] max-w-full bg-[#1e1f20] text-[#e3e3e3] shadow-[-12px_0_36px_rgba(0,0,0,0.6)] z-[99995] flex flex-col font-sans transition-all duration-200 select-none border-l border-[#333538] overflow-hidden ${
          isCapturing ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2f31] shrink-0">
          <h2 className="text-[17px] font-medium text-[#e3e3e3] tracking-tight">
            Send feedback to Ekaze
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#333538] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-4 text-left text-xs box-border">
          {/* Describe your feedback */}
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-[#e3e3e3]">
              Describe your feedback (required)
            </label>
            <textarea
              rows={6}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what prompted this feedback..."
              className="w-full box-border p-3.5 rounded-lg border border-[#8e918f]/70 bg-transparent text-[#e3e3e3] placeholder:text-[#8e918f] text-[13px] focus:outline-none focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] transition-all leading-relaxed resize-none"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-[#c4c7c5]">
              <span>Please don't include any sensitive information</span>
              <button
                type="button"
                onClick={() => setShowSensitiveInfoModal(true)}
                className="text-[#c4c7c5] hover:text-white inline-flex items-center cursor-pointer"
                title="Sensitive information details"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Screenshot Section */}
          <div className="relative space-y-2.5 pt-1">
            <p className="text-[13px] font-medium text-[#e3e3e3]">
              A screenshot will help us better understand your feedback.
            </p>

            {!screenshot ? (
              <button
                type="button"
                onClick={handleInitiateCapture}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-[#8e918f]/50 hover:bg-[#2d2f31] text-[#a8c7fa] font-medium text-[13px] transition-colors cursor-pointer"
              >
                <Monitor className="w-4 h-4 text-[#a8c7fa]" />
                <span>Capture screenshot</span>
              </button>
            ) : (
              /* Attached Screenshot Preview */
              <div className="relative rounded-lg border border-[#444746] bg-[#131314] p-2 flex items-center justify-between gap-3">
                <img
                  src={screenshot}
                  alt="Captured screenshot"
                  className="w-24 h-16 object-cover rounded border border-[#2d2f31] cursor-pointer hover:opacity-90"
                  onClick={() => setShowFullPreview(true)}
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[12px] font-medium text-white truncate">
                    Current tab capture
                  </p>
                  <p className="text-[10px] text-[#8e918f]">
                    Attached to feedback
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowFullPreview(true)}
                    className="p-1.5 rounded-full hover:bg-[#2d2f31] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
                    title="View fullscreen preview"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className="p-1.5 rounded-full hover:bg-[#3c2a2b] text-[#f2b8b5] transition-colors cursor-pointer"
                    title="Remove screenshot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Opt-in Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setOptInUpdates(!optInUpdates)}
                className={`w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 mt-0.5 ${
                  optInUpdates
                    ? 'bg-[#a8c7fa] border-[#a8c7fa] text-[#062e6f]'
                    : 'border-[#8e918f] group-hover:border-white'
                }`}
              >
                {optInUpdates && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="text-[12px] text-[#e3e3e3] leading-snug">
                Opt in for updates and information requests
              </span>
            </label>
          </div>

          {/* Legal and System Info Disclaimer Text (opens in new tab) */}
          <div className="text-[11px] text-[#8e918f] leading-relaxed pt-3 border-t border-[#2d2f31]">
            Some{' '}
            <a
              href="/privacy-and-terms?tab=overview"
              target="_blank"
              rel="noreferrer"
              className="text-[#a8c7fa] underline hover:text-[#c2e7ff] cursor-pointer inline"
            >
              account and system information
            </a>{' '}
            may be sent to Ekaze. We use it to fix problems and improve our services, subject to our{' '}
            <a
              href="/privacy-and-terms?tab=privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="text-[#a8c7fa] underline hover:text-[#c2e7ff]"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/privacy-and-terms?tab=terms-of-service"
              target="_blank"
              rel="noreferrer"
              className="text-[#a8c7fa] underline hover:text-[#c2e7ff]"
            >
              Terms of Service
            </a>
            . Visit{' '}
            <a
              href="/privacy-and-terms?tab=legal-help"
              target="_blank"
              rel="noreferrer"
              className="text-[#a8c7fa] underline hover:text-[#c2e7ff]"
            >
              Legal Help
            </a>{' '}
            to ask for content changes for legal reasons.
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-[#2d2f31] flex items-center justify-end">
          <button
            type="button"
            disabled={!feedbackText.trim() || isSubmitting}
            onClick={handleSendFeedback}
            className={`px-6 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
              feedbackText.trim() && !isSubmitting
                ? 'bg-[#a8c7fa] text-[#062e6f] hover:bg-[#c2e7ff] cursor-pointer shadow-md'
                : 'bg-[#3c4043] text-[#8e918f] cursor-not-allowed opacity-80'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </div>

      {/* Google-Style "Allow see this tab?" Confirmation Modal (Matching Image 2) */}
      {showAllowDialog && (
        <div
          className="fixed inset-0 z-[100000] bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4 font-sans select-none"
          onClick={handleCancelScreenshot}
        >
          <div
            className="relative w-full max-w-[560px] bg-[#1e1f20] text-[#e3e3e3] rounded-2xl shadow-2xl p-6 border border-[#3c4043] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Heading */}
            <div className="text-left space-y-1">
              <h3 className="text-[17px] font-medium text-white tracking-tight">
                Allow {currentHost} to see this tab?
              </h3>
              <p className="text-[12px] text-[#c4c7c5]">
                The site will be able to see the contents of this tab
              </p>
            </div>

            {/* Captured Tab Preview Card (Purple Border like Image 2) */}
            <div className="rounded-xl border-2 border-[#7a64a3] bg-[#131314] overflow-hidden p-3 shadow-inner">
              <div className="relative rounded-lg overflow-hidden border border-[#2d2f31] bg-white">
                {tempCapturedImage ? (
                  <img
                    src={tempCapturedImage}
                    alt="Current tab preview"
                    className="w-full max-h-[260px] object-cover object-top"
                  />
                ) : (
                  <div className="h-44 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                )}
              </div>

              {/* Tab Title Footer inside preview card */}
              <div className="flex items-center gap-2 mt-2 px-1 text-[11px] text-left text-[#c4c7c5] truncate">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">{pageTitle}</span>
              </div>
            </div>

            {/* Bottom Actions: Allow / Cancel (Matching Image 2) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelScreenshot}
                className="px-5 py-2 rounded-full text-xs font-semibold text-[#e3e3e3] hover:bg-[#333538] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmScreenshot}
                className="px-6 py-2 rounded-full text-xs font-semibold text-white bg-[#524475] hover:bg-[#63538c] transition-colors cursor-pointer shadow-md"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Screenshot Lightbox */}
      {showFullPreview && screenshot && (
        <div
          className="fixed inset-0 z-[100010] bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowFullPreview(false)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] bg-[#1e1f20] rounded-2xl overflow-hidden shadow-2xl p-3 border border-[#3c4043]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2d2f31] text-xs font-semibold text-white">
              <span>Attached Screenshot Preview</span>
              <button
                onClick={() => setShowFullPreview(false)}
                className="p-1 rounded-full hover:bg-[#333538] text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={screenshot}
              alt="Fullscreen Preview"
              className="max-h-[80vh] w-auto object-contain mx-auto rounded-lg mt-2"
            />
          </div>
        </div>
      )}

      {/* Sensitive Information Info Dialog */}
      {showSensitiveInfoModal && (
        <div
          className="fixed inset-0 z-[100010] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowSensitiveInfoModal(false)}
        >
          <div
            className="bg-[#28292a] border border-[#444746] text-[#e3e3e3] rounded-2xl p-5 max-w-md w-full space-y-3 text-left text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3c4043] pb-2">
              <h3 className="font-bold text-sm text-white">Sensitive Information</h3>
              <button onClick={() => setShowSensitiveInfoModal(false)}>
                <X className="w-4 h-4 text-[#8e918f] hover:text-white" />
              </button>
            </div>
            <p className="text-[#c4c7c5] leading-relaxed">
              To protect your privacy, please avoid including sensitive data in your feedback description or screenshots, such as:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#8e918f]">
              <li>Passwords or PINs</li>
              <li>Bank card or credit card numbers</li>
              <li>National ID numbers or private documents</li>
              <li>Confidential personal identification</li>
            </ul>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSensitiveInfoModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account and System Information Info Dialog */}
      {showSystemInfoModal && (
        <div
          className="fixed inset-0 z-[100010] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowSystemInfoModal(false)}
        >
          <div
            className="bg-[#28292a] border border-[#444746] text-[#e3e3e3] rounded-2xl p-5 max-w-md w-full space-y-3 text-left text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3c4043] pb-2">
              <h3 className="font-bold text-sm text-white">System Information Included</h3>
              <button onClick={() => setShowSystemInfoModal(false)}>
                <X className="w-4 h-4 text-[#8e918f] hover:text-white" />
              </button>
            </div>
            <div className="space-y-1.5 text-[#c4c7c5]">
              <p><span className="font-bold text-white">Page URL:</span> {typeof window !== 'undefined' ? window.location.href : ''}</p>
              <p><span className="font-bold text-white">User:</span> {user?.full_name || 'Anonymous'}</p>
              <p><span className="font-bold text-white">Role:</span> {user?.role || 'Guest'}</p>
              <p><span className="font-bold text-white">Browser / OS:</span> {typeof navigator !== 'undefined' ? navigator.userAgent : ''}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSystemInfoModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;
