// src/app/services/leave-type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
  private apiUrl = 'http://localhost:5000/api/LeaveTypes'; 

  constructor(private http: HttpClient) {}

  getAllLeaveTypes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getLeaveTypeById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createLeaveType(body: any): Observable<any> {
    return this.http.post(this.apiUrl, body);
  }

  updateLeaveType(body: any): Observable<any> {
    return this.http.put(this.apiUrl, body);
  }
}
