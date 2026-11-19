export interface Province {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  province_id: number;
  province?: Province;
}

export interface Sector {
  id: number;
  name: string;
  district_id: number;
  district?: District;
}

export interface Cell {
  id: number;
  name: string;
  sector_id: number;
  sector?: Sector;
}

export interface Village {
  id: number;
  name: string;
  cell_id: number;
  cell?: Cell;
}

export interface LocationHierarchy {
  id: number;
  name: string;
  districts?: Array<District & {
    sectors?: Array<Sector & {
      cells?: Array<Cell & {
        villages?: Village[];
      }>;
    }>;
  }>;
}

export interface LocationResponse<T> {
  success: boolean;
  data: T;
}