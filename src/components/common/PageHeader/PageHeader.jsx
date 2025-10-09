// src/components/common/PageHeader/PageHeader.jsx
import React from 'react';
import './PageHeader.scss';

const PageHeader = ({ title, subtitle }) => (
  <div className="page-header">
    <h1 className="page-header__title">{title}</h1>
    {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
  </div>
);

export default PageHeader;
