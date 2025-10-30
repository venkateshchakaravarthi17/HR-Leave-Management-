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
  countries: string[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loadCountries();
  }

  loadCountries() {
    this.countries = [
      'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
      'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
      'Cambodia','Cameroon','Canada','Cape Verde','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
      'Denmark','Djibouti','Dominica','Dominican Republic',
      'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
      'Fiji','Finland','France',
      'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guyana',
      'Haiti','Honduras','Hungary',
      'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
      'Jamaica','Japan','Jordan',
      'Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
      'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
      'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
      'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway',
      'Oman',
      'Pakistan','Palau','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
      'Qatar',
      'Romania','Russia','Rwanda',
      'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
      'Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
      'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
      'Vanuatu','Vatican City','Venezuela','Vietnam',
      'Yemen',
      'Zambia','Zimbabwe'
    ];
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.toastr.error('Please fill all required fields!');
      return;
    }

    // Map form fields to API fields (preserve your existing mapping)
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
