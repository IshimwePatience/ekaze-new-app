import { useQuery } from '@tanstack/react-query';
import { policeJurisdictionApi } from '@/api/policeJurisdictionService';

export const policeJurisdictionKeys = {
  all: ['police-jurisdictions'] as const,
  mine: () => [...policeJurisdictionKeys.all, 'mine'] as const,
};

export const useMyJurisdictions = () => {
  return useQuery({
    queryKey: policeJurisdictionKeys.mine(),
    queryFn: () => policeJurisdictionApi.getMyJurisdictions(),
    staleTime: 60000,
  });
};