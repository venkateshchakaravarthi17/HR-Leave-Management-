import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  response?: T;
}

export interface User {
  name: string;
  role: string;
  email?: string;
  workEmail: string;
  userId?: string; 
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  getLoggedInUserEmail() {
    throw new Error('Method not implemented.');
  }
  getUser() {
    throw new Error('Method not implemented.');
  }
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly accountUrl = 'https://localhost:7150/api/Account';
  private readonly employeeUrl = 'https://localhost:7150/api/employee';

  constructor(private http: HttpClient, private router: Router) {}

  // 🔹 LOGIN
  login(credentials: { workEmail: string; password: string }): Observable<ApiResponse<{ token: string }>> {
    return this.http.post<ApiResponse<{ token: string }>>(`${this.accountUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.isSuccess && res.response?.token) {
          this.saveToken(res.response.token);
          const user = this.decodeToken(res.response.token);
          if (user) this.setCurrentUser(user);
        }
      })
    );
  }

  // 🔹 SIGNUP AS EMPLOYEE
  signupEmployee(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.employeeUrl}/signup`, data);
  }

  


changePassword(payload: { workEmail: string; currentPassword: string; newPassword: string }) {
  const token = this.getToken();
  return this.http.post<ApiResponse<any>>(
    `${this.accountUrl}/change-password`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
}





  // 🔹 FORGOT PASSWORD
  forgotPassword(workEmail: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.accountUrl}/forgot-password`, { workEmail });
  }

  // 🔹 RESET PASSWORD
  resetPassword(data: { workEmail: string; token: string; newPassword: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.accountUrl}/reset-password`, data);
  }

  // 🔹 TOKEN HANDLING
  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 🔹 Decode JWT payload
  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const name = payload.unique_name || payload.name || '';
      const role =
        (payload.role ||
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          '').toLowerCase();
      const userId = payload.userId || '';
      const email = payload.email || '';
      const workEmail = payload.workEmail || email;

      return { name, role, email, workEmail, userId };
    } catch {
      return null;
    }
  }

  // 🔹 Save current user
  setCurrentUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // 🔹 Getters
  getUserRole(): string {
    return this.getCurrentUser()?.role.toLowerCase() || '';
  }

  getUserName(): string {
    return this.getCurrentUser()?.name || '';
  }

  getUserWorkEmail(): string {
    return this.getCurrentUser()?.workEmail || '';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }
}
