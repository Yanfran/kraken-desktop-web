// src/hooks/useAddresses.js
import { useQuery } from '@tanstack/react-query';
import { getUserAddresses } from '@services/address/addressService';

export const useAddresses = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: async () => {
      const response = await getUserAddresses();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Error al cargar direcciones');
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2,
  });

  // Encontrar la dirección predeterminada
  const defaultAddress = data?.find(addr => addr.esPredeterminada === true);

  // Formatear el texto de la dirección predeterminada
  const getDefaultAddressText = () => {
    if (!defaultAddress) {
      return 'Tienda Chacao'; // Fallback por defecto
    }

    if (defaultAddress.tipoDireccion === 'store') {
      return `Retiro en tienda: ${defaultAddress.nombreLocker || 'Locker'}`;
    }

    // Para direcciones de domicilio
    const parts = [];
    if (defaultAddress.direccionCompleta) parts.push(defaultAddress.direccionCompleta);
    if (defaultAddress.nombreParroquia) parts.push(defaultAddress.nombreParroquia);
    if (defaultAddress.nombreMunicipio) parts.push(defaultAddress.nombreMunicipio);
    if (defaultAddress.nombreEstado) parts.push(defaultAddress.nombreEstado);
    
    return defaultAddress.nombreDireccion || parts.join(', ');
  };

  return {
    addresses: data || [],
    defaultAddress,
    defaultAddressText: getDefaultAddressText(),
    isLoading,
    error,
    refetch,
  };
};