# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.








# Proyecto React Desktop/Tablet - Arquitectura Limpia

## 📁 Estructura del Proyecto

```
kraken-desktop-web/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppContainer/
│   │   │   │   ├── AppContainer.jsx
│   │   │   │   ├── AppContainer.styles.scss
│   │   │   │   └── index.js
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Button.styles.scss
│   │   │   │   └── index.js
│   │   │   ├── Loading/
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── Loading.styles.scss
│   │   │   │   └── index.js
│   │   │   └── Layout/
│   │   │       ├── Layout.jsx
│   │   │       ├── Layout.styles.scss
│   │   │       └── index.js
│   │   ├── auth/
│   │   │   ├── AuthForm/
│   │   │   │   ├── AuthForm.jsx
│   │   │   │   ├── AuthForm.styles.scss
│   │   │   │   └── index.js
│   │   │   └── SocialButtons/
│   │   │       ├── SocialButtons.jsx
│   │   │       ├── SocialButtons.styles.scss
│   │   │       └── index.js
│   │   ├── alert/
│   │   │   ├── CustomAlert/
│   │   │   │   ├── CustomAlert.jsx
│   │   │   │   ├── CustomAlert.styles.scss
│   │   │   │   └── index.js
│   │   └── calculator/
│   │       ├── CalculatorHeader/
│   │       ├── LocationStep/
│   │       ├── PackageStep/
│   │       └── ResultStep/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Login.styles.scss
│   │   │   │   └── index.js
│   │   │   ├── Register/
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── Register.styles.scss
│   │   │   │   └── index.js
│   │   │   └── ForgotPassword/
│   │   │       ├── ForgotPassword.jsx
│   │   │       ├── ForgotPassword.styles.scss
│   │   │       └── index.js
│   │   ├── dashboard/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Dashboard.styles.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── DashboardStats/
│   │   │   │   │   └── DashboardCharts/
│   │   │   │   └── index.js
│   │   ├── payment/
│   │   │   ├── PaymentPage/
│   │   │   │   ├── PaymentPage.jsx
│   │   │   │   ├── PaymentPage.styles.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── PaymentForm/
│   │   │   │   │   ├── PaymentMethod/
│   │   │   │   │   └── PaymentSummary/
│   │   │   │   └── index.js
│   │   ├── calculator/
│   │   │   ├── Calculator/
│   │   │   │   ├── Calculator.jsx
│   │   │   │   ├── Calculator.styles.scss
│   │   │   │   └── index.js
│   │   ├── packages/
│   │   │   ├── PackagesList/
│   │   │   │   ├── PackagesList.jsx
│   │   │   │   ├── PackagesList.styles.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── PackageCard/
│   │   │   │   │   └── PackageFilters/
│   │   │   │   └── index.js
│   │   │   └── PackageDetail/
│   │   │       ├── PackageDetail.jsx
│   │   │       ├── PackageDetail.styles.scss
│   │   │       └── index.js
│   │   └── profile/
│   │       ├── Profile/
│   │       │   ├── Profile.jsx
│   │       │   ├── Profile.styles.scss
│   │       │   └── index.js
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.js
│   │   │   ├── endpoints.js
│   │   │   └── interceptors.js
│   │   ├── auth/
│   │   │   ├── authService.js
│   │   │   └── tokenService.js
│   │   ├── payment/
│   │   │   ├── paymentService.js
│   │   │   └── paymentService.test.js
│   │   ├── calculator/
│   │   │   ├── calculatorService.js
│   │   │   └── calculatorService.test.js
│   │   ├── packages/
│   │   │   ├── packagesService.js
│   │   │   └── packagesService.test.js
│   │   ├── address/
│   │   │   ├── addressService.js
│   │   │   └── addressService.test.js
│   │   └── redirect/
│   │       ├── redirectService.js
│   │       └── redirectService.test.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCustomAlert.js
│   │   ├── useLocalStorage.js
│   │   └── useApi.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── utils/
│   │   ├── config.js
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   └── icons/
│   │   └── fonts/
│   ├── styles/
│   │   ├── globals.scss
│   │   ├── variables.scss
│   │   ├── mixins.scss
│   │   ├── breakpoints.scss
│   │   └── components.scss
│   ├── App.jsx
│   ├── App.styles.scss
│   └── index.js
├── .env.local
├── .env.example
├── package.json
├── vite.config.js
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## 📦 Dependencias Recomendadas

```json
{
  "name": "kraken-desktop-web",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.4.0",
    "@tanstack/react-query": "^4.29.0",
    "react-hook-form": "^7.44.0",
    "react-hot-toast": "^2.4.0",
    "date-fns": "^2.29.0",
    "clsx": "^1.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0",
    "sass": "^1.62.0",
    "eslint": "^8.40.0",
    "prettier": "^2.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

## ⚙️ Configuración Base

### Variables de Entorno (.env.local)
```env
# API Configuration - Debe coincidir con tu backend C#
VITE_API_BASE_URL=http://localhost:7031/api
VITE_APP_NAME=Kraken Desktop
VITE_APP_VERSION=1.0.0

# Development
VITE_NODE_ENV=development
```

### Configuración Vite (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@styles/variables.scss";
          @import "@styles/mixins.scss";
          @import "@styles/breakpoints.scss";
        `
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

## 🎯 Beneficios de esta Arquitectura

1. **Consistencia**: Mantiene la misma estructura de carpetas que tu proyecto móvil
2. **Escalabilidad**: Fácil agregar nuevas funcionalidades
3. **Mantenimiento**: Código organizado por dominio
4. **Reutilización**: Servicios centralizados
5. **Testing**: Estructura que facilita las pruebas
6. **Responsive**: Optimizado para desktop y tablet