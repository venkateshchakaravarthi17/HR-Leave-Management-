import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
  const credentials = { username: this.username, password: this.password };

  this.auth.login(credentials).subscribe({
    next: (response) => {
      const token = response?.response?.token; 
      if (token) {
        this.auth.saveToken(token);
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Login failed';
      }
    },
    error: (err) => {
      this.error = 'Invalid credentials or server error.';
      console.error('Login error:', err);
    }
  });
}

}
