// src/app/pages/leave/apply-leave.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LeaveService } from '../../services/leave.service';
import { CreateLeaveRequestDto } from '../../models/leave.model';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  templateUrl: './apply-leave.component.html'
})
export class ApplyLeaveComponent implements OnInit {
  leaveTypes: any[] = [];
  today: string = new Date().toISOString().split('T')[0]; // min date for input
  Editor = ClassicEditor;

  model: CreateLeaveRequestDto = {
    LeaveTypeId: 0,
    StartDate: '',
    EndDate: '',
    Reason: '',
    IsStartDateHalfDay: false,
    IsEndDateHalfDay: false
  };

  selectedFiles: File[] = [];
  isSubmitting = false;

  constructor(private leaveService: LeaveService, private router: Router) {}

  ngOnInit(): void {
    this.loadLeaveTypes();
  }

  loadLeaveTypes(): void {
    this.leaveService.getAllLeaveTypes().subscribe({
      next: (res) => {
        this.leaveTypes = res || [];
      },
      error: (err) => {
        console.error('Failed to fetch leave types', err);
        Swal.fire('Error', 'Could not load leave types.', 'error');
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  get isHalfDayAllowed(): boolean {
    if (!this.model.StartDate || !this.model.EndDate) return false;
    return this.model.StartDate === this.model.EndDate;
  }

  // 🔹 Allow datepicker to open when clicking anywhere in input
  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker?.(); 
  }

  // 🔹 Disable weekends and past dates
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

    const day = selected.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      Swal.fire('Invalid Date', 'Weekends (Saturday/Sunday) cannot be selected.', 'warning');
      if (type === 'start') this.model.StartDate = '';
      else this.model.EndDate = '';
    }
  }

  submit(form: NgForm): void {
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

    // Format as yyyy-MM-dd
    const formattedStart = start.toISOString().split('T')[0];
    const formattedEnd = end.toISOString().split('T')[0];

    const payload = {
      LeaveTypeId: Number(this.model.LeaveTypeId),
      StartDate: formattedStart,
      EndDate: formattedEnd,
      Reason: this.stripHtml(this.model.Reason),
      IsStartDateHalfDay: !!this.model.IsStartDateHalfDay,
      IsEndDateHalfDay: !!this.model.IsEndDateHalfDay
    };

    console.log('🟩 Submitting JSON payload:', payload);

    this.isSubmitting = true;
    this.leaveService.applyLeave(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res?.isSuccess) {
          Swal.fire('Success', res.message || 'Leave applied successfully.', 'success')
            .then(() => this.router.navigate(['/leaves']));
        } else {
          Swal.fire('Error', res?.message || 'Failed to submit leave.', 'error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg =
          err?.error?.Message ||
          err?.error?.message ||
          err?.error ||
          'Server validation failed. Please check all fields.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  resetFileInput(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    this.selectedFiles = [];
  }

  // 🔹 Strip HTML tags from CKEditor output (plain text)
  private stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    return tempDiv.textContent || tempDiv.innerText || '';
  }
}
