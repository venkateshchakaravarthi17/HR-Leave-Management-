// src/app/pages/leave/leaves-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/leave.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leaves-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './leaves-list.component.html'
})
export class LeavesListComponent implements OnInit {
  leaves: Leave[] = [];
  filteredLeaves: Leave[] = [];
  searchText = '';
  filterStatus = '';
  startDate = '';
  endDate = '';
  loading = false;
  isAdmin = false;
  currentUserEmail = '';

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isAdmin = currentUser?.role?.toLowerCase() === 'admin';
      this.currentUserEmail = currentUser?.workEmail || currentUser?.email || '';
    } else {
      this.isAdmin = false;
      this.currentUserEmail = '';
    }

    this.loadLeaves();
  }

  loadLeaves(): void {
    this.loading = true;
    const obs = this.isAdmin
      ? this.leaveService.getAllLeaveRequests()
      : this.leaveService.getLeaveRequestsForEmployee(this.currentUserEmail);

    obs.subscribe({
      next: (leaves) => {
        console.log('Leaves from API:', leaves);
        // ✅ Normalize status and keep consistent field names (fromDate / toDate)
        this.leaves = (leaves || []).map(l => ({
          ...l,
          status: (l.status || '').toLowerCase().trim()
        }));
        this.filteredLeaves = [...this.leaves];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading leaves:', err);
        this.loading = false;
        Swal.fire('Error', 'Could not load leave records', 'error');
      },
    });
  }

  // ✅ FIXED date filter logic (using fromDate / toDate)
  applyFilters(): void {
    const filterStart = this.startDate ? new Date(this.startDate) : null;
    const filterEnd = this.endDate ? new Date(this.endDate) : null;

    this.filteredLeaves = this.leaves.filter((l) => {
      const status = (l.status || '').toLowerCase().trim();

      const matchesSearch =
        !this.searchText ||
        (l.employeeName &&
          l.employeeName.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (l.leaveType &&
          l.leaveType.toLowerCase().includes(this.searchText.toLowerCase())) ||
        status.includes(this.searchText.toLowerCase());

      const matchesStatus =
        !this.filterStatus || status === this.filterStatus.toLowerCase();

      // ✅ FIXED field names
      const leaveStart = l.fromDate ? new Date(l.fromDate) : null;
      const leaveEnd = l.toDate ? new Date(l.toDate) : null;

      const matchesDate =
        (!filterStart || (leaveStart && leaveStart >= filterStart)) &&
        (!filterEnd || (leaveEnd && leaveEnd <= filterEnd));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  resetFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.filteredLeaves = [...this.leaves];
  }

  // 🔹 Employee Actions
  editLeave(id: number) {
  this.router.navigate([`/leave/edit/${id}`]);
}


 cancelLeave(id: number) {
  const title = this.isAdmin ? 'Delete Leave?' : 'Cancel Leave?';
  const text = this.isAdmin
    ? 'Do you want to delete this leave record?'
    : 'Do you want to cancel this leave request?';

  Swal.fire({ title, text, icon: 'warning', showCancelButton: true }).then(
    (r) => {
      if (!r.isConfirmed) return;

      const remarks = this.isAdmin ? 'Deleted by admin' : '';
      this.leaveService.cancelLeaveRequest(id, remarks).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            Swal.fire(
              this.isAdmin ? 'Deleted' : 'Cancelled',
              res.message || (this.isAdmin ? 'Leave deleted' : 'Leave cancelled'),
              'success'
            );
            this.loadLeaves();
          } else Swal.fire('Error', res.message || 'Failed operation', 'error');
        },
        error: (err) =>
          Swal.fire('Error', err?.error?.message || 'Server error', 'error'),
      });
    }
  );
}


  // 🔹 Admin Actions
  approveLeave(id: number) {
    Swal.fire({
      title: 'Approve Leave',
      input: 'textarea',
      inputLabel: 'Manager Remarks (optional)',
      showCancelButton: true,
      confirmButtonText: 'Approve',
    }).then((r) => {
      if (!r.isConfirmed) return;
      const remarks = r.value ?? '';
      this.leaveService.approveLeaveRequest(id, remarks).subscribe({
        next: (res) => {
          if (res.isSuccess)
            Swal.fire('Approved', res.message || 'Leave approved', 'success');
          else
            Swal.fire('Error', res.message || 'Failed to approve leave', 'error');
          this.loadLeaves();
        },
        error: (err) =>
          Swal.fire('Error', err?.error?.message || 'Server error', 'error'),
      });
    });
  }

  rejectLeave(id: number) {
    Swal.fire({
      title: 'Reject Leave',
      input: 'textarea',
      inputLabel: 'Remarks (required)',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      inputValidator: (value) =>
        !value || value.trim().length < 3
          ? 'Please provide a valid remark'
          : null,
    }).then((r) => {
      if (!r.isConfirmed) return;
      const remarks = r.value ?? '';
      this.leaveService.rejectLeaveRequest(id, remarks).subscribe({
        next: (res) => {
          if (res.isSuccess)
            Swal.fire('Rejected', res.message || 'Leave rejected', 'success');
          else
            Swal.fire('Error', res.message || 'Failed to reject leave', 'error');
          this.loadLeaves();
        },
        error: (err) =>
          Swal.fire('Error', err?.error?.message || 'Server error', 'error'),
      });
    });
  }

  revertLeave(id: number) {
    Swal.fire({
      title: 'Revert Leave',
      input: 'textarea',
      inputLabel: 'Remarks (optional)',
      showCancelButton: true,
      confirmButtonText: 'Revert',
    }).then((r) => {
      if (!r.isConfirmed) return;
      const remarks = r.value ?? '';
      this.leaveService.revertLeaveRequest(id, remarks).subscribe({
        next: (res) => {
          if (res.isSuccess)
            Swal.fire('Reverted', res.message || 'Leave reverted', 'success');
          else
            Swal.fire('Error', res.message || 'Failed to revert leave', 'error');
          this.loadLeaves();
        },
        error: (err) =>
          Swal.fire('Error', err?.error?.message || 'Server error', 'error'),
      });
    });
  }

  // 🔹 Calculate leave days — also fixed field names
  calcDays(l: Leave): number {
    if (!l.fromDate || !l.toDate) return 0;

    const start = new Date(l.fromDate);
    const end = new Date(l.toDate);
    const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;

    const isHalfDay = l.IsStartDateHalfDay || l.IsEndDateHalfDay;
    return isHalfDay && diff === 1 ? 0.5 : diff;
  }
}
