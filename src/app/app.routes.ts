// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LayoutComponent } from '../layout/layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ------------------------
  // Public routes (no layout)
  // ------------------------
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // ------------------------
  // Protected routes (with LayoutComponent wrapper)
  // ------------------------
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },

      // Profile & Change Password
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/Employees/profile-component/profile.component').then(m => m.ProfileComponent),
      },
      // {
      //   path: 'change-password',
      //   loadComponent: () =>
      //     import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent),
      // },

      // Employees
      {
        path: 'employees',
        children: [
          {
            path: 'add',
            loadComponent: () =>
              import('./pages/Employees/add-edit-employee.component').then(m => m.AddEditEmployeeComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./pages/Employees/add-edit-employee.component').then(m => m.AddEditEmployeeComponent),
          },
          {
            path: 'list',
            loadComponent: () =>
              import('./pages/Employees/employee-list.component').then(m => m.EmployeeListComponent),
          },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },

      // Leave Management
      {
        path: 'leave',
        children: [
          {
            path: 'apply',
            loadComponent: () =>
              import('./pages/leave/apply-leave.component').then(m => m.ApplyLeaveComponent),
          },
          {
            path: 'list',
            loadComponent: () =>
              import('./pages/leave/leaves-list.component').then(m => m.LeavesListComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./pages/leave/edit-leave.component').then(m => m.EditLeaveComponent),
          },
          {
            path: 'balance',
            loadComponent: () =>
              import('./pages/leave/leave-balance.component').then(m => m.LeaveBalanceComponent),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('./pages/leave/leave-history.component').then(m => m.LeaveHistoryComponent),
          },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },

      // Default & wildcard inside layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  // Global fallback for any unmatched route
  { path: '**', redirectTo: 'login' },
];
