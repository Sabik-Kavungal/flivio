import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const cfAnalyticsToken = import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN;
if (import.meta.env.PROD && cfAnalyticsToken) {
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', JSON.stringify({token: cfAnalyticsToken}));
  document.head.appendChild(script);
}

createRoot(document.getElementById('root')!).render(<App />);
