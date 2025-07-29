import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
})
export class UserViewComponent implements OnInit {
  userId: number | null = null;

  user = {
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    country: '',
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    // Simulated data fetch — replace with real service/API
    if (this.userId === 1) {
      this.user = {
        firstName: 'Venkatesh',
        lastName: 'Chakaravarthi',
        department: 'ECE',
        email: 'venkatesh@gmail.com',
        country: 'India',
      };
    }
    if (this.userId === 2) {
      this.user = {
        firstName: 'Vishnu',
        lastName: 'Kumar',
        department: 'IT',
        email: 'vishnu@gmail.com',
        country: 'Japan',
      };
    }
    if (this.userId === 3) {
      this.user = {
        firstName: 'Dhivya',
        lastName: 'Bharathi',
        department: 'CSE',
        email: 'dhivya@gmail.com',
        country: 'USA',
      };
    }
    if (this.userId === 4) {
      this.user = {
        firstName: 'Swapna',
        lastName: 'Pushparaj',
        department: 'EEE',
        email: 'swapna@gmail.com',
        country: 'UK',
      };
    }
    if (this.userId === 5) {
      this.user = {
        firstName: 'Udhaya',
        lastName: 'Kumar',
        department: 'MECH',
        email: 'udhaya@gmail.com',
        country: 'Australia',
      };
    }
    if (this.userId === 6) {
      this.user = {
        firstName: 'Virat',
        lastName: 'Kohli',
        department: 'AE',
        email: 'virat@gmail.com',
        country: 'Canada',
      };
    }

  }
}
