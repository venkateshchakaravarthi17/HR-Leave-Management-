// src/app/pages/leave/edit-leave.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { LeaveService } from '../../services/leave.service';
import { Leave, UpdateLeaveRequestDto } from '../../models/leave.model';

@Component({
  selector: 'app-edit-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  templateUrl: './edit-leave.component.html'
})
export class EditLeaveComponent implements OnInit {
  public Editor = ClassicEditor;
  leaveId!: number;
  leave!: Leave | null;
  leaveTypes: any[] = [];
  selectedFiles: File[] = [];
  isSubmitting = false;
  today: string = new Date().toISOString().split('T')[0];

  model: UpdateLeaveRequestDto = {
    LeaveTypeId: 0,
    StartDate: '',
    EndDate: '',
    Reason: '',
    IsStartDateHalfDay: false,
    IsEndDateHalfDay: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.leaveId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.leaveId) {
      Swal.fire('Error', 'Invalid leave ID.', 'error');
      this.router.navigate(['/leaves']);
      return;
    }

    this.loadLeave();
    this.loadLeaveTypes();
  }

  loadLeaveTypes(): void {
    this.leaveService.getAllLeaveTypes().subscribe({
      next: (res) => (this.leaveTypes = res || []),
      error: (err) => {
        console.error('Failed to fetch leave types', err);
        Swal.fire('Error', 'Could not load leave types.', 'error');
      }
    });
  }

  loadLeave(): void {
    this.leaveService.getLeaveById(this.leaveId).subscribe({
      next: (l) => {
        if (!l) {
          Swal.fire('Not found', 'Leave not found.', 'warning');
          this.router.navigate(['/leaves']);
          return;
        }

        this.leave = l;
        this.model.LeaveTypeId = Number(l.leaveTypeId);
        this.model.StartDate = l.StartDate ?? '';
        this.model.EndDate = l.EndDate ?? '';
        this.model.Reason = l.Reason ?? '';
        this.model.IsStartDateHalfDay = !!l.IsStartDateHalfDay;
        this.model.IsEndDateHalfDay = !!l.IsEndDateHalfDay;
      },
      error: () => {
        Swal.fire('Error', 'Could not load leave details.', 'error');
        this.router.navigate(['/leaves']);
      }
    });
  }

  get isHalfDayAllowed(): boolean {
    if (!this.model.StartDate || !this.model.EndDate) return false;
    return this.model.StartDate === this.model.EndDate;
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker?.();
  }

  validateDate(event: Event, type: 'start' | 'end'): void {
    const input = event.target as HTMLInputElement;
    const selected = new Date(input.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      Swal.fire('Invalid Date', 'Past dates are not allowed.', 'warning');
      if (type === 'start') this.model.StartDate = '';
      else this.model.EndDate = '';
      return;
    }

    const day = selected.getDay();
    if (day === 0 || day === 6) {
      Swal.fire('Invalid Date', 'Weekends (Saturday/Sunday) cannot be selected.', 'warning');
      if (type === 'start') this.model.StartDate = '';
      else this.model.EndDate = '';
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  resetFileInput(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    this.selectedFiles = [];
  }

  private stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  update(form: NgForm): void {
  if (form.invalid) {
    Swal.fire('Validation', 'Please fill all required fields.', 'warning');
    return;
  }

  if (!this.model.LeaveTypeId || this.model.LeaveTypeId <= 0) {
    Swal.fire('Validation', 'Please select a valid leave type.', 'warning');
    return;
  }

  const start = new Date(this.model.StartDate);
  const end = new Date(this.model.EndDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    Swal.fire('Date Error', 'Please provide valid start and end dates.', 'error');
    return;
  }

  if (end < start) {
    Swal.fire('Date Error', 'End date cannot be before start date.', 'error');
    return;
  }

  // Convert dates to yyyy-MM-dd for DateOnly
  const dto: UpdateLeaveRequestDto = {
    LeaveTypeId: this.model.LeaveTypeId,
    StartDate: start.toISOString().split('T')[0],
    EndDate: end.toISOString().split('T')[0],
    Reason: this.stripHtml(this.model.Reason),
    IsStartDateHalfDay: this.model.IsStartDateHalfDay,
    IsEndDateHalfDay: this.model.IsEndDateHalfDay
  };

  this.isSubmitting = true;
  console.log('🟩 Updating leave request (JSON DTO):', dto);

  this.leaveService.updateLeaveRequest(this.leaveId, dto).subscribe({
    next: (res) => {
      this.isSubmitting = false;
      if (res?.isSuccess) {
        Swal.fire('Success', res.message || 'Leave updated successfully.', 'success')
          .then(() => this.router.navigate(['/leaves']));
      } else {
        Swal.fire('Error', res?.message || 'Failed to update leave.', 'error');
      }
    },
    error: (err) => {
      this.isSubmitting = false;
      const msg =
        err?.error?.Message ||
        err?.error?.message ||
        (typeof err?.error === 'string' ? err.error : '') ||
        'Server validation failed. Please check all fields.';
      Swal.fire('Error', msg, 'error');
    }
  });
}



  cancelLeave(): void {
    if (!this.leaveId) return;

    Swal.fire({
      title: 'Withdraw leave?',
      text: 'This will withdraw your pending leave request.',
      icon: 'warning',
      showCancelButton: true
    }).then((r) => {
      if (!r.isConfirmed) return;
      this.leaveService.cancelLeaveRequest(this.leaveId).subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            Swal.fire('Cancelled', res.message || 'Leave withdrawn.', 'success')
              .then(() => this.router.navigate(['/leaves']));
          } else {
            Swal.fire('Error', res?.message || 'Failed to withdraw leave.', 'error');
          }
        },
        error: (err) => {
          const msg = err?.error?.message ?? err?.message ?? 'Server error';
          Swal.fire('Error', msg, 'error');
        }
      });
    });
  }

  openFile(url: string): void {
    window.open(url, '_blank');
  }
}
