import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../../services/employee.service';
import { EmployeeProfileDTO, EmployeeProfileUpdateDTO } from '../../../models/employee.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: EmployeeProfileDTO = {
    employeeId: 0,
    userName: '',
    employeeName: '',
    employeeRole: '',
    profilePictureUrl: '',
    status: '',
    employmentType: '',
    contractBy: '',
    contractEndDate: undefined,
    workLocation: '',
    gender: '',
    nationality: '',
    dateOfBirth: undefined,
    maritalStatus: '',
    emiratesIdNumber: '',
    passportNumber: '',
    jobTitle: '',
    department: '',
    managerName: '',
    dateOfJoining: undefined,
    personalEmail: '',
    workEmail: '',
    personalPhone: '',
    workPhone: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    currentAddress: '',
    permanentAddress: '',
    countryOfResidence: '',
    poBox: '',
    passportExpiryDate: undefined,
    visaExpiryDate: undefined,
    emiratesIdExpiryDate: undefined,
    labourCardExpiryDate: undefined,
    insuranceExpiryDate: undefined
  };

  previewUrl: string | ArrayBuffer | null = null;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
  this.employeeService.getProfile().subscribe({
    next: (res) => {
      // backend might return { data: EmployeeProfileDTO } or DTO directly
      const profile: EmployeeProfileDTO = res.data || res.response || res;
      if (profile) {
        this.user = profile;
        this.previewUrl = this.user.profilePictureUrl || 'assets/img/avatar.png';
      }
    },
    error: (err) => console.error('Failed to load profile', err)
  });
}


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(file);

      this.employeeService.uploadProfilePicture(file).subscribe({
        next: () => Swal.fire('Success', 'Profile picture updated', 'success'),
        error: () => Swal.fire('Error', 'Failed to upload picture', 'error')
      });
    }
  }

  onSubmit(): void {
    const updatePayload: EmployeeProfileUpdateDTO = {
      userName: this.user.userName,
      employeeName: this.user.employeeName,
      status: this.user.status,
      employmentType: this.user.employmentType,
      contractBy: this.user.contractBy,
      contractEndDate: this.user.contractEndDate,
      workLocation: this.user.workLocation,
      gender: this.user.gender,
      nationality: this.user.nationality,
      dateOfBirth: this.user.dateOfBirth,
      maritalStatus: this.user.maritalStatus,
      emiratesIdNumber: this.user.emiratesIdNumber,
      passportNumber: this.user.passportNumber,
      jobTitle: this.user.jobTitle,
      department: this.user.department,
      managerName: this.user.managerName,
      dateOfJoining: this.user.dateOfJoining,
      personalEmail: this.user.personalEmail,
      workEmail: this.user.workEmail,
      personalPhone: this.user.personalPhone,
      workPhone: this.user.workPhone,
      emergencyContactName: this.user.emergencyContactName,
      emergencyContactRelationship: this.user.emergencyContactRelationship,
      emergencyContactNumber: this.user.emergencyContactNumber,
      currentAddress: this.user.currentAddress,
      permanentAddress: this.user.permanentAddress,
      countryOfResidence: this.user.countryOfResidence,
      poBox: this.user.poBox,
      passportExpiryDate: this.user.passportExpiryDate,
      visaExpiryDate: this.user.visaExpiryDate,
      emiratesIdExpiryDate: this.user.emiratesIdExpiryDate,
      labourCardExpiryDate: this.user.labourCardExpiryDate,
      insuranceExpiryDate: this.user.insuranceExpiryDate
    };

    this.employeeService.updateProfile(updatePayload).subscribe({
      next: () => Swal.fire('Success', 'Profile updated successfully', 'success'),
      error: () => Swal.fire('Error', 'Failed to update profile', 'error')
    });
  }
}
