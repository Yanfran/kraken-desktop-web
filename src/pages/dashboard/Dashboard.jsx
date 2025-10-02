import React from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home/Home';

const Dashboard = () => {
  const navigate = useNavigate();
  return <Home onNavigateToShipments={() => navigate('/my-guides')} />;
};

export default Dashboard;