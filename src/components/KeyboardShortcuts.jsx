import { X, Keyboard } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import './KeyboardShortcuts.css'

const KeyboardShortcuts = () => {
  const [showModal, setShowModal] = useState(false)

  const shortcuts = [
    { key: 'Ctrl+S', description: 'Save project' },
    { key: 'Ctrl+E', description: 'Export EPUB 3.0' },
    { key: 'Ctrl+P', description: 'Preview book' },
    { key: 'Ctrl+N', description: 'New chapter' },
    { key: 'Ctrl+D', description: 'Duplicate current chapter' },
    { key: 'Ctrl+1', description: 'Toggle style panel' },
    { key: 'Ctrl+2', description: 'Toggle metadata panel' },
    { key: 'Ctrl+F', description: 'Toggle distraction-free mode' },
    { key: 'Ctrl+Z', description: 'Undo' },
    { key: 'Ctrl+Shift+Z', description: 'Redo' },
  ]

  return (
    <>
      <button 
        className="keyboard-shortcuts-btn"
        onClick={() => setShowModal(true)}
        title="Keyboard Shortcuts"
      >
        <Keyboard size={16} />
      </button>

      {showModal && createPortal(
        <div className="shortcuts-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h3>
                <Keyboard size={18} />
                Keyboard Shortcuts
              </h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="shortcuts-list">
              {shortcuts.map(shortcut => (
                <div key={shortcut.key} className="shortcut-item">
                  <kbd className="shortcut-key">{shortcut.key}</kbd>
                  <span className="shortcut-desc">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default KeyboardShortcuts
