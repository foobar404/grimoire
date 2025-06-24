import { Trash2, Edit3 } from 'lucide-react'
import { useState } from 'react'
import './TableOfContents.css'

const TableOfContents = ({ pages, currentPageId, onPageSelect, onPageUpdate, onPageDelete }) => {
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

  return (
    <div className="table-of-contents">
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={`toc-item ${currentPageId === page.id ? 'active' : ''}`}
        >
          <div className="toc-item-content">
            <span className="chapter-number">{index + 1}.</span>
            
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
              <span
                className="toc-title"
                onClick={() => onPageSelect(page.id)}
              >
                {page.title}
              </span>
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
