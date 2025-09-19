// src/App.jsx - LOGIN EXACTO COMO MÓVIL
import React from 'react';
import './styles/variables.scss';
import './App.styles.scss';

// AuthContext simplificado para prueba
const AuthContext = React.createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUser({ email, name: 'Usuario Kraken' });
      setIsSignedIn(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Credenciales inválidas' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ email: 'google@user.com', name: 'Usuario Google' });
      setIsSignedIn(true);
      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isSignedIn, isLoading, signIn, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// Componente AppLogo
const AppLogo = ({ size = 200 }) => {
  return (
    <div className="app-logo">
      <img 
        src="https://via.placeholder.com/300x120/FF4500/FFFFFF?text=KRAKEN+LOGO" 
        alt="Kraken Logo"
        style={{
          width: size,
          height: 'auto',
          maxHeight: size * 0.6,
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

// Componente InputField
const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = "text",
  error,
  rightIcon,
  onRightIconPress,
  ...props 
}) => {
  return (
    <div className="input-field">
      <label className="input-field__label">{label}</label>
      <div className="input-field__container">
        <input
          className={`input-field__input ${error ? 'input-field__input--error' : ''}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
        {rightIcon && (
          <button 
            type="button"
            className="input-field__icon"
            onClick={onRightIconPress}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
};

// Componente AppContainer
const AppContainer = ({ children }) => {
  return (
    <div className="app-container">
      {children}
    </div>
  );
};

// COMPONENTE LOGIN PRINCIPAL
const LoginScreen = () => {
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [buildInfo] = React.useState({ version: '1.0.0' });

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    let hasError = false;

    if (!email) {
      setEmailError('Por favor ingresa tu email');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Por favor ingresa tu contraseña');
      hasError = true;
    }

    if (hasError) return;

    const result = await signIn(email, password);
    if (!result.success) {
      setEmailError('Credenciales inválidas');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="login-screen">
      <div className="login-screen__scroll">
        <AppLogo size={200} />

        <AppContainer>
          <div className="login-screen__layout">
            <h1 className="login-screen__title">Iniciar Sesión</h1>

            <button
              className="login-screen__social-button login-screen__google-button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="login-screen__social-icon"
              />
              <span className="login-screen__social-text">Continuar con Google</span>
            </button>

            <div className="login-screen__separator">
              <div className="login-screen__separator-line"></div>
              <span className="login-screen__separator-text">o</span>
              <div className="login-screen__separator-line"></div>
            </div>

            <div className="login-screen__form">
              <InputField
                label="Email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
                type="email"
                error={emailError}
              />

              <InputField
                label="Contraseña"
                placeholder="Contraseña"
                value={password}
                onChange={setPassword}
                type={showPassword ? 'text' : 'password'}
                error={passwordError}
                rightIcon={showPassword ? '🙈' : '👁️'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <div className="login-screen__forgot">
                <a href="#forgot" className="login-screen__forgot-link">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                className="login-screen__login-button"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="login-screen__loading">
                    <div className="login-screen__spinner"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>

              <div className="login-screen__register-link">
                <span className="login-screen__register-text">¿No tienes cuenta? </span>
                <a href="#register" className="login-screen__register-button">Regístrate</a>
              </div>

              <div className="login-screen__terms">
                <p className="login-screen__terms-text">
                  Al iniciar sesión, aceptas nuestros{' '}
                  <a href="#terms" className="login-screen__terms-link">Términos y Condiciones</a>
                  {' '}y nuestra{' '}
                  <a href="#privacy" className="login-screen__terms-link">Política de Privacidad</a>
                </p>
              </div>

              <div className="login-screen__build-info">
                <p className="login-screen__build-text">© 2025 Kraken Admin.</p>
                <p className="login-screen__build-text">Todos los derechos reservados.</p>
                {buildInfo && (
                  <div className="login-screen__version">
                    <span className="login-screen__version-badge">
                      {buildInfo.version}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AppContainer>
      </div>
    </div>
  );
};

// Dashboard simple
const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🐙 Dashboard Kraken</h1>
      <p>¡Bienvenido, {user?.name}!</p>
      <button 
        onClick={logout}
        style={{
          padding: '12px 24px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

// App principal
function App() {
  const { isSignedIn } = useAuth();

  return (
    <AuthProvider>
      <div className="app">
        {isSignedIn ? <Dashboard /> : <LoginScreen />}
      </div>
    </AuthProvider>
  );
}

export default App;