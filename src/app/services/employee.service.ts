import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap, map } from 'rxjs';
import { Employee, EmployeeProfileDTO, EmployeeProfileUpdateDTO } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private baseUrl = 'https://localhost:7150/api/employee';

  // Observable to notify when employee list needs refresh
  private _refreshNeeded$ = new Subject<void>();
  get refreshNeeded$() {
    return this._refreshNeeded$.asObservable();
  }

  constructor(private http: HttpClient) {}

  // --- Admin APIs ---
  getEmployees(): Observable<Employee[]> {
    return this.http.get<any>(this.baseUrl).pipe(map(res => res.response || []));
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map(res => res.response));
  }

  addEmployee(data: Employee): Observable<any> {
    return this.http.post(this.baseUrl, data).pipe(
      tap(() => this._refreshNeeded$.next()) // Notify after add
    );
  }

  updateEmployee(id: string, data: Employee): Observable<any> {
    const payload = { ...data, employeeId: +id }; // Include EmployeeId for backend
    return this.http.put(this.baseUrl, payload).pipe(
      tap(() => this._refreshNeeded$.next()) // Notify after update
    );
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => this._refreshNeeded$.next()) // Notify after delete
    );
  }

  exportToExcel(): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/export-excel`, {
    responseType: 'blob'
  });
}


  // --- User Profile APIs ---
  getProfile(): Observable<{
    response: { data: EmployeeProfileDTO; }; data: EmployeeProfileDTO 
}> {
    return this.http.get<any>(`${this.baseUrl}/profile`).pipe(map(res => res));
  }

  updateProfile(data: EmployeeProfileUpdateDTO): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, data);
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload-profile-picture`, formData);
  }
}
