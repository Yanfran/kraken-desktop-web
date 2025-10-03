
import React from 'react';
import PreAlertForm from '../../../components/pre-alert/PreAlertForm';
import './PreAlertCreate.styles.scss';

// This component will serve as the page for creating a new pre-alert.
// It renders the reusable form in 'create' mode.

const PreAlertCreate = () => {
  return (
    <div>
      {/* We can add a page title or other layout elements here */}
      <PreAlertForm isEditMode={false} />
    </div>
  );
};

export default PreAlertCreate;
