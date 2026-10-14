// AgriSurvey Type Definitions

export type UserRole = 'farmer' | 'tahsildar' | 'field_worker' | 'admin';

export type AccountStatus = 'active' | 'pending_approval' | 'suspended' | 'deactivated';

export type RegistrationStatus =
  | 'DRAFT'
  | 'PENDING_TAHSILDAR_REVIEW'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type InspectionStatus =
  | 'NOT_STARTED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'EVIDENCE_UPLOADED'
  | 'SUBMITTED_FOR_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REINSPECTION_REQUIRED';

export type FinalVerificationStatus =
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ADDITIONAL_EVIDENCE_REQUIRED'
  | 'REINSPECTION_REQUIRED';

export type ComparisonResultType =
  | 'CONSISTENT'
  | 'INCONSISTENT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'REQUIRES_REINSPECTION';

export type CropVerificationResultType =
  | 'MATCHES'
  | 'PARTIALLY_MATCHES'
  | 'DOES_NOT_MATCH'
  | 'UNABLE_TO_DETERMINE';

export type NotificationChannel = 'in_app' | 'sms' | 'both';

export type DeliveryStatusType =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'provider_unavailable';

export type LandAreaUnit = 'Acres' | 'Hectares' | 'Cents';

export type LandType =
  | 'Agricultural Land'
  | 'Irrigated Land'
  | 'Rain-Fed Land'
  | 'Mixed Agricultural Land'
  | 'Other';

export type FarmType =
  | 'Crop Farming'
  | 'Horticulture'
  | 'Plantation'
  | 'Mixed Farming'
  | 'Other';

export type OwnershipCategory =
  | 'Individual Ownership'
  | 'Joint Ownership'
  | 'Leasehold'
  | 'Other';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  role: UserRole;
  account_status: AccountStatus;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  address: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  postal_code: string;
  identity_verification_status: string;
  identity_verification_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  farmer_id: string;
  property_reference: string;
  property_name: string | null;
  survey_number: string;
  subdivision_number: string | null;
  land_document_reference: string;
  land_area: number;
  land_area_unit: LandAreaUnit;
  land_type: LandType;
  farm_type: FarmType;
  ownership_category: OwnershipCategory;
  village: string;
  taluk: string;
  district: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationApplication {
  id: string;
  application_reference: string;
  farmer_id: string;
  property_id: string;
  status: RegistrationStatus;
  assigned_tahsildar_id: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  additional_information_request: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for UI convenience
  property?: Property;
  farmer?: Profile;
  assigned_tahsildar?: Profile;
}

export interface LandDocument {
  id: string;
  property_id: string;
  uploaded_by: string;
  document_type: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  review_status: string;
  uploaded_at: string;
}

export interface FarmerLandImage {
  id: string;
  property_id: string;
  application_id: string;
  uploaded_by: string;
  storage_path: string;
  original_filename: string;
  capture_timestamp: string | null;
  latitude: number | null;
  longitude: number | null;
  metadata_status: string;
  uploaded_at: string;
}

export interface FieldInspection {
  id: string;
  property_id: string;
  application_id: string;
  assigned_worker_id: string | null;
  assigned_tahsildar_id: string | null;
  inspection_status: InspectionStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  field_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  property?: Property;
  application?: RegistrationApplication;
  assigned_worker?: Profile;
}

export interface DroneImagery {
  id: string;
  inspection_id: string;
  property_id: string;
  application_id: string;
  uploaded_by: string;
  storage_path: string;
  original_filename: string;
  capture_timestamp: string | null;
  latitude: number | null;
  longitude: number | null;
  mission_reference: string | null;
  metadata_status: string;
  processing_status: string;
  uploaded_at: string;
}

export interface ImageComparison {
  id: string;
  application_id: string;
  property_id: string;
  comparison_result: ComparisonResultType;
  similarity_score: number | null;
  similarity_model_version: string | null;
  review_notes: string | null;
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
}

export interface ComparisonImage {
  id: string;
  comparison_id: string;
  image_type: 'farmer' | 'drone';
  image_id: string;
  created_at: string;
}

export interface CropVerification {
  id: string;
  property_id: string;
  application_id: string;
  declared_crop_type: string;
  observed_crop_type: string;
  crop_category: string;
  cultivation_season: string;
  approximate_cultivated_area: number | null;
  irrigation_method: string | null;
  verification_result: CropVerificationResultType;
  ai_prediction: string | null;
  ai_confidence: number | null;
  ai_model_version: string | null;
  reviewer_notes: string | null;
  verified_by: string;
  verified_at: string;
  created_at: string;
}

export interface VerificationReport {
  id: string;
  report_reference: string;
  property_id: string;
  application_id: string;
  reviewed_by: string;
  final_status: FinalVerificationStatus;
  findings: Record<string, any>;
  discrepancies: string | null;
  supporting_evidence: Array<{ type: string; title: string; reference: string; date?: string }>;
  report_storage_path: string | null;
  created_at: string;
  // Joined
  property?: Property;
  application?: RegistrationApplication;
  reviewer?: Profile;
}

export interface Notification {
  id: string;
  recipient_user_id: string;
  notification_type: string;
  title: string;
  message: string;
  related_application_id: string | null;
  channel: NotificationChannel;
  delivery_status: DeliveryStatusType;
  read_at: string | null;
  created_at: string;
}

export interface NotificationJob {
  id: string;
  notification_id: string;
  provider: string;
  delivery_status: DeliveryStatusType;
  attempt_count: number;
  last_attempt_at: string | null;
  delivered_at: string | null;
  provider_message_reference: string | null;
  error_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
  created_at: string;
}

export interface StaffRegion {
  id: string;
  staff_user_id: string;
  state: string;
  district: string;
  taluk: string;
  village: string | null;
  created_at: string;
}
