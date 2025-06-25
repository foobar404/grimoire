import { useState } from 'react'
import { MessageCircle, X, Plus, Trash2 } from 'lucide-react'
import './Comments.css'

const Comments = ({ comments = [], onAddComment, onDeleteComment }) => {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({
        id: Date.now(),
        text: newComment.trim(),
        timestamp: new Date().toLocaleString()
      })
      setNewComment('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  return (
    <div className="comments-container">
      <button 
        className={`comments-toggle ${comments.length > 0 ? 'has-comments' : ''}`}
        onClick={() => setShowComments(!showComments)}
        title={`${comments.length} comments`}
      >
        <MessageCircle size={16} />
        {comments.length > 0 && <span className="comment-count">{comments.length}</span>}
      </button>

      {showComments && (
        <div className="comments-panel">
          <div className="comments-header">
            <h4>
              <MessageCircle size={16} />
              Comments
            </h4>
            <button 
              className="close-btn"
              onClick={() => setShowComments(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-text">{comment.text}</div>
                <div className="comment-meta">
                  <span className="comment-time">{comment.timestamp}</span>
                  <button 
                    className="comment-delete"
                    onClick={() => onDeleteComment(comment.id)}
                    title="Delete comment"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="no-comments">
                <MessageCircle size={24} />
                <p>No comments yet. Add one below!</p>
              </div>
            )}
          </div>

          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a comment..."
              className="comment-input"
              rows="2"
            />
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="add-comment-btn"
            >
              <Plus size={16} />
              Add Comment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Comments
