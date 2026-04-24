import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/AppRoutes';

/**
 * App – root component.
 * Layout và state được xử lý bên trong AppRoutes / AppLayout.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
