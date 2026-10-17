import {
  Profile,
  FarmerProfile,
  Property,
  RegistrationApplication,
  LandDocument,
  FarmerLandImage,
  FieldInspection,
  DroneImagery,
  ImageComparison,
  CropVerification,
  VerificationReport,
  Notification,
  AuditLog,
  StaffRegion,
  UserRole,
  SmsMessage,
} from '@/types';

// Key for LocalStorage Persistence
const STORAGE_PREFIX = 'agrisurvey_db_';
const memoryStorage: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  } catch {
    return false;
  }
}

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    if (!isLocalStorageAvailable()) {
      const mem = memoryStorage[STORAGE_PREFIX + key];
      return mem ? JSON.parse(mem) : defaultVal;
    }
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    const serialized = JSON.stringify(val);
    if (!isLocalStorageAvailable()) {
      memoryStorage[STORAGE_PREFIX + key] = serialized;
      return;
    }
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (err) {
    console.error('LocalStorage write error', err);
  }
}

// -----------------------------------------------------------------------------
// Initial Demonstration Data
// -----------------------------------------------------------------------------
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'usr-farmer-01',
    full_name: 'Ramesh Balasaheb Patil',
    email: 'farmer.ramesh@agrisurvey.gov.in',
    phone_number: '9822012345',
    role: 'farmer',
    account_status: 'active',
    preferred_language: 'en',
    password: 'FarmerPass123!',
    created_at: '2026-02-10T09:30:00Z',
    updated_at: '2026-02-10T09:30:00Z',
  },
  {
    id: 'usr-farmer-02',
    full_name: 'Sunita Dnyaneshwar Shinde',
    email: 'sunita.shinde@agrisurvey.gov.in',
    phone_number: '9850123456',
    role: 'farmer',
    account_status: 'active',
    preferred_language: 'mr',
    password: 'FarmerPass123!',
    created_at: '2026-03-01T10:15:00Z',
    updated_at: '2026-03-01T10:15:00Z',
  },
  {
    id: 'usr-tahsildar-01',
    full_name: 'Anand Shrikant Kulkarni',
    email: 'tahsildar.haveli@agrisurvey.gov.in',
    phone_number: '9423987654',
    role: 'tahsildar',
    account_status: 'active',
    preferred_language: 'en',
    password: 'TahsildarPass123!',
    created_at: '2025-11-01T08:00:00Z',
    updated_at: '2025-11-01T08:00:00Z',
  },
  {
    id: 'usr-worker-01',
    full_name: 'Prakash Mahadev Jadhav',
    email: 'drone.prakash@agrisurvey.gov.in',
    phone_number: '9765432109',
    role: 'field_worker',
    account_status: 'active',
    preferred_language: 'en',
    password: 'WorkerPass123!',
    created_at: '2025-12-15T11:20:00Z',
    updated_at: '2025-12-15T11:20:00Z',
  },
  {
    id: 'usr-admin-01',
    full_name: 'Dr. Meenakshi Sundaram, IAS',
    email: 'admin.director@agrisurvey.gov.in',
    phone_number: '9823000001',
    role: 'admin',
    account_status: 'active',
    preferred_language: 'en',
    password: 'AdminPass123!',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const INITIAL_SMS_MESSAGES: SmsMessage[] = [];

const INITIAL_FARMER_PROFILES: FarmerProfile[] = [
  {
    id: 'fp-01',
    user_id: 'usr-farmer-01',
    address: 'Gat No. 142, Pune-Nagar Highway, Wagholi Rural',
    village: 'Wagholi',
    taluk: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    postal_code: '412207',
    identity_verification_status: 'VERIFIED_DOC_ATTACHED',
    identity_verification_reference: 'VOTER-MH/2024/098124',
    created_at: '2026-02-10T09:30:00Z',
    updated_at: '2026-02-10T09:30:00Z',
  },
  {
    id: 'fp-02',
    user_id: 'usr-farmer-02',
    address: 'Near Gram Panchayat Office, Supae Road',
    village: 'Supae',
    taluk: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    postal_code: '412204',
    identity_verification_status: 'VERIFIED_DOC_ATTACHED',
    identity_verification_reference: 'PAN-BCKPS4192K',
    created_at: '2026-03-01T10:15:00Z',
    updated_at: '2026-03-01T10:15:00Z',
  },
];

const INITIAL_STAFF_REGIONS: StaffRegion[] = [
  {
    id: 'sr-01',
    staff_user_id: 'usr-tahsildar-01',
    state: 'Maharashtra',
    district: 'Pune',
    taluk: 'Haveli',
    village: null,
    created_at: '2025-11-01T08:00:00Z',
  },
  {
    id: 'sr-02',
    staff_user_id: 'usr-tahsildar-01',
    state: 'Maharashtra',
    district: 'Pune',
    taluk: 'Baramati',
    village: null,
    created_at: '2025-11-01T08:00:00Z',
  },
  {
    id: 'sr-03',
    staff_user_id: 'usr-worker-01',
    state: 'Maharashtra',
    district: 'Pune',
    taluk: 'Haveli',
    village: null,
    created_at: '2025-12-15T11:20:00Z',
  },
];

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-01',
    farmer_id: 'usr-farmer-01',
    property_reference: 'AGRI-PROP-2026-HAV-0142',
    property_name: 'Patil Agro Sugarcane Field',
    survey_number: '142/2A',
    subdivision_number: '2A',
    land_document_reference: 'MH-PUN-7-12-2025-884920',
    land_area: 3.5,
    land_area_unit: 'Acres',
    land_type: 'Agricultural Land',
    farm_type: 'Crop Farming',
    ownership_category: 'Individual Ownership',
    village: 'Wagholi',
    taluk: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5793,
    longitude: 73.9824,
    created_at: '2026-02-12T10:00:00Z',
    updated_at: '2026-02-12T10:00:00Z',
  },
  {
    id: 'prop-02',
    farmer_id: 'usr-farmer-02',
    property_reference: 'AGRI-PROP-2026-BAR-0088',
    property_name: 'Shinde Organic Soybean Farm',
    survey_number: '88/1',
    subdivision_number: '1',
    land_document_reference: 'MH-PUN-7-12-2025-339182',
    land_area: 5.2,
    land_area_unit: 'Acres',
    land_type: 'Agricultural Land',
    farm_type: 'Crop Farming',
    ownership_category: 'Joint Ownership',
    village: 'Supae',
    taluk: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.1519,
    longitude: 74.5772,
    created_at: '2026-03-02T11:20:00Z',
    updated_at: '2026-03-02T11:20:00Z',
  },
  {
    id: 'prop-03',
    farmer_id: 'usr-farmer-01',
    property_reference: 'AGRI-PROP-2026-SHI-0204',
    property_name: 'Shirur Agro Wheat & Jowar Plot',
    survey_number: '204/B',
    subdivision_number: 'B',
    land_document_reference: 'MH-PUN-7-12-2026-102941',
    land_area: 2.75,
    land_area_unit: 'Acres',
    land_type: 'Irrigated Land',
    farm_type: 'Mixed Farming',
    ownership_category: 'Individual Ownership',
    village: 'Koregaon Bhima',
    taluk: 'Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.6654,
    longitude: 74.0721,
    created_at: '2026-03-10T14:45:00Z',
    updated_at: '2026-03-10T14:45:00Z',
  },
];

const INITIAL_APPLICATIONS: RegistrationApplication[] = [
  {
    id: 'app-01',
    application_reference: 'AGRI-APP-2026-849102',
    farmer_id: 'usr-farmer-01',
    property_id: 'prop-01',
    status: 'APPROVED',
    assigned_tahsildar_id: 'usr-tahsildar-01',
    submitted_at: '2026-02-12T10:15:00Z',
    reviewed_at: '2026-02-14T11:30:00Z',
    rejection_reason: null,
    additional_information_request: null,
    created_at: '2026-02-12T10:15:00Z',
    updated_at: '2026-02-14T11:30:00Z',
  },
  {
    id: 'app-02',
    application_reference: 'AGRI-APP-2026-921345',
    farmer_id: 'usr-farmer-02',
    property_id: 'prop-02',
    status: 'PENDING_TAHSILDAR_REVIEW',
    assigned_tahsildar_id: 'usr-tahsildar-01',
    submitted_at: '2026-03-02T11:40:00Z',
    reviewed_at: null,
    rejection_reason: null,
    additional_information_request: null,
    created_at: '2026-03-02T11:40:00Z',
    updated_at: '2026-03-02T11:40:00Z',
  },
  {
    id: 'app-03',
    application_reference: 'AGRI-APP-2026-713420',
    farmer_id: 'usr-farmer-01',
    property_id: 'prop-03',
    status: 'PENDING_TAHSILDAR_REVIEW',
    assigned_tahsildar_id: 'usr-tahsildar-01',
    submitted_at: '2026-03-10T15:00:00Z',
    reviewed_at: null,
    rejection_reason: null,
    additional_information_request: null,
    created_at: '2026-03-10T15:00:00Z',
    updated_at: '2026-03-10T15:00:00Z',
  },
];

const INITIAL_LAND_IMAGES: FarmerLandImage[] = [
  {
    id: 'fli-01',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-farmer-01',
    storage_path: 'farmer-images/prop-01/north_entrance.jpg',
    original_filename: 'field_north_boundary.jpg',
    capture_timestamp: '2026-02-15T08:15:00Z',
    latitude: 18.5793,
    longitude: 73.9823,
    metadata_status: 'METADATA_EXTRACTED',
    uploaded_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 'fli-02',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-farmer-01',
    storage_path: 'farmer-images/prop-01/sugarcane_crop_row.jpg',
    original_filename: 'sugarcane_canopy_rows.jpg',
    capture_timestamp: '2026-02-15T08:22:00Z',
    latitude: 18.5795,
    longitude: 73.9826,
    metadata_status: 'METADATA_EXTRACTED',
    uploaded_at: '2026-02-15T09:02:00Z',
  },
  {
    id: 'fli-03',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-farmer-01',
    storage_path: 'farmer-images/prop-01/drip_irrigation_lateral.jpg',
    original_filename: 'drip_irrigation_pipes.jpg',
    capture_timestamp: '2026-02-15T08:30:00Z',
    latitude: 18.5794,
    longitude: 73.9824,
    metadata_status: 'METADATA_EXTRACTED',
    uploaded_at: '2026-02-15T09:04:00Z',
  },
  {
    id: 'fli-04',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-farmer-01',
    storage_path: 'farmer-images/prop-01/east_survey_marker.jpg',
    original_filename: 'boundary_survey_stone.jpg',
    capture_timestamp: '2026-02-15T08:35:00Z',
    latitude: 18.5791,
    longitude: 73.9828,
    metadata_status: 'METADATA_EXTRACTED',
    uploaded_at: '2026-02-15T09:06:00Z',
  },
  {
    id: 'fli-05',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-farmer-01',
    storage_path: 'farmer-images/prop-01/pump_shed_borewell.jpg',
    original_filename: 'borewell_solar_pump.jpg',
    capture_timestamp: '2026-02-15T08:42:00Z',
    latitude: 18.5790,
    longitude: 73.9822,
    metadata_status: 'METADATA_EXTRACTED',
    uploaded_at: '2026-02-15T09:08:00Z',
  },
  {
    id: 'fli-06',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-farmer-01',
    storage_path: 'farmer-images/prop-01/overall_farm_view.jpg',
    original_filename: 'overall_landscape_view.jpg',
    capture_timestamp: '2026-02-15T08:50:00Z',
    latitude: 18.5796,
    longitude: 73.9825,
    metadata_status: 'METADATA_EXTRACTED',
    uploaded_at: '2026-02-15T09:10:00Z',
  },
];

const INITIAL_INSPECTIONS: FieldInspection[] = [
  {
    id: 'insp-01',
    property_id: 'prop-01',
    application_id: 'app-01',
    assigned_worker_id: 'usr-worker-01',
    assigned_tahsildar_id: 'usr-tahsildar-01',
    inspection_status: 'EVIDENCE_UPLOADED',
    scheduled_at: '2026-02-18T10:00:00Z',
    started_at: '2026-02-18T10:15:00Z',
    completed_at: '2026-02-18T11:45:00Z',
    field_notes: 'Flight executed with DJI Matrice 300 RTK at 45m AGL. 75% front overlap, 70% side overlap. High-density canopy coverage confirming healthy sugarcane stand.',
    created_at: '2026-02-16T10:00:00Z',
    updated_at: '2026-02-18T12:00:00Z',
  },
];

const INITIAL_DRONE_IMAGERY: DroneImagery[] = [
  {
    id: 'drn-01',
    inspection_id: 'insp-01',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-worker-01',
    storage_path: 'drone-imagery/insp-01/orthomosaic_nadir.jpg',
    original_filename: 'DJI_20260218_0142_NADIR.JPG',
    capture_timestamp: '2026-02-18T10:25:00Z',
    latitude: 18.5793,
    longitude: 73.9824,
    mission_reference: 'MISSION-HAV-2026-081',
    metadata_status: 'GEO_TAGGED_RTK',
    processing_status: 'PROCESSED',
    uploaded_at: '2026-02-18T12:30:00Z',
  },
  {
    id: 'drn-02',
    inspection_id: 'insp-01',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-worker-01',
    storage_path: 'drone-imagery/insp-01/oblique_field_overview.jpg',
    original_filename: 'DJI_20260218_0143_OBLIQUE.JPG',
    capture_timestamp: '2026-02-18T10:32:00Z',
    latitude: 18.5796,
    longitude: 73.9822,
    mission_reference: 'MISSION-HAV-2026-081',
    metadata_status: 'GEO_TAGGED_RTK',
    processing_status: 'PROCESSED',
    uploaded_at: '2026-02-18T12:32:00Z',
  },
  {
    id: 'drn-03',
    inspection_id: 'insp-01',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-worker-01',
    storage_path: 'drone-imagery/insp-01/irrigation_infrastructure.jpg',
    original_filename: 'DJI_20260218_0144_IRRIGATION.JPG',
    capture_timestamp: '2026-02-18T10:40:00Z',
    latitude: 18.5794,
    longitude: 73.9825,
    mission_reference: 'MISSION-HAV-2026-081',
    metadata_status: 'GEO_TAGGED_RTK',
    processing_status: 'PROCESSED',
    uploaded_at: '2026-02-18T12:35:00Z',
  },
  {
    id: 'drn-04',
    inspection_id: 'insp-01',
    property_id: 'prop-01',
    application_id: 'app-01',
    uploaded_by: 'usr-worker-01',
    storage_path: 'drone-imagery/insp-01/boundary_stone_aerial.jpg',
    original_filename: 'DJI_20260218_0145_BOUNDARY.JPG',
    capture_timestamp: '2026-02-18T10:48:00Z',
    latitude: 18.5791,
    longitude: 73.9829,
    mission_reference: 'MISSION-HAV-2026-081',
    metadata_status: 'GEO_TAGGED_RTK',
    processing_status: 'PROCESSED',
    uploaded_at: '2026-02-18T12:38:00Z',
  },
];

const INITIAL_COMPARISONS: ImageComparison[] = [
  {
    id: 'cmp-01',
    application_id: 'app-01',
    property_id: 'prop-01',
    comparison_result: 'CONSISTENT',
    similarity_score: 93.4,
    similarity_model_version: 'AgriVision-SIFT-v2.1',
    review_notes: 'Visible land boundary landmarks, irrigation pipe alignment, and crop vigor in farmer photo #2 perfectly correspond with drone orthomosaic Nadir image DJI_0142.',
    reviewed_by: 'usr-tahsildar-01',
    reviewed_at: '2026-02-20T14:30:00Z',
    created_at: '2026-02-20T14:30:00Z',
  },
];

const INITIAL_CROP_VERIFICATIONS: CropVerification[] = [
  {
    id: 'cv-01',
    property_id: 'prop-01',
    application_id: 'app-01',
    declared_crop_type: 'Sugarcane (ऊस)',
    observed_crop_type: 'Sugarcane (ऊस)',
    crop_category: 'Cash Crop',
    cultivation_season: 'Annual (Adsali / Suru)',
    approximate_cultivated_area: 3.45,
    irrigation_method: 'Drip Irrigation',
    verification_result: 'MATCHES',
    ai_prediction: 'Sugarcane (Saccharum officinarum)',
    ai_confidence: 94.8,
    ai_model_version: 'AgriCropNet-ResNet50-v3.2',
    reviewer_notes: 'Confirmed by Tahsildar Anand Kulkarni: Stand is 5-6 month old high-density sugarcane matching declaration and drone spectral reflectance.',
    verified_by: 'usr-tahsildar-01',
    verified_at: '2026-02-20T15:10:00Z',
    created_at: '2026-02-20T15:10:00Z',
  },
];

const INITIAL_REPORTS: VerificationReport[] = [
  {
    id: 'rep-01',
    report_reference: 'AGRI-VR-2026-583921',
    property_id: 'prop-01',
    application_id: 'app-01',
    reviewed_by: 'usr-tahsildar-01',
    final_status: 'VERIFIED',
    findings: {
      survey_number_matched: true,
      physical_boundaries_verified: true,
      boundary_discrepancy_meters: 0.4,
      declared_area: 3.5,
      measured_area: 3.48,
      crop_matched: true,
      declared_crop: 'Sugarcane (ऊस)',
      observed_crop: 'Sugarcane (ऊस)',
      irrigation_verified: 'Drip Irrigation operational',
      ai_assisted_analysis_conducted: true,
      similarity_score: 93.4,
    },
    discrepancies: 'Negligible 0.02 acre buffer variation on western boundary hedge with adjacent cart-track.',
    supporting_evidence: [
      { type: 'FARMER_IMAGES', title: '6 Verified Ground Photographs', reference: 'FLI-01 to FLI-06', date: '2026-02-15' },
      { type: 'DRONE_SURVEY', title: 'DJI RTK Aerial Mission #081', reference: 'DRN-01 to DRN-04', date: '2026-02-18' },
      { type: 'CROP_VERIFICATION', title: 'Revenue Crop Inspection Record', reference: 'CV-01', date: '2026-02-20' },
      { type: 'LAND_REVENUE_EXTRACT', title: '7/12 Extract Verification', reference: 'MH-PUN-7-12-2025-884920', date: '2026-02-12' },
    ],
    report_storage_path: 'reports/AGRI-VR-2026-583921.pdf',
    created_at: '2026-02-21T11:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-01',
    recipient_user_id: 'usr-farmer-01',
    notification_type: 'FINAL_VERIFICATION_COMPLETED',
    title: 'Verification Report Issued',
    message: 'Your AgriSurvey land verification report AGRI-VR-2026-583921 is now available for download. Decision: VERIFIED.',
    related_application_id: 'app-01',
    channel: 'both',
    delivery_status: 'delivered',
    read_at: null,
    created_at: '2026-02-21T11:05:00Z',
  },
  {
    id: 'notif-02',
    recipient_user_id: 'usr-tahsildar-01',
    notification_type: 'NEW_REGISTRATION_SUBMITTED',
    title: 'New Land Application in Baramati',
    message: 'Sunita Shinde submitted application AGRI-APP-2026-921345 for Survey No. 88/1, Supae, Baramati. Review pending.',
    related_application_id: 'app-02',
    channel: 'in_app',
    delivery_status: 'delivered',
    read_at: null,
    created_at: '2026-03-02T11:45:00Z',
  },
  {
    id: 'notif-03',
    recipient_user_id: 'usr-farmer-02',
    notification_type: 'APPLICATION_SUBMITTED',
    title: 'Application Received',
    message: 'Your land registration application AGRI-APP-2026-921345 has been submitted successfully and is awaiting verification by the responsible Tahsildar.',
    related_application_id: 'app-02',
    channel: 'both',
    delivery_status: 'delivered',
    read_at: '2026-03-02T12:00:00Z',
    created_at: '2026-03-02T11:40:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    actor_user_id: 'usr-tahsildar-01',
    actor_name: 'Anand Shrikant Kulkarni (Tahsildar)',
    action: 'TAHSILDAR_APPLICATION_APPROVED',
    entity_type: 'registration_applications',
    entity_id: 'app-01',
    previous_state: { status: 'PENDING_TAHSILDAR_REVIEW' },
    new_state: { status: 'APPROVED', reviewed_at: '2026-02-14T11:30:00Z' },
    created_at: '2026-02-14T11:30:00Z',
  },
  {
    id: 'aud-02',
    actor_user_id: 'usr-farmer-01',
    actor_name: 'Ramesh Balasaheb Patil (Farmer)',
    action: 'FARMER_LAND_IMAGES_UPLOADED',
    entity_type: 'farmer_land_images',
    entity_id: 'app-01',
    previous_state: null,
    new_state: { image_count: 6, status: 'SUBMITTED_FOR_INSPECTION' },
    created_at: '2026-02-15T09:10:00Z',
  },
  {
    id: 'aud-03',
    actor_user_id: 'usr-worker-01',
    actor_name: 'Prakash Mahadev Jadhav (Field Worker)',
    action: 'DRONE_EVIDENCE_SUBMITTED',
    entity_type: 'field_inspections',
    entity_id: 'insp-01',
    previous_state: { inspection_status: 'SCHEDULED' },
    new_state: { inspection_status: 'EVIDENCE_UPLOADED', photo_count: 4 },
    created_at: '2026-02-18T12:40:00Z',
  },
  {
    id: 'aud-04',
    actor_user_id: 'usr-tahsildar-01',
    actor_name: 'Anand Shrikant Kulkarni (Tahsildar)',
    action: 'FINAL_LAND_VERIFICATION_COMPLETED',
    entity_type: 'verification_reports',
    entity_id: 'rep-01',
    previous_state: { status: 'PENDING_FINAL_REVIEW' },
    new_state: { report_reference: 'AGRI-VR-2026-583921', final_status: 'VERIFIED' },
    created_at: '2026-02-21T11:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// Reactive Mock Database Engine
// -----------------------------------------------------------------------------
export class MockDatabase {
  private static instance: MockDatabase;

  public profiles: Profile[];
  public farmerProfiles: FarmerProfile[];
  public staffRegions: StaffRegion[];
  public properties: Property[];
  public applications: RegistrationApplication[];
  public landImages: FarmerLandImage[];
  public inspections: FieldInspection[];
  public droneImagery: DroneImagery[];
  public comparisons: ImageComparison[];
  public cropVerifications: CropVerification[];
  public reports: VerificationReport[];
  public notifications: Notification[];
  public auditLogs: AuditLog[];
  public smsMessages: SmsMessage[];

  // Active simulated user session
  public currentUser: Profile;

  private constructor() {
    this.profiles = getStorage('profiles', INITIAL_PROFILES);
    this.farmerProfiles = getStorage('farmerProfiles', INITIAL_FARMER_PROFILES);
    this.staffRegions = getStorage('staffRegions', INITIAL_STAFF_REGIONS);
    this.properties = getStorage('properties', INITIAL_PROPERTIES);
    this.applications = getStorage('applications', INITIAL_APPLICATIONS);
    this.landImages = getStorage('landImages', INITIAL_LAND_IMAGES);
    this.inspections = getStorage('inspections', INITIAL_INSPECTIONS);
    this.droneImagery = getStorage('droneImagery', INITIAL_DRONE_IMAGERY);
    this.comparisons = getStorage('comparisons', INITIAL_COMPARISONS);
    this.cropVerifications = getStorage('cropVerifications', INITIAL_CROP_VERIFICATIONS);
    this.reports = getStorage('reports', INITIAL_REPORTS);
    this.notifications = getStorage('notifications', INITIAL_NOTIFICATIONS);
    this.auditLogs = getStorage('auditLogs', INITIAL_AUDIT_LOGS);
    this.smsMessages = getStorage('smsMessages', INITIAL_SMS_MESSAGES);

    const savedUserId = isLocalStorageAvailable() ? localStorage.getItem('agrisurvey_current_user_id') : null;
    const userMatch = this.profiles.find((p) => p.id === savedUserId);
    this.currentUser = userMatch || this.profiles[0]; // Defaults to Ramesh Patil (Farmer)
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  public persistAll(): void {
    setStorage('profiles', this.profiles);
    setStorage('farmerProfiles', this.farmerProfiles);
    setStorage('staffRegions', this.staffRegions);
    setStorage('properties', this.properties);
    setStorage('applications', this.applications);
    setStorage('landImages', this.landImages);
    setStorage('inspections', this.inspections);
    setStorage('droneImagery', this.droneImagery);
    setStorage('comparisons', this.comparisons);
    setStorage('cropVerifications', this.cropVerifications);
    setStorage('reports', this.reports);
    setStorage('notifications', this.notifications);
    setStorage('auditLogs', this.auditLogs);
    setStorage('smsMessages', this.smsMessages);
  }

  public addSmsMessage(sms: SmsMessage): void {
    this.smsMessages.unshift(sms);
    this.persistAll();
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('agrisurvey_sms_received', { detail: sms }));
      } catch (e) {
        console.warn('Could not dispatch sms event', e);
      }
    }
  }

  public findProfileByLogin(identifier: string): Profile | null {
    if (!identifier) return null;
    const cleanId = identifier.trim();
    const idLower = cleanId.toLowerCase();
    const cleanPhone = cleanId.replace(/\D/g, '');

    return (
      this.profiles.find((p) => {
        // Match email
        if (p.email && p.email.toLowerCase() === idLower) return true;
        // Match phone (raw or normalized)
        if (p.phone_number) {
          const pClean = p.phone_number.replace(/\D/g, '');
          if (pClean === cleanPhone || p.phone_number === cleanId) return true;
        }
        // Match user ID
        if (p.id === cleanId) return true;
        // Match generated username
        if (p.generated_credentials?.username === cleanId) return true;
        return false;
      }) || null
    );
  }

  public setCurrentUser(userId: string): Profile | null {
    const user = this.profiles.find((p) => p.id === userId);
    if (user) {
      this.currentUser = user;
      if (isLocalStorageAvailable()) {
        localStorage.setItem('agrisurvey_current_user_id', user.id);
      }
      return user;
    }
    return null;
  }

  public setCurrentUserByRole(role: UserRole): Profile {
    const user = this.profiles.find((p) => p.role === role) || this.profiles[0];
    this.currentUser = user;
    if (isLocalStorageAvailable()) {
      localStorage.setItem('agrisurvey_current_user_id', user.id);
    }
    return user;
  }

  public addAuditLog(action: string, entityType: string, entityId: string, prev: any, next: any) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor_user_id: this.currentUser.id,
      actor_name: `${this.currentUser.full_name} (${this.currentUser.role.toUpperCase()})`,
      action,
      entity_type: entityType,
      entity_id: entityId,
      previous_state: prev,
      new_state: next,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    this.persistAll();
    return log;
  }

  public resetToFactory(): void {
    localStorage.clear();
    this.profiles = INITIAL_PROFILES;
    this.farmerProfiles = INITIAL_FARMER_PROFILES;
    this.staffRegions = INITIAL_STAFF_REGIONS;
    this.properties = INITIAL_PROPERTIES;
    this.applications = INITIAL_APPLICATIONS;
    this.landImages = INITIAL_LAND_IMAGES;
    this.inspections = INITIAL_INSPECTIONS;
    this.droneImagery = INITIAL_DRONE_IMAGERY;
    this.comparisons = INITIAL_COMPARISONS;
    this.cropVerifications = INITIAL_CROP_VERIFICATIONS;
    this.reports = INITIAL_REPORTS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.smsMessages = INITIAL_SMS_MESSAGES;
    this.currentUser = INITIAL_PROFILES[0];
    this.persistAll();
  }
}

export const mockDb = MockDatabase.getInstance();
