// src/app/models/leave.model.ts

// Frontend-friendly Leave model (mapped from backend LeaveRequest)
export interface Leave {
  id?: number | null;               // LeaveRequestId in backend
  employeeId?: number | null;
  employeeName?: string;
  leaveTypeId?: number | null;
  leaveType?: string;               // leaveTypeName from backend
  StartDate?: string;               // ISO date string
  EndDate?: string;                 // ISO date string
  Reason?: string;
  IsStartDateHalfDay?: boolean;
  IsEndDateHalfDay?: boolean;
  status?: string;                  // LeaveRequestStatus as string
  managerRemarks?: string;
  requestedOn?: string | Date | null;
  actionedOn?: string | Date | null;
  leaveRequestFileNames?: string[];   // backend blob names
  temporaryBlobUrls?: string[];       // optional temporary urls for frontend preview
  fromDate: string; 
  toDate: string;   
  leaveDaysUsed: number;
  //leaveDaysUsed?: number;
}

// DTO for creating leave request (matches backend CreateLeaveRequestDto)
export interface CreateLeaveRequestDto {
  LeaveTypeId: number;
  StartDate: string;              // ISO date string
  EndDate: string;                // ISO date string
  Reason: string;
  IsStartDateHalfDay: boolean;
  IsEndDateHalfDay: boolean;
  // files will be sent via FormData under 'Files'
}

// DTO for updating leave request (matches backend UpdateLeaveRequestDto)
export interface UpdateLeaveRequestDto {
  id?: number;
  LeaveTypeId: number;
  StartDate: string;
  EndDate: string;
  Reason: string;
  IsStartDateHalfDay: boolean;
  IsEndDateHalfDay: boolean;
  // files will be sent via FormData under 'Files'
}

// Leave Balance DTO (from backend)
export interface LeaveBalance {
  leaveTypeId: number;
  leaveTypeName: string;
  defaultAnnualAllocation: number;
  used: number;
  remaining: number;
  employeeName?: string;
}

