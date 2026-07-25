import React from 'react';
import { ArrowDownward } from '@mui/icons-material';
import ModuleStub from '../../components/common/ModuleStub';

const CreditNotesPage: React.FC = () => (
  <ModuleStub
    title="Credit Notes"
    description="Issue credit notes for sales returns and price adjustments."
    icon={<ArrowDownward />}
    color="#7B1FA2"
  />
);

export default CreditNotesPage;
