# AgriSurvey-K: AI-Powered Smart Agriculture Administration & Land Verification Platform

**AgriSurvey-K** is a modern, centralized agricultural land registration, administration, and drone-based verification platform. It connects **Farmers**, **Tahsildars (Revenue Officers)**, **Field Verification Workers (Drone Pilots)**, and **Administrators** to replace paper-bound land record friction with an evidence-backed verification pipeline.

---

## 🏛️ System Architecture

```
                       ┌──────────────────────────────────────────────────────────┐
                       │                     AgriSurvey Web                       │
                       │    (React 19 + TypeScript + Vite + Tailwind CSS)         │
                       └────────────────────────────┬─────────────────────────────┘
                                                    │
                   ┌────────────────────────────────┴─────────────────────────────┐
                   │                                                              │
        ┌──────────▼──────────┐                                        ┌──────────▼──────────┐
        │   Public Portals    │                                        │  Role-Based Portals │
        │  • Landing Page     │                                        │  • Farmer Portal    │
        │  • Auth & Onboarding│                                        │  • Tahsildar Portal │
        │  • Public FAQ/Track │                                        │  • Field Worker     │
        └─────────────────────┘                                        │  • Admin Analytics  │
                                                                       └──────────┬──────────┘
                                                                                  │
     ┌────────────────────────────────────────────────────────────────────────────┴────────┐
     │                               Service & Data Access Layer                           │
     │  auth.service | registration.service | inspection.service | drone.service           │
     │  crop-verification.service | report.service | notification.service | audit.service  │
     └────────────────────────────────────────────┬────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴───────────────────────────────┐
                 │                                                                │
     ┌───────────▼────────────┐                                      ┌────────────▼──────────┐
     │ Supabase Cloud Backend │                                      │ Dev Simulation Engine │
     │ • PostgreSQL 15+ Schema│                                      │ (Active when API keys │
     │ • 15 Tables + RLS      │                                      │  are not configured)  │
     │ • Supabase Auth        │                                      │ • In-Memory/Storage DB│
     │ • Private Storage      │                                      │ • Honest Status Labels│
     │ • Edge Functions       │                                      │ • Role Switcher       │
     └────────────────────────┘                                      └───────────────────────┘
```

---

## 🎨 UI/UX Design System (The 80/20 Rule)

AgriSurvey uses a professional, government-grade agricultural technology visual identity:
* **80% Surfaces**: Clean whites and off-whites (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`).
* **20% Accents**: Agricultural greenish-blue gradient (`linear-gradient(135deg, #15803D 0%, #0F766E 55%, #0891B2 100%)`), deep teal (`#0F766E`), accent cyan (`#0891B2`), and soft mint highlights (`#ECFDF5`).
* **Typography**: Inter sans-serif with accessible contrast ratios.
* **Geospatial & Photogrammetry**: Integrated Leaflet interactive maps with parcel boundaries.

---

## 🌾 End-to-End Workflow

```
1. Farmer Registration (4-Step Wizard: Personal -> Identity/Aadhaar-safe -> Land Details -> 7/12 Upload)
   ↓
2. PENDING_TAHSILDAR_REVIEW (Application assigned to responsible Taluk Tahsildar)
   ↓
3. Tahsildar Review (Approve / Reject with required justification / Request Clarifications)
   ↓
4. APPROVED: Farmer Uploads 5–6 Ground Photographs (Boundary stones, crop rows, irrigation)
   ↓
5. Field Drone Inspection Assigned to Certified Field Worker
   ↓
6. Drone Photogrammetry Mission Executed (RTK Nadir Orthomosaics & Obliques Uploaded)
   ↓
7. Image Comparison Workspace (Tahsildar compares ground photos vs drone imagery side-by-side)
   ↓
8. Crop Verification (Declared vs observed crops, seasonality, irrigation, AI vision analysis)
   ↓
9. Final Verification Report (Downloadable official PDF with digital seal & legal disclaimers)
   ↓
10. Event-Driven SMS & In-App Notifications dispatched at every milestone
```

---

## 🗄️ Database Architecture (PostgreSQL Schema)

The database schema is defined across 3 SQL migrations in `supabase/migrations/`:

| # | Table Name | Purpose |
|---|------------|---------|
| 1 | `profiles` | User accounts, roles (`farmer`, `tahsildar`, `field_worker`, `admin`), account status |
| 2 | `farmer_profiles` | Address, village, taluk, district, masked identity document references (Aadhaar-safe) |
| 3 | `properties` | Survey numbers, Gat numbers, 7/12 extract references, acreage, land types, GPS coordinates |
| 4 | `registration_applications` | Application references (`AGRI-APP-2026-XXXXXX`), lifecycle statuses, review decisions |
| 5 | `land_documents` | Uploaded 7/12 revenue documents stored in private Supabase Storage buckets |
| 6 | `farmer_land_images` | 5–6 ground photographs captured from designated viewpoints with GPS metadata |
| 7 | `field_inspections` | Inspection assignments, scheduled dates, flight notes, worker tracking |
| 8 | `drone_imagery` | High-resolution RTK orthomosaics, mission identifiers, telemetry tags |
| 9 | `image_comparisons` | Side-by-side correlation findings, similarity scores, Tahsildar review notes |
| 10 | `comparison_images` | Normalized relationships between compared ground and aerial imagery |
| 11 | `crop_verifications` | Declared crop vs observed crop, cultivation season, irrigation method, AI predictions |
| 12 | `verification_reports` | Final verification decisions (`VERIFIED`, `REJECTED`), discrepancies, evidence trails |
| 13 | `notifications` | In-app notifications with read/unread tracking |
| 14 | `notification_jobs` | SMS delivery tracking with provider references, attempts, and truthful fallback flags |
| 15 | `audit_logs` | Immutable audit trail capturing actors, previous states, and new states |
| 16 | `staff_regions` | Geographic jurisdiction assignments (District/Taluk) enforcing regional data access |

---

## ⚡ Supabase Edge Functions

Implemented in `supabase/functions/`:
1. `create-registration`: Idempotent application creation and automated jurisdiction routing.
2. `review-registration`: Role-guarded approval, rejection, and notification dispatch.
3. `assign-inspection`: Dispatching drone inspection missions to certified field workers.
4. `submit-inspection`: Submitting aerial evidence and transitioning status.
5. `finalize-verification`: Compiling evidence into signed verification records.
6. `process-notification`: Reliable SMS dispatch queue with fallback handling.
7. `generate-report`: Compiling certified verification payloads with statutory notices.

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v18+ (tested on v25.1.0)
* **npm** v9+

### 2. Installation
```bash
# Clone or navigate to the repository
cd PuneAgriMain

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
# Frontend Safe Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Server-Side / Edge Function Secrets (Optional)
SMS_PROVIDER_API_KEY=
SMS_PROVIDER_SENDER_ID=AGRISURV
SMS_PROVIDER_BASE_URL=https://api.sms-gateway.in/v2

CROP_ANALYSIS_API_KEY=
CROP_ANALYSIS_API_URL=https://api.agri-vision-ai.org/v1/crop-detect
```

> **Note on Development Simulation**: When `VITE_SUPABASE_URL` is empty, AgriSurvey automatically launches in **Development Simulation Mode**. It initializes an active, persistent in-browser database engine populated with realistic Pune agricultural records (Haveli & Baramati Taluks). All workflows—including role switching, document registration, image uploads, drone inspections, side-by-side comparisons, crop verifications, and PDF generation—work immediately without requiring cloud setup.

### 4. Running Locally
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Automated Functional Acceptance Tests

AgriSurvey includes an automated test runner validating all 12 functional requirements specified in Section 26:

```bash
npx tsx scripts/run-acceptance-tests.ts
```

### Test Suite Coverage:
* **Test 1 — Farmer Registration**: Multi-step submission, survey numbers, 7/12 extract reference generation.
* **Test 2 — Tahsildar Notification**: Automated jurisdiction queue matching and in-app alert.
* **Test 3 — Registration Approval**: Status transition to `APPROVED` and SMS queue dispatch.
* **Test 4 — Registration Rejection**: Mandatory rejection justification and audit trail.
* **Test 5 — Land Image Upload**: Validation enforcing 5–6 ground photographs from distinct viewpoints.
* **Test 6 — Field Inspection**: Drone mission assignment, scheduling, and aerial orthomosaic upload.
* **Test 7 — Image Comparison**: Dual-pane workspace inspection and `CONSISTENT` determination.
* **Test 8 — Crop Verification**: Observed vs declared sugarcane validation and irrigation check.
* **Test 9 — Final Report Compilation**: Signed report generation and PDF export capability.
* **Test 10 — Admin Analytics**: Recharts dynamic queries, acreage calculation, and status counts.
* **Test 11 — Authorization Matrix**: Role-based access control preventing privilege escalation.
* **Test 12 — External Failure Handling**: Truthful fallbacks when SMS or AI keys are unconfigured.

---

## 👤 Quick Evaluation Personas

For streamlined testing in development mode, use the **Persona Switcher** in the top navigation bar or log in with these accounts:

| Persona | Role | Assigned Jurisdiction | Credentials |
|---------|------|------------------------|-------------|
| **Ramesh Balasaheb Patil** | Farmer / Landholder | Wagholi, Haveli Taluk | `farmer.ramesh@agrisurvey.gov.in` |
| **Anand Shrikant Kulkarni** | Tahsildar / Revenue Officer | Haveli & Baramati Taluks | `tahsildar.haveli@agrisurvey.gov.in` |
| **Prakash Mahadev Jadhav** | Field Worker (Drone Pilot) | Haveli Taluk Missions | `drone.prakash@agrisurvey.gov.in` |
| **Dr. Meenakshi Sundaram, IAS** | System Administrator | State Revenue Division | `admin.director@agrisurvey.gov.in` |

---

## 🔒 Security & Privacy Practices

* **Aadhaar Privacy**: In compliance with national data privacy standards, full Aadhaar numbers are never collected, stored, or exposed. Alternative authorized document references (EPIC Voter ID, PAN, Kisan Credit Passbook) are utilized.
* **Row Level Security (RLS)**: Enforced across all tables in `supabase/migrations/20261014000002_rls_and_storage.sql`.
* **Private Storage Buckets**: Uploaded 7/12 land records, farmer ground photographs, and drone imagery reside in private buckets requiring signed token authorization.
* **Statutory Administrative Disclaimer**: Every generated verification report and PDF includes a mandatory notice clarifying that technical agricultural field inspections do not substitute for judicial title registration or conveyancing deeds.

---

## 📦 Production Deployment

### 1. Connecting to Live Supabase
1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Execute the migrations in sequence via the Supabase SQL Editor:
   - `supabase/migrations/20261014000001_initial_schema.sql`
   - `supabase/migrations/20261014000002_rls_and_storage.sql`
   - `supabase/migrations/20261014000003_seed_data.sql`
3. In Project Settings -> API, retrieve your Project URL and Anon Public Key.
4. Update your `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Deploy Edge Functions using the Supabase CLI:
   ```bash
   supabase functions deploy create-registration
   supabase functions deploy review-registration
   supabase functions deploy assign-inspection
   supabase functions deploy submit-inspection
   supabase functions deploy finalize-verification
   supabase functions deploy process-notification
   supabase functions deploy generate-report
   ```

### 2. Building for Production
```bash
npm run build
```
The optimized bundle is output to the `dist/` directory, ready for hosting on Vercel, Netlify, AWS CloudFront, or Cloudflare Pages.
