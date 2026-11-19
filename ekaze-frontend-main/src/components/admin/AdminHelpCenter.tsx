import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  Eye,
  X,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { helpFeedbackService, HelpFeedbackItem } from '@/api/helpFeedbackService';
import { PageHeaderBreadcrumb } from '@/components/common/PageHeaderBreadcrumb';

export const AdminHelpCenter: React.FC = () => {
  const [tickets, setTickets] = useState<HelpFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'RESOLVED' | 'ALL'>('ALL');

  // Modal / Image Preview
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await helpFeedbackService.getHelpFeedbacks();
      if (res?.data) {
        setTickets(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching help feedback:', err);
      toast.error('Failed to load feedback reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Compute counts
  const openCount = tickets.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress' || (t.status as string) === 'open'
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === 'resolved' || (t.status as string) === 'closed'
  ).length;
  const allCount = tickets.length;

  // Filtered list
  const filteredList = tickets.filter((t) => {
    const isResolved = t.status === 'resolved' || (t.status as string) === 'closed';
    if (statusFilter === 'OPEN') return !isResolved;
    if (statusFilter === 'RESOLVED') return isResolved;
    return true;
  });

  // Quick Resolve
  const handleResolveFeedback = async (ticket: HelpFeedbackItem) => {
    try {
      await helpFeedbackService.updateStatus(ticket.id, {
        status: 'resolved',
        admin_notes: 'Issue marked as resolved by Ihirwe.',
      });
      toast.success('Feedback marked as resolved and user notified.');
      setTickets((prev) =>
        prev.map((item) =>
          item.id === ticket.id
            ? {
              ...item,
              status: 'resolved',
              resolved_at: new Date().toISOString(),
              admin_notes: 'Issue marked as resolved by Ihirwe.',
            }
            : item
        )
      );
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* 1. Top Breadcrumb Header */}
      <div className="pt-1 pb-3 px-0">
        <PageHeaderBreadcrumb title="Help & Feedback Center" />
      </div>

      <div className="w-full bg-white border-t border-slate-200 pt-5 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          {/* 2. Sub-Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('OPEN')}
              className={`px-4 py-1.5 text-xs font-normal rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === 'OPEN'
                  ? 'bg-[#2478b8] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
            >
              Open <span className="text-[11px] font-normal">{openCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-4 py-1.5 text-xs font-normal rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === 'RESOLVED'
                  ? 'bg-[#2478b8] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
            >
              Resolved <span className="text-[11px] font-normal">{resolvedCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-1.5 text-xs font-normal rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === 'ALL'
                  ? 'bg-[#2478b8] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
            >
              All <span className="text-[11px] font-normal">{allCount}</span>
            </button>
          </div>

          {/* 3. Feedback Reports List */}
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-500 font-normal">
              Loading user feedback requests...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-28 text-center text-sm text-gray-400 font-normal">
              No {statusFilter.toLowerCase()} reports
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map((item) => {
                const isResolved =
                  item.status === 'resolved' || (item.status as string) === 'closed';
                const displayName = item.user?.full_name || item.name || 'Anonymous User';
                const displayRole = item.role || item.user?.role || 'User';
                const displayEmail = item.email || item.user?.email || '';
                const dateString = item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : '';
                const avatarLetter = (displayName[0] || 'U').toUpperCase();

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-2xl p-5 bg-white shadow-xs hover:shadow-md transition space-y-3"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.user?.profile_photo ? (
                          <img
                            src={item.user.profile_photo}
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0052cc] font-normal flex items-center justify-center text-sm">
                            {avatarLetter}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-normal text-gray-900">{displayName}</h4>
                            <span className="px-2 py-0.5 text-[10px] font-normal rounded bg-gray-100 text-gray-700 capitalize">
                              {displayRole}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {displayEmail} {displayEmail && dateString ? '• ' : ''}
                            {dateString}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 text-xs font-normal rounded-full ${isResolved
                              ? 'bg-blue-50 text-[#2478b8] border border-blue-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        >
                          {isResolved ? 'Resolved' : 'Open'}
                        </span>

                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => handleResolveFeedback(item)}
                            className="px-3.5 py-1.5 bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-normal rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Message description box */}
                    <div className="text-sm text-gray-700 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 leading-relaxed font-normal whitespace-pre-wrap">
                      {item.message || item.subject}
                    </div>

                    {/* Ihirwe Response / Notes if present */}
                    {item.admin_notes && (
                      <div className="text-xs text-slate-700 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                        <span className="font-normal text-slate-800 block mb-0.5">Ihirwe Response:</span>
                        <p className="text-slate-600 leading-relaxed font-normal">
                          {item.admin_notes
                            .replace(/by Administrator/gi, 'by Ihirwe')
                            .replace(/by Admin/gi, 'by Ihirwe')
                            .replace(/Administrator/gi, 'Ihirwe')
                            .replace(/Admin/gi, 'Ihirwe')}
                        </p>
                      </div>
                    )}

                    {/* Screenshot Thumbnail */}
                    {item.screenshot && (
                      <div className="pt-1">
                        <p className="text-xs font-normal text-gray-500 mb-1.5">
                          Attached Issue Screenshot:
                        </p>
                        <div
                          onClick={() => setSelectedImage(item.screenshot || null)}
                          className="relative w-48 h-32 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group bg-gray-100"
                        >
                          <img
                            src={item.screenshot}
                            alt="Feedback Screenshot"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <Eye className="w-4 h-4" /> Expand
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer / Resolved Time */}
                    {isResolved && item.resolved_at && (
                      <div className="text-[11px] text-gray-400 pt-1 italic border-t border-gray-100 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Resolved on {new Date(item.resolved_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Full Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged issue screenshot"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHelpCenter;
