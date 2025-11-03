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
  casilleroName,
  country,
  state,
  city,
  line1,
  line2,
  zip,
  name,  
  phone,
  isChina = false
}) => {
  const Row = ({ label, value }) => (
    <div className="address-block__row">
      <span className="address-block__label">{label}</span>
      <span className="address-block__value">{value}</span>
    </div>
  );

  // Orden para USA
  if (!isChina) {
    return (
      <div className="address-block__wrapper">
        {casilleroName && <Row label="Tu Casillero Kraken:" value={casilleroName} />}
        <Row label="Full Name:" value={name} />
        <Row label="Address Line 1:" value={line1} />      
        <Row label="Address Line 2:" value={line2} />
        <Row label="City:" value={city} />
        <Row label="State:" value={state} />
        <Row label="ZIP:" value={zip} />
        <Row label="Country:" value={country} />
        <Row label="Phone Number:" value={phone} />
      </div>
    );
  }

  // Orden para China
  return (
    <div className="address-block__wrapper">
      {casilleroName && <Row label="Tu Casillero Kraken:" value={casilleroName} />}
      <Row label="Country:" value={country} />
      <Row label="Province:" value={state} />
      <Row label="City:" value={city} />
      <Row label="Detailed Address:" value={line1} />
      <Row label="Postal Code:" value={zip} />
      <Row label="Full Name:" value={name} />
      {phone && <Row label="Phone:" value={phone} />}
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
    const userName = `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim();
    const userCode = user?.codCliente || "KVXXXXXXXX";
    const casilleroName = usaAddress.nombre || usaAddress.addressLine1;
    
    const address = `🇺🇸 DIRECCIÓN USA
Tu Casillero Kraken: ${casilleroName}
Full Name: ${userName}
Address Line 1: ${usaAddress.addressLine1}
Address Line 2: (${userCode})
City: ${usaAddress.city}
State: ${usaAddress.stateProvince}
ZIP: ${usaAddress.zip}
Country: ${usaAddress.country}
Phone Number: ${usaAddress.phoneNumber}`;
    
    await copyToClipboard(address);
  };

  const copyChinaAddress = async () => {
    if (!chinaAddress) return;
    const userName = `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim();
    const userCode = user?.codCliente || "KVXXXXXXXX";
    const casilleroName = chinaAddress.nombre || chinaAddress.addressLine1;
    
    const address = `🇨🇳 DIRECCIÓN CHINA
Tu Casillero Kraken: ${casilleroName}
Country: ${chinaAddress.country}
Province: ${chinaAddress.stateProvince}
City: ${chinaAddress.city}
Detailed Address: ${chinaAddress.addressLine1} (${userCode})
Postal Code: ${chinaAddress.zip}
Full Name: ${userName}`;
    
    await copyToClipboard(address);
  };

  const shareAddresses = async () => {
    if (!usaAddress || !chinaAddress) return;
    
    const userName = `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim();
    const userCode = user?.codCliente || "KVXXXXXXXX";
    const usaCasillero = usaAddress.nombre || usaAddress.addressLine1;
    const chinaCasillero = chinaAddress.nombre || chinaAddress.addressLine1;

    const text = `📦 DIRECCIONES PARA ENVIAR COMPRAS

🇺🇸 USA
Tu Casillero Kraken: ${usaCasillero}
Full Name: ${userName}
Address Line 1: ${usaAddress.addressLine1}
Address Line 2: (${userCode})
City: ${usaAddress.city}
State: ${usaAddress.stateProvince}
ZIP: ${usaAddress.zip}
Country: ${usaAddress.country}
Phone Number: ${usaAddress.phoneNumber}

🇨🇳 CHINA
Tu Casillero Kraken: ${chinaCasillero}
Country: ${chinaAddress.country}
Province: ${chinaAddress.stateProvince}
City: ${chinaAddress.city}
Detailed Address: ${chinaAddress.addressLine1} (${userCode})
Postal Code: ${chinaAddress.zip}
Full Name: ${userName}`;

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

        {/* Addresses Grid */}
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
              casilleroName={usaAddress.nombre || usaAddress.addressLine1}
              name={`${user.name ?? ""} ${user.lastName ?? ""}`.trim()}            
              line1={usaAddress.addressLine1}
              line2={`(${user.codCliente || "KVXXXXXXXX"})`}
              city={usaAddress.city}
              state={usaAddress.stateProvince}
              zip={usaAddress.zip}
              country={usaAddress.country}
              phone={usaAddress.phoneNumber}
              isChina={false}
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
              casilleroName={chinaAddress.nombre || chinaAddress.addressLine1}
              country={chinaAddress.country}
              state={chinaAddress.stateProvince}
              city={chinaAddress.city}
              line1={`${chinaAddress.addressLine1} (${user.codCliente || "KVXXXXXXXX"})`}
              zip={chinaAddress.zip}
              name={`${user.name ?? ""} ${user.lastName ?? ""}`.trim()}
              // phone={chinaAddress.phoneNumber}
              isChina={true}
            />
          </div>
        </div>

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