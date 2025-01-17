import React from 'react';
import PropTypes from 'prop-types';

const FeedbackButtons = ({ onFeedback }) => {
  return (
    <div className="feedback-buttons">
      <button onClick={() => onFeedback('like')}>👍 Like</button>
      <button onClick={() => onFeedback('dislike')}>👎 Dislike</button>
    </div>
  );
};

FeedbackButtons.propTypes = {
  onFeedback: PropTypes.func.isRequired,
};

export default FeedbackButtons;
