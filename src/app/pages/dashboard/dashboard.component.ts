import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { LeaveService } from '../../services/leave.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Leave, LeaveBalance } from '../../models/leave.model';
import { Employee } from '../../models/employee.model';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  userRole = '';
  localTime = '';
  utcTime = '';

  leaves: Leave[] = [];
  leaveBalances: LeaveBalance[] = [];
  employees: Employee[] = [];

  // KPIs
  totalEmployees = 0;
  employeesOnLeave = 0;
  pendingApprovals = 0;
  approvedThisMonth = 0;
  rejectedLeaves = 0;
  avgLeaveDays = 0;
  approvalRate = 0;

  // Employee data
  eligibleLeaves = 0;
  consumedLeaves = 0;
  remainingLeaves = 0;
  upcomingLeaves: Leave[] = [];
  leaveSummary: { name: string, leaves: number }[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private auth: AuthService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService
  ) {
    this.userRole = this.auth.getUserRole();
    this.updateTimes();
    setInterval(() => this.updateTimes(), 1000);
  }

  updateTimes() {
    const now = new Date();
    this.localTime = now.toLocaleString();
    this.utcTime = now.toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour12: false });
  }

  ngAfterViewInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData() {
    const email = localStorage.getItem('currentUserEmail') || sessionStorage.getItem('currentUserEmail') || '';
    const year = new Date().getFullYear();

    // Subscribe to leave updates
    this.subscriptions.add(
      this.leaveService.leaves$.subscribe((leaves) => {
        this.leaves = leaves;
        if (this.userRole === 'employee') {
          this.calculateEmployeeKPIs();
        } else if (this.userRole === 'admin') {
          this.calculateAdminKPIs();
        }
      })
    );

    // Subscribe to employee refresh events (admin only)
    if (this.userRole === 'admin') {
      this.subscriptions.add(
        this.employeeService.refreshNeeded$.subscribe(() => {
          this.employeeService.getEmployees().subscribe(employees => {
            this.employees = employees;
            this.totalEmployees = employees.length;
          });
        })
      );

      // Initial load
      this.employeeService.getEmployees().subscribe(employees => {
        this.employees = employees;
        this.totalEmployees = employees.length;
      });

      // Load all leaves initially
      this.leaveService.loadLeaves(true);
    } else if (this.userRole === 'employee') {
      // Employee: load personal leaves and balances
      forkJoin({
        leaves: this.leaveService.getLeaveRequestsForEmployee(email),
        balances: this.leaveService.getLeaveBalances(year)
      }).subscribe(({ leaves, balances }) => {
        this.leaves = leaves;
        this.leaveBalances = balances;
        this.calculateEmployeeKPIs();
        this.leaveService.loadLeaves(false, email); 
      });
    }
  }

  private calculateEmployeeKPIs() {
  // Only approved leaves
  const approvedLeaves: Leave[] = this.leaves.filter(l => l.status === 'approved');

  // Deduct Emergency & Personal/Casual from Annual
  const annualBalance = this.leaveBalances.find(l => l.leaveTypeName === 'Annual Leave');
  if (annualBalance) {
    const deduction = this.leaveBalances
      .filter(l => l.leaveTypeName === 'Emergency Leave' || l.leaveTypeName === 'Personal/Casual Leave')
      .reduce((sum, l) => sum + (l.used ?? 0), 0);

    annualBalance.used += deduction;
    annualBalance.remaining = annualBalance.defaultAnnualAllocation - annualBalance.used;
  }

  // Eligible Leaves = Annual + Sick
  const annual = this.leaveBalances.find(l => l.leaveTypeName === 'Annual Leave')?.defaultAnnualAllocation ?? 0;
  const sick = this.leaveBalances.find(l => l.leaveTypeName === 'Sick Leave')?.defaultAnnualAllocation ?? 0;
  this.eligibleLeaves = annual + sick;

  // Consumed Leaves = sum of approved leaves
  this.consumedLeaves = approvedLeaves.reduce((sum, l) => sum + (l.leaveDaysUsed ?? 0), 0);

  // Remaining
  this.remainingLeaves = this.eligibleLeaves - this.consumedLeaves;

  // Upcoming approved leaves
  const today = new Date();
  this.upcomingLeaves = approvedLeaves.filter(l => new Date(l.fromDate) >= today);

  // Leave summary for charts
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const summaryMap: { [key: string]: number } = {};
  approvedLeaves.forEach(l => {
    const month = months[new Date(l.fromDate).getMonth()];
    summaryMap[month] = (summaryMap[month] || 0) + l.leaveDaysUsed;
  });
  this.leaveSummary = Object.keys(summaryMap).map(k => ({ name: k, leaves: summaryMap[k] }));

  // Draw charts
  this.loadEmployeeCharts();
}



  private calculateAdminKPIs() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    this.approvedThisMonth = this.leaves.filter(l => {
      const d = new Date(l.fromDate);
      return l.status === 'approved' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    this.rejectedLeaves = this.leaves.filter(l => l.status === 'rejected').length;

    const approvedLeaves = this.leaves.filter(l => l.status === 'approved');
    this.avgLeaveDays = approvedLeaves.length
      ? approvedLeaves.reduce((a, b) => a + (b.leaveDaysUsed || 0), 0) / approvedLeaves.length
      : 0;

    this.pendingApprovals = this.leaves.filter(l => l.status === 'pending').length;

    // Leave summary per month
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const summaryMap: { [key: string]: number } = {};
    this.leaves.forEach(l => {
      const month = months[new Date(l.fromDate).getMonth()];
      summaryMap[month] = (summaryMap[month] || 0) + l.leaveDaysUsed;
    });
    this.leaveSummary = Object.keys(summaryMap).map(k => ({ name: k, leaves: summaryMap[k] }));

    // Total employees
    this.totalEmployees = Array.from(new Set(this.leaves.map(l => l.employeeId))).length;

    // Draw charts
    this.loadAdminCharts();
  }

  /** ===== Employee Charts ===== */
  loadEmployeeCharts() {
    // Leave Balance Doughnut
    const availCtx = document.getElementById('availableLeavesChart') as HTMLCanvasElement;
    if (availCtx && Chart.getChart(availCtx)) Chart.getChart(availCtx)?.destroy();
    if (availCtx && (this.consumedLeaves > 0 || this.remainingLeaves > 0)) {
      new Chart(availCtx, {
        type: 'doughnut',
        data: {
          labels: ['Consumed', 'Remaining'],
          datasets: [{ data: [this.consumedLeaves, this.remainingLeaves], backgroundColor: ['#999','#4cb4ac'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    // Upcoming Leaves Bar
    const upCtx = document.getElementById('upcomingLeavesChart') as HTMLCanvasElement;
    if (upCtx) {
      if (Chart.getChart(upCtx)) Chart.getChart(upCtx)?.destroy();
      new Chart(upCtx, {
        type: 'bar',
        data: { labels: this.upcomingLeaves.map(l => l.fromDate), datasets: [{ label: 'Upcoming Leaves', data: this.upcomingLeaves.map(() => 1), backgroundColor: '#f59709' }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
      });
    }

    // Leave Summary per Month
    const summaryCtx = document.getElementById('leaveSummaryChart') as HTMLCanvasElement;
    if (summaryCtx) {
      if (Chart.getChart(summaryCtx)) Chart.getChart(summaryCtx)?.destroy();
      new Chart(summaryCtx, {
        type: 'bar',
        data: { labels: this.leaveSummary.map(s => s.name), datasets: [{ label: 'Leaves Taken', data: this.leaveSummary.map(s => s.leaves), backgroundColor: '#4cb4ac' }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  /** ===== Admin Charts ===== */
  loadAdminCharts() {
    // Leave Overview Bar Chart
    const leaveCtx = document.getElementById('leaveChart') as HTMLCanvasElement;
    if (leaveCtx) {
      if (Chart.getChart(leaveCtx)) Chart.getChart(leaveCtx)?.destroy();
      new Chart(leaveCtx, {
        type: 'bar',
        data: { labels: this.leaveSummary.map(s => s.name), datasets: [{ label: 'Leaves Taken', data: this.leaveSummary.map(s => s.leaves), backgroundColor: '#4cb4ac' }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Employee Leave Distribution Pie
    const empCtx = document.getElementById('employeeLeaveGraph') as HTMLCanvasElement;
    if (empCtx) {
      if (Chart.getChart(empCtx)) Chart.getChart(empCtx)?.destroy();
      const empMap: { [key: string]: number } = {};
      this.leaves.forEach(l => { if (l.employeeName) empMap[l.employeeName] = (empMap[l.employeeName] || 0) + (l.leaveDaysUsed ?? 0); });
      new Chart(empCtx, {
        type: 'pie',
        data: { labels: Object.keys(empMap), datasets: [{ data: Object.values(empMap), backgroundColor: ['#f59709','#4cb4ac','#999','#f59709','#4cb4ac'] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }
}
