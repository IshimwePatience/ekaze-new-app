import api from '@/lib/api';

export interface HelpFeedbackPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  type?: 'feedback' | 'bug' | 'feature' | 'help' | 'support';
  category?: string;
  subject?: string;
  message: string;
  page_url?: string;
  screenshot?: string;
  browser_info?: string;
}

export interface HelpFeedbackItem {
  id: number | string;
  ticket_number: string;
  user_id?: number | string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  type: 'feedback' | 'bug' | 'feature' | 'help' | 'support';
  category: string;
  subject?: string | null;
  message: string;
  page_url?: string | null;
  screenshot?: string | null;
  browser_info?: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  admin_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number | string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    profile_photo?: string;
  };
}

export interface HelpFeedbackStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  bugs: number;
  features: number;
}

export const helpFeedbackService = {
  // Public or Authenticated submission
  submitHelpFeedback: async (payload: HelpFeedbackPayload) => {
    const response = await api.post('/help-feedback', payload);
    return response.data;
  },

  // Admin: get all tickets with filtering
  getHelpFeedbacks: async (params?: {
    status?: string;
    type?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/help-feedback', { params });
    return response.data;
  },

  // Admin: get stats
  getStats: async (): Promise<{ success: boolean; stats: HelpFeedbackStats }> => {
    const response = await api.get('/help-feedback/stats');
    return response.data;
  },

  // Admin: update status
  updateStatus: async (
    id: number | string,
    data: { status: string; admin_notes?: string }
  ) => {
    const response = await api.put(`/help-feedback/${id}/status`, data);
    return response.data;
  },

  // Admin: delete ticket
  deleteFeedback: async (id: number | string) => {
    const response = await api.delete(`/help-feedback/${id}`);
    return response.data;
  }
};

export default helpFeedbackService;
