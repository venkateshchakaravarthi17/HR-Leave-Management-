import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Leave, LeaveService } from '../../services/leave.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CkeditorComponent } from '../../shared/ckeditor/ckeditor.component';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, CkeditorComponent],
  templateUrl: './apply-leave.component.html',
})
export class ApplyLeaveComponent implements OnInit {
  employeeName = '';
  fromDate = '';
  toDate = '';
  reason = '';
  isHalfDay: boolean = false;
  today: string = '';
  isSubmitting: boolean | undefined;
  totalDays: number = 0;

  constructor(private leaveService: LeaveService, private router: Router) {}

  ngOnInit(): void {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
  }

  // strip all HTML tags 
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  onSubmit(form: NgForm) {
    if (form.valid && this.validateDates()) {
      this.isSubmitting = true;

      // Converting CKEditor HTML to plain text
      const plainReason = this.stripHtmlTags(this.reason);

      const leave: Leave = {
        employeeName: this.employeeName,
        fromDate: this.fromDate,
        toDate: this.toDate,
        reason: plainReason + (this.isHalfDay ? ' (Half Day)' : ''),
        status: 'Pending',
        isHalfDay: false
      };

      this.leaveService.applyLeave(leave).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Leave Applied',
            text: 'Your leave has been submitted successfully.',
          }).then(() => {
            this.isSubmitting = false;
            this.router.navigate(['/leave/list']);
          });
        },
        error: () => {
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'Please try again later.',
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Submission',
        text: 'Please fix the date issues before submitting.',
      });
    }
  }

  validateDates(): boolean {
    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);
    const today = new Date(this.today);

    if ([0, 6].includes(from.getDay())) {
      Swal.fire('Invalid Date', 'From Date cannot be on a weekend.', 'warning');
      return false;
    }

    if ([0, 6].includes(to.getDay())) {
      Swal.fire('Invalid Date', 'To Date cannot be on a weekend.', 'warning');
      return false;
    }

    if (from < today) {
      Swal.fire('Invalid From Date', 'From Date cannot be in the past.', 'warning');
      return false;
    }

    if (to < from) {
      Swal.fire('Invalid To Date', 'To Date cannot be before From Date.', 'warning');
      return false;
    }

    this.calculateTotalDays(from, to);
    return true;
  }

  openDatePicker(event: Event) {
  const input = event.target as HTMLInputElement;
  input.showPicker?.(); 
}


  calculateTotalDays(from: Date, to: Date): void {
    let count = 0;
    const current = new Date(from);

    while (current <= to) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    this.totalDays = this.isHalfDay ? 0.5 : count;
  }

  cancel() {
    this.router.navigate(['/leave/list']);
  }
}
