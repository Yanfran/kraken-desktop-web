
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPreAlertaById } from '../../services/preAlertService';
import PreAlertForm from '../../../components/pre-alert/PreAlertForm';
import Loading from '../../components/common/Loading/Loading';

// This component will serve as the page for editing an existing pre-alert.
// It fetches the pre-alert data and renders the reusable form in 'edit' mode.

const PreAlertEdit = () => {
  const { id } = useParams();

  const { data: preAlertData, isLoading, isError, error } = useQuery({
    queryKey: ['preAlerta', id],
    queryFn: () => getPreAlertaById(id),
    enabled: !!id, // Only run the query if the id exists
    select: (response) => response.data, // Extract data from the api response
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <div>Error al cargar la pre-alerta: {error.message}</div>;
  }

  return (
    <div>
      <PreAlertForm isEditMode={true} initialData={preAlertData} />
    </div>
  );
};

export default PreAlertEdit;
