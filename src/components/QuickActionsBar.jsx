import { Bold, Italic, Underline, List, ListOrdered, Quote, Plus, Save, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import './QuickActionsBar.css'

const QuickActionsBar = ({ editor, onAddChapter, onSave, onExport, currentPage }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!editor) return

    const handleSelectionChange = () => {
      const { selection } = editor.state
      
      if (selection.empty) {
        setIsVisible(false)
        return
      }

      // Get the DOM position of the selection for TipTap v2
      try {
        const { from, to } = selection
        const start = editor.view.coordsAtPos(from)
        const end = editor.view.coordsAtPos(to)
        
        // Get the editor container bounds for proper positioning
        const editorRect = editor.view.dom.getBoundingClientRect()
        
        setPosition({
          x: Math.max(50, Math.min(window.innerWidth - 200, (start.left + end.left) / 2)),
          y: Math.max(10, start.top - 50)
        })
        setIsVisible(true)
      } catch (error) {
        // Fallback if position calculation fails
        setIsVisible(false)
      }
    }

    const handleClick = (event) => {
      // Hide if clicking outside the editor and not on the toolbar
      if (editor?.view?.dom && 
          !editor.view.dom.contains(event.target) && 
          !event.target.closest('.quick-actions-bar')) {
        setIsVisible(false)
      }
    }

    const handleMouseUp = () => {
      // Small delay to allow selection to be processed
      setTimeout(handleSelectionChange, 10)
    }

    // Use multiple event handlers for better compatibility
    editor.on('selectionUpdate', handleSelectionChange)
    editor.on('transaction', handleSelectionChange)
    
    // Also listen for mouse events on the editor
    const editorDom = editor.view.dom
    editorDom.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClick)

    return () => {
      editor.off('selectionUpdate', handleSelectionChange)
      editor.off('transaction', handleSelectionChange)
      editorDom?.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClick)
    }
  }, [editor])

  if (!isVisible || !editor) return null

  const actions = [
    {
      icon: Bold,
      label: 'Bold',
      command: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold')
    },
    {
      icon: Italic,
      label: 'Italic',
      command: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic')
    },
    {
      icon: Underline,
      label: 'Underline',
      command: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline')
    },
    {
      icon: List,
      label: 'Bullet List',
      command: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      command: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList')
    },
    {
      icon: Quote,
      label: 'Quote',
      command: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote')
    }
  ]

  const globalActions = [
    {
      icon: Plus,
      label: 'Add Chapter',
      command: onAddChapter,
      isActive: () => false,
      isGlobal: true
    },
    {
      icon: Save,
      label: 'Save',
      command: onSave,
      isActive: () => false,
      isGlobal: true
    },
    {
      icon: Download,
      label: 'Export',
      command: onExport,
      isActive: () => false,
      isGlobal: true
    }
  ]

  return (
    <div 
      className="quick-actions-bar"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000
      }}
    >
      <div className="quick-actions-content">
        {actions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <button
              key={index}
              className={`quick-action-btn ${action.isActive() ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                action.command()
              }}
              title={action.label}
            >
              <IconComponent size={14} />
            </button>
          )
        })}
        
        <div className="quick-actions-divider" />
        
        {globalActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <button
              key={`global-${index}`}
              className="quick-action-btn global"
              onClick={(e) => {
                e.preventDefault()
                action.command()
                setIsVisible(false)
              }}
              title={action.label}
            >
              <IconComponent size={14} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActionsBar
