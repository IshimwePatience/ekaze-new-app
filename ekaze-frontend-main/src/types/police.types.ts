export type PoliceTabType = "overview" | "incidents" | "statistics" | "profile" | "jurisdiction";



export interface PoliceJurisdictionItem {
  id: number;
  coverage_level: 'province' | 'district' | 'sector' | 'cell' | 'village';
  coverage_summary: string;
  notes: string | null;
  province?: { id: number; name: string };
  district?: { id: number; name: string };
  sector?: { id: number; name: string };
  cell?: { id: number; name: string };
  village?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface MyJurisdictionsResponse {
  success: boolean;
  data: {
    jurisdictions: PoliceJurisdictionItem[];
    total: number;
    coverage_areas: Array<{
      id: number;
      coverage_level: string;
      coverage_summary: string;
      notes: string | null;
    }>;
  };
}