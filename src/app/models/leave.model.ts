export interface Leave {
  isHalfDay: boolean;
  id?: number;
  employeeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
}
