import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  model = {
    username: '',
    password: '',
    confirmPassword: ''
  };
  error = '';
  success = '';
  password: any;
  confirmPassword: any;
  username: any;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
  if (this.password !== this.confirmPassword) {
    this.error = 'Passwords do not match';
    return;
  }

  const newUser = {
    username: this.username,
    password: this.password
  };

  this.auth.register(newUser).subscribe({
    next: () => {
      alert('Registered successfully!');
      this.router.navigate(['/login']); 
    },
    error: (err) => {
      this.error = 'Registration failed. Username may already exist.';
      console.error('Register error:', err);
    }
  });
}

}

