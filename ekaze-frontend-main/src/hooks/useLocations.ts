import { useQuery } from '@tanstack/react-query';
import { locationApi } from '@/api/locationService';

// Helper to safely extract an array regardless of API response wrapping
const extractArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

// Query Keys
export const locationKeys = {
  all: ['locations'] as const,
  provinces: () => [...locationKeys.all, 'provinces'] as const,
  districts: (province?: number | string) => [...locationKeys.all, 'districts', province] as const,
  sectors: (district?: number | string) => [...locationKeys.all, 'sectors', district] as const,
  cells: (sector?: number | string, district?: number | string) => [...locationKeys.all, 'cells', sector, district] as const,
  villages: (cell?: number | string, sector?: number | string) => [...locationKeys.all, 'villages', cell, sector] as const,
  hierarchy: () => [...locationKeys.all, 'hierarchy'] as const,
};

// Get all provinces
export const useProvinces = () => {
  return useQuery({
    queryKey: locationKeys.provinces(),
    queryFn: async () => {
      const response = await locationApi.getProvinces();
      return extractArray(response);
    },
    staleTime: Infinity,
  });
};

// Get districts by province (ID or Name)
export const useDistricts = (province?: number | string) => {
  return useQuery({
    queryKey: locationKeys.districts(province),
    queryFn: async () => {
      const response = await locationApi.getDistricts(province);
      return extractArray(response);
    },
    enabled: Boolean(province),
    staleTime: Infinity,
  });
};

// Get sectors by district (ID or Name)
export const useSectors = (district?: number | string) => {
  return useQuery({
    queryKey: locationKeys.sectors(district),
    queryFn: async () => {
      const response = await locationApi.getSectors(district);
      return extractArray(response);
    },
    enabled: Boolean(district),
    staleTime: Infinity,
  });
};

// Get cells by sector (ID or Name)
export const useCells = (sector?: number | string, district?: number | string) => {
  return useQuery({
    queryKey: locationKeys.cells(sector, district),
    queryFn: async () => {
      const response = await locationApi.getCells(sector, district);
      return extractArray(response);
    },
    enabled: Boolean(sector),
    staleTime: Infinity,
  });
};

// Get villages by cell (ID or Name)
export const useVillages = (cell?: number | string, sector?: number | string) => {
  return useQuery({
    queryKey: locationKeys.villages(cell, sector),
    queryFn: async () => {
      const response = await locationApi.getVillages(cell, sector);
      return extractArray(response);
    },
    enabled: Boolean(cell),
    staleTime: Infinity,
  });
};

// Get complete hierarchy
export const useLocationHierarchy = () => {
  return useQuery({
    queryKey: locationKeys.hierarchy(),
    queryFn: async () => {
      const response = await locationApi.getHierarchy();
      return response.data;
    },
    staleTime: Infinity,
  });
};
