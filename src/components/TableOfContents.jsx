import { Trash2, Clock, GripVertical, Search } from 'lucide-react'
import { useState } from 'react'
import { calculateReadingTime, formatReadingTime, getWordCount } from '../utils/readingTimeUtils'
import './TableOfContents.css'

const TableOfContents = ({ pages, currentPageId, onPageSelect, onPageUpdate, onPageDelete, onPageReorder, getReadingTime }) => {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverItem, setDragOverItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const startEditing = (page) => {
    setEditingId(page.id)
    setEditTitle(page.title)
  }

  const saveEdit = (pageId) => {
    if (editTitle.trim()) {
      onPageUpdate(pageId, { title: editTitle.trim() })
    }
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

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    setDragOverItem(index)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedItem !== null && draggedItem !== dropIndex) {
      onPageReorder(draggedItem, dropIndex)
    }
    
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Search functionality
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchTerm('')
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
      <div className="toc-header">
        <button
          onClick={handleSearchToggle}
          className={`search-toggle-btn toc-search-toggle ${showSearch ? 'active' : ''}`}
          title="Search chapters"
          style={{ display: 'none' }}
        >
          <Search size={14} />
        </button>
        {showSearch && (
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="toc-search-input"
            autoFocus
          />
        )}
      </div>

      {filteredPages.map((page, index) => {
        const originalIndex = pages.findIndex(p => p.id === page.id)
        return (
          <div
            key={page.id}
            className={`toc-item ${currentPageId === page.id ? 'active' : ''} ${
              dragOverItem === originalIndex ? 'drag-over' : ''
            }`}
            draggable={!editingId}
            onDragStart={(e) => handleDragStart(e, originalIndex)}
            onDragOver={(e) => handleDragOver(e, originalIndex)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, originalIndex)}
            onClick={() => {
              if (editingId !== page.id) {
                onPageSelect(page.id)
              }
            }}
          >
            <div className="toc-item-content">
              <div className="drag-handle">
                <GripVertical size={12} />
              </div>
              
              <span className="chapter-number">
                <span className="chapter-indicator" title={getChapterTooltip(page)}>
                  {getChapterIndicator(page)}
                </span>
                {originalIndex + 1}.
              </span>
              
              {editingId === page.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => saveEdit(page.id)}
                  onKeyDown={(e) => handleKeyPress(e, page.id)}
                  className="toc-edit-input"
                  placeholder="Chapter title..."
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="toc-title-section">
                  <span 
                    className="toc-title"
                    onDoubleClick={() => startEditing(page)}
                    title="Double-click to rename"
                  >
                    {page.title || 'Untitled Chapter'}
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
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPageDelete(page.id)
                  }}
                  className="toc-action-btn delete"
                  title="Delete chapter"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TableOfContents
