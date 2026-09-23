import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import PatientForm from './pages/PatientForm';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import DoctorForm from './pages/DoctorForm';
import Appointments from './pages/Appointments';
import AppointmentForm from './pages/AppointmentForm';
import Consultations from './pages/Consultations';
import ConsultationForm from './pages/ConsultationForm';
import ConsultationDetail from './pages/ConsultationDetail';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/new" element={<PatientForm />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/patients/:id/edit" element={<PatientForm />} />

        <Route path="/services" element={<Services />} />

        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/new" element={<DoctorForm />} />
        <Route path="/doctors/:id/edit" element={<DoctorForm />} />

        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/new" element={<AppointmentForm />} />

        <Route path="/consultations" element={<Consultations />} />
        <Route path="/consultations/new" element={<ConsultationForm />} />
        <Route path="/consultations/:id" element={<ConsultationDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}