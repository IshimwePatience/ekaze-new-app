import api from '@/lib/api';

export const nidaApi = {
  check: async (nid: string) => {
    const r = await api.post('/nida/check', { nid });
    return r.data;
  },

  verify: async (payload: { nid: string; fullname?: string; date_of_birth?: string }) => {
    const r = await api.post('/nida/verify', payload);
    return r.data;
  },
};