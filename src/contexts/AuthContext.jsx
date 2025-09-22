// src/contexts/AuthContext.jsx - Context robusto para web (sin cambios, ya está correcto)
import React, { createContext, useContext, useEffect, useState } from 'react';

// Tipos de usuario (estructura preparada para servicios reales)
const createUser = (data) => ({
  id: data.id || null,
  email: data.email,
  name: data.name || data.nombres,
  lastName: data.lastName || data.apellidos,
  phone: data.phone || data.telefonoCelular,
  nro: data.nro || data.nroIdentificacionCliente,
  emailVerified: data.emailVerified || data.fromEmail || false,
  profileComplete: data.profileComplete || false,
  fromGoogle: data.fromGoogle || false,
  clienteActivo: data.clienteActivo || false,
  codCliente: data.codCliente || null,
  birthday: data.birthday || data.fechaNacimiento,
  phoneSecondary: data.phoneSecundary || data.telefonoCelularSecundario,
  avatarId: data.avatarId || '1',
});

// Context inicial
const AuthContext = createContext({
  user: null,
  isLoading: false,
  isSignedIn: false,
  signIn: async () => ({ success: false, message: 'Not implemented' }),
  signUp: async () => ({ success: false, message: 'Not implemented' }),
  signInWithGoogle: async () => ({ success: false, message: 'Not implemented' }),
  signOut: async () => {},
  confirmEmail: () => {},
  setUserState: async () => {},
  resendVerificationEmail: async () => ({ success: false, message: 'Not implemented' }),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estado computado
  const isSignedIn = !!user;

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = localStorage.getItem('userData');
        const storedToken = localStorage.getItem('authToken');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(createUser(userData));
          console.log('Usuario cargado desde localStorage:', userData.email);
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
        // Limpiar storage corrupto
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Guardar usuario en localStorage
  const saveUserToStorage = async (userData, token) => {
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('authToken', token);
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
    }
  };

  // Limpiar storage
  const clearUserFromStorage = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
  };

  // SIGN IN - Preparado para API real
  const signIn = async (email, password) => {
    setIsLoading(true);
    console.log('Iniciando sesión para:', email);

    try {
      // TODO: Reemplazar con llamada API real
      // const response = await authService.signIn(email, password);
      
      // Simulación estática por ahora
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular diferentes casos
      if (email === 'test@error.com') {
        return { success: false, message: 'Credenciales inválidas' };
      }
      
      if (email === 'test@unverified.com') {
        return { 
          success: false, 
          message: 'Debes verificar tu email antes de continuar',
          code: 'EMAIL_NOT_VERIFIED'
        };
      }

      // Usuario exitoso - datos estáticos
      const mockUserData = {
        id: '123',
        email: email,
        name: 'Usuario',
        lastName: 'Kraken',
        phone: '+58412345679',
        emailVerified: true,
        profileComplete: true,
        fromGoogle: false,
      };

      const mockToken = 'mock-jwt-token-12345';
      const userData = createUser(mockUserData);
      
      setUser(userData);
      await saveUserToStorage(mockUserData, mockToken);
      
      console.log('Login exitoso:', userData.email);
      return { success: true, message: 'Login exitoso' };

    } catch (error) {
      console.error('Error en signIn:', error);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setIsLoading(false);
    }
  };

  // SIGN UP - Preparado para API real
  const signUp = async (email, password, name, lastName) => {
    setIsLoading(true);
    console.log('Registrando usuario:', email);

    try {
      // TODO: Reemplazar con llamada API real
      // const response = await authService.signUp(email, password, name, lastName);
      
      // Simulación estática
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular diferentes casos
      if (email === 'test@exists.com') {
        return { 
          success: false, 
          message: 'Este email ya está registrado',
          field: 'email'
        };
      }

      // Registro exitoso - NO loguear automáticamente
      // El usuario debe verificar email primero
      console.log('Registro exitoso para:', email);
      return { 
        success: true, 
        message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.' 
      };

    } catch (error) {
      console.error('Error en signUp:', error);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setIsLoading(false);
    }
  };

  // GOOGLE SIGN IN - Preparado para API real
  const signInWithGoogle = async () => {
    setIsLoading(true);
    console.log('Iniciando sesión con Google...');

    try {
      // TODO: Reemplazar con Google OAuth real
      // const googleResponse = await googleAuth.signIn();
      // const response = await authService.googleSignIn(googleResponse.token);
      
      // Simulación estática
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockGoogleUser = {
        id: '456',
        email: 'google.user@gmail.com',
        name: 'Usuario',
        lastName: 'Google',
        emailVerified: true,
        profileComplete: false, // Nuevo usuario de Google necesita completar perfil
        fromGoogle: true,
      };

      const mockToken = 'mock-google-jwt-token-67890';
      const userData = createUser(mockGoogleUser);
      
      setUser(userData);
      await saveUserToStorage(mockGoogleUser, mockToken);
      
      console.log('Google login exitoso:', userData.email);
      return { success: true, message: 'Login con Google exitoso' };

    } catch (error) {
      console.error('Error en Google signIn:', error);
      return { success: false, message: 'Error con Google Sign In' };
    } finally {
      setIsLoading(false);
    }
  };

  // SIGN OUT
  const signOut = async () => {
    console.log('Cerrando sesión...');
    
    try {
      // TODO: Invalidar token en el servidor
      // await authService.signOut();
      
      setUser(null);
      clearUserFromStorage();
      console.log('Sesión cerrada exitosamente');
      
    } catch (error) {
      console.error('Error en signOut:', error);
      // Limpiar localmente aunque falle el servidor
      setUser(null);
      clearUserFromStorage();
    }
  };

  // CONFIRMAR EMAIL
  const confirmEmail = () => {
    console.log('Confirmando email del usuario...');
    setUser(prev => prev ? createUser({ ...prev, emailVerified: true }) : prev);
    
    // TODO: Actualizar en servidor
    // await authService.confirmEmail(user.id);
  };

  // ACTUALIZAR ESTADO DEL USUARIO
  const setUserState = async (userData, token = null) => {
    try {
      if (userData) {
        const newUserData = createUser(userData);
        setUser(newUserData);
        await saveUserToStorage(userData, token);
        console.log('Estado del usuario actualizado');
      } else {
        setUser(null);
        clearUserFromStorage();
      }
    } catch (error) {
      console.error('Error actualizando estado del usuario:', error);
    }
  };

  // REENVIAR EMAIL DE VERIFICACIÓN
  const resendVerificationEmail = async (email) => {
    try {
      console.log('Reenviando email de verificación a:', email);
      
      // TODO: Reemplazar con API real
      // const response = await authService.resendVerificationEmail(email);
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Email de verificación reenviado exitosamente'
      };
      
    } catch (error) {
      console.error('Error reenviando email:', error);
      return {
        success: false,
        message: 'Error al reenviar el email'
      };
    }
  };

  const value = {
    user,
    isLoading,
    isSignedIn,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    confirmEmail,
    setUserState,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};