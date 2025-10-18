import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  WorkEmail = '';
  message = '';
  error = '';

  constructor(private authService: AuthService) {}

  submit() {
    this.message = '';
    this.error = '';

    if (!this.WorkEmail.trim()) {
      this.error = 'Please enter a valid Work Email.';
      return;
    }

    this.authService.forgotPassword(this.WorkEmail).subscribe({
      next: (res: any) => {
        this.message = res?.message || 'If the email exists, a reset link has been sent.';
      },
      error: (err) => {
        this.error = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}
