import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  isAdmin = false;
  currentUserId = '';

  private routerSub?: Subscription;
  private refreshSub?: Subscription;

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUser()?.userId || '';

    this.loadEmployees();

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/employees/list') {
          this.loadEmployees();
        }
      });

    this.refreshSub = this.employeeService.refreshNeeded$.subscribe(() => {
      this.loadEmployees();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => console.error('Error fetching employees', err),
    });
  }

  addEmployee(): void {
    if (!this.isAdmin) return; // Employees cannot add
    this.router.navigate(['/employees/add']);
  }

  editEmployee(id: number, employeeUserId: string): void {
    if (!this.isAdmin && employeeUserId !== this.currentUserId) return;
    this.router.navigate(['/employees/edit', id]);
  }

  deleteEmployee(id: number): void {
    if (!this.isAdmin) return; // Employees cannot delete
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this employee!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(id).subscribe(() => {
          this.employees = this.employees.filter((e) => e.employeeId !== id);
          Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
        });
      }
    });
  }
}
