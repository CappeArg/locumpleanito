import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SalaProvider } from './context/SalaContext';
import { ToastContainer } from './components/ToastContainer';
import { HomeView } from './views/HomeView';
import { SalaView } from './views/SalaView';
import { CumpleView } from './views/CumpleView';
import { NuevoCumpleView } from './views/NuevoCumpleView';

export function App() {
  return (
    <SalaProvider>
      <BrowserRouter>
        <Routes>
          {/* Inicio / Bienvenida / Crear Sala */}
          <Route path="/" element={<HomeView />} />

          {/* Tablero de una Sala específica */}
          <Route path="/sala/:salaId" element={<SalaView />} />

          {/* Formulario para crear un cumpleaños en la Sala */}
          <Route path="/sala/:salaId/nuevo" element={<NuevoCumpleView />} />

          {/* Vista individual de un Cumpleaños (URL directa para WhatsApp) */}
          <Route path="/sala/:salaId/cumple/:cumpleId" element={<CumpleView />} />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer />
      </BrowserRouter>
    </SalaProvider>
  );
}

export default App;
