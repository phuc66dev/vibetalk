import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './style.css';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <>
    <App />
    <Toaster position="top-right" richColors theme="dark" toastOptions={{ duration: 1500, }} />
  </>,
);
