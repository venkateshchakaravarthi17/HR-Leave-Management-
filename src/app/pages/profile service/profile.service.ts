// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { AuthService } from '../../services/auth.service';

// @Injectable({ providedIn: 'root' })
// export class ProfileService {
//   constructor(private http: HttpClient, private auth: AuthService) {}

//   private getAuthHeaders(): HttpHeaders {
//     return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
//   }

//   getProfile(): Observable<any> {
//     return this.http.get(`${environment.apiUrl}/employee/profile`, { headers: this.getAuthHeaders() });
//   }

//   updateProfile(data: any): Observable<any> {
//     return this.http.put(`${environment.apiUrl}/employee/profile`, data, { headers: this.getAuthHeaders() });
//   }

//   uploadProfilePicture(file: File): Observable<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//     return this.http.post(`${environment.apiUrl}/employee/profile`, formData, {
//     headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` })
// });

//   }
// }  