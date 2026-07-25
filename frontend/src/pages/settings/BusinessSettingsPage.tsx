import React from 'react';
import { ManageAccounts } from '@mui/icons-material';
import ModuleStub from '../../components/common/ModuleStub';

const BusinessSettingsPage: React.FC = () => (
  <ModuleStub
    title="Business Profile"
    description="Manage business details, GSTIN, PAN, logo, and financial year settings."
    icon={<ManageAccounts />}
    color="#5A5D72"
  />
);

export default BusinessSettingsPage;
