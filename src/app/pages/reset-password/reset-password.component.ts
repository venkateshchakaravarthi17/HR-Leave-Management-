import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  WorkEmail = '';
  Token = '';
  NewPassword = '';
  ConfirmPassword = '';
  message = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.WorkEmail = this.route.snapshot.queryParamMap.get('WorkEmail') || '';
    this.Token = this.route.snapshot.queryParamMap.get('Token') || '';
  }

  submit() {
    this.message = '';
    this.error = '';

    if (!this.NewPassword || !this.ConfirmPassword) {
      this.error = 'Please fill in all fields.';
      return;
    }

    if (this.NewPassword !== this.ConfirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    const payload = {
      workEmail: this.WorkEmail,
      token: this.Token,
      newPassword: this.NewPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.message = res?.message || 'Password reset successful!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Unable to reset password. Please try again.';
      }
    });
  }
}
