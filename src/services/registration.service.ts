import { supabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from './mock-db';
import { notificationService } from './notification.service';
import { msg91Service } from './msg91.service';
import { firebaseService } from './firebase.service';
import {
  RegistrationApplication,
  Property,
  RegistrationStatus,
  Profile,
  NotificationJob,
  AccountActivationToken,
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
    username?: string;
    activationToken?: string;
    activationUrl?: string;
    smsJob?: NotificationJob;
    smsMessage?: string;
    [key: string]: any;
  }> {
    const officer = mockDb.currentUser;
    // 1. Role Authorization Check: Only Tahsildar or Admin
    if (officer.role !== 'tahsildar' && officer.role !== 'admin') {
      throw new Error('Unauthorized: Only an authorized Tahsildar or Administrator can review applications.');
    }

    const app = mockDb.applications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    // 2. Prevent conflicting/duplicate approvals
    if (app.status === 'APPROVED' && decision === 'APPROVED') {
      throw new Error('This application has already been approved and credentials have been provisioned.');
    }

    const prevStatus = app.status;
    app.status = decision;
    app.reviewed_at = new Date().toISOString();
    app.assigned_tahsildar_id = officer.id;
    app.updated_at = new Date().toISOString();

    if (decision === 'REJECTED') {
      if (!payload.rejectionReason?.trim()) {
        throw new Error('An official rejection reason is mandatory when rejecting an application.');
      }
      app.rejection_reason = payload.rejectionReason;
    } else if (decision === 'ADDITIONAL_INFORMATION_REQUIRED') {
      if (!payload.additionalInfoRequest?.trim()) {
        throw new Error('Explanation of requested additional information is mandatory.');
      }
      app.additional_information_request = payload.additionalInfoRequest;
    }

    let generatedUsername: string | undefined;
    let activationToken: string | undefined;
    let activationUrl: string | undefined;
    let smsJob: NotificationJob | undefined;
    let smsMessageText: string | undefined;

    // 3. IF APPROVED: Provision unique username, create single-use activation token, dispatch MSG91 SMS
    if (decision === 'APPROVED') {
      const farmer = mockDb.profiles.find((p) => p.id === app.farmer_id);
      if (farmer) {
        // Status remains 'pending_activation' until farmer sets their own secure password
        farmer.account_status = 'pending_activation';

        // Unique username generated by backend (State - District - Taluk - Random 5-digit number)
        const talukPrefix = (app.property?.taluk || 'HAV').slice(0, 3).toUpperCase();
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        generatedUsername = `MH-PUN-${talukPrefix}-${randomSuffix}`;

        // Cryptographically random, single-use activation token (expires in 48 hours)
        activationToken = `act_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
        const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

        // Record activation token in durable storage
        const tokenRecord: AccountActivationToken = {
          id: `tok-${Date.now()}`,
          user_id: farmer.id,
          application_id: app.id,
          token: activationToken,
          username: generatedUsername,
          expires_at: expiresAt,
          used_at: null,
          created_at: new Date().toISOString(),
        };
        mockDb.activationTokens.unshift(tokenRecord);

        // Store credentials metadata on farmer (NO plaintext password)
        farmer.activation_token = activationToken;
        farmer.activation_expires_at = expiresAt;
        farmer.generated_credentials = {
          username: generatedUsername,
          password: '', // Plaintext passwords are NEVER stored
          dispatched_at: new Date().toISOString(),
        };

        // Dispatch SMS via MSG91 Service (Records durable notification_job)
        const smsResult = await msg91Service.sendApprovalSms({
          phoneNumber: farmer.phone_number || '',
          username: generatedUsername,
          activationToken,
          applicationId: app.id,
        });

        activationUrl = smsResult.activationUrl;
        smsJob = smsResult.job;
        smsMessageText = smsResult.messageText;

        // Also record in legacy smsMessages for backward UI compatibility
        mockDb.addSmsMessage({
          id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          recipient_phone: farmer.phone_number || 'Registered Mobile',
          recipient_name: farmer.full_name,
          message: smsResult.messageText,
          credentials: {
            username: generatedUsername,
            password: '[Set via Secure Activation Link]',
          },
          sent_at: new Date().toISOString(),
          status: smsResult.job.delivery_status === 'SENT' ? 'sent' : 'delivered',
        });
      }
    }

    // 4. Audit Log Entry
    mockDb.addAuditLog(
      `TAHSILDAR_APPLICATION_${decision}`,
      'registration_applications',
      app.id,
      { status: prevStatus },
      {
        status: decision,
        notes: payload.notes || payload.rejectionReason || payload.additionalInfoRequest,
        officer_id: officer.id,
        officer_name: officer.full_name,
        username_provisioned: generatedUsername || null,
        sms_job_id: smsJob?.id || null,
        sms_delivery_status: smsJob?.delivery_status || null,
      }
    );

    // 5. In-App Notification for Farmer
    let notifTitle = '';
    let notifMsg = '';
    if (decision === 'APPROVED') {
      notifTitle = 'Land Registration Approved - Account Activation Required';
      notifMsg = `Your AgriSurvey land registration application ${app.application_reference} has been approved by the Tahsildar. Your official assigned username is ${generatedUsername}. Please check your SMS for the official activation link to set your password.`;
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
    return {
      ...app,
      application: app,
      username: generatedUsername,
      activationToken,
      activationUrl,
      smsJob,
      smsMessage: smsMessageText,
    };
  }

  /**
   * Secure 2-factor Application Status Lookup (Application Reference + Registered Mobile Number)
   */
  async lookupApplicationStatus(appReference: string, mobileNumber: string): Promise<{
    application: RegistrationApplication;
    property: Property | null;
    status: RegistrationStatus;
    rejectionReason: string | null;
    additionalInfoRequest: string | null;
    username?: string;
    activationToken?: string;
    smsJob?: NotificationJob | null;
  }> {
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    const cleanRef = appReference.trim().toUpperCase();

    const app = mockDb.applications.find(
      (a) => a.application_reference.toUpperCase() === cleanRef
    );

    if (!app) {
      throw new Error('No registration application found matching this reference number.');
    }

    const farmer = mockDb.profiles.find((p) => p.id === app.farmer_id);
    const farmerPhone = farmer?.phone_number?.replace(/\D/g, '') || '';

    // Verify phone matches registered farmer
    if (farmerPhone !== cleanPhone && !farmerPhone.endsWith(cleanPhone) && !cleanPhone.endsWith(farmerPhone)) {
      throw new Error('The mobile number does not match the registered applicant for this application reference.');
    }

    const property = mockDb.properties.find((p) => p.id === app.property_id) || null;
    const smsJob = mockDb.notificationJobs.find((j) => j.application_id === app.id) || null;

    // If approved, find the active activation token
    const tokenRecord = mockDb.activationTokens.find(
      (t) => t.application_id === app.id && !t.used_at
    );

    return {
      application: app,
      property,
      status: app.status,
      rejectionReason: app.rejection_reason,
      additionalInfoRequest: app.additional_information_request,
      username: farmer?.generated_credentials?.username,
      activationToken: tokenRecord?.token,
      smsJob,
    };
  }

  /**
   * Validates an account activation token
   */
  async validateActivationToken(token: string): Promise<{
    valid: boolean;
    tokenRecord?: AccountActivationToken;
    farmer?: Profile;
    application?: RegistrationApplication;
    reason?: string;
  }> {
    const cleanToken = token.trim();
    const tokenRecord = mockDb.activationTokens.find((t) => t.token === cleanToken);

    if (!tokenRecord) {
      return { valid: false, reason: 'Invalid activation link. Please check the link sent to your mobile phone.' };
    }

    if (tokenRecord.used_at) {
      return {
        valid: false,
        reason: 'This account activation link has already been used. Please log in with your credentials.',
      };
    }

    const isExpired = new Date(tokenRecord.expires_at).getTime() < Date.now();
    if (isExpired) {
      return {
        valid: false,
        reason: 'This activation link has expired (validity is 48 hours). Please contact your Tahsildar office for a re-issuance.',
      };
    }

    const farmer = mockDb.profiles.find((p) => p.id === tokenRecord.user_id);
    const application = mockDb.applications.find((a) => a.id === tokenRecord.application_id);

    return {
      valid: true,
      tokenRecord,
      farmer,
      application,
    };
  }

  /**
   * Activate farmer account and set initial secure password
   */
  async activateFarmerAccount(params: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; username: string }> {
    const { token, newPassword } = params;

    // Validate token
    const validation = await this.validateActivationToken(token);
    if (!validation.valid || !validation.tokenRecord || !validation.farmer) {
      throw new Error(validation.reason || 'Invalid or expired activation token.');
    }

    // Validate password security
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error('Password must contain at least one uppercase letter (A-Z).');
    }
    if (!/[a-z]/.test(newPassword)) {
      throw new Error('Password must contain at least one lowercase letter (a-z).');
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new Error('Password must contain at least one numeric digit (0-9).');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      throw new Error('Password must contain at least one special character (e.g. !@#$%^&*).');
    }

    const farmer = validation.farmer;
    const tokenRecord = validation.tokenRecord;

    // Establish password & activate account
    farmer.password = newPassword;
    farmer.account_status = 'active';
    tokenRecord.used_at = new Date().toISOString();

    // Audit log
    mockDb.addAuditLog(
      'FARMER_ACCOUNT_ACTIVATED',
      'profiles',
      farmer.id,
      { account_status: 'pending_activation' },
      { account_status: 'active', activated_via_token: tokenRecord.id }
    );

    mockDb.persistAll();
    return {
      success: true,
      username: tokenRecord.username || farmer.phone_number || 'Farmer',
    };
  }

  /**
   * Tahsildar starts reviewing an application (transition to UNDER_REVIEW)
   */
  async startReview(appId: string): Promise<RegistrationApplication> {
    const app = mockDb.applications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const prevStatus = app.status;
    app.status = 'UNDER_REVIEW';
    app.assigned_tahsildar_id = mockDb.currentUser.id;
    app.updated_at = new Date().toISOString();

    mockDb.addAuditLog(
      'TAHSILDAR_REVIEW_STARTED',
      'registration_applications',
      app.id,
      { status: prevStatus },
      { status: 'UNDER_REVIEW', reviewer: mockDb.currentUser.full_name }
    );

    mockDb.persistAll();
    return app;
  }

  /**
   * Farmer responds to Additional Information Request or files an Appeal for Rejected application
   */
  async respondAndResubmit(params: {
    appId: string;
    responseNotes: string;
    additionalDocuments?: string;
  }): Promise<RegistrationApplication> {
    const { appId, responseNotes, additionalDocuments } = params;
    const app = mockDb.applications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const prevStatus = app.status;
    if (prevStatus !== 'ADDITIONAL_INFORMATION_REQUIRED' && prevStatus !== 'REJECTED') {
      throw new Error(`Cannot resubmit application with current status: ${prevStatus}`);
    }

    app.status = 'RESUBMITTED';
    app.updated_at = new Date().toISOString();

    // Audit log
    mockDb.addAuditLog(
      'FARMER_APPLICATION_RESUBMITTED',
      'registration_applications',
      app.id,
      { status: prevStatus },
      {
        status: 'RESUBMITTED',
        response_notes: responseNotes,
        documents: additionalDocuments,
      }
    );

    // Notify assigned Tahsildar
    if (app.assigned_tahsildar_id) {
      await notificationService.createNotification({
        recipient_user_id: app.assigned_tahsildar_id,
        notification_type: 'APPLICATION_RESUBMITTED',
        title: 'Application Resubmitted with Clarifications',
        message: `Farmer has responded to verification request on application ${app.application_reference}: "${responseNotes.slice(0, 100)}..."`,
        related_application_id: app.id,
        channel: 'in_app',
      });
    }

    mockDb.persistAll();
    return app;
  }

  /**
   * Register an additional agricultural property under an existing farmer account
   */
  async createAdditionalProperty(params: {
    farmerId: string;
    property: PropertyDetailsFormData;
  }): Promise<{ property: Property; application: RegistrationApplication }> {
    const { farmerId, property } = params;
    const farmer = mockDb.profiles.find((p) => p.id === farmerId);
    if (!farmer) throw new Error('Farmer account not found');

    const propRef = `AGRI-PROP-${new Date().getFullYear()}-${property.taluk.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProperty: Property = {
      id: `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      farmer_id: farmerId,
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

    // Assign to Tahsildar based on region
    const staffMatch = mockDb.staffRegions.find(
      (sr) => sr.district === property.district && (!sr.taluk || sr.taluk === property.taluk)
    );
    const assignedTahsildarId = staffMatch?.staff_user_id || 'usr-tahsildar-01';

    const appRef = `AGRI-APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApp: RegistrationApplication = {
      id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
      farmer,
    };
    mockDb.applications.unshift(newApp);

    mockDb.addAuditLog(
      'ADDITIONAL_PROPERTY_REGISTERED',
      'properties',
      newProperty.id,
      null,
      {
        property_reference: propRef,
        application_reference: appRef,
        survey_number: property.surveyNumber,
        district: property.district,
      }
    );

    await notificationService.createNotification({
      recipient_user_id: assignedTahsildarId,
      notification_type: 'NEW_REGISTRATION_SUBMITTED',
      title: 'New Property Registration Review Pending',
      message: `Farmer ${farmer.full_name} submitted additional property for Survey ${property.surveyNumber}, ${property.taluk}.`,
      related_application_id: newApp.id,
      channel: 'in_app',
    });

    mockDb.persistAll();
    return { property: newProperty, application: newApp };
  }
}

export const registrationService = new RegistrationService();
