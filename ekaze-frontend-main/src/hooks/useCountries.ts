import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Country {
  id: number;
  code?: string;
  flag?: string;
  name: string;
  continent: string | null;
  phone_code: string | null;
}

const fetchCountries = async (): Promise<Country[]> => {
  const res = await api.get('/countries');
  return res.data.data;
};

export const useCountries = () =>
  useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60,
  });