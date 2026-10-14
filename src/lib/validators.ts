import { z } from 'zod';

// Step 1: Personal Information Schema
export const personalInfoSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  preferredLanguage: z.string().default('en'),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

// Step 2: Identity & Address Schema
export const identityAddressSchema = z.object({
  identityMethod: z.enum([
    'VOTER_ID',
    'PAN_CARD',
    'RATION_CARD',
    'KISAN_CREDIT_PASSBOOK',
    'GOVT_PHOTO_ID',
  ], {
    error: 'Please select an authorized identity verification document',
  }),
  identityDocumentNumber: z
    .string()
    .min(4, 'Document identifier is required (e.g., ABCDE1234F)')
    .max(20, 'Document identifier is too long'),
  address: z.string().min(5, 'Full residential address is required'),
  village: z.string().min(2, 'Village is required'),
  taluk: z.string().min(2, 'Taluk / Tehsil is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().default('Maharashtra'),
  postalCode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code'),
});

export type IdentityAddressFormData = z.infer<typeof identityAddressSchema>;

// Step 3: Property Details Schema
export const propertyDetailsSchema = z.object({
  propertyName: z.string().optional(),
  landDocumentNumber: z.string().min(3, 'Land title / 7/12 extract document number is required'),
  surveyNumber: z.string().min(1, 'Survey number / Gat number is required'),
  subdivisionNumber: z.string().optional(),
  landArea: z
    .number({ error: 'Land area must be a valid number' })
    .positive('Land area must be greater than zero'),
  landAreaUnit: z.enum(['Acres', 'Hectares', 'Cents']),
  landType: z.string().min(2, 'Please select a land category'),
  farmType: z.string().min(2, 'Please select a farming classification'),
  ownershipCategory: z.string().min(2, 'Please select ownership type'),
  village: z.string().min(2, 'Property village is required'),
  taluk: z.string().min(2, 'Property taluk is required'),
  district: z.string().min(2, 'Property district is required'),
  state: z.string().default('Maharashtra'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type PropertyDetailsFormData = z.infer<typeof propertyDetailsSchema>;

// Step 4: Documents and Consent Schema
export const documentConsentSchema = z.object({
  consentGiven: z.literal(true, {
    error: 'You must provide consent for official verification and land imagery inspection',
  }),
});

export type DocumentConsentFormData = z.infer<typeof documentConsentSchema>;

// Tahsildar Review Schema
export const tahsildarReviewSchema = z
  .object({
    decision: z.enum(['APPROVED', 'REJECTED', 'ADDITIONAL_INFORMATION_REQUIRED']),
    rejectionReason: z.string().optional(),
    additionalInfoRequest: z.string().optional(),
    internalNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.decision === 'REJECTED') {
        return !!data.rejectionReason && data.rejectionReason.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'Rejection reason must be at least 5 characters long',
      path: ['rejectionReason'],
    }
  )
  .refine(
    (data) => {
      if (data.decision === 'ADDITIONAL_INFORMATION_REQUIRED') {
        return !!data.additionalInfoRequest && data.additionalInfoRequest.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'Please provide clear explanation for additional information required',
      path: ['additionalInfoRequest'],
    }
  );

export type TahsildarReviewFormData = z.infer<typeof tahsildarReviewSchema>;

// Crop Verification Schema
export const cropVerificationSchema = z.object({
  declaredCropType: z.string().min(2, 'Declared crop type is required'),
  observedCropType: z.string().min(2, 'Observed crop type is required'),
  cropCategory: z.string().min(2, 'Crop category is required'),
  cultivationSeason: z.string().min(2, 'Cultivation season is required'),
  approximateCultivatedArea: z.number().positive('Area must be positive').optional().nullable(),
  irrigationMethod: z.string().optional().nullable(),
  verificationResult: z.enum(['MATCHES', 'PARTIALLY_MATCHES', 'DOES_NOT_MATCH', 'UNABLE_TO_DETERMINE']),
  reviewerNotes: z.string().optional().nullable(),
});

export type CropVerificationFormData = z.infer<typeof cropVerificationSchema>;
