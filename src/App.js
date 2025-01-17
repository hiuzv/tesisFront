import React from 'react';
import ChatWindow from './components/ChatWindow'; // Asegúrate de que la ruta sea correcta
import './styles/App.css'; // Opcional si tienes estilos globales

function App() {
  return (
    <div className="App">
      {/* Renderiza el chat */}
      <ChatWindow />
    </div>
  );
}

export default App;
