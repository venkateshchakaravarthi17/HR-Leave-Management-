import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import * as L from 'leaflet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements AfterViewInit {
  ngAfterViewInit() {
    const areaCtx = document.getElementById('areaChart') as HTMLCanvasElement;
    new Chart(areaCtx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
        datasets: [{
          label: 'Sales',
          backgroundColor: 'rgba(60,141,188,0.9)',
          borderColor: 'rgba(60,141,188,0.8)',
          data: [65,59,80,81,56,55,40]
        }]
      },
      options: { maintainAspectRatio: false }
    });

    // Sales Graph
    const salesCtx = document.getElementById('salesGraph') as HTMLCanvasElement;
    new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Q1','Q2','Q3','Q4','Q5'],
        datasets: [{
          label: 'Mail-Orders',
          data: [5000,8000,6000,12000,9000],
          borderColor: '#fff',
          backgroundColor: 'rgba(255,255,255,0.3)'
        }]
      },
      options: { scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
    });

    // Leaflet map
    const map = L.map('world-map', { attributionControl: false }).setView([37.8, -96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }
}
