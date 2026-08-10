import { Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/LoginPage";

import ProfilePage from "@/pages/profile/ProfilePage";

import PublicLayout from "@/layouts/PublicLayout";
import PrivateLayout from "@/layouts/PrivateLayout";

import { ROUTES } from "@/constants/routes";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import RegisterPage from "@/pages/RegisterPage";
import useAuthStore from "@/features/auth/authStore";
import HomePage from "@/pages/home/HomePage";
import SavedJobsPage from "@/pages/saveJob/SavedJobsPage";
import AnalysisPage from "@/pages/analysis/AnalysisPage";

function AppRoutes() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.DEF}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
      </Route>

      <Route element={<PrivateLayout />}>
        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SAVED_JOBS}
          element={
            <ProtectedRoute>
              <SavedJobsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ANALYSIS}
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

      </Route>
    </Routes>
  );
}

export default AppRoutes;
