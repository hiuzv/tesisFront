import React, { useState } from 'react';
import Message from './Message';
import FeedbackButtons from './FeedbackButtons';
import Loader from './Loader';
import axios from 'axios';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Bienvenido al Chat Bot Educativo' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', text: input };
    setMessages([...messages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://web-production-67b6d.up.railway.app/chat', {
        prompt: input,
      });
      const botMessage = { role: 'bot', text: response.data.response };
      setMessages([...messages, newMessage, botMessage]);
    } catch (error) {
      const errorMessage = { role: 'bot', text: 'Error en la conexión.' };
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

  const handleFeedback = (feedback) => {
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
          message.role === 'bot' ? (
            <div key={index} className="bot-message message">
              <div dangerouslySetInnerHTML={{ __html: message.text }}></div>
              <div className="feedback-buttons">
                <button onClick={() => handleFeedback('like')}>👍 Like</button>
                <button onClick={() => handleFeedback('dislike')}>👎 Dislike</button>
              </div>
            </div>
          ) : (
            <p key={index} className="user-message message">
              {message.text}
            </p>
          )
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
