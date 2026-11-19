import api from '@/lib/api';
import type {
  Province,
  District,
  Sector,
  Cell,
  Village,
  LocationHierarchy,
  LocationResponse,
} from '@/types/location.types';

export const locationApi = {
  // Get all provinces
  getProvinces: async (): Promise<LocationResponse<Province[]>> => {
    const response = await api.get('/locations/provinces');
    return response.data;
  },

  // Get districts (optionally filtered by province ID or Name)
  getDistricts: async (province?: number | string): Promise<LocationResponse<District[]>> => {
    const params: any = {};
    if (typeof province === 'number') {
      params.province_id = province;
    } else if (province) {
      params.province = province;
    }
    const response = await api.get('/locations/districts', { params });
    return response.data;
  },

  // Get sectors (optionally filtered by district ID or Name)
  getSectors: async (district?: number | string): Promise<LocationResponse<Sector[]>> => {
    const params: any = {};
    if (typeof district === 'number') {
      params.district_id = district;
    } else if (district) {
      params.district = district;
    }
    const response = await api.get('/locations/sectors', { params });
    return response.data;
  },

  // Get cells (optionally filtered by sector ID or Name, plus optional district)
  getCells: async (sector?: number | string, district?: number | string): Promise<LocationResponse<Cell[]>> => {
    const params: any = {};
    if (typeof sector === 'number') {
      params.sector_id = sector;
    } else if (sector) {
      params.sector = sector;
    }
    if (district) {
      params.district = district;
    }
    const response = await api.get('/locations/cells', { params });
    return response.data;
  },

  // Get villages (optionally filtered by cell ID or Name, plus optional sector)
  getVillages: async (cell?: number | string, sector?: number | string): Promise<LocationResponse<Village[]>> => {
    const params: any = {};
    if (typeof cell === 'number') {
      params.cell_id = cell;
    } else if (cell) {
      params.cell = cell;
    }
    if (sector) {
      params.sector = sector;
    }
    const response = await api.get('/locations/villages', { params });
    return response.data;
  },

  // Get complete location hierarchy
  getHierarchy: async (): Promise<LocationResponse<LocationHierarchy[]>> => {
    const response = await api.get('/locations/hierarchy');
    return response.data;
  },
};
