import { Component, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Chart from 'chart.js/auto';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  userRole: string = '';

  // Employee data
  availableLeaves = 15;
  upcomingLeave = { date: '2025-09-10', reason: 'Family Function' };

  // Admin data
  pendingApprovals = 3;
  leaveChartData = [5, 8, 3, 10]; // Example: leaves taken by users this month
  plannedEmployees = ['Alice', 'Bob', 'John']; // Example: employees currently on leave

  constructor(private auth: AuthService) {
    this.userRole = this.auth.getUserRole();
  }

  ngAfterViewInit() {
    // Charts only for Admin
    if (this.userRole === 'admin') {
      const areaCtx = document.getElementById('areaChart') as HTMLCanvasElement;
      if (areaCtx) {
        new Chart(areaCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
              label: 'Leaves Taken',
              backgroundColor: 'rgba(60,141,188,0.9)',
              borderColor: 'rgba(60,141,188,0.8)',
              data: this.leaveChartData
            }]
          },
          options: { maintainAspectRatio: false }
        });
      }

      const salesCtx = document.getElementById('salesGraph') as HTMLCanvasElement;
      if (salesCtx) {
        new Chart(salesCtx, {
          type: 'line',
          data: {
            labels: ['Q1','Q2','Q3','Q4','Q5'],
            datasets: [{
              label: 'Leave Requests',
              data: [5, 10, 7, 12, 9],
              borderColor: '#fff',
              backgroundColor: 'rgba(255,255,255,0.3)'
            }]
          },
          options: { 
            scales: { 
              y: { ticks: { color: 'white' } }, 
              x: { ticks: { color: 'white' } } 
            } 
          }
        });
      }

      // Leaflet map
      const map = L.map('world-map', { attributionControl: false }).setView([37.8, -96], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
  }
}
