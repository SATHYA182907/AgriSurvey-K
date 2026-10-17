import { supabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from './mock-db';
import { notificationService } from './notification.service';
import {
  RegistrationApplication,
  Property,
  RegistrationStatus,
  Profile,
} from '@/types';
import {
  PropertyDetailsFormData,
  IdentityAddressFormData,
} from '@/lib/validators';

export class RegistrationService {
  async submitRegistration(params: {
    farmerId: string;
    identity: IdentityAddressFormData;
    property: PropertyDetailsFormData;
  }): Promise<{ application: RegistrationApplication; property: Property }> {
    const { farmerId, identity, property } = params;

    if (isLiveSupabaseConfigured && supabase) {
      // Execute via Edge function or client RPC
      const propRef = `AGRI-PROP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: prop, error: pErr } = await supabase
        .from('properties')
        .insert({
          farmer_id: farmerId,
          property_reference: propRef,
          property_name: property.propertyName || `Land at Survey ${property.surveyNumber}`,
          survey_number: property.surveyNumber,
          subdivision_number: property.subdivisionNumber || null,
          land_document_reference: property.landDocumentNumber,
          land_area: property.landArea,
          land_area_unit: property.landAreaUnit,
          land_type: property.landType,
          farm_type: property.farmType,
          ownership_category: property.ownershipCategory,
          village: property.village,
          taluk: property.taluk,
          district: property.district,
          state: property.state,
          latitude: property.latitude || null,
          longitude: property.longitude || null,
        })
        .select()
        .single();
      if (pErr) throw pErr;

      const appRef = `AGRI-APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data: app, error: aErr } = await supabase
        .from('registration_applications')
        .insert({
          application_reference: appRef,
          farmer_id: farmerId,
          property_id: prop.id,
          status: 'PENDING_TAHSILDAR_REVIEW',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (aErr) throw aErr;

      return { application: app, property: prop };
    }

    // Dev Simulation
    const propRef = `AGRI-PROP-${new Date().getFullYear()}-${property.taluk.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      farmer_id: farmerId,
      property_reference: propRef,
      property_name: property.propertyName || `Plot at Survey ${property.surveyNumber}`,
      survey_number: property.surveyNumber,
      subdivision_number: property.subdivisionNumber || null,
      land_document_reference: property.landDocumentNumber,
      land_area: property.landArea,
      land_area_unit: property.landAreaUnit,
      land_type: property.landType as any,
      farm_type: property.farmType as any,
      ownership_category: property.ownershipCategory as any,
      village: property.village,
      taluk: property.taluk,
      district: property.district,
      state: property.state,
      latitude: property.latitude || 18.5204 + (Math.random() - 0.5) * 0.1,
      longitude: property.longitude || 73.8567 + (Math.random() - 0.5) * 0.1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDb.properties.unshift(newProperty);

    // Find assigned Tahsildar for this district/taluk
    const staffMatch = mockDb.staffRegions.find(
      (sr) => sr.district === property.district && (!sr.taluk || sr.taluk === property.taluk)
    );
    const assignedTahsildarId = staffMatch?.staff_user_id || 'usr-tahsildar-01';

    const appRef = `AGRI-APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApp: RegistrationApplication = {
      id: `app-${Date.now()}`,
      application_reference: appRef,
      farmer_id: farmerId,
      property_id: newProperty.id,
      status: 'PENDING_TAHSILDAR_REVIEW',
      assigned_tahsildar_id: assignedTahsildarId,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      rejection_reason: null,
      additional_information_request: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      property: newProperty,
      farmer: mockDb.profiles.find((p) => p.id === farmerId),
    };
    mockDb.applications.unshift(newApp);

    // Audit log
    mockDb.addAuditLog(
      'FARMER_REGISTRATION_SUBMITTED',
      'registration_applications',
      newApp.id,
      null,
      { application_reference: appRef, survey_number: property.surveyNumber, district: property.district }
    );

    // In-app Notification for Tahsildar
    await notificationService.createNotification({
      recipient_user_id: assignedTahsildarId,
      notification_type: 'NEW_REGISTRATION_SUBMITTED',
      title: 'New Land Registration Review Pending',
      message: `New registration ${appRef} submitted for Survey ${property.surveyNumber}, ${property.taluk}, ${property.district}.`,
      related_application_id: newApp.id,
      channel: 'in_app',
    });

    // In-app & SMS Notification for Farmer
    await notificationService.createNotification({
      recipient_user_id: farmerId,
      notification_type: 'APPLICATION_SUBMITTED',
      title: 'Registration Application Received',
      message: `Your land registration application ${appRef} has been submitted successfully and is awaiting verification by the responsible Tahsildar.`,
      related_application_id: newApp.id,
      channel: 'both',
    });

    mockDb.persistAll();
    return { application: newApp, property: newProperty };
  }

  async getMyApplications(farmerId: string): Promise<RegistrationApplication[]> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('registration_applications')
        .select(`
          *,
          property:properties(*),
          assigned_tahsildar:profiles!registration_applications_assigned_tahsildar_id_fkey(*)
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    return mockDb.applications
      .filter((a) => a.farmer_id === farmerId)
      .map((a) => ({
        ...a,
        property: mockDb.properties.find((p) => p.id === a.property_id),
        farmer: mockDb.profiles.find((p) => p.id === a.farmer_id),
        assigned_tahsildar: mockDb.profiles.find((p) => p.id === a.assigned_tahsildar_id),
      }));
  }

  async getApplicationById(id: string): Promise<RegistrationApplication | null> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('registration_applications')
        .select(`
          *,
          property:properties(*),
          farmer:profiles!registration_applications_farmer_id_fkey(*),
          assigned_tahsildar:profiles!registration_applications_assigned_tahsildar_id_fkey(*)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    const app = mockDb.applications.find((a) => a.id === id || a.application_reference === id);
    if (!app) return null;

    return {
      ...app,
      property: mockDb.properties.find((p) => p.id === app.property_id),
      farmer: mockDb.profiles.find((p) => p.id === app.farmer_id),
      assigned_tahsildar: mockDb.profiles.find((p) => p.id === app.assigned_tahsildar_id),
    };
  }

  async listApplicationsForTahsildar(params?: {
    tahsildarId?: string;
    status?: string;
    district?: string;
    taluk?: string;
    search?: string;
  }): Promise<RegistrationApplication[]> {
    const list = mockDb.applications.map((a) => ({
      ...a,
      property: mockDb.properties.find((p) => p.id === a.property_id),
      farmer: mockDb.profiles.find((p) => p.id === a.farmer_id),
      assigned_tahsildar: mockDb.profiles.find((p) => p.id === a.assigned_tahsildar_id),
    }));

    return list.filter((app) => {
      if (params?.status && params.status !== 'ALL' && app.status !== params.status) {
        return false;
      }
      if (params?.district && params.district !== 'ALL' && app.property?.district !== params.district) {
        return false;
      }
      if (params?.taluk && params.taluk !== 'ALL' && app.property?.taluk !== params.taluk) {
        return false;
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        const refMatch = app.application_reference.toLowerCase().includes(q);
        const nameMatch = app.farmer?.full_name.toLowerCase().includes(q);
        const surveyMatch = app.property?.survey_number.toLowerCase().includes(q);
        const villageMatch = app.property?.village.toLowerCase().includes(q);
        if (!refMatch && !nameMatch && !surveyMatch && !villageMatch) return false;
      }
      return true;
    });
  }

  async registerFarmerWithLand(params: {
    personal: {
      fullName: string;
      mobileNumber: string;
      email?: string;
      preferredLanguage?: string;
    };
    identity: IdentityAddressFormData;
    property: PropertyDetailsFormData;
    documentNames?: { landDoc?: string; identityDoc?: string };
  }): Promise<{
    farmer: Profile;
    application: RegistrationApplication;
    property: Property;
  }> {
    const { personal, identity, property, documentNames } = params;

    // Check if farmer already exists by phone or email
    let farmer = mockDb.findProfileByLogin(personal.mobileNumber) ||
      (personal.email ? mockDb.findProfileByLogin(personal.email) : null);

    if (!farmer) {
      farmer = {
        id: `usr-farmer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        full_name: personal.fullName,
        email: personal.email || `farmer.${personal.mobileNumber}@agrisurvey.local`,
        phone_number: personal.mobileNumber,
        role: 'farmer',
        account_status: 'pending_approval', // NOT active until Tahsildar approval!
        preferred_language: personal.preferredLanguage || 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.profiles.push(farmer);

      mockDb.farmerProfiles.push({
        id: `fp-${Date.now()}`,
        user_id: farmer.id,
        address: identity.address,
        village: identity.village,
        taluk: identity.taluk,
        district: identity.district,
        state: identity.state || 'Maharashtra',
        postal_code: identity.postalCode,
        identity_verification_status: 'PENDING_DOCUMENT_VERIFICATION',
        identity_verification_reference: identity.identityDocumentNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      // Mark as pending approval if submitting land registration for onboarding
      farmer.account_status = 'pending_approval';
      farmer.full_name = personal.fullName;
      farmer.phone_number = personal.mobileNumber;
      if (personal.email) farmer.email = personal.email;
    }

    // Create Property
    const propRef = `AGRI-PROP-${new Date().getFullYear()}-${property.taluk.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProperty: Property = {
      id: `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      farmer_id: farmer.id,
      property_reference: propRef,
      property_name: property.propertyName || `Farmland at Survey ${property.surveyNumber}`,
      survey_number: property.surveyNumber,
      subdivision_number: property.subdivisionNumber || null,
      land_document_reference: property.landDocumentNumber,
      land_area: property.landArea,
      land_area_unit: property.landAreaUnit,
      land_type: property.landType as any,
      farm_type: property.farmType as any,
      ownership_category: property.ownershipCategory as any,
      village: property.village,
      taluk: property.taluk,
      district: property.district,
      state: property.state,
      latitude: property.latitude || 18.5204 + (Math.random() - 0.5) * 0.1,
      longitude: property.longitude || 73.8567 + (Math.random() - 0.5) * 0.1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDb.properties.unshift(newProperty);

    // Assign Tahsildar based on jurisdiction
    const staffMatch = mockDb.staffRegions.find(
      (sr) => sr.district === property.district && (!sr.taluk || sr.taluk === property.taluk)
    );
    const assignedTahsildarId = staffMatch?.staff_user_id || 'usr-tahsildar-01';

    const appRef = `AGRI-APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApp: RegistrationApplication = {
      id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      application_reference: appRef,
      farmer_id: farmer.id,
      property_id: newProperty.id,
      status: 'PENDING_TAHSILDAR_REVIEW',
      assigned_tahsildar_id: assignedTahsildarId,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      rejection_reason: null,
      additional_information_request: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      property: newProperty,
      farmer,
    };
    mockDb.applications.unshift(newApp);

    // Audit log
    mockDb.addAuditLog(
      'FARMER_ONBOARDING_LAND_REGISTRATION_SUBMITTED',
      'registration_applications',
      newApp.id,
      null,
      {
        application_reference: appRef,
        farmer_name: personal.fullName,
        mobile_number: personal.mobileNumber,
        survey_number: property.surveyNumber,
        village: property.village,
        taluk: property.taluk,
        status: 'PENDING_TAHSILDAR_REVIEW',
      }
    );

    // High-priority In-App Notification for Tahsildar
    await notificationService.createNotification({
      recipient_user_id: assignedTahsildarId,
      notification_type: 'NEW_REGISTRATION_SUBMITTED',
      title: 'New Farmer & Land Registration Submitted',
      message: `New farmer ${personal.fullName} has registered with 7/12 Land Survey No. ${property.surveyNumber} in ${property.village}, ${property.taluk}. Official verification and approval required to generate and dispatch portal credentials.`,
      related_application_id: newApp.id,
      channel: 'in_app',
    });

    // Notification for Farmer record
    await notificationService.createNotification({
      recipient_user_id: farmer.id,
      notification_type: 'APPLICATION_SUBMITTED',
      title: 'Registration Application Received',
      message: `Your land registration application ${appRef} has been received. Upon Tahsildar review and approval, your official login Username and Password will be sent via SMS text message to ${personal.mobileNumber}.`,
      related_application_id: newApp.id,
      channel: 'both',
    });

    mockDb.persistAll();
    return { farmer, application: newApp, property: newProperty };
  }

  async reviewApplication(
    appId: string,
    decision: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFORMATION_REQUIRED',
    payload: { rejectionReason?: string; additionalInfoRequest?: string; notes?: string }
  ): Promise<{
    application: RegistrationApplication;
    credentials?: { username: string; password: string };
    smsMessage?: string;
  }> {
    const app = mockDb.applications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const prevStatus = app.status;
    app.status = decision;
    app.reviewed_at = new Date().toISOString();
    app.assigned_tahsildar_id = mockDb.currentUser.id;
    app.updated_at = new Date().toISOString();

    if (decision === 'REJECTED') {
      app.rejection_reason = payload.rejectionReason || 'Application does not meet land record verification criteria.';
    } else if (decision === 'ADDITIONAL_INFORMATION_REQUIRED') {
      app.additional_information_request = payload.additionalInfoRequest || 'Please supply updated survey clarification.';
    }

    let credentials: { username: string; password: string } | undefined;
    let smsMessageText: string | undefined;

    // IF APPROVED: Activate Farmer Account & Generate Credentials & Dispatch SMS!
    if (decision === 'APPROVED') {
      const farmer = mockDb.profiles.find((p) => p.id === app.farmer_id);
      if (farmer) {
        farmer.account_status = 'active';

        // Generate clean official credentials: username = mobile number, password = secure memorable phrase
        const cleanPhone = farmer.phone_number?.replace(/\D/g, '') || '';
        const phoneSuffix = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
        const username = farmer.phone_number || farmer.email || `farmer_${phoneSuffix}`;
        const generatedPassword = `Agri@${phoneSuffix}`;

        farmer.password = generatedPassword;
        farmer.generated_credentials = {
          username,
          password: generatedPassword,
          dispatched_at: new Date().toISOString(),
        };

        credentials = { username, password: generatedPassword };

        smsMessageText = `Govt of Maharashtra - AgriSurvey:\nDear ${farmer.full_name}, your land registration (${app.application_reference}) for Survey No. ${app.property?.survey_number || 'N/A'}, ${app.property?.village || 'Pune'} has been APPROVED by the Tahsildar Office.\n\nYour Portal Login Credentials:\nUsername: ${username}\nPassword: ${generatedPassword}\n\nLog in at: http://localhost:5173/auth/login to access your Farmer Dashboard and upload ground photographs.`;

        // Store and dispatch SMS
        mockDb.addSmsMessage({
          id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          recipient_phone: farmer.phone_number || 'Registered Mobile',
          recipient_name: farmer.full_name,
          message: smsMessageText,
          credentials: {
            username,
            password: generatedPassword,
          },
          sent_at: new Date().toISOString(),
          status: 'delivered',
        });
      }
    }

    // Audit log
    mockDb.addAuditLog(
      `TAHSILDAR_APPLICATION_${decision}`,
      'registration_applications',
      app.id,
      { status: prevStatus },
      {
        status: decision,
        notes: payload.notes || payload.rejectionReason || payload.additionalInfoRequest,
        credentials_generated: Boolean(credentials),
        sms_sent_to: app.farmer?.phone_number,
      }
    );

    // Notify farmer via in-app & SMS
    let notifTitle = '';
    let notifMsg = '';
    if (decision === 'APPROVED') {
      notifTitle = 'Land Registration Approved - Login Credentials Issued';
      notifMsg = `Your AgriSurvey land registration application ${app.application_reference} has been approved by the Tahsildar. Your login credentials (Username: ${credentials?.username}, Password: ${credentials?.password}) have been dispatched via SMS.`;
    } else if (decision === 'REJECTED') {
      notifTitle = 'Registration Application Rejected';
      notifMsg = `Your application ${app.application_reference} was rejected. Reason: ${app.rejection_reason}`;
    } else {
      notifTitle = 'Additional Information Required';
      notifMsg = `Action needed on application ${app.application_reference}: ${app.additional_information_request}`;
    }

    await notificationService.createNotification({
      recipient_user_id: app.farmer_id,
      notification_type: `REGISTRATION_${decision}`,
      title: notifTitle,
      message: notifMsg,
      related_application_id: app.id,
      channel: 'both',
    });

    mockDb.persistAll();
    return { application: app, credentials, smsMessage: smsMessageText };
  }
}

export const registrationService = new RegistrationService();
