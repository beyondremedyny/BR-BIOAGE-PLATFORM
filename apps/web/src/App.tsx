import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PatientIntakePage from './pages/patient/IntakePage';
import PatientUploadPage from './pages/patient/UploadPage';
import PatientDashboardPage from './pages/patient/DashboardPage';
import PatientReportPage from './pages/patient/ReportPage';
import ClinicianDashboardPage from './pages/clinician/DashboardPage';
import ClinicianPatientsPage from './pages/clinician/PatientsPage';
import ClinicianPatientPage from './pages/clinician/PatientPage';
import ClinicianLabsPage from './pages/clinician/LabsPage';
import ClinicianReportPage from './pages/clinician/ReportPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/patient/*"
        element={
          <>
            <SignedIn>
              <Routes>
                <Route path="intake" element={<PatientIntakePage />} />
                <Route path="intake/:sessionId" element={<PatientIntakePage />} />
                <Route path="upload" element={<PatientUploadPage />} />
                <Route path="dashboard" element={<PatientDashboardPage />} />
                <Route path="report/:reportId" element={<PatientReportPage />} />
              </Routes>
            </SignedIn>
            <SignedOut>
              <SignIn routing="path" path="/patient" />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/clinician/*"
        element={
          <>
            <SignedIn>
              <Routes>
                <Route path="dashboard" element={<ClinicianDashboardPage />} />
                <Route path="patients" element={<ClinicianPatientsPage />} />
                <Route path="patient/:patientId" element={<ClinicianPatientPage />} />
                <Route path="patient/:patientId/intake" element={<ClinicianPatientPage tab="intake" />} />
                <Route path="patient/:patientId/labs" element={<ClinicianLabsPage />} />
                <Route path="patient/:patientId/report" element={<ClinicianReportPage />} />
                <Route path="patient/:patientId/report/:reportId" element={<ClinicianReportPage />} />
              </Routes>
            </SignedIn>
            <SignedOut>
              <SignIn routing="path" path="/clinician" />
            </SignedOut>
          </>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
