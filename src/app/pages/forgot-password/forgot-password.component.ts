import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  error = '';

  constructor(private authService: AuthService) {}

  submit() {
    this.message = '';
    this.error = '';

    if (!this.email.trim()) {
      this.error = 'Please enter a valid email.';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.message = res?.message || 'If the email exists, a reset link has been sent.';
      },
      error: (err) => {
        this.error = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}
