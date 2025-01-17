import React from 'react';
import PropTypes from 'prop-types';

const Message = ({ role, text }) => {
  const messageClass = role === 'user' ? 'user-message' : 'bot-message';
  return <div className={`message ${messageClass}`}>{text}</div>;
};

Message.propTypes = {
  role: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default Message;
