import { TrendingUp, Target, Calendar, Zap, X } from 'lucide-react'
import { getWritingInsights, getWritingStreak } from '../utils/readingTimeUtils'
import './WritingInsights.css'

const WritingInsights = ({ book, onClose }) => {
  const insights = getWritingInsights(book)
  const streak = getWritingStreak()

  return (
    <div className="writing-insights-modal">
      <div className="writing-insights-content">
        <div className="insights-header">
          <div className="insights-title">
            <TrendingUp size={20} />
            <h3>Writing Insights</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="insights-body">
          {/* Writing Streak Section */}
          {streak.currentStreak > 0 && (
            <div className="insight-section streak-section">
              <div className="streak-header">
                <Zap size={18} />
                <h4>Writing Streak</h4>
              </div>
              <div className="streak-display">
                <div className="streak-number">{streak.currentStreak}</div>
                <div className="streak-label">day{streak.currentStreak === 1 ? '' : 's'}</div>
              </div>
              <div className="streak-encouragement">
                {streak.currentStreak === 1 && "🌱 Great start! Keep it going!"}
                {streak.currentStreak >= 2 && streak.currentStreak < 7 && "🔥 You're building momentum!"}
                {streak.currentStreak >= 7 && streak.currentStreak < 30 && "💪 Strong habit forming!"}
                {streak.currentStreak >= 30 && "🏆 Amazing dedication!"}
              </div>
            </div>
          )}

          {/* Book Statistics */}
          <div className="insight-section">
            <div className="section-header">
              <Target size={18} />
              <h4>Book Statistics</h4>
            </div>
            <div className="insights-grid">
              {insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-icon">{insight.icon}</div>
                  <div className="insight-content">
                    <div className="insight-label">{insight.label}</div>
                    <div className="insight-value">{insight.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="insight-section">
            <div className="section-header">
              <Calendar size={18} />
              <h4>Progress Tracking</h4>
            </div>
            <div className="progress-info">
              <div className="progress-item">
                <span className="progress-label">Total Writing Days:</span>
                <span className="progress-value">{streak.totalDays || 0}</span>
              </div>
              <div className="progress-item">
                <span className="progress-label">Chapters Completed:</span>
                <span className="progress-value">{book.pages?.length || 0}</span>
              </div>
              <div className="progress-item">
                <span className="progress-label">Last Updated:</span>
                <span className="progress-value">
                  {streak.lastWriteDate ? new Date(streak.lastWriteDate).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Motivational Tips */}
          <div className="insight-section tips-section">
            <h4>💡 Writing Tips</h4>
            <div className="tips-list">
              <div className="tip">Set a daily word count goal (even 100 words counts!)</div>
              <div className="tip">Write at the same time each day to build routine</div>
              <div className="tip">Don't edit while writing - get the ideas down first</div>
              <div className="tip">Celebrate small wins - every word is progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WritingInsights
