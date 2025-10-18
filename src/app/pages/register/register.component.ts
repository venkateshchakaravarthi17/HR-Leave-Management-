import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
      this.toastr.error('Please fill all required fields!');
      return;
    }

    // Map form fields to API fields
    const newEmployee = {
      UserName: form.value.username,
      EmployeeName: form.value.employeename || `${form.value.firstname} ${form.value.lastname}`,
      Password: form.value.password,
      ConfirmPassword: form.value.confirmpassword,
      IsActive: true,
      CreatedBy: 'admin',
      Status: form.value.status || 'InActive',
      EmploymentType: form.value.employmentType || 'FTE',
      ContractBy: form.value.contractBy || 'Datafirst',
      ContractEndDate: form.value.contractEndDate,
      WorkLocation: form.value.workLocation,
      Gender: form.value.gender,
      Nationality: form.value.nationality,
      DateOfBirth: form.value.dateOfBirth,
      MaritalStatus: form.value.maritalStatus,
      EmiratesIdNumber: form.value.emiratesIdNumber,
      PassportNumber: form.value.passportNumber,
      JobTitle: form.value.jobTitle,
      Department: form.value.department,
      ManagerName: form.value.managerName,
      DateOfJoining: form.value.dateOfJoining,
      PersonalEmail: form.value.personalEmail,
      WorkEmail: form.value.workEmail,
      PersonalPhone: form.value.personalPhone,
      WorkPhone: form.value.workPhone,
      EmergencyContactName: form.value.emergencyContactName,
      EmergencyContactRelationship: form.value.emergencyContactRelationship,
      EmergencyContactNumber: form.value.emergencyContactNumber,
      CurrentAddress: form.value.currentAddress,
      PermanentAddress: form.value.permanentAddress,
      CountryOfResidence: form.value.countryOfResidence,
      PoBox: form.value.poBox,
      PassportExpiryDate: form.value.passportExpiryDate,
      VisaExpiryDate: form.value.visaExpiryDate,
      EmiratesIdExpiryDate: form.value.emiratesIdExpiryDate,
      LabourCardExpiryDate: form.value.labourCardExpiryDate,
      InsuranceExpiryDate: form.value.insuranceExpiryDate
    };

    this.auth.signupEmployee(newEmployee).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastr.success('Employee registration successful!');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.toastr.error(res?.message || 'Registration failed!');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err.error?.message || 'Something went wrong during registration.');
      }
    });
  }
}
