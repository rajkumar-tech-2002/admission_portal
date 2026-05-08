import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnquiryForm from './pages/Public/EnquiryForm';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import ArchivedList from './pages/Admin/ArchivedList';
import ChangePassword from './pages/Admin/ChangePassword';
import MasterManagementPage from './pages/Admin/Master/MasterManagementPage';
import AdminLayout from './components/layout/AdminLayout';
import ToastProvider from './components/layout/ToastProvider';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<EnquiryForm />} />
        <Route path="/admin/login" element={<Login />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="archived" element={<ArchivedList />} />
          <Route path="change-password" element={<ChangePassword />} />
          
          {/* Master Module Routes */}
          <Route path="master/departments" element={
            <MasterManagementPage 
              title="Department Master" 
              tableType="departments"
              columns={[{key: 'department', label: 'Department'}, {key: 'type', label: 'Type'}]}
              fields={[
                {name: 'department', label: 'Department Name', required: true},
                {name: 'type', label: 'Type', type: 'select', options: ['UG', 'PG', 'DIPLOMA'], required: true}
              ]}
            />
          } />
          
          <Route path="master/studies" element={
            <MasterManagementPage 
              title="Study Master" 
              tableType="studies"
              columns={[{key: 'study', label: 'Study'}]}
              fields={[{name: 'study', label: 'Study Level', required: true}]}
            />
          } />
          
          <Route path="master/communities" element={
            <MasterManagementPage 
              title="Community Master" 
              tableType="communities"
              columns={[{key: 'community', label: 'Community'}]}
              fields={[{name: 'community', label: 'Community Name', required: true}]}
            />
          } />
          
          <Route path="master/admission-types" element={
            <MasterManagementPage 
              title="Admission Type Master" 
              tableType="admission-types"
              columns={[{key: 'admission_type', label: 'Admission Type'}]}
              fields={[{name: 'admission_type', label: 'Admission Type', required: true}]}
            />
          } />
          
          <Route path="master/reference-types" element={
            <MasterManagementPage 
              title="Reference Type Master" 
              tableType="reference-types"
              columns={[{key: 'reference_type', label: 'Reference Type'}, {key: 'way', label: 'Way'}]}
              fields={[
                {name: 'reference_type', label: 'Reference Type', required: true},
                {name: 'way', label: 'Way', type: 'select', options: ['Normal', 'Direct'], required: true}
              ]}
            />
          } />
          
          <Route path="master/admission-statuses" element={
            <MasterManagementPage 
              title="Admission Status Master" 
              tableType="admission-statuses"
              columns={[{key: 'admission_status', label: 'Status'}]}
              fields={[{name: 'admission_status', label: 'Status Name', required: true}]}
            />
          } />
          
          <Route path="master/valid-date" element={
            <MasterManagementPage 
              title="Valid Date Master" 
              tableType="valid-date"
              columns={[{key: 'date_count', label: 'Days Limit'}, {key: 'archive_status', label: 'Archive Targets'}]}
              fields={[
                {name: 'date_count', label: 'Days to Archive', type: 'number', required: true},
                {name: 'archive_status', label: 'Statuses to Archive', type: 'checkbox-group', optionsKey: 'admissionStatuses', required: true}
              ]}
            />
          } />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
