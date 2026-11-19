export type ApplyScope = "every_week" | "this_week" | "custom";

export interface AvailabilitySlot {
  id: number;
  worker_id: number;
  day_index: number; // 0=Mon … 6=Sun
  day_label: string;
  start_time: string; // "HH:mm"
  end_time: string;
  scope: ApplyScope;
  custom_from: string | null;
  custom_to: string | null;
  is_active: boolean;
}

export interface SaveAvailabilityRequest {
  scope: ApplyScope;
  custom_from?: string | null;
  custom_to?: string | null;
  slots: {
    day_index: number;
    start_time: string;
    end_time: string;
  }[];
}

export interface AvailabilitySlotsResponse {
  success: boolean;
  message?: string;
  data: AvailabilitySlot[];
}

export interface WeekViewBookedItem {
  employment_id: number;
  employer: string;
  start_date: string;
  day_index: number;
}

export interface WeekViewResponse {
  success: boolean;
  data: {
    week_start: string;
    week_end: string;
    availability: AvailabilitySlot[];
    booked: WeekViewBookedItem[];
  };
}

// Frontend-only local slot (before saving — uses string id for new unsaved slots)
export interface LocalAvailabilitySlot {
  id: string;
  dayIndex: number;
  startTime: string;
  endTime: string;
}

export interface LocalAvailabilitySetting {
  slots: LocalAvailabilitySlot[];
  scope: ApplyScope;
  customFrom: string;
  customTo: string;
}