import { Component, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
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
  currentMonthName: string = '';

  // Employee data
  eligibleLeaves = 0;
  consumedLeaves = 0;
  remainingLeaves = 0;
  upcomingLeaves: Leave[] = [];
  leaveSummary: { name: string; leaves: number; diff?: number }[] = [];
  currentMonthLeaves = 0;

  // Leave history
  leaveHistory: Leave[] = [];
  groupedLeaveHistory: { month: string; leaves: Leave[] }[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private auth: AuthService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private renderer: Renderer2
  ) {
    this.userRole = this.auth.getUserRole();
    this.updateTimes();
    setInterval(() => this.updateTimes(), 1000);
  }

  // 🕒 Local & GST Time
  updateTimes() {
    const now = new Date();
    this.localTime = now.toLocaleString();
    this.utcTime = now.toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour12: false });
  }

  ngAfterViewInit() {
    this.loadDashboardData();
    // keep initializeMaximizeFeature if you still need renderer-based listeners,
    // but toggleMaximize is the main handler called from template buttons.
    this.initializeMaximizeFeature();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ==================== MAXIMIZE FEATURE ====================
  // Called by the template button (click)
  toggleMaximize(event: Event) {
    const target = event.target as HTMLElement;
    // find the button element (in case the <i> was clicked)
    const btn = target.closest('button');
    if (!btn) return;
    const card = btn.closest('.card') as HTMLElement | null;
    if (!card) return;

    card.classList.toggle('maximized');

    // swap icon classes inside the clicked button
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-expand');
      icon.classList.toggle('fa-compress');
    }

    // If other cards are maximized, allow multiple; optional: close others if needed.

    // Wait for the CSS transition and then resize chart(s) inside the card
    setTimeout(() => {
      const canvas = card.querySelector('canvas') as HTMLCanvasElement | null;
      if (canvas) {
        const chart = Chart.getChart(canvas);
        if (chart) chart.resize();
      }
    }, 350);
  }

  // keep existing renderer-based initialization (safe fallback)
  private initializeMaximizeFeature() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      const maximizeBtn = card.querySelector('.btn-tool');
      if (maximizeBtn) {
        this.renderer.listen(maximizeBtn, 'click', () => {
          // Ensure icon and class toggle happen if someone triggers btn-tool programmatically
          card.classList.toggle('maximized');
          const icon = maximizeBtn.querySelector('i');
          if (icon) {
            icon.classList.toggle('fa-expand');
            icon.classList.toggle('fa-compress');
          }

          const canvas = card.querySelector('canvas') as HTMLCanvasElement | null;
          if (canvas) {
            setTimeout(() => {
              const chart = Chart.getChart(canvas);
              if (chart) chart.resize();
            }, 300);
          }
        });
      }
    });
  }

  // ==================== LOAD DASHBOARD ====================
  loadDashboardData() {
    const email =
      localStorage.getItem('currentUserEmail') ||
      sessionStorage.getItem('currentUserEmail') ||
      '';
    const year = new Date().getFullYear();

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

    if (this.userRole === 'admin') {
      this.subscriptions.add(
        this.employeeService.refreshNeeded$.subscribe(() => {
          this.employeeService.getEmployees().subscribe((employees) => {
            this.employees = employees;
            this.totalEmployees = employees.length;
          });
        })
      );

      this.employeeService.getEmployees().subscribe((employees) => {
        this.employees = employees;
        this.totalEmployees = employees.length;
      });

      this.leaveService.loadLeaves(true);
    } else if (this.userRole === 'employee') {
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

  // ==================== EMPLOYEE KPI ====================
  private calculateEmployeeKPIs() {
    const approvedLeaves: Leave[] = this.leaves.filter((l) => l.status === 'approved');

    const annualBalance = this.leaveBalances.find((l) => l.leaveTypeName === 'Annual Leave');
    if (annualBalance) {
      const deduction = this.leaveBalances
        .filter(
          (l) => l.leaveTypeName === 'Emergency Leave' || l.leaveTypeName === 'Personal/Casual Leave'
        )
        .reduce((sum, l) => sum + (l.used ?? 0), 0);
      annualBalance.used += deduction;
      annualBalance.remaining = annualBalance.defaultAnnualAllocation - annualBalance.used;
    }

    const annual = this.leaveBalances.find((l) => l.leaveTypeName === 'Annual Leave')
      ?.defaultAnnualAllocation ?? 0;
    const sick = this.leaveBalances.find((l) => l.leaveTypeName === 'Sick Leave')
      ?.defaultAnnualAllocation ?? 0;
    this.eligibleLeaves = annual + sick;

    this.consumedLeaves = approvedLeaves.reduce((sum, l) => sum + (l.leaveDaysUsed ?? 0), 0);
    this.remainingLeaves = this.eligibleLeaves - this.consumedLeaves;

    const today = new Date();
    this.upcomingLeaves = approvedLeaves
      .filter((l) => new Date(l.fromDate) >= today)
      .sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const summaryMap: { [key: string]: number } = {};

    approvedLeaves.forEach((l) => {
      const d = new Date(l.fromDate);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      summaryMap[key] = (summaryMap[key] || 0) + (l.leaveDaysUsed ?? 0);
    });

    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    this.leaveSummary = Object.keys(summaryMap)
      .map((key) => {
        const [monthName, yearStr] = key.split(' ');
        const monthIndex = months.indexOf(monthName);
        const year = parseInt(yearStr, 10);
        const diff = (year - currentYear) * 12 + (monthIndex - currentMonthIndex);
        return { name: key, leaves: summaryMap[key], diff };
      })
      .sort((a, b) => a.diff - b.diff);

    this.currentMonthLeaves = approvedLeaves.filter(l => {
      const from = new Date(l.fromDate);
      return from.getMonth() === currentMonthIndex && from.getFullYear() === currentYear;
    }).length;

    this.leaveHistory = [...approvedLeaves].sort(
      (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
    );

    const grouped: { [key: string]: Leave[] } = {};
    this.leaveHistory.forEach((l) => {
      const d = new Date(l.fromDate);
      const monthKey = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(l);
    });

    this.groupedLeaveHistory = Object.keys(grouped).map((month) => ({
      month,
      leaves: grouped[month]
    }));

    this.loadEmployeeCharts();
  }

  // ==================== ADMIN KPI ====================
  private calculateAdminKPIs() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthsFull = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    this.currentMonthName = monthsFull[currentMonth];

    const approvedLeaves = this.leaves.filter((l) => l.status === 'approved');

    this.approvedThisMonth = approvedLeaves.filter((l) => {
      const d = new Date(l.fromDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    this.rejectedLeaves = this.leaves.filter((l) => l.status === 'rejected').length;
    this.pendingApprovals = this.leaves.filter((l) => l.status === 'pending').length;

    this.avgLeaveDays = approvedLeaves.length
      ? approvedLeaves.reduce((a, b) => a + (b.leaveDaysUsed || 0), 0) / approvedLeaves.length
      : 0;

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const summaryMap: { [key: string]: number } = {};
    this.leaves.forEach((l) => {
      const month = months[new Date(l.fromDate).getMonth()];
      summaryMap[month] = (summaryMap[month] || 0) + (l.leaveDaysUsed || 0);
    });

    const orderedMonths = [...months.slice(currentMonth), ...months.slice(0, currentMonth)];
    this.leaveSummary = orderedMonths
      .filter((m) => summaryMap[m])
      .map((m) => ({ name: m, leaves: summaryMap[m] }));

    if (this.employees && this.employees.length > 0) {
      this.totalEmployees = this.employees.length;
    } else {
      this.totalEmployees = Array.from(new Set(this.leaves.map((l) => l.employeeId))).length;
    }

    // Employees on leave TODAY
    const startOfToday = new Date(currentYear, currentMonth, today.getDate()).getTime();
    const endOfToday = new Date(currentYear, currentMonth, today.getDate(), 23, 59, 59, 999).getTime();

    const onLeaveEmployeeIds = new Set<string | number>();
    approvedLeaves.forEach((l) => {
      const from = new Date(l.fromDate).getTime();
      const to = new Date(l.toDate).getTime();
      if (from <= endOfToday && to >= startOfToday) {
        if (l.employeeId != null) onLeaveEmployeeIds.add(l.employeeId);
      }
    });
    this.employeesOnLeave = onLeaveEmployeeIds.size;

    const soonLimit = new Date(currentYear, currentMonth, today.getDate() + 30).getTime();
    this.upcomingLeaves = approvedLeaves.filter((l) => {
      const from = new Date(l.fromDate).getTime();
      return from >= startOfToday && from <= soonLimit;
    });

    this.loadAdminCharts();
  }

  // ==================== EMPLOYEE CHARTS ====================
  loadEmployeeCharts() {
    const availCtx = document.getElementById('availableLeavesChart') as HTMLCanvasElement;
    if (availCtx && Chart.getChart(availCtx)) Chart.getChart(availCtx)?.destroy();
    if (availCtx && (this.consumedLeaves > 0 || this.remainingLeaves > 0)) {
      new Chart(availCtx, {
        type: 'doughnut',
        data: {
          labels: ['Consumed', 'Remaining'],
          datasets: [
            {
              data: [this.consumedLeaves, this.remainingLeaves],
              backgroundColor: ['#999', '#4cb4ac']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                boxWidth: 12,
                padding: 12
              }
            }
          }
        }
      });
    }

    const upCtx = document.getElementById('upcomingLeavesChart') as HTMLCanvasElement;
    if (upCtx) {
      if (Chart.getChart(upCtx)) Chart.getChart(upCtx)?.destroy();
      new Chart(upCtx, {
        type: 'bar',
        data: {
          labels: this.upcomingLeaves.map((l) =>
            new Date(l.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          ),
          datasets: [
            {
              label: 'Upcoming Leaves',
              data: this.upcomingLeaves.map(() => 1),
              backgroundColor: '#4cb4ac',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: '#070707' } },
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#070707' } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    const summaryCtx = document.getElementById('leaveSummaryChart') as HTMLCanvasElement;
    if (summaryCtx) {
      if (Chart.getChart(summaryCtx)) Chart.getChart(summaryCtx)?.destroy();
      new Chart(summaryCtx, {
        type: 'bar',
        data: {
          labels: this.leaveSummary.map((s) => s.name),
          datasets: [
            {
              label: 'Leaves Taken',
              data: this.leaveSummary.map((s) => s.leaves),
              backgroundColor: '#f59709',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} day(s)` } }
          },
          scales: {
            x: { ticks: { color: '#070707' } },
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#070707' } }
          }
        }
      });
    }
  }

  // ==================== ADMIN CHARTS ====================
  loadAdminCharts() {
    const leaveCtx = document.getElementById('leaveChart') as HTMLCanvasElement;
    if (leaveCtx) {
      if (Chart.getChart(leaveCtx)) Chart.getChart(leaveCtx)?.destroy();
      new Chart(leaveCtx, {
        type: 'bar',
        data: {
          labels: this.leaveSummary.map((s) => s.name),
          datasets: [
            { label: 'Leaves Taken', data: this.leaveSummary.map((s) => s.leaves), backgroundColor: '#4cb4ac' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { usePointStyle: true, boxWidth: 12, padding: 12 }
            }
          },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      });
    }

    const empCtx = document.getElementById('employeeLeaveGraph') as HTMLCanvasElement;
    if (empCtx) {
      if (Chart.getChart(empCtx)) Chart.getChart(empCtx)?.destroy();
      const empMap: { [key: string]: number } = {};
      this.leaves.forEach((l) => {
        if (l.employeeName && l.employeeName !== 'Unknown') {
          empMap[l.employeeName] = (empMap[l.employeeName] || 0) + (l.leaveDaysUsed ?? 0);
        }
      });

      new Chart(empCtx, {
        type: 'pie',
        data: {
          labels: Object.keys(empMap),
          datasets: [{ data: Object.values(empMap), backgroundColor: ['#4cb4ac','#f59709','#999','#070707','#d4d4d4'] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { usePointStyle: true, boxWidth: 12, padding: 12 }
            }
          }
        }
      });
    }
  }
}
