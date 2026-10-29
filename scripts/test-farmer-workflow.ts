import { mockDb } from '../src/services/mock-db';
import { registrationService } from '../src/services/registration.service';
import { authService } from '../src/services/auth.service';

async function runTest() {
  console.log('--- Step 1: Submitting Land Registration at Farmer Signup ---');
  const res = await registrationService.registerFarmerWithLand({
    personal: {
      fullName: 'Sathya Marathe',
      mobileNumber: '9848848484',
      email: 'sathya@example.com',
      preferredLanguage: 'en',
    },
    identity: {
      identityMethod: 'VOTER_ID',
      identityDocumentNumber: 'MH/2026/098124',
      address: 'Gat 142, Pune-Nagar Road, Wagholi',
      village: 'Wagholi',
      taluk: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      postalCode: '412207',
    },
    property: {
      propertyName: 'Marathe Sugarcane Field',
      landDocumentNumber: 'MH-PUN-7-12-2026-99214',
      surveyNumber: '142/2A',
      subdivisionNumber: '2A',
      landArea: 3.5,
      landAreaUnit: 'Acres',
      landType: 'Agricultural Land',
      farmType: 'Crop Farming',
      ownershipCategory: 'Individual Ownership',
      village: 'Wagholi',
      taluk: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      latitude: 18.5793,
      longitude: 73.9824,
    },
  });

  console.log('Registered Farmer ID:', res.farmer.id);
  console.log('Account Status:', res.farmer.account_status);
  console.log('Application Ref:', res.application.application_reference);
  console.log('Application Status:', res.application.status);
  console.log('Assigned Tahsildar:', res.application.assigned_tahsildar_id);

  if (res.farmer.account_status !== 'pending_approval') {
    throw new Error('FAILED: Farmer should be pending_approval before Tahsildar approves');
  }

  console.log('\n--- Step 2: Attempting Sign In before Tahsildar Approval ---');
  try {
    await authService.signIn('9848848484', 'SomePassword');
    console.error('FAILED: Sign in should have thrown PENDING_APPROVAL error');
  } catch (err: any) {
    console.log('Expected error caught:', err.message);
    if (!err.message.includes('PENDING_APPROVAL')) {
      throw new Error('FAILED: Did not catch PENDING_APPROVAL error');
    }
  }

  console.log('\n--- Step 3: Tahsildar Review & Approval ---');
  // Set current user as Tahsildar
  mockDb.setCurrentUserByRole('tahsildar');
  const reviewResult = await registrationService.reviewApplication(res.application.id, 'APPROVED', {
    notes: 'Verified 7/12 extract from Maharashtra Mahabhulekh land registry.',
  });

  console.log('Approval Result Status:', reviewResult.application.status);
  console.log('Generated Username:', reviewResult.username);
  console.log('Activation URL:', reviewResult.activationUrl);
  console.log('SMS Message Text:', reviewResult.smsMessage);

  if (!reviewResult.activationToken || !reviewResult.username) {
    throw new Error('FAILED: Secure activation token or username not generated properly');
  }

  // Check SMS message in DB
  const latestSms = mockDb.smsMessages[0];
  console.log('\n--- Step 4: Verifying SMS Text Message Delivery ---');
  console.log('SMS Recipient:', latestSms?.recipient_phone);
  console.log('SMS Content:', latestSms?.message);
  console.log('SMS Status:', latestSms?.status);

  if (!latestSms || latestSms.recipient_phone !== '9848848484') {
    throw new Error('FAILED: SMS text message not found in database');
  }

  console.log('\n--- Step 5: Farmer Activating Account with Secure Password ---');
  const activationRes = await registrationService.activateFarmerAccount({
    token: reviewResult.activationToken,
    newPassword: 'FarmerSecurePass123!',
  });
  console.log('Account Activated Successfully with Username:', activationRes.username);

  console.log('\n--- Step 6: Farmer Signing In with Activated Password ---');
  const loginRes = await authService.signIn('9848848484', 'FarmerSecurePass123!');
  console.log('Logged In Farmer Name:', loginRes.user.full_name);
  console.log('Logged In Farmer Status:', loginRes.user.account_status);

  if (loginRes.user.account_status !== 'active') {
    throw new Error('FAILED: Farmer account should be active after activation');
  }

  console.log('\n--- Step 6: Verifying Farmer Property in Portal ---');
  const farmerApps = await registrationService.getMyApplications(loginRes.user.id);
  console.log('Farmer Applications Count:', farmerApps.length);
  console.log('First App Survey Number:', farmerApps[0]?.property?.survey_number);
  console.log('First App Status:', farmerApps[0]?.status);

  if (farmerApps.length === 0 || farmerApps[0]?.property?.survey_number !== '142/2A') {
    throw new Error('FAILED: Registered land property not found for approved farmer');
  }

  console.log('\n✅ ALL WORKFLOW ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
