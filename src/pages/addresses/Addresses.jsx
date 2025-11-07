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
        {name && <Row label="Full Name:" value={name} />}
        {line1 && <Row label="Address Line 1:" value={line1} />}
        {line2 && <Row label="Address Line 2:" value={line2} />}
        {city && <Row label="City:" value={city} />}
        {state && <Row label="State:" value={state} />}
        {zip && <Row label="ZIP:" value={zip} />}
        {country && <Row label="Country:" value={country} />}
        {phone && <Row label="Phone Number:" value={phone} />}
      </div>
    );
  }

  // Orden para China
  return (
    <div className="address-block__wrapper">
      {casilleroName && <Row label="Tu Casillero Kraken:" value={casilleroName} />}
      {country && <Row label="Country:" value={country} />}
      {state && <Row label="Province:" value={state} />}
      {city && <Row label="City:" value={city} />}
      {line1 && <Row label="Detailed Address:" value={line1} />}
      {zip && <Row label="Postal Code:" value={zip} />}
      {name && <Row label="Full Name:" value={name} />}
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

    let address = "🇺🇸 DIRECCIÓN USA\n";
    
    if (casilleroName) address += `Tu Casillero Kraken: ${casilleroName}\n`;
    if (userName) address += `Full Name: ${userName}\n`;
    if (usaAddress.addressLine1) address += `Address Line 1: ${usaAddress.addressLine1}\n`;
    if (userCode) address += `Address Line 2: (${userCode})\n`;
    if (usaAddress.city) address += `City: ${usaAddress.city}\n`;
    if (usaAddress.stateProvince) address += `State: ${usaAddress.stateProvince}\n`;
    if (usaAddress.zip) address += `ZIP: ${usaAddress.zip}\n`;
    if (usaAddress.country) address += `Country: ${usaAddress.country}\n`;
    if (usaAddress.phoneNumber) address += `Phone Number: ${usaAddress.phoneNumber}`;
    
    await copyToClipboard(address);
  };

  const copyChinaAddress = async () => {
    if (!chinaAddress) return;
    
    const userName = `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim();
    const userCode = user?.codCliente || "KVXXXXXXXX";
    const casilleroName = chinaAddress.nombre || chinaAddress.addressLine1;

    let address = "🇨🇳 DIRECCIÓN CHINA\n";
    
    if (casilleroName) address += `Tu Casillero Kraken: ${casilleroName}\n`;
    if (chinaAddress.country) address += `Country: ${chinaAddress.country}\n`;
    if (chinaAddress.stateProvince) address += `Province: ${chinaAddress.stateProvince}\n`;
    if (chinaAddress.city) address += `City: ${chinaAddress.city}\n`;
    if (chinaAddress.addressLine1) address += `Detailed Address: ${chinaAddress.addressLine1} (${userCode})\n`;
    if (chinaAddress.zip) address += `Postal Code: ${chinaAddress.zip}\n`;
    if (userName) address += `Full Name: ${userName}\n`;
    if (chinaAddress.phoneNumber) address += `Phone: ${chinaAddress.phoneNumber}`;
    
    await copyToClipboard(address);
  };

  const shareAddresses = async () => {
    const userName = `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim();
    const userCode = user?.codCliente || "KVXXXXXXXX";
    
    let text = "📦 DIRECCIONES PARA ENVIAR COMPRAS\n\n";

    if (usaAddress) {
      const usaCasillero = usaAddress.nombre || usaAddress.addressLine1;
      text += "🇺🇸 USA\n";
      if (usaCasillero) text += `Tu Casillero Kraken: ${usaCasillero}\n`;
      if (userName) text += `Full Name: ${userName}\n`;
      if (usaAddress.addressLine1) text += `Address Line 1: ${usaAddress.addressLine1}\n`;
      if (userCode) text += `Address Line 2: (${userCode})\n`;
      if (usaAddress.city) text += `City: ${usaAddress.city}\n`;
      if (usaAddress.stateProvince) text += `State: ${usaAddress.stateProvince}\n`;
      if (usaAddress.zip) text += `ZIP: ${usaAddress.zip}\n`;
      if (usaAddress.country) text += `Country: ${usaAddress.country}\n`;
      if (usaAddress.phoneNumber) text += `Phone Number: ${usaAddress.phoneNumber}\n`;
      text += "\n";
    }

    if (chinaAddress) {
      const chinaCasillero = chinaAddress.nombre || chinaAddress.addressLine1;
      text += "🇨🇳 CHINA\n";
      if (chinaCasillero) text += `Tu Casillero Kraken: ${chinaCasillero}\n`;
      if (chinaAddress.country) text += `Country: ${chinaAddress.country}\n`;
      if (chinaAddress.stateProvince) text += `Province: ${chinaAddress.stateProvince}\n`;
      if (chinaAddress.city) text += `City: ${chinaAddress.city}\n`;
      if (chinaAddress.addressLine1) text += `Detailed Address: ${chinaAddress.addressLine1} (${userCode})\n`;
      if (chinaAddress.zip) text += `Postal Code: ${chinaAddress.zip}\n`;
      if (userName) text += `Full Name: ${userName}\n`;
      if (chinaAddress.phoneNumber) text += `Phone: ${chinaAddress.phoneNumber}`;
    }

    if (usaAddress || chinaAddress) {
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

  // Cambio aquí: mostrar si hay al menos una dirección
  if (!usaAddress && !chinaAddress) {
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
            <p className="addresses-page__label">Nº de Casillero</p>
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
          {/* USA Address - Solo mostrar si existe */}
          {usaAddress && (
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
          )}

          {/* China Address - Solo mostrar si existe */}
          {chinaAddress && (
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
                phone={chinaAddress.phoneNumber}
                isChina={true}
              />
            </div>
          )}
        </div>

        {/* Help */}
        <button className="addresses-page__help-row">
          <HelpCircle size={18} />
          <p className="addresses-page__help-text">
            ¿Tienes dudas? Así debes escribir la dirección
          </p>
        </button>

        {/* Share - Solo mostrar si hay al menos una dirección */}
        {(usaAddress || chinaAddress) && (
          <div className="addresses-page__share-section">
            <p className="addresses-page__share-title">COMPARTIR</p>
            <button onClick={shareAddresses} className="addresses-page__share-button">
              <Share2 size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}