import * as bootstrap from 'bootstrap';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../services/leave.service';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Leave } from '../../models/leave.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-leaves-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './leaves-list.component.html',
})
export class LeavesListComponent implements OnInit {
  leaves$!: Observable<Leave[]>;
  userRole: string = '';

  selectedLeave!: Leave;
  rejectReason: string = '';
  modalInstance: bootstrap.Modal | null = null; // ✅ store modal instance

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getLeaves();
    this.userRole = this.authService.getUserRole();
  }

  getLeaves() {
    this.leaves$ = this.leaveService.getLeaves();
  }

  updateStatus(leave: Leave, newStatus: string) {
    const baseReason = leave.reason.split('| Rejected Reason:')[0].trim();

    const updatedLeave: Leave = {
      ...leave,
      status: newStatus,
      reason: baseReason,
      isHalfDay: leave.isHalfDay ?? false,
    };

    this.leaveService.updateLeave(leave.id!, updatedLeave).subscribe(() => this.getLeaves());
  }

  deleteLeave(id: number): void {
    Swal.fire({
      icon: 'warning',
      title: 'Confirm Deletion',
      text: 'Are you sure you want to delete this leave?',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.leaveService.deleteLeave(id).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Leave deleted successfully.',
            timer: 1500,
            showConfirmButton: false,
          });
          this.getLeaves();
        });
      }
    });
  }

  openRejectModal(leave: Leave) {
    this.selectedLeave = leave;
    this.rejectReason = '';
    const modalEl = document.getElementById('rejectModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  confirmReject() {
    if (!this.rejectReason.trim()) {
      this.toastr.warning('Rejection reason is mandatory.', 'Warning');
      return;
    }

    const updatedLeave: Leave = {
      ...this.selectedLeave,
      status: 'Rejected',
      reason:
        this.selectedLeave.reason.split(' | Rejected Reason')[0] +
        ' | Rejected Reason: ' +
        this.rejectReason,
      isHalfDay: this.selectedLeave.isHalfDay ?? false,
    };

    this.leaveService.updateLeave(this.selectedLeave.id!, updatedLeave).subscribe(() => {
      this.getLeaves();

      if (this.modalInstance) {
        this.modalInstance.hide(); 
      }

      this.toastr.success('Leave rejected successfully!', 'Success');
    });
  }

  revertLeave(leave: Leave) {
    const baseReason = leave.reason.split('| Rejected Reason:')[0].trim();

    const updatedLeave: Leave = {
      ...leave,
      status: 'Pending',
      reason: baseReason,
      isHalfDay: leave.isHalfDay ?? false,
    };

    this.leaveService.updateLeave(leave.id!, updatedLeave).subscribe(() => {
      this.getLeaves();
    });
  }
}
