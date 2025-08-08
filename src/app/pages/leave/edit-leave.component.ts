import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Leave, LeaveService } from '../../services/leave.service';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CkeditorComponent } from '../../shared/ckeditor/ckeditor.component';

@Component({
  selector: 'app-edit-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, CkeditorComponent],
  templateUrl: './edit-leave.component.html'
})
export class EditLeaveComponent implements OnInit {
  leaveId: number = 0;
  employeeName = '';
  fromDate = '';
  toDate = '';
  reason = '';
  status = '';
  isHalfDay: boolean = false;
  today: string = '';
  totalDays: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];

    this.leaveId = Number(this.route.snapshot.paramMap.get('id'));
    this.leaveService.getLeaveById(this.leaveId).subscribe(leave => {
      if (leave) {
        this.employeeName = leave.employeeName;
        this.fromDate = leave.fromDate;
        this.toDate = leave.toDate;
        this.reason = leave.reason;
        this.status = leave.status;
        this.isHalfDay = leave.isHalfDay ?? false;

        // Pre-calculate total days for loaded leave
        this.calculateTotalDays(new Date(this.fromDate), new Date(this.toDate));
      }
    });
  }

  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
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

  openDatePicker(event: Event) {
    const input = event.target as HTMLInputElement;
    input.showPicker?.();
  }

  onSubmit(form: NgForm): void {
    if (form.valid && this.validateDates()) {
      const plainReason = this.stripHtmlTags(this.reason);

      const updatedLeave: Leave = {
        id: this.leaveId,
        employeeName: this.employeeName,
        fromDate: this.fromDate,
        toDate: this.toDate,
        reason: plainReason + (this.isHalfDay ? ' (Half Day)' : ''),
        status: this.status,
        isHalfDay: this.isHalfDay
      };

      this.leaveService.updateLeave(this.leaveId, updatedLeave).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Leave Updated',
          text: 'The leave has been updated successfully.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/leave/list']);
        });
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Submission',
        text: 'Please fix the date issues before submitting.',
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/leave/list']);
  }
}
