import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private baseUrl = 'https://localhost:7150/api/Account';

  constructor(private http: HttpClient, private router: Router) {}

  // LOGIN
  login(credentials: { email: string; password: string }) {
    return this.http.post<{ 
      isSuccess: boolean;
      message: string;
      statusCode: number;
      response: { token: string };
    }>(`${this.baseUrl}/login`, credentials);
  }

  // REGISTER
  register(data: any) {
    return this.http.post<{ 
      isSuccess: boolean;
      message: string;
      statusCode: number;
      response?: any;
    }>(`${this.baseUrl}/register`, data);
  }

  // FORGOT PASSWORD
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  // RESET PASSWORD
  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  // TOKEN HANDLING
  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ✅ FIXED: Return the user role from JWT token
  getUserRole(): string {
    const token = this.getToken();
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
      return (payload.role || '').toLowerCase(); // normalize case
    } catch {
      return '';
    }
  }
}
