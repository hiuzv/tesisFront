import React, { useState } from 'react';
import Message from './Message';
import FeedbackButtons from './FeedbackButtons';
import Loader from './Loader';
import axios from 'axios';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Bienvenido al Chat Bot Educativo', feedbackGiven: true },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', text: input, feedbackGiven: false };
    setMessages([...messages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://web-production-67b6d.up.railway.app/chat', {
        prompt: input,
      });
      const botMessage = { role: 'bot', text: response.data.response, feedbackGiven: false };
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

  const renderMessage = (message, index) => {
    if (message.role === 'bot') {
      // Procesar bloques de código
      const codeRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/g;
      const parts = message.text.split(codeRegex);

      return (
        <div key={index} className="bot-message message">
          {parts.map((part, i) =>
            i % 2 === 0 ? (
              // Renderizar texto normal
              <div key={i} dangerouslySetInnerHTML={{ __html: part }}></div>
            ) : (
              // Renderizar bloque de código con botón de copiar
              <div key={i} className="code-block">
                <pre><code>{part}</code></pre>
                <button onClick={() => handleCopyCode(part)}>Copiar</button>
              </div>
            )
          )}
          {/* Botones de feedback */}
          {!message.feedbackGiven && index !== 0 && (
            <div className="feedback-buttons">
              <button onClick={() => handleFeedback(index, 'like')}>👍 Like</button>
              <button onClick={() => handleFeedback(index, 'dislike')}>👎 Dislike</button>
            </div>
          )}
        </div>
      );
    }

    // Renderizar mensajes del usuario
    return (
      <p key={index} className="user-message message">
        {message.text}
      </p>
    );
  };

  const handleFeedback = (index, feedback) => {
    const updatedMessages = [...messages];
    updatedMessages[index].feedbackGiven = true; // Bloquear feedback para este mensaje
    setMessages(updatedMessages);

    // Enviar el feedback al servidor
    axios.post('https://web-production-67b6d.up.railway.app/feedback', { feedback })
      .then(() => {
        alert('Gracias por tu feedback');
      })
      .catch(() => {
        alert('Error al enviar el feedback');
      });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">Chat Bot Educativo</div>
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
