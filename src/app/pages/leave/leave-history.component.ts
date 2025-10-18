// src/app/pages/leave/leave-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/leave.model';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.scss']
})
export class LeaveHistoryComponent implements OnInit {
  leaves: Leave[] = [];
  filteredLeaves: Leave[] = [];

  searchText = '';
  filterTypeId: number | '' = '';
  filterYear: number | '' = '';
  leaveTypes: any[] = [];

  loading = false;
  isAdmin = false;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    // Determine if current user is admin
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';

    this.loadLeaveTypes();
    this.loadHistory();
  }

  loadLeaveTypes(): void {
    this.leaveService.getAllLeaveTypes().subscribe({
      next: (types) => (this.leaveTypes = types || []),
      error: (err) => {
        console.error('Failed to load leave types', err);
        this.leaveTypes = [];
      }
    });
  }

  loadHistory(): void {
  this.loading = true;

  const email =
    localStorage.getItem('currentUserEmail') ||
    sessionStorage.getItem('currentUserEmail') ||
    '';

  const obs = this.isAdmin
    ? this.leaveService.getAllLeaveRequests()
    : this.leaveService.getLeaveRequestsForEmployee(email);

  obs.subscribe({
    next: (leaves) => {
      const mapped: Leave[] = (leaves || []).map((l: any) => ({
        ...l,
        StartDate: l.StartDate || l.startDate || l.fromDate || l.FromDate,
        EndDate: l.EndDate || l.endDate || l.toDate || l.ToDate,
      }));

      // ✅ Show only Approved/Rejected (history)
      const history = mapped.filter(
        (l) =>
          l.status?.toLowerCase() === 'approved' ||
          l.status?.toLowerCase() === 'rejected'
      );

      // ✅ Sort by start date (desc)
      this.leaves = history.sort(
        (a, b) =>
          new Date(b.StartDate!).getTime() - new Date(a.StartDate!).getTime()
      );

      this.filteredLeaves = [...this.leaves];
      this.applyFilters(); // reapply filters
      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
      Swal.fire('Error', 'Could not load leave history', 'error');
    }
  });
}


  applyFilters(): void {
    this.filteredLeaves = this.leaves.filter((l) => {
      const matchesSearch =
        !this.searchText ||
        (l.employeeName &&
          l.employeeName.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (l.leaveType &&
          l.leaveType.toLowerCase().includes(this.searchText.toLowerCase()));

      const matchesType =
        this.filterTypeId === '' || l.leaveTypeId === this.filterTypeId;

      const matchesYear =
        this.filterYear === '' ||
        (l.StartDate &&
          new Date(l.StartDate).getFullYear() === +this.filterYear) ||
        (l.EndDate && new Date(l.EndDate).getFullYear() === +this.filterYear);

      return matchesSearch && matchesType && matchesYear;
    });
  }

  resetFilters(): void {
    this.searchText = '';
    this.filterTypeId = '';
    this.filterYear = '';
    this.filteredLeaves = [...this.leaves];
  }

  revertLeave(id: number) {
    Swal.fire({
      title: 'Revert Leave',
      input: 'textarea',
      inputLabel: 'Remarks (optional)',
      inputPlaceholder: 'Add remarks if needed',
      showCancelButton: true,
      confirmButtonText: 'Revert'
    }).then((r) => {
      if (!r.isConfirmed) return;
      const remarks = r.value ?? '';
      this.leaveService.revertLeaveRequest(id, remarks).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            Swal.fire('Reverted', res.message || 'Leave reverted successfully', 'success');
            this.loadHistory();
          } else {
            Swal.fire('Error', res.message || 'Failed to revert leave', 'error');
          }
        },
        error: (err) => {
          Swal.fire('Error', err?.error?.message || 'Server error', 'error');
        }
      });
    });
  }

  calcDays(l: Leave): number {
    if (!l.StartDate || !l.EndDate) return 0;
    const s = new Date(l.StartDate);
    const e = new Date(l.EndDate);
    const diff = (e.getTime() - s.getTime()) / (1000 * 3600 * 24) + 1;
    const isHalfDay = l.IsStartDateHalfDay || l.IsEndDateHalfDay;
    return isHalfDay && diff === 1 ? 0.5 : diff;
  }
}
