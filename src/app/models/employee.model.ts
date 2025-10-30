export interface Employee {
  numberOfChildren: string;
  id: number | null | undefined;
  employeeId?: number;
  userId?: string;       
  userName: string;
  employeeName: string;
  employeeRole: string;
  workEmail: string;
  picture?: string;      
  isActive?: boolean;    // backend expects
  createdBy?: string;    // backend expects

  //  employee add/edit
  status?: string;
  employmentType?: string;
  contractBy?: string;
  contractEndDate?: string;
  workLocation?: string;
  gender?: string;
  nationality?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  emiratesIdNumber?: string;
  passportNumber?: string;
  jobTitle?: string;
  department?: string;
  managerName?: string;
  dateOfJoining?: string;
  personalEmail?: string;
  personalPhone?: string;
  workPhone?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactNumber?: string;
  currentAddress?: string;
  permanentAddress?: string;
  countryOfResidence?: string;
  poBox?: string;
  passportExpiryDate?: string;
  visaExpiryDate?: string;
  emiratesIdExpiryDate?: string;
  labourCardExpiryDate?: string;
  insuranceExpiryDate?: string;
}

// --- DTOs for Profile APIs ---
export interface EmployeeProfileDTO {
  employeeId: number;
  userName: string;
  employeeName: string;
  employeeRole: string;
  status: string;
  employmentType: string;
  contractBy: string;
  contractEndDate?: string;
  workLocation: string;
  gender: string;
  nationality: string;
  dateOfBirth?: string;
  maritalStatus: string;
  emiratesIdNumber: string;
  passportNumber: string;
  jobTitle: string;
  department: string;
  managerName: string;
  dateOfJoining?: string;
  personalEmail: string;
  workEmail: string;
  personalPhone: string;
  workPhone: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
  currentAddress: string;
  permanentAddress: string;
  countryOfResidence: string;
  poBox: string;
  passportExpiryDate?: string;
  visaExpiryDate?: string;
  emiratesIdExpiryDate?: string;
  labourCardExpiryDate?: string;
  insuranceExpiryDate?: string;

  profilePictureUrl?: string;  // frontend now uses profilePictureUrl
  picture?: string;            // for backward compatibility with previewUrl
}

export interface EmployeeProfileUpdateDTO {
  userName: string;
  employeeName: string;
  status: string;
  employmentType: string;
  contractBy: string;
  contractEndDate?: string;
  workLocation: string;
  gender: string;
  nationality: string;
  dateOfBirth?: string;
  maritalStatus: string;
  emiratesIdNumber: string;
  passportNumber: string;
  jobTitle: string;
  department: string;
  managerName: string;
  dateOfJoining?: string;
  personalEmail: string;
  workEmail: string;
  personalPhone: string;
  workPhone: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
  currentAddress: string;
  permanentAddress: string;
  countryOfResidence: string;
  poBox: string;
  passportExpiryDate?: string;
  visaExpiryDate?: string;
  emiratesIdExpiryDate?: string;
  labourCardExpiryDate?: string;
  insuranceExpiryDate?: string;
  picture?: string;  // for frontend preview
}
