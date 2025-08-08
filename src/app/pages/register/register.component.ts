import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.toastr.error('Please fill all fields correctly!');
      return;
    }

    const newUser = {
      UserName: form.value.username,
      firstName: form.value.firstname,
      lastName: form.value.lastname,
      email: form.value.email,
      password: form.value.password,
      confirmPassword: form.value.confirmpassword,
      EmployeeRole: form.value.role || 'Employee',
      PhoneNumber: form.value.phonenumber || '',
      isActive: true,
      createdBy: 'self',
      modifiedBy: 'self'
    };

    this.auth.register(newUser).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toastr.success('Registration successful!');
        
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.toastr.error(res?.message || 'Registration failed.');
        }
      },
      error: (err: any) => {
        this.toastr.error('Something went wrong during registration.');
        console.error(err);
      }
    });
  }
}
