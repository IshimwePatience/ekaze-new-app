export interface WorkerLocationItem {
  worker_id: number;
  full_name: string;
  profile_photo: string | null;
  phone: string;
  employer_name?: string;
  employer_phone?: string;
  employment_id: number;
  latitude: number | string;
  longitude: number | string;
  address: string | null;
  district: string | null;
  sector: string | null;
  last_updated: string;
  last_updated_diff: string;
  has_location?: boolean;
  start_date?: string;
}

export interface EmployerWorkerLocationsResponse {
  success: boolean;
  data: {
    workers: WorkerLocationItem[];
    total_active: number;
    with_location: number;
  };
}

export interface AdminWorkerLocationsResponse {
  success: boolean;
  data: {
    workers: WorkerLocationItem[];
    summary: {
      total_on_map: number;
      by_district: Record<string, number>;
    };
  };
}

export interface SetWorkerLocationRequest {
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
  sector?: string;
}