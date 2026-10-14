import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { FarmerRegistrationPage } from '@/pages/farmer/FarmerRegistrationPage';
import { FarmerDashboardPage } from '@/pages/farmer/FarmerDashboardPage';
import { LandImageUploadPage } from '@/pages/farmer/LandImageUploadPage';
import { TahsildarDashboardPage } from '@/pages/tahsildar/TahsildarDashboardPage';
import { ImageComparisonWorkspacePage } from '@/pages/tahsildar/ImageComparisonWorkspacePage';
import { CropVerificationPage } from '@/pages/tahsildar/CropVerificationPage';
import { FinalVerificationReportsPage } from '@/pages/tahsildar/FinalVerificationReportsPage';
import { FieldWorkerDashboardPage } from '@/pages/field-worker/FieldWorkerDashboardPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="/auth/register" element={<AuthPage />} />

        {/* Farmer Portal */}
        <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
        <Route path="/farmer/register" element={<FarmerRegistrationPage />} />
        <Route path="/farmer/upload-images" element={<LandImageUploadPage />} />
        <Route path="/farmer/properties" element={<FarmerDashboardPage />} />
        <Route path="/farmer/inspection-status" element={<FarmerDashboardPage />} />
        <Route path="/farmer/reports" element={<FarmerDashboardPage />} />
        <Route path="/farmer/notifications" element={<FarmerDashboardPage />} />

        {/* Tahsildar Portal */}
        <Route path="/tahsildar/dashboard" element={<TahsildarDashboardPage />} />
        <Route path="/tahsildar/registrations" element={<TahsildarDashboardPage />} />
        <Route path="/tahsildar/assign-inspections" element={<TahsildarDashboardPage />} />
        <Route path="/tahsildar/image-comparison" element={<ImageComparisonWorkspacePage />} />
        <Route path="/tahsildar/crop-verification" element={<CropVerificationPage />} />
        <Route path="/tahsildar/reports" element={<FinalVerificationReportsPage />} />
        <Route path="/tahsildar/audit-logs" element={<TahsildarDashboardPage />} />

        {/* Field Worker Portal */}
        <Route path="/field-worker/dashboard" element={<FieldWorkerDashboardPage />} />
        <Route path="/field-worker/inspections" element={<FieldWorkerDashboardPage />} />
        <Route path="/field-worker/drone-upload" element={<FieldWorkerDashboardPage />} />
        <Route path="/field-worker/completed" element={<FieldWorkerDashboardPage />} />

        {/* Admin Portal */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminDashboardPage />} />
        <Route path="/admin/regions" element={<AdminDashboardPage />} />
        <Route path="/admin/analytics" element={<AdminDashboardPage />} />
        <Route path="/admin/audit-logs" element={<AdminDashboardPage />} />
        <Route path="/admin/settings" element={<AdminDashboardPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
