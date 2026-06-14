export type VisaCategory = 'tourist' | 'transit' | 'hajj-umrah' | 'work' | 'student' | 'diplomatic';

export interface VisaTypeInfo {
  id: VisaCategory;
  name: string;
  title: string;
  feeUsd: number;
  processingTime: string;
  validity: string;
  entries: string;
  eligibility: string;
  requiredDocuments: string[];
  description: string;
}

export type PaymentStatus = 'draft' | 'pending' | 'paid' | 'failed' | 'pending_verification';
export type ApplicationStatus = 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected';

export interface Application {
  fullName: string;
  email: string;
  phone: string;
  passportNo: string;
  nationality: string;
  dob: string;
  visaType: VisaCategory;
  numberOfApplicants: number;
  address: string;
  documents: {
    passportScan: string; // Base64 image or filename
    photo: string; // Base64 image or filename
  };
  passportScan?: string; // backward compatibility
  photo?: string; // backward compatibility
  paymentStatus: PaymentStatus;
  applicationStatus: ApplicationStatus;
  applicationId: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  transactionId?: string;
  totalFee: number;
}

export interface Payment {
  paymentId: string;
  applicationId: string;
  method: 'stripe' | 'paypal' | 'bank';
  amount: number;
  currency: 'USD';
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'pending_verification';
  paymentProof: string; // for bank transfer base64
  createdAt: string;
}

export interface AdminLog {
  action: string;
  performedBy: string;
  targetId: string;
  timestamp: string;
}

export interface WebConfig {
  reCaptchaSiteKey?: string;
}
