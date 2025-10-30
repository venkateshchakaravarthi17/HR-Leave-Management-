import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';

function passwordMatchValidator(form: FormGroup) {
  const password = form.get('Password')?.value;
  const confirm = form.get('ConfirmPassword')?.value;
  return password === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-add-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-employee.component.html',
  styleUrls: ['./add-edit-employee.component.scss']
})
export class AddEditEmployeeComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  employeeId: string | null = null;
  private draftKey = 'employeeDraft';

  isAdmin = false;
  currentUserId = '';

  countries: string[] = [
    'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
    'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
    'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia',
    'Cameroon','Canada','Cape Verde','Central African Republic','Chad','Chile','China','Colombia','Comoros',
    'Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica',
    'Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini',
    'Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada',
    'Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
    'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
    'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar',
    'Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco',
    'Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands',
    'New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan',
    'Palau','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania',
    'Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa',
    'San Marino','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia',
    'Slovenia','Solomon Islands','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Suriname',
    'Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tonga','Trinidad and Tobago',
    'Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom',
    'United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUser()?.userId || '';

    this.initForm();

    // Dynamic validation: Show NumberOfChildren only for Married/Widowed/Divorced
    this.form.get('MaritalStatus')?.valueChanges.subscribe(status => {
      const childrenControl = this.form.get('NumberOfChildren');
      if (['Married', 'Widowed', 'Divorced'].includes(status)) {
        childrenControl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        childrenControl?.clearValidators();
        childrenControl?.setValue('');
      }
      childrenControl?.updateValueAndValidity();
    });

    this.employeeId = this.route.snapshot.paramMap.get('id');

    if (this.employeeId && !this.isAdmin && this.employeeId !== this.currentUserId) {
      Swal.fire('Access Denied', 'You can only edit your own profile.', 'error');
      this.router.navigate(['/employees/list']);
      return;
    }

    if (this.employeeId) {
      this.isEdit = true;
      this.loadEmployeeForEdit(this.employeeId);
    } else {
      if (!this.isAdmin) {
        Swal.fire('Access Denied', 'You are not allowed to add new employees.', 'error');
        this.router.navigate(['/employees/list']);
        return;
      }
      this.loadDraft();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      UserName: ['', Validators.required],
      EmployeeName: ['', Validators.required],
      Password: ['', this.isEdit ? [] : [Validators.required]],
      ConfirmPassword: ['', this.isEdit ? [] : [Validators.required]],
      EmployeeRole: [{ value: '', disabled: !this.isAdmin }, Validators.required],
      IsActive: [true],
      CreatedBy: ['admin'],
      Status: ['', Validators.required],
      EmploymentType: [''],
      ContractBy: [''],
      ContractEndDate: [''],
      WorkLocation: [''],
      Gender: [''],
      Nationality: [''],
      DateOfBirth: [''],
      MaritalStatus: [''],
      NumberOfChildren: [''],
      EmiratesIdNumber: [''],
      PassportNumber: [''],
      JobTitle: [''],
      Department: [''],
      ManagerName: [''],
      DateOfJoining: [''],
      PersonalEmail: [''],
      WorkEmail: ['', [Validators.required, Validators.email]],
      PersonalPhone: [''],
      WorkPhone: [''],
      EmergencyContactName: [''],
      EmergencyContactRelationship: [''],
      EmergencyContactNumber: [''],
      CurrentAddress: [''],
      PermanentAddress: [''],
      CountryOfResidence: [''],
      PoBox: [''],
      PassportExpiryDate: [''],
      VisaExpiryDate: [''],
      EmiratesIdExpiryDate: [''],
      LabourCardExpiryDate: [''],
      InsuranceExpiryDate: ['']
    }, {
      validators: this.isEdit ? [] : passwordMatchValidator
    });
  }

  private loadEmployeeForEdit(id: string): void {
    this.employeeService.getEmployeeById(id).subscribe(emp => {
      this.form.patchValue({
        UserName: emp.userName,
        EmployeeName: emp.employeeName,
        EmployeeRole: emp.employeeRole,
        IsActive: emp.isActive,
        CreatedBy: emp.createdBy,
        Status: emp.status,
        EmploymentType: emp.employmentType,
        ContractBy: emp.contractBy,
        ContractEndDate: emp.contractEndDate || '',
        WorkLocation: emp.workLocation,
        Gender: emp.gender,
        Nationality: emp.nationality,
        DateOfBirth: emp.dateOfBirth || '',
        MaritalStatus: emp.maritalStatus,
        NumberOfChildren: emp.numberOfChildren || '',
        EmiratesIdNumber: emp.emiratesIdNumber,
        PassportNumber: emp.passportNumber,
        JobTitle: emp.jobTitle,
        Department: emp.department,
        ManagerName: emp.managerName,
        DateOfJoining: emp.dateOfJoining || '',
        PersonalEmail: emp.personalEmail,
        WorkEmail: emp.workEmail,
        PersonalPhone: emp.personalPhone,
        WorkPhone: emp.workPhone,
        EmergencyContactName: emp.emergencyContactName,
        EmergencyContactRelationship: emp.emergencyContactRelationship,
        EmergencyContactNumber: emp.emergencyContactNumber,
        CurrentAddress: emp.currentAddress,
        PermanentAddress: emp.permanentAddress,
        CountryOfResidence: emp.countryOfResidence,
        PoBox: emp.poBox,
        PassportExpiryDate: emp.passportExpiryDate || '',
        VisaExpiryDate: emp.visaExpiryDate || '',
        EmiratesIdExpiryDate: emp.emiratesIdExpiryDate || '',
        LabourCardExpiryDate: emp.labourCardExpiryDate || '',
        InsuranceExpiryDate: emp.insuranceExpiryDate || ''
      });

      this.form.get('Password')?.clearValidators();
      this.form.get('Password')?.updateValueAndValidity();
      this.form.get('ConfirmPassword')?.clearValidators();
      this.form.get('ConfirmPassword')?.updateValueAndValidity();
    });
  }

  /** ✅ Includes NumberOfChildren in backend payload */
  private buildPayload(): any {
    const f = this.form.value;
    const payload: any = {
      UserName: f.UserName?.trim(),
      EmployeeRole: f.EmployeeRole,
      EmployeeName: f.EmployeeName?.trim(),
      IsActive: f.IsActive,
      CreatedBy: f.CreatedBy,
      Status: f.Status,
      EmploymentType: f.EmploymentType,
      ContractBy: f.ContractBy,
      ContractEndDate: f.ContractEndDate || undefined,
      WorkLocation: f.WorkLocation,
      Gender: f.Gender,
      Nationality: f.Nationality,
      DateOfBirth: f.DateOfBirth || undefined,
      MaritalStatus: f.MaritalStatus,
      NumberOfChildren: f.NumberOfChildren, 
      EmiratesIdNumber: f.EmiratesIdNumber,
      PassportNumber: f.PassportNumber,
      JobTitle: f.JobTitle,
      Department: f.Department,
      ManagerName: f.ManagerName,
      DateOfJoining: f.DateOfJoining || undefined,
      PersonalEmail: f.PersonalEmail,
      WorkEmail: f.WorkEmail?.trim(),
      PersonalPhone: f.PersonalPhone,
      WorkPhone: f.WorkPhone,
      EmergencyContactName: f.EmergencyContactName,
      EmergencyContactRelationship: f.EmergencyContactRelationship,
      EmergencyContactNumber: f.EmergencyContactNumber,
      CurrentAddress: f.CurrentAddress,
      PermanentAddress: f.PermanentAddress,
      CountryOfResidence: f.CountryOfResidence,
      PoBox: f.PoBox,
      PassportExpiryDate: f.PassportExpiryDate || undefined,
      VisaExpiryDate: f.VisaExpiryDate || undefined,
      EmiratesIdExpiryDate: f.EmiratesIdExpiryDate || undefined,
      LabourCardExpiryDate: f.LabourCardExpiryDate || undefined,
      InsuranceExpiryDate: f.InsuranceExpiryDate || undefined
    };

    if (this.isEdit && this.employeeId) {
      payload.EmployeeId = +this.employeeId;
      payload.ModifiedBy = 'admin';
    } else {
      payload.Password = f.Password;
    }

    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    return payload;
  }

  openDatePicker(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && 'showPicker' in input) {
      input.showPicker();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
      Swal.fire('Error', 'Please fill all required fields correctly.', 'error');
      return;
    }

    const payload = this.buildPayload();
    const request = this.isEdit && this.employeeId
      ? this.employeeService.updateEmployee(this.employeeId, payload)
      : this.employeeService.addEmployee(payload);

    request.subscribe({
      next: () => {
        Swal.fire(
          'Success',
          this.isEdit ? 'Employee updated successfully.' : 'Employee created successfully.',
          'success'
        ).then(() => {
          localStorage.removeItem(this.draftKey);
          this.router.navigate(['/employees/list']);
        });
      },
      error: err => {
        console.error('API Error:', err);
        Swal.fire(
          'Error',
          this.isEdit ? 'Failed to update employee.' : 'Failed to create employee.',
          'error'
        );
      }
    });
  }

  saveDraft(): void {
    localStorage.setItem(this.draftKey, JSON.stringify(this.form.value));
    Swal.fire('Draft Saved', 'Your employee draft has been saved.', 'info');
  }

  loadDraft(): void {
    const draft = localStorage.getItem(this.draftKey);
    if (draft) {
      this.form.patchValue(JSON.parse(draft));
      Swal.fire('Draft Loaded', 'A saved draft has been loaded.', 'info');
    }
  }

  clearForm(): void {
    this.form.reset({
      EmployeeRole: 'Employee',
      Status: 'InActive',
      EmploymentType: 'FTE',
      IsActive: true,
      CreatedBy: 'admin'
    });
    Swal.fire('Cleared', 'The form has been reset.', 'info');
  }

  cancel(): void {
    this.router.navigate(['/employees/list']);
  }
}
