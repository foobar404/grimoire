import { Trash2, Edit3, Clock } from 'lucide-react'
import { useState } from 'react'
import { calculateReadingTime, formatReadingTime, getWordCount } from '../utils/readingTimeUtils'
import './TableOfContents.css'

const TableOfContents = ({ pages, currentPageId, onPageSelect, onPageUpdate, onPageDelete, getReadingTime }) => {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const startEditing = (page) => {
    setEditingId(page.id)
    setEditTitle(page.title)
  }

  const saveEdit = (pageId) => {
    onPageUpdate(pageId, { title: editTitle })
    setEditingId(null)
    setEditTitle('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleKeyPress = (e, pageId) => {
    if (e.key === 'Enter') {
      saveEdit(pageId)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const getChapterIndicator = (page) => {
    const wordCount = getWordCount(page.content)
    if (wordCount === 0) return '📝'
    if (wordCount < 100) return '🌱'
    if (wordCount < 500) return '📄'
    if (wordCount < 1000) return '📚'
    if (wordCount < 2000) return '🏆'
    return '⭐'
  }

  const getChapterTooltip = (page) => {
    const wordCount = getWordCount(page.content)
    if (wordCount === 0) return 'Ready to write!'
    if (wordCount < 100) return `${wordCount} words - Getting started`
    if (wordCount < 500) return `${wordCount} words - Good progress`
    if (wordCount < 1000) return `${wordCount} words - Solid chapter`
    if (wordCount < 2000) return `${wordCount} words - Excellent length`
    return `${wordCount} words - Epic chapter!`
  }

  return (
    <div className="table-of-contents">
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={`toc-item ${currentPageId === page.id ? 'active' : ''}`}
        >
          <div className="toc-item-content">
            <span className="chapter-number">
              <span className="chapter-indicator" title={getChapterTooltip(page)}>
                {getChapterIndicator(page)}
              </span>
              {index + 1}.
            </span>
            
            {editingId === page.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => saveEdit(page.id)}
                onKeyDown={(e) => handleKeyPress(e, page.id)}
                className="toc-edit-input"
                autoFocus
              />
            ) : (
              <div className="toc-title-section">
                <span
                  className="toc-title"
                  onClick={() => onPageSelect(page.id)}
                >
                  {page.title}
                </span>
                <div className="toc-meta">
                  <span className="reading-time">
                    <Clock size={10} />
                    {formatReadingTime(calculateReadingTime(page.content))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="toc-actions">
            <button
              onClick={() => startEditing(page)}
              className="toc-action-btn"
              title="Edit title"
            >
              <Edit3 size={12} />
            </button>
            {pages.length > 1 && (
              <button
                onClick={() => onPageDelete(page.id)}
                className="toc-action-btn delete"
                title="Delete chapter"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TableOfContents
