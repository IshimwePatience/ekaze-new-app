import React, { useState, useEffect } from "react";
import { X, Star, MessageSquare, Loader2, Award, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { companyApi } from "@/api/companyService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RatingItem {
  id: number | string;
  rating: number;
  comment?: string;
  review?: string;
  company_name?: string;
  reviewer_name?: string;
  reviewer_role?: string;
  created_at: string;
}

interface WorkerRatingModalProps {
  worker: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WorkerRatingModal: React.FC<WorkerRatingModalProps> = ({
  worker,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState<RatingItem[]>([]);
  const [showRateForm, setShowRateForm] = useState(false);

  const workerName =
    worker?.user?.name ||
    worker?.name ||
    `${worker?.first_name || ""} ${worker?.last_name || ""}`.trim() ||
    "Driver";

  useEffect(() => {
    if (!worker?.id || !isOpen) return;

    setIsLoadingReviews(true);
    companyApi
      .getWorkerRatings(worker.id)
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setReviews(list);
      })
      .catch(() => {
        // Fallback to extended_profile ratings if available
        const ext = worker?.extended_profile || {};
        if (Array.isArray(ext.ratings)) {
          setReviews(ext.ratings);
        } else {
          setReviews([]);
        }
      })
      .finally(() => {
        setIsLoadingReviews(false);
      });
  }, [worker?.id, isOpen]);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description: "Please write a performance comment or feedback for this driver.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await companyApi.rateWorker(worker.id, {
        rating,
        comment: comment.trim(),
      });

      toast({
        variant: "success",
        title: "Rating Submitted",
        description: `Your rating for ${workerName} has been recorded.`,
      });

      if (res?.data?.ratings) {
        setReviews(res.data.ratings);
      } else {
        const newEntry: RatingItem = {
          id: Date.now(),
          rating,
          comment: comment.trim(),
          review: comment.trim(),
          reviewer_name: "Your Company",
          company_name: "Your Company",
          created_at: new Date().toISOString(),
        };
        setReviews((prev) => [newEntry, ...prev]);
      }

      setComment("");
      setShowRateForm(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to Submit Rating",
        description: err?.response?.data?.message || err?.message || "Could not submit rating.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      return format(new Date(isoString), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return isoString;
    }
  };

  // Avatar colors matching Picture 2
  const avatarColors = [
    "bg-[#c9302c]",
    "bg-[#2478b8]",
    "bg-[#d9534f]",
    "bg-[#0073bb]",
    "bg-[#b32424]",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2478b8] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Driver Ratings & Company Reviews
              </h2>
              <p className="text-xs text-slate-500">
                Performance history for <span className="font-semibold text-slate-700">{workerName}</span> across companies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showRateForm && (
              <Button
                size="sm"
                onClick={() => setShowRateForm(true)}
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Rate Driver</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rate Worker Form Box (Collapsible / Expandable) */}
          {showRateForm && (
            <form
              onSubmit={handleSubmit}
              className="p-5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rate {workerName}
                </span>
                <button
                  type="button"
                  onClick={() => setShowRateForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Star Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 mr-1">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>

              {/* Comment text area */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Comment & Performance Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe driver's punctuality, road safety, vehicle handling, and work conduct..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2478b8] focus:border-[#2478b8]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRateForm(false)}
                  className="h-8 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-8 text-xs font-semibold bg-[#2478b8] hover:bg-[#1b6296] text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Rating</span>
                </Button>
              </div>
            </form>
          )}

          {/* Testimonial & Review Cards Section matching Picture 2 layout */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                System Company Ratings ({reviews.length})
              </h3>
              <span className="text-xs text-slate-400 font-normal">
                Includes all companies driver worked for
              </span>
            </div>

            {isLoadingReviews ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#2478b8]" />
                <span className="text-xs">Loading company reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-slate-600">
                  No company ratings or comments recorded for this driver yet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRateForm(true)}
                  className="text-xs text-[#2478b8] hover:underline font-semibold cursor-pointer"
                >
                  Be the first company to rate {workerName}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-6 pt-2">
                {reviews.map((rev, idx) => {
                  const companyTitle =
                    rev.company_name || rev.reviewer_name || "Partner Company";
                  const ratingStars = Number(rev.rating) || 5;
                  const reviewComment =
                    rev.comment || rev.review || "Reliable driver with solid performance.";
                  const initialLetter = companyTitle.charAt(0).toUpperCase();
                  const bgCircleColor = avatarColors[idx % avatarColors.length];

                  return (
                    /* Testimonial Layout matching Picture 2 */
                    <div
                      key={rev.id || idx}
                      className="pt-6 first:pt-0 flex items-start gap-5 sm:gap-6"
                    >
                      {/* Left Circular Avatar with colored boundary matching Picture 2 */}
                      <div className="shrink-0">
                        <div
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${bgCircleColor} p-1 shadow-sm flex items-center justify-center overflow-hidden`}
                        >
                          <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                            {initialLetter}
                          </div>
                        </div>
                      </div>

                      {/* Right Testimonial Text & Info */}
                      <div className="flex-1 space-y-2">
                        {/* Quote paragraph text */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                          &ldquo;{reviewComment}&rdquo;
                        </p>

                        {/* Stars */}
                        <div className="flex items-center gap-1 pt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < ratingStars
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">
                            {ratingStars}.0
                          </span>
                        </div>

                        {/* Company Author & Date */}
                        <div className="pt-1">
                          <h4 className="text-xs sm:text-sm font-bold text-[#c9302c]">
                            {companyTitle}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-normal">
                            Company in System &bull; {formatDate(rev.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerRatingModal;
