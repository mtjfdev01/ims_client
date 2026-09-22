import React from 'react';
import { Link } from 'react-router-dom';
import { hasPermission } from '../services/session';

const PermissionLink = ({ module, to, children }) => {
  if (!to || !hasPermission(module)) {
    return <>{children}</>;
  }
  return <Link to={to}>{children}</Link>;
};

export default PermissionLink;
