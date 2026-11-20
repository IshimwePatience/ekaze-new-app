import React, { useState, useEffect } from "react";
import {
  Star,
  ArrowLeft,
  MessageSquare,
  Loader2,
  Building2,
  CheckCircle2,
  User,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  reviewer_photo?: string;
  created_at: string;
}

interface CompanyWorkerRatingsPageProps {
  worker: any;
  onBack: () => void;
  onRatingSubmitted?: () => void;
}

export const CompanyWorkerRatingsPage: React.FC<CompanyWorkerRatingsPageProps> = ({
  worker,
  onBack,
  onRatingSubmitted,
}) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<RatingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "others">("all");

  // Rate Modal state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workerUser = worker?.user || worker || {};
  const workerName =
    workerUser?.name ||
    worker?.name ||
    `${workerUser?.first_name || worker?.first_name || ""} ${workerUser?.last_name || worker?.last_name || ""}`.trim() ||
    "Driver";

  const rawPhoto =
    workerUser?.profile_photo ||
    workerUser?.photo ||
    worker?.profile_photo ||
    worker?.business_card_path ||
    null;

  const resolvePhotoUrl = (p: string | null) => {
    if (!p) return null;
    if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("data:")) return p;
    return `${window.location.origin}${p.startsWith("/") ? "" : "/"}${p}`;
  };

  const driverPhoto = resolvePhotoUrl(rawPhoto);

  const fetchRatings = async () => {
    if (!worker?.id) return;
    try {
      setIsLoading(true);
      const res = await companyApi.getWorkerRatings(worker.id);
      const list = Array.isArray(res?.data) ? res.data : [];
      setReviews(list);
    } catch {
      const ext = worker?.extended_profile || {};
      if (Array.isArray(ext.ratings)) {
        setReviews(ext.ratings);
      } else {
        setReviews([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [worker?.id]);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description: "Please provide a performance evaluation or feedback comment.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await companyApi.rateWorker(worker.id, {
        rating,
        comment: comment.trim(),
      });

      toast({
        variant: "success",
        title: "Rating Submitted",
        description: `Your rating for ${workerName} has been recorded.`,
      });

      setComment("");
      setIsRateModalOpen(false);
      fetchRatings();
      if (onRatingSubmitted) onRatingSubmitted();
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

  // Filter reviews
  const currentCompanyName = "Your Company";
  const myReviews = reviews.filter((r) =>
    (r.company_name || r.reviewer_name || "").toLowerCase().includes("your") ||
    (r.company_name || "").toLowerCase() === currentCompanyName.toLowerCase()
  );
  const otherReviews = reviews.filter((r) => !myReviews.includes(r));

  const displayedReviews =
    activeFilter === "mine" ? myReviews : activeFilter === "others" ? otherReviews : reviews;

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : worker?.rating
      ? Number(worker.rating).toFixed(1)
      : "5.0";

  return (
    <div className="w-full bg-white space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ── Breadcrumb & Page Header ── */}
      <div className="pt-1 pb-2 border-b border-slate-200">
        <PageHeaderBreadcrumb
          title="Driver Ratings"
          items={[{ label: "Drivers Management", onClick: onBack }]}
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsRateModalOpen(true)}
              className="h-8 bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-white stroke-none" />
              <span>Rate Your Worker</span>
            </Button>
          </div>
        </PageHeaderBreadcrumb>
      </div>

      {/* ── Driver Summary Banner ── */}
      <div className="py-2 px-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {driverPhoto ? (
              <img
                src={driverPhoto}
                alt={workerName}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-bold text-lg">
                {workerName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{workerName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-[#2478b8]">
                {worker?.driving_licence_type ? `Permit Cat. ${worker.driving_licence_type}` : "Driver"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {[workerUser?.phone, workerUser?.email, workerUser?.district || "Kigali"].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>

        {/* Rating Score Badge */}
        <div className="flex items-center gap-4 self-start sm:self-auto py-1">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-bold text-slate-900">{avgRating}</span>
          </div>
          <div className="text-xs text-slate-500 border-l border-slate-200 pl-3">
            <span className="font-semibold text-slate-800">{reviews.length}</span> Company{" "}
            {reviews.length === 1 ? "Review" : "Reviews"}
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#2478b8] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Ratings ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("mine")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === "mine"
                ? "bg-[#2478b8] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Your Company Past Ratings ({myReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("others")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === "others"
                ? "bg-[#2478b8] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Other Companies ({otherReviews.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing company reviews across Ekaze
        </span>
      </div>

      {/* ── Testimonials Grid Section (Matching Picture 2: 2 Columns Grid) ── */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#2478b8]" />
          <span className="text-xs">Loading company evaluations...</span>
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="py-12">
          <CharacterIllustration
            type="default"
            title="No ratings recorded"
            description={
              activeFilter === "mine"
                ? "You haven't submitted any performance rating for this worker yet."
                : activeFilter === "others"
                ? "No other companies have evaluated this worker yet."
                : "No company ratings recorded yet for this driver."
            }
          />
        </div>
      ) : (
        /* TWO COLUMN GRID CLONING PICTURE 2 DESIGN */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-2">
          {displayedReviews.map((rev, idx) => {
            const companyName = rev.company_name || rev.reviewer_name || "Company Fleet";
            const score = Number(rev.rating) || 5;
            const quoteText = rev.comment || rev.review || "Reliable driver with good performance.";
            const initial = companyName.charAt(0).toUpperCase();

            return (
              <div
                key={rev.id || idx}
                className="flex items-start gap-5 sm:gap-6 p-4 rounded-xl hover:bg-slate-50/50 transition-colors"
              >
                {/* Left Circular Avatar with Red Background/Border (Cloning Picture 2) */}
                <div className="shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#c9302c] p-1 flex items-center justify-center overflow-hidden shadow-sm">
                    {rev.reviewer_photo ? (
                      <img
                        src={resolvePhotoUrl(rev.reviewer_photo) || ""}
                        alt={companyName}
                        className="w-full h-full rounded-full object-cover grayscale"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#b82a26] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
                        {initial}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Testimonial & Company Information */}
                <div className="flex-1 space-y-2">
                  {/* Quote Paragraph */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    &ldquo;{quoteText}&rdquo;
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 pt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < score
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">
                      {score}.0
                    </span>
                  </div>

                  {/* Company Title in Bold Red & Subtitle */}
                  <div className="pt-1">
                    <h4 className="text-sm sm:text-base font-bold text-[#c9302c]">
                      {companyName}
                    </h4>
                    <p className="text-xs text-slate-400 font-normal">
                      Company in System &bull; {formatDate(rev.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rate Your Worker Modal Dialog ── */}
      <Dialog open={isRateModalOpen} onOpenChange={setIsRateModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Rate Your Worker
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit your performance evaluation and feedback for{" "}
              <span className="font-semibold text-slate-700">{workerName}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRating} className="space-y-4 pt-2">
            {/* Interactive Stars */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Rating Score <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
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
                      className={`w-7 h-7 ${
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
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Performance Comment & Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe driver's road safety, vehicle maintenance, punctuality, and conduct..."
                rows={4}
                className="w-full p-3 text-xs rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2478b8] focus:border-[#2478b8]"
                required
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Rating</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyWorkerRatingsPage;
