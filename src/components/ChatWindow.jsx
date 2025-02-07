import React, { useState,useEffect } from 'react';
import Message from './Message';
import FeedbackButtons from './FeedbackButtons';
import Loader from './Loader';
import axios from 'axios';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Extraer el parámetro "nombre_usuario" de la URL
    const params = new URLSearchParams(window.location.search);
    const nombreUsuario = params.get('nombre_usuario') || 'Usuario Anónimo';
    const decodedName = decodeURIComponent(nombreUsuario); // Decodificar caracteres especiales

    setUserName(decodedName); // Actualizar el nombre de usuario
    setMessages([{ role: 'bot', text: `Bienvenido ${decodedName} al Chat Bot Educativo`, feedbackGiven: true }]); // Mensaje de bienvenida dinámico
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', text: input, feedbackGiven: false };
    setMessages([...messages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://web-production-67b6d.up.railway.app/chat', {
        prompt: input,
        nombre_usuario: userName,
      });
      // Crear el mensaje del bot con el message_id incluido
      const botMessage = {
          role: 'bot',
          text: response.data.response,
          feedbackGiven: false,
          message_id: response.data.assistant_message_id, // Aquí se incluye el message_id del backend
      };
      setMessages([...messages, newMessage, botMessage]);
    } catch (error) {
      const errorMessage = { role: 'bot', text: 'Error en la conexión.', feedbackGiven: true };
      setMessages([...messages, newMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      alert('Código copiado al portapapeles');
    }).catch(() => {
      alert('Error al copiar el código');
    });
  };

  // Función para agregar botones de copiar dentro de los bloques de código
  const renderMessageContent = (text) => {
    return text.split(/(<pre><code>[\s\S]*?<\/code><\/pre>)/g).map((part, index) => {
      if (part.startsWith('<pre><code>')) {
        // Extraer el contenido sin etiquetas
        const codeContent = part.replace('<pre><code>', '').replace('</code></pre>', '');

        return (
          <div key={index} className="code-block">
            <button className="copy-button" onClick={() => handleCopyCode(codeContent)}>📋 Copiar</button>
            <pre><code>{codeContent}</code></pre>
          </div>
        );
      }
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  const handleFeedback = (index, feedback) => {
    const updatedMessages = [...messages];
    updatedMessages[index].feedbackGiven = true; // Bloquear feedback para este mensaje
    setMessages(updatedMessages);

    const messageId = updatedMessages[index].message_id;

    // Enviar el feedback al servidor
    axios.post('https://web-production-67b6d.up.railway.app/feedback', { feedback, message_id: messageId, })
      .then(() => {
        alert('Gracias por tu feedback');
      })
      .catch(() => {
        alert('Error al enviar el feedback');
      });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-title">Chat Bot Educativo</div>
        <div className="user-info">
          <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="white">
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/>
          </svg>
          <span>{userName}</span>
        </div>
      </div>
      <div className="chat-log">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}>
            {/* Renderizar contenido del mensaje */}
            {message.role === 'bot' ? (
              <div dangerouslySetInnerHTML={{ __html: message.text }}></div>
            ) : (
              <p>{message.text}</p>
            )}

            {/* Mostrar botones de Like/Dislike solo si no se ha dado feedback y no es el mensaje de bienvenida */}
            {message.role === 'bot' && !message.feedbackGiven && index !== 0 && (
              <div className="feedback-buttons">
                <button onClick={() => handleFeedback(index, 'like')}>👍 Like</button>
                <button onClick={() => handleFeedback(index, 'dislike')}>👎 Dislike</button>
              </div>
            )}
          </div>
        ))}
        {isLoading && <Loader />}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatWindow;
