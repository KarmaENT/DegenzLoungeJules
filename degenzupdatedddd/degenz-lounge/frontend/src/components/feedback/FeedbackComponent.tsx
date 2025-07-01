import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaRegStar, FaThumbsUp, FaThumbsDown, FaComment } from 'react-icons/fa';

export interface FeedbackProps {
  messageId?: number; // Optional for general agent feedback
  sessionId?: number; // Optional for general agent feedback
  agentId: number;
  agentName?: string; // Optional, can be fetched or passed if available
  onFeedbackSubmitted?: () => void; // Callback for when feedback is submitted
}

const FeedbackComponent: React.FC<FeedbackProps> = ({ 
  messageId, 
  sessionId, 
  agentId, 
  agentName = "Agent", // Default agent name
  onFeedbackSubmitted 
}) => {
  const [feedbackType, setFeedbackType] = useState<string>('rating');
  const [category, setCategory] = useState<string>('overall');
  const [rating, setRating] = useState<number | null>(null);
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [comment, setComment] = useState<string>('');
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingClick = (value: number) => {
    setRating(value);
    setFeedbackType('rating');
    setIsPositive(null);
  };

  const handleThumbsClick = (value: boolean) => {
    setIsPositive(value);
    setFeedbackType('thumbs');
    setRating(null);
  };

  const handleCommentClick = () => {
    setShowCommentBox(!showCommentBox);
    if (showCommentBox) { // If closing comment box, revert to previous type or default
      setFeedbackType(rating !== null ? 'rating' : isPositive !== null ? 'thumbs' : 'detailed');
    } else { // If opening comment box, set type to detailed
      setFeedbackType('detailed');
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      if (rating === null && isPositive === null && comment.trim() === '') {
        setError('Please provide some feedback before submitting.');
        return;
      }
      
      const feedbackData = {
        message_id: messageId,
        session_id: sessionId,
        agent_id: agentId,
        feedback_type: feedbackType,
        category: category,
        rating: rating,
        is_positive: isPositive,
        comment: comment.trim() !== '' ? comment : null,
      };
      
      await axios.post('/api/feedback/', feedbackData);
      setFeedbackSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error('Error submitting feedback:', err);
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="feedback-container submitted p-3 bg-gray-800 rounded-lg mt-2">
        <p className="text-green-400 text-sm">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="feedback-container bg-gray-800 p-3 rounded-lg mt-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-white">Rate {messageId ? `${agentName}'s response` : `your experience with ${agentName}`}:</h4>
        <div className="flex space-x-2">
          <select 
            className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:ring-purple-500 focus:border-purple-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="overall">Overall</option>
            <option value="accuracy">Accuracy</option>
            <option value="helpfulness">Helpfulness</option>
            <option value="creativity">Creativity</option>
            <option value="clarity">Clarity</option>
            <option value="speed">Speed</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="text-red-400 text-xs mb-2 p-2 bg-red-900 rounded">{error}</div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="star-rating flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              className="focus:outline-none text-xl"
              aria-label={`Rate ${star} stars`}
            >
              {rating !== null && star <= rating ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar className="text-gray-400 hover:text-yellow-400" />
              )}
            </button>
          ))}
        </div>
        
        <div className="thumbs flex space-x-3 items-center">
          <button
            onClick={() => handleThumbsClick(true)}
            className={`focus:outline-none text-xl ${isPositive === true ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
            aria-label="Thumbs up"
          >
            <FaThumbsUp />
          </button>
          <button
            onClick={() => handleThumbsClick(false)}
            className={`focus:outline-none text-xl ${isPositive === false ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            aria-label="Thumbs down"
          >
            <FaThumbsDown />
          </button>
          <button
            onClick={handleCommentClick}
            className={`focus:outline-none text-xl ${showCommentBox ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
            aria-label="Add comment"
          >
            <FaComment />
          </button>
        </div>
      </div>
      
      {showCommentBox && (
        <div className="mt-3">
          <textarea
            className="w-full bg-gray-700 text-white rounded p-2 text-sm border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            rows={3}
            placeholder="Add detailed feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      )}
      
      {(rating !== null || isPositive !== null || comment.trim() !== '') && (
        <div className="mt-3 flex justify-end">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-md transition-colors"
            onClick={handleSubmit}
          >
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;

