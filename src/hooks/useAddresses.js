// src/hooks/useAddresses.js
import { useQuery } from '@tanstack/react-query';
import { getUserAddresses } from '@services/address/addressService';

export const useAddresses = () => {
  // ✅ Obtener userId directamente de localStorage
  const userId = localStorage.getItem('userId');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userAddresses', userId], // ✅ Incluir userId en la key
    queryFn: async () => {
      if (!userId) {
        // console.warn('⚠️ No user ID available');
        return [];
      }

      // console.log('🔍 Fetching addresses for user:', userId);
      
      // ✅ Pasar el userId a la función
      const response = await getUserAddresses(parseInt(userId));
      
      // console.log('✅ Addresses response:', response);
      
      if (response.success) {
        return response.data || [];
      }
      
      throw new Error(response.message || 'Error al cargar direcciones');
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!userId, // ✅ Solo ejecutar si hay userId
    refetchOnMount: 'always', // ✅ SIEMPRE refetch
    refetchOnWindowFocus: true,
  });

  const addresses = Array.isArray(data) ? data : [];
  const defaultAddress = addresses.find(addr => addr.esPredeterminada === true);

  const getDefaultAddressText = () => {
    if (isLoading) {
      return 'Cargando dirección...';
    }

    if (!defaultAddress) {
      return 'Sin dirección configurada';
    }

    if (defaultAddress.tipoDireccion === 'store') {
      return `Retiro en tienda: ${defaultAddress.nombreLocker || 'Locker'}`;
    }

    if (defaultAddress.nombreDireccion) {
      return defaultAddress.nombreDireccion;
    }

    const parts = [];
    if (defaultAddress.direccionCompleta) parts.push(defaultAddress.direccionCompleta);
    if (defaultAddress.nombreParroquia) parts.push(defaultAddress.nombreParroquia);
    if (defaultAddress.nombreMunicipio) parts.push(defaultAddress.nombreMunicipio);
    if (defaultAddress.nombreEstado) parts.push(defaultAddress.nombreEstado);

    return parts.length > 0 ? parts.join(', ') : 'Sin dirección';
  };

  return {
    addresses,
    defaultAddress: defaultAddress || null,
    defaultAddressText: getDefaultAddressText(),
    isLoading,
    error,
    refetch,
  };
};