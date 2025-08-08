import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LayoutComponent } from '../layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserAddComponent } from './pages/users/user-add/user-add.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
 
  {
  path: '',
  component: LayoutComponent,
  canActivateChild: [authGuard],
  children: [
    { path: 'dashboard', component: DashboardComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'users/list', component: UserListComponent },
    { path: 'users/add', component: UserAddComponent },
    {
      path: 'users/edit/:id',
      loadComponent: () =>
        import('./pages/users/user-edit/user-edit.component').then(m => m.UserEditComponent),
    },
    {
      path: 'users/view/:id',
      loadComponent: () =>
        import('./pages/users/user-view/user-view.component').then(m => m.UserViewComponent),
    },
    {
    path: 'leave/apply',
    loadComponent: () => import('./pages/leave/apply-leave.component').then(m => m.ApplyLeaveComponent),
    },
    {
    path: 'leave/list',
    loadComponent: () => import('./pages/leave/leaves-list.component').then(m => m.LeavesListComponent),
    },
    {
    path: 'leave/edit/:id',
    loadComponent: () => import('./pages/leave/edit-leave.component').then(m => m.EditLeaveComponent),
    },

  ]
},
]
