// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token'; 
  private baseUrl = 'https://localhost:7150/api/Account';

  constructor(private http: HttpClient, private router: Router) {}
  
  login(credentials: { username: string; password: string }) {
  return this.http.post<{ 
    isSuccess: boolean;
    message: string;
    statusCode: number;
    response: {
      token: string;
    };

  }>(`${this.baseUrl}/login`, credentials);
}


  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

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
}
