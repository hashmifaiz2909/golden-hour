import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RiderProvider } from './context/RiderContext';
import { ResponderProvider } from './context/ResponderContext';
import { GoldenHoursNavbar } from './components/common/GoldenHoursNavbar';
import { GoldenHoursFooter } from './components/common/GoldenHoursFooter';
import { SupportButton } from './components/common/SupportButton';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LandingPage } from './pages/landing/LandingPage';
import { FeaturesPage } from './pages/features/FeaturesPage';
import { PricingPage } from './pages/pricing/PricingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { QrPage } from './pages/dashboard/QrPage';
import { AdminPortalPage } from './pages/admin/AdminPortalPage';
import { PublicQrPage } from './pages/public-qr/PublicQrPage';
import { DemoSuitePage } from './pages/demo/DemoSuitePage';
import { MobileAppPage } from './pages/mobile/MobileAppPage';
import { ResponderDashboard } from './pages/responder/ResponderDashboard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RiderProvider>
          <ResponderProvider>
            <div className="flex flex-col min-h-screen bg-[#F1F4EE] text-[#1A2421]">
              <GoldenHoursNavbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<LandingPage />} />
                  <Route path="/overview" element={<LandingPage />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/contact" element={<Navigate to="/" replace />} />

                  {/* Auth Pages */}
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/signup" element={<SignupPage />} />
                  <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                  {/* Customer Dashboard Suite (Protected - Must Sign In to Access) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/qr"
                    element={
                      <ProtectedRoute>
                        <QrPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Portal */}
                  <Route path="/admin" element={<AdminPortalPage />} />

                  {/* Public Emergency Scan Page */}
                  <Route path="/id/:tagId" element={<PublicQrPage />} />
                  <Route path="/qr/:tagId" element={<PublicQrPage />} />
                  <Route path="/scan/:tagId" element={<PublicQrPage />} />

                  {/* Emergency Response Suite */}
                  <Route path="/demo" element={<DemoSuitePage />} />
                  <Route path="/mobile" element={<MobileAppPage />} />
                  <Route path="/responder" element={<ResponderDashboard />} />
                  <Route path="/responder/dashboard" element={<ResponderDashboard />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <GoldenHoursFooter />
              <SupportButton />
            </div>
          </ResponderProvider>
        </RiderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
