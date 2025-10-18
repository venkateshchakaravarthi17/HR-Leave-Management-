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
  }

  closeChangePassword() {
    if (this.changePasswordModal) this.changePasswordModal.hide();
  }

  logout() {
    this.auth.logout();
  }

  changePassword(form: NgForm) {
  console.log('🔹 Change password clicked');

  if (form.invalid) {
    this.toastr.warning('Please fill all fields correctly!');
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.toastr.error('New Password and Confirm Password do not match!');
    return;
  }

  const currentUser = this.auth.getCurrentUser();
  console.log('Current user:', currentUser);

  if (!currentUser) {
    this.toastr.error('User not found. Please login again.');
    return;
  }

  this.loading = true;

  
  this.auth
    .changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    })
    .subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastr.success('Password changed successfully!');
          this.closeChangePassword();
        } else {
          this.toastr.error(res?.message || 'Failed to change password.');
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Change password error:', err);
        this.toastr.error(err.error?.message || 'Something went wrong.');
        this.loading = false;
      }
    });
}


}
