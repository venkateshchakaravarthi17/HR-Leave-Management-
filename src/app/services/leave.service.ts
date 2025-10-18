// src/app/services/leave.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import {
  Leave,
  LeaveBalance,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto
} from '../models/leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  leaveRequests$: any;

  getAllEmployees(): any {
    throw new Error('Method not implemented.');
  }

  // base urls
  private readonly apiBase = 'https://localhost:7150/api';
  private readonly leaveRequestsBase = `${this.apiBase}/LeaveRequests`;
  private readonly leaveTypesBase = `${this.apiBase}/LeaveTypes`;

  private leavesSubject = new BehaviorSubject<Leave[]>([]);
  leaves$ = this.leavesSubject.asObservable();

  // ✅ reactive leave balances
  private leaveBalancesSubject = new BehaviorSubject<LeaveBalance[]>([]);
  leaveBalances$ = this.leaveBalancesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /* -------------------------
     Helpers: normalize backend ApiResponse
     ------------------------- */
  private normalizeApiResponse<T>(
    obs: Observable<any>
  ): Observable<{ isSuccess: boolean; message?: string; response?: T }> {
    return obs.pipe(
      map(res => {
        if (!res) return { isSuccess: false, message: 'No response from server' };
        const isSuccess = (res.isSuccess ?? res.IsSuccess) ?? false;
        const message = (res.message ?? res.Message) ?? '';
        const response = (res.response ?? res.Response) ?? res;
        return { isSuccess, message, response } as { isSuccess: boolean; message?: string; response?: T };
      })
    );
  }

  /* -------------------------
     Map backend Leave DTO -> frontend Leave
     ------------------------- */
  private mapLeaveDtoToLeave(dto: any): Leave {
    const rawStatus = dto?.status ?? dto?.Status;
    let statusStr = '';
    if (rawStatus === null || rawStatus === undefined) {
      statusStr = '';
    } else if (typeof rawStatus === 'number') {
      switch (rawStatus) {
        case 0: statusStr = 'pending'; break;
        case 1: statusStr = 'approved'; break;
        case 2: statusStr = 'rejected'; break;
        case 3: statusStr = 'cancelled'; break;
        default: statusStr = String(rawStatus); break;
      }
    } else {
      statusStr = String(rawStatus).toLowerCase().trim();
    }

    const isStartHalf = !!(dto?.isStartDateHalfDay ?? dto?.IsStartDateHalfDay);
    const isEndHalf = !!(dto?.isEndDateHalfDay ?? dto?.IsEndDateHalfDay);
    const isHalfDay = isStartHalf || isEndHalf;

    return {
      id: dto?.leaveRequestId ?? dto?.LeaveRequestId ?? dto?.id ?? null,
      employeeId: dto?.employeeId ?? dto?.EmployeeId ?? null,
      employeeName: dto?.employeeName ?? dto?.EmployeeName ?? '',
      leaveTypeId: dto?.leaveTypeId ?? dto?.LeaveTypeId ?? null,
      leaveType: dto?.leaveTypeName ?? dto?.LeaveTypeName ?? dto?.leaveType ?? '',
      fromDate: dto?.startDate ?? dto?.StartDate ?? '',
      toDate: dto?.endDate ?? dto?.EndDate ?? '',
      StartDate: dto?.StartDate ?? '',
      EndDate: dto?.EndDate ?? '',
      Reason: dto?.reason ?? dto?.Reason ?? '',
      IsStartDateHalfDay: isStartHalf,
      IsEndDateHalfDay: isEndHalf,
      isHalfDay: isHalfDay,
      status: statusStr,
      managerRemarks: dto?.managerRemarks ?? dto?.ManagerRemarks ?? '',
      requestedOn: dto?.requestedOn ?? dto?.RequestedOn ?? null,
      actionedOn: dto?.actionedOn ?? dto?.ActionedOn ?? null,
      leaveRequestFileNames: dto?.leaveRequestFileNames ?? dto?.LeaveRequestFileNames ?? [],
      temporaryBlobUrls: dto?.temporaryBlobUrls ?? dto?.TemporaryBlobUrls ?? [],
      leaveDaysUsed: dto?.leaveDaysUsed ?? dto?.LeaveDaysUsed ?? 0
    } as Leave;
  }

  

  /* -------------------------
     Public API: Leaves
     ------------------------- */
  loadLeaves(isAdmin: boolean, email: string = ''): void {
    const obs = isAdmin ? this.getAllLeaveRequests() : this.getLeaveRequestsForEmployee(email);
    obs.subscribe({
      next: leaves => this.leavesSubject.next(leaves || []),
      error: () => this.leavesSubject.next([])
    });
  }

  refreshLeaves() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const email = localStorage.getItem('currentUserEmail') || sessionStorage.getItem('currentUserEmail') || '';
    this.loadLeaves(isAdmin, email);
  }

  getLeaveRequestsForEmployee(email: string): Observable<Leave[]> {
    const params = new HttpParams().set('Email', email);
    return this.http.get<any>(`${this.leaveRequestsBase}/employee`, { params }).pipe(
      map(res => {
        const payload = res?.response ?? res;
        if (!Array.isArray(payload)) return [];
        return payload.map(p => this.mapLeaveDtoToLeave(p));
      })
    );
  }

  getAllLeaveRequests(): Observable<Leave[]> {
    return this.http.get<any>(`${this.leaveRequestsBase}/all`).pipe(
      map(res => {
        const payload = res?.response ?? res;
        if (!Array.isArray(payload)) return [];
        return payload.map(p => this.mapLeaveDtoToLeave(p));
      })
    );
  }

  applyLeave(payload: CreateLeaveRequestDto) {
    const raw$ = this.http.post<any>(`${this.leaveRequestsBase}`, payload, { headers: { 'Content-Type': 'application/json' } });
    return this.normalizeApiResponse(raw$).pipe(
      tap(() => { this.refreshLeaves(); this.refreshLeaveBalances(); })
    );
  }

  updateLeaveRequest(id: number, dto: UpdateLeaveRequestDto) {
  // Send JSON directly instead of FormData
  return this.http.put<any>(`${this.leaveRequestsBase}/${id}`, dto, {
    headers: { 'Content-Type': 'application/json' }
  }).pipe(
    tap(() => {
      this.refreshLeaves();
      this.refreshLeaveBalances();
    })
  );
}


  cancelLeaveRequest(id: number, managerRemarks: string = '') {
    const body = { ManagerRemarks: managerRemarks };
    const raw$ = this.http.put<any>(`${this.leaveRequestsBase}/${id}/cancel`, body);
    return this.normalizeApiResponse(raw$).pipe(
      tap(() => { this.refreshLeaves(); this.refreshLeaveBalances(); })
    );
  }

  approveLeaveRequest(id: number, managerRemarks: string) {
    const body = { ManagerRemarks: managerRemarks ?? '' };
    const raw$ = this.http.put<any>(`${this.leaveRequestsBase}/${id}/approve`, body);
    return this.normalizeApiResponse(raw$).pipe(
      tap(() => { this.refreshLeaves(); this.refreshLeaveBalances(); })
    );
  }

  rejectLeaveRequest(id: number, managerRemarks: string) {
    const body = { ManagerRemarks: managerRemarks ?? '' };
    const raw$ = this.http.put<any>(`${this.leaveRequestsBase}/${id}/reject`, body);
    return this.normalizeApiResponse(raw$).pipe(
      tap(() => { this.refreshLeaves(); this.refreshLeaveBalances(); })
    );
  }

  revertLeaveRequest(id: number, managerRemarks: string = '') {
    const body = { ManagerRemarks: managerRemarks ?? '' };
    const raw$ = this.http.put<any>(`${this.leaveRequestsBase}/${id}/revert`, body);
    return this.normalizeApiResponse(raw$).pipe(
      tap(() => { this.refreshLeaves(); this.refreshLeaveBalances(); })
    );
  }

  getLeaveById(id: number): Observable<Leave | null> {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      return this.getAllLeaveRequests().pipe(map(list => list.find(l => l.id === id) ?? null));
    } else {
      const email = localStorage.getItem('currentUserEmail') || sessionStorage.getItem('currentUserEmail') || '';
      return this.getLeaveRequestsForEmployee(email).pipe(map(list => list.find(l => l.id === id) ?? null));
    }
  }

  getAllLeaveTypes(): Observable<any[]> {
    return this.http.get<any>(`${this.leaveTypesBase}`).pipe(
      map(res => {
        const payload = (res?.response ?? res) as any[];
        if (!Array.isArray(payload)) return [];
        return payload.map(p => ({
          LeaveTypeId: p.leaveTypeId ?? p.LeaveTypeId,
          LeaveTypeName: p.leaveTypeName ?? p.LeaveTypeName
        }));
      })
    );
  }

  getLeaveTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.leaveTypesBase}/${id}`).pipe(map(res => res?.response ?? res));
  }

  createLeaveType(data: any) { return this.http.post<any>(`${this.leaveTypesBase}`, data); }
  updateLeaveType(data: any) { return this.http.put<any>(`${this.leaveTypesBase}`, data); }

  // ------------------------- Leave balances -------------------------
  /** ✅ Fetch leave balances only from backend — no defaults */
getLeaveBalances(year: number): Observable<LeaveBalance[]> {
  return this.http.get<any>(`${this.leaveRequestsBase}/balance/${year}`).pipe(
    map(res => {
      const payload = res?.response ?? [];
      if (!Array.isArray(payload)) return [];
      return payload.map(p => ({
        leaveTypeId: p.leaveTypeId,
        leaveTypeName: p.leaveTypeName,
        defaultAnnualAllocation: p.defaultAnnualAllocation ?? 0,
        used: p.used ?? 0,
        remaining: p.remaining ?? 0
      } as LeaveBalance));
    })
  );
}


 /**
 * Dynamically calculates leave balances for Admin or Employee based on existing leave requests.
 * @param year - The leave year (e.g., 2025)
 * @param email - The logged-in employee’s email
 * @param isAdmin - Whether the current user is an Admin
 */

  /** ✅ Reload balances from backend */
refreshLeaveBalances(year: number = new Date().getFullYear()): void {
  this.getLeaveBalances(year).subscribe({
    next: (balances) => this.leaveBalancesSubject.next(balances || []),
    error: (err) => {
      console.error('Error refreshing leave balances:', err);
      this.leaveBalancesSubject.next([]);
    }
  });
}


  /* -------------------------
     File helper + util
     ------------------------- */
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  public validateFiles(files: File[], maxSizeBytes = 10 * 1024 * 1024): { ok: boolean; message?: string } {
    const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc', '.txt'];
    for (const f of files) {
      const ext = ('.' + f.name.split('.').pop() || '').toLowerCase();
      if (!allowedExt.includes(ext)) return { ok: false, message: `File ${f.name} has invalid extension (${ext}).` };
      if (f.size > maxSizeBytes) return { ok: false, message: `File ${f.name} exceeds max size ${maxSizeBytes} bytes.` };
    }
    return { ok: true };
  }
}

