import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../app/services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements AfterViewInit {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  changePasswordModal: bootstrap.Modal | null = null;

  // Password strength meter
  passwordStrength: number = 0;
  passwordStrengthText: string = '';

  constructor(private auth: AuthService, private toastr: ToastrService) {}

  ngAfterViewInit(): void {
    const modalEl = document.getElementById('changePasswordModal');
    if (modalEl) this.changePasswordModal = new bootstrap.Modal(modalEl);
  }

  toggleSidebar() {
    document.body.classList.toggle('sidebar-collapse');
  }

  openChangePassword() {
    if (this.changePasswordModal) this.changePasswordModal.show();
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrength = 0;
    this.passwordStrengthText = '';
  }

  closeChangePassword() {
    if (this.changePasswordModal) this.changePasswordModal.hide();
  }

  /** Password Strength Checker */
  checkPasswordStrength() {
    const pwd = this.newPassword || '';
    let score = 0;

    if (pwd.length >= 6) score += 20;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/\d/.test(pwd)) score += 20;
    if (/[@$!%*?&]/.test(pwd)) score += 20;

    this.passwordStrength = score;

    if (score <= 40) {
      this.passwordStrengthText = 'Weak';
    } else if (score <= 80) {
      this.passwordStrengthText = 'Medium';
    } else {
      this.passwordStrengthText = 'Strong';
    }
  }

  logout() {
    this.auth.logout();
  }

  changePassword(form: NgForm) {
    if (form.invalid) {
      this.toastr.warning('Please fill all fields correctly!');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('New Password and Confirm Password do not match!');
      return;
    }

    const currentUser = this.auth.getCurrentUser();
    if (!currentUser?.workEmail) {
      this.toastr.error('User email not found. Please login again.');
      return;
    }

    this.loading = true;

    const payload = {
      workEmail: currentUser.workEmail as string,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.auth.changePassword(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Password changed successfully!');
          this.closeChangePassword();
          form.resetForm();
          this.passwordStrength = 0;
          this.passwordStrengthText = '';
        } else {
          this.toastr.error(res?.message || 'Failed to change password.');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Change password error:', err);
        this.toastr.error(err.error?.message || 'Something went wrong.');
      }
    });
  }
}
