// src/app/services/leave.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';


export interface Leave {
  isHalfDay: boolean;
  id?: number;
  employeeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  rejectedReason?: string;
}

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private storageKey = 'leavesData';
  private leaves: Leave[] = [];
  private leavesSubject = new BehaviorSubject<Leave[]>([]);

  constructor() {
   
    const storedLeaves = localStorage.getItem(this.storageKey);
    this.leaves = storedLeaves ? JSON.parse(storedLeaves) : [];
    this.leavesSubject.next(this.leaves);
  }

  private updateStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.leaves));
    this.leavesSubject.next(this.leaves);
  }

  getLeaves(): Observable<Leave[]> {
    return this.leavesSubject.asObservable();
  }

  getLeaveById(id: number): Observable<Leave | undefined> {
    const leave = this.leaves.find(l => l.id === id);
    return of(leave);
  }

  applyLeave(leave: Leave): Observable<void> {
    leave.id = this.generateId();
    this.leaves.push(leave);
    this.updateStorage();
    return of(void 0).pipe(delay(500)); 
  }

  updateLeave(leaveId: number, updatedLeave: Leave): Observable<void> {
  const index = this.leaves.findIndex(l => l.id === leaveId);
  if (index !== -1) {
    this.leaves[index] = { ...updatedLeave, id: leaveId };
    this.updateStorage();
  }
  return of(void 0).pipe(delay(300));
}


  deleteLeave(id: number): Observable<void> {
    this.leaves = this.leaves.filter(l => l.id !== id);
    this.updateStorage();
    return of(void 0);
  }

  private generateId(): number {
    return this.leaves.length ? Math.max(...this.leaves.map(l => l.id || 0)) + 1 : 1;
  }
}
