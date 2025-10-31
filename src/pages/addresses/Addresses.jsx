// src/pages/addresses/Addresses.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { getAddresses } from '../../../src/services/address/addressService';
import { toast } from 'react-hot-toast';
import { Copy, Share2, HelpCircle, Loader } from 'lucide-react';
import './Addresses.scss';

// Flags
import veFlag from '../../../src/assets/images/venezuela.png';
import usaFlag from '../../../src/assets/images/usa.png';
import chinaFlag from '../../../src/assets/images/china.png';

// Sub-component for displaying an address block
const AddressBlock = ({ 
  country,
  state,
  city,
  line1,
  zip,
  name,  
  phone,
}) => {
  const Row = ({ label, value }) => (
    <div className="address-block__row">
      <span className="address-block__label">{label}</span>
      <span className="address-block__value">{value}</span>
    </div>
  );
  return (
    <div className="address-block__wrapper">
      <Row label="Country:" value={country} />
      <Row label="State Province:" value={state} />
      <Row label="City:" value={city} />
      <Row label="Address Line 1:" value={line1} />      
      <Row label="ZIP:" value={zip} />
      <Row label="Full Name:" value={name} />
      <Row label="Phone Number:" value={phone} />
    </div>
  );
};

export default function AddressesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await getAddresses();

      if (response.success) {
        setAddresses(response.data);
      } else {
        toast.error(response.message || 'Error al cargar direcciones.');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Error de conexión al cargar direcciones.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('✅ Copiado al portapapeles');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('❌ Error al copiar');
    }
  };

  const usaAddress = addresses?.[0];
  const chinaAddress = addresses?.[1];

  const copyUSAAddress = async () => {
  if (!usaAddress) return;
  const userName = `${user?.name ?? ""} + ${user?.lastName ?? ""}`.trim();
  const address = `🇺🇸 DIRECCIÓN USA
Country: ${usaAddress.country}
State Province: ${usaAddress.stateProvince}
City: ${usaAddress.city}
Address Line 1: ${usaAddress.addressLine1} (${user?.codCliente || "KVXXXXXXXX"})
ZIP: ${usaAddress.zip}
Full Name: ${userName}
Phone Number: ${usaAddress.phoneNumber}`;
  await copyToClipboard(address);
};

  const copyChinaAddress = async () => {
  if (!chinaAddress) return;
  const userName = `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim();
  const address = `🇨🇳 DIRECCIÓN CHINA
Country: ${chinaAddress.country}
State Province: ${chinaAddress.stateProvince}
City: ${chinaAddress.city}
Address Line 1: ${chinaAddress.addressLine1} (${user?.codCliente || "KVXXXXXXXX"})
ZIP: ${chinaAddress.zip}
Full Name: ${userName}
Phone Number: ${chinaAddress.phoneNumber}`;
  await copyToClipboard(address);
};

  const shareAddresses = async () => {
  const userName = `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim();
  const userCode = user?.codCliente || "KVXXXXXXXX";

  const text = `📦 DIRECCIONES PARA ENVIAR COMPRAS

🇺🇸 USA
Country: ${usaAddress.country}
State Province: ${usaAddress.stateProvince}
City: ${usaAddress.city}
Address Line 1: ${usaAddress.addressLine1} (${userCode})
ZIP: ${usaAddress.zip}
Full Name: ${userName}
Phone Number: ${usaAddress.phoneNumber}

🇨🇳 CHINA
Country: ${chinaAddress.country}
State Province: ${chinaAddress.stateProvince}
City: ${chinaAddress.city}
Address Line 1: ${chinaAddress.addressLine1} (${userCode})
ZIP: ${chinaAddress.zip}
Full Name: ${userName}
Phone Number: ${chinaAddress.phoneNumber}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Mis Direcciones Kraken', text });
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error al compartir.');
    }
  } else {
    await copyToClipboard(text);
    toast.info('Direcciones copiadas al portapapeles para compartir.');
  }
};

  if (isLoading || !user) {
    return (
      <div className="addresses-page__loading">
        <Loader className="spinner" size={48} />
        <p>Cargando direcciones...</p>
      </div>
    );
  }

  if (!usaAddress || !chinaAddress) {
    return (
      <div className="addresses-page__loading">
        <p>No se encontraron direcciones.</p>
      </div>
    );
  }

  return (
    <div className="addresses-page">
      <div className="addresses-page__container">
        <img src={veFlag} alt="Venezuela Flag" className="addresses-page__main-flag" />
        <h1 className="addresses-page__title">
          Estas son las direcciones que debes usar para enviar tus compras online a Venezuela
        </h1>

        {/* User Number */}
        <div className="addresses-page__section">
          <div className="addresses-page__row">
            <p className="addresses-page__label">N° de usuario</p>
            <div className="addresses-page__badge">
              <p className="addresses-page__badge-text">
                {user.codCliente || "KVXXXXXXXX"}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(user.codCliente || "KVXXXXXXXX")}
              className="addresses-page__copy-button"
            >
              <Copy size={18} />
            </button>
          </div>
          <p className="addresses-page__note">
            Siempre debes poner tu número de usuario en la dirección de envío (shipping address).
          </p>
        </div>

        {/* ✅ NUEVA SECCIÓN DE COLUMNAS */}
      <div className="addresses-page__addresses-grid"> 
        {/* USA Address */}
        <div className="addresses-page__section">
          <div className="addresses-page__row">
            <img src={usaFlag} alt="USA Flag" className="addresses-page__flag-icon" />
            <h2 className="addresses-page__country-title">USA</h2>
            <button onClick={copyUSAAddress} className="addresses-page__copy-button">
              <Copy size={18} />
            </button>
          </div>
          <AddressBlock
            country={`${usaAddress.country}`}
            state={`${usaAddress.stateProvince}`}
            city={`${usaAddress.city}`}
            line1={`${usaAddress.addressLine1} (${user.codCliente || "KVXXXXXXXX"})`}
            zip={`${usaAddress.zip}`}
            name={`${user.name ?? ""} ${user.lastName ?? ""}`.trim()}            
            phone={`${usaAddress.phoneNumber}`}
          />
        </div>

        {/* China Address */}
        <div className="addresses-page__section">
          <div className="addresses-page__row">
            <img src={chinaFlag} alt="China Flag" className="addresses-page__flag-icon" />
            <h2 className="addresses-page__country-title">CHINA</h2>
            <button onClick={copyChinaAddress} className="addresses-page__copy-button">
              <Copy size={18} />
            </button>
          </div>
          <AddressBlock
            country={`${chinaAddress.country}`}
            state={`${chinaAddress.stateProvince}`}
            city={`${chinaAddress.city}`}
            line1={`${chinaAddress.addressLine1} (${user.codCliente || "KVXXXXXXXX"})`}
            zip={`${chinaAddress.zip}`}
            name={`${user.name ?? ""} ${user.lastName ?? ""}`.trim()}            
            phone={`${chinaAddress.phoneNumber}`}
          />
        </div>
      </div>
      {/* FIN NUEVA SECCIÓN DE COLUMNAS */}

        {/* Help */}
        <button className="addresses-page__help-row">
          <HelpCircle size={18} />
          <p className="addresses-page__help-text">
            ¿Tienes dudas? Así debes escribir la dirección
          </p>
        </button>

        {/* Share */}
        <div className="addresses-page__share-section">
          <p className="addresses-page__share-title">COMPARTIR</p>
          <button onClick={shareAddresses} className="addresses-page__share-button">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
