import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { LeaveBalance, Leave } from '../../models/leave.model';

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-balance.component.html'
})
export class LeaveBalanceComponent implements OnInit {
  leaveBalances: LeaveBalance[] = [];
  filteredBalances: LeaveBalance[] = [];
  searchText: string = '';
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];

  totalEligible: number = 0;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.initYearOptions();
    this.loadLeaveBalances();
  }

  private initYearOptions(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.selectedYear = currentYear;
  }

  loadLeaveBalances(): void {
  this.leaveService.getLeaveBalances(this.selectedYear).subscribe({
    next: (balances: LeaveBalance[]) => {
      console.log('✅ Backend leave balances:', balances); // <<<<< LOG RAW DATA

      this.leaveBalances = balances.map(lb => ({ ...lb }));

      // Deduct Emergency & Personal/Casual leaves from Annual
      const annual = this.leaveBalances.find(l => l.leaveTypeName === 'Annual Leave');
      if (annual) {
        const deduction = this.leaveBalances
          .filter(l => l.leaveTypeName === 'Emergency Leave' || l.leaveTypeName === 'Personal/Casual Leave')
          .reduce((sum, l) => sum + (l.used ?? 0), 0);

        annual.used += deduction;
        annual.remaining = annual.defaultAnnualAllocation - annual.used;
      }

      // Total Eligible = Annual + Sick
      this.totalEligible =
        (this.leaveBalances.find(l => l.leaveTypeName === 'Annual Leave')?.defaultAnnualAllocation ?? 0) +
        (this.leaveBalances.find(l => l.leaveTypeName === 'Sick Leave')?.defaultAnnualAllocation ?? 0);

      this.filteredBalances = [...this.leaveBalances];

      console.log('✅ Computed leave balances (after deductions):', this.leaveBalances); // <<<<< LOG FINAL
    },
    error: (err) => {
      console.error('❌ Error loading leave balances:', err);
      this.leaveBalances = [];
      this.filteredBalances = [];
    }
  });
}


  applyFilters(): void {
    this.filteredBalances = this.leaveBalances.filter(item =>
      !this.searchText ||
      (item.leaveTypeName && item.leaveTypeName.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  resetFilters(): void {
    this.searchText = '';
    this.filteredBalances = [...this.leaveBalances];
  }

  onYearChange(): void {
    this.loadLeaveBalances();
  }
}
