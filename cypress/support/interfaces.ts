export interface Facility {
  facility_name: string;
  monthly_summary: Record<string, any> | null;
  address?: string;
  rating?: number;
  patient_capacity: number;
  number_of_staff: number;
  date_added?: Date;
}

export  interface newFacility {
  id: number;
}

