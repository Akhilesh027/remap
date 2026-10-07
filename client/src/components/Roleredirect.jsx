// components/RoleRedirect.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleRedirect = ({ user }) => {
  if (!user || !user.role) return <Navigate to="/login" />;

  const role = user.role;

  if (role === 'Management') return <Navigate to="/Management-dashboard" />;
  else if (role === 'Admin') return <Navigate to="/Admin-dashboard" />;
  else if (role === 'Executive') return <Navigate to="/Executive-dashboard" />;
  else if (role === 'Director') return <Navigate to="/Director-dashboard" />;
  else if (role === 'Driver') return <Navigate to="/Driver-dashboard" />;
  else if (role === 'Receptionist') return <Navigate to="/Receptionist-dashboard" />;
  else if (role === 'Telecaller') return <Navigate to="/Telecaller-dashboard" />;
  else if (role === 'HR') return <Navigate to="/Hr-dashboard" />;
  else return <Navigate to="/user-dashboard" />; // default fallback
};

export default RoleRedirect;
