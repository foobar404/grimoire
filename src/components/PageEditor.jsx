import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Undo, Redo, Image as ImageIcon, Subscript as SubIcon, Superscript as SuperIcon, FileText, Code } from 'lucide-react'
import { useEffect, useRef, useCallback, useState } from 'react'
import Comments from './Comments'
import './PageEditor.css'

const PageEditor = ({ page, onUpdate, styles }) => {
  const fileInputRef = useRef(null)
  const updateTimeoutRef = useRef(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importFormat, setImportFormat] = useState('markdown')
  
  // Debounced update function to reduce typing lag
  const debouncedUpdate = useCallback((updates) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate(updates)
    }, 300) // 300ms debounce
  }, [onUpdate])
  // Convert Markdown to HTML
  const markdownToHtml = (markdown) => {
    let html = markdown
    
    // Code blocks (must be processed first)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Bold and Italic (order matters)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="editor-image" />')
    
    // Lists - handle multi-line lists properly
    const lines = html.split('\n')
    let inList = false
    let listType = null
    const processedLines = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const bulletMatch = line.match(/^\s*[\*\-\+]\s+(.*)$/)
      const numberMatch = line.match(/^\s*\d+\.\s+(.*)$/)
      
      if (bulletMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push(`</${listType}>`)
          processedLines.push('<ul>')
          inList = true
          listType = 'ul'
        }
        processedLines.push(`<li>${bulletMatch[1]}</li>`)
      } else if (numberMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(`</${listType}>`)
          processedLines.push('<ol>')
          inList = true
          listType = 'ol'
        }
        processedLines.push(`<li>${numberMatch[1]}</li>`)
      } else {
        if (inList) {
          processedLines.push(`</${listType}>`)
          inList = false
          listType = null
        }
        processedLines.push(line)
      }
    }
    
    if (inList) {
      processedLines.push(`</${listType}>`)
    }
    
    html = processedLines.join('\n')
    
    // Blockquotes
    html = html.replace(/^>\s+(.*)$/gim, '<blockquote><p>$1</p></blockquote>')
    
    // Paragraphs - handle double line breaks
    html = html.replace(/\n\n+/g, '\n\n')
    const paragraphs = html.split('\n\n')
    html = paragraphs.map(p => {
      p = p.trim()
      if (!p) return ''
      // Don't wrap if already a block element
      if (p.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|div)/)) {
        return p
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`
    }).filter(p => p).join('\n\n')
    
    return html
  }
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: page.content,
    onUpdate: ({ editor }) => {
      debouncedUpdate({ content: editor.getHTML() })
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: `
          font-family: ${styles.fontFamily === 'serif' ? 'Georgia, serif' : styles.fontFamily === 'sans' ? 'Arial, sans-serif' : 'Courier, monospace'};
          font-size: ${styles.fontSize};
          line-height: ${styles.lineHeight};
          text-align: ${styles.textAlign};
          color: ${styles.color};
          background-color: ${styles.backgroundColor};
        `
      }
    },
  })

  // Handle clipboard paste for images and text
  const handlePaste = useCallback((event) => {
    const items = event.clipboardData?.items
    if (!items) return

    // Check for images first
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        event.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (editor) {
              editor.chain().focus().setImage({ src: e.target.result }).run()
            }
          }
          reader.readAsDataURL(file)
        }
        return
      }
    }
    
    // Handle text paste - check for Markdown or HTML
    const text = event.clipboardData.getData('text/plain')
    if (text) {
      // Simple heuristic to detect if text might be Markdown
      const hasMarkdownSyntax = /(\*\*|__|\*|_|`|#|>\s|\[.*\]\(.*\)|!\[.*\]\(.*\))/.test(text)
      
      if (hasMarkdownSyntax) {
        event.preventDefault()
        const htmlContent = markdownToHtml(text)
        if (editor) {
          editor.commands.insertContent(htmlContent)
        }
      }
    }
  }, [editor, markdownToHtml])

  // Handle import of content
  const handleImport = () => {
    if (!importText.trim()) return
    
    let content = importText
    if (importFormat === 'markdown') {
      content = markdownToHtml(content)
    }
    
    if (editor) {
      editor.commands.setContent(content)
      setShowImportModal(false)
      setImportText('')
    }
  }

  // Update editor props to include paste handler
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          ...editor.options.editorProps,
          handleDOMEvents: {
            paste: handlePaste
          }
        }
      })
    }
  }, [editor, handlePaste])

  useEffect(() => {
    if (editor && page.content !== editor.getHTML()) {
      editor.commands.setContent(page.content)
    }
  }, [page.content, editor])
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom
      const fontFamily = styles.fontFamily === 'serif' ? 'Georgia, serif' : 
                        styles.fontFamily === 'sans' ? 'Arial, sans-serif' : 
                        'Courier, monospace'
      
      // Batch style updates to reduce reflows
      editorElement.style.cssText = `
        font-family: ${fontFamily};
        font-size: ${styles.fontSize};
        line-height: ${styles.lineHeight};
        text-align: ${styles.textAlign};
        color: ${styles.color};
        background-color: ${styles.backgroundColor};
      `
    }
  }, [styles, editor])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  const addImage = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target.result
        editor.chain().focus().setImage({ src: url }).run()
      }
      reader.readAsDataURL(file)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="page-editor">      <div className="page-header">
        <input
          type="text"
          value={page.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="page-title-input"
          placeholder="Chapter Title"
        />
        <Comments
          comments={page.comments || []}
          onAddComment={(comment) => onUpdate({ 
            comments: [...(page.comments || []), comment] 
          })}
          onDeleteComment={(commentId) => onUpdate({ 
            comments: (page.comments || []).filter(c => c.id !== commentId) 
          })}
        />
      </div><div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <UnderlineIcon size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={editor.isActive('subscript') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <SubIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={editor.isActive('superscript') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <SuperIcon size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'toolbar-btn active' : 'toolbar-btn'}
          >
            <Quote size={16} />
          </button>
        </div>        <div className="toolbar-group">
          <button
            onClick={addImage}
            className="toolbar-btn"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="toolbar-btn"
            title="Import Markdown/HTML"
          >
            <FileText size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="toolbar-btn"
            disabled={!editor.can().undo()}
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="toolbar-btn"
            disabled={!editor.can().redo()}
          >
            <Redo size={16} />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="import-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="import-modal-header">
              <h3>Import Content</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowImportModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="import-format-selector">
              <label>
                <input
                  type="radio"
                  value="markdown"
                  checked={importFormat === 'markdown'}
                  onChange={(e) => setImportFormat(e.target.value)}
                />
                Markdown
              </label>
              <label>
                <input
                  type="radio"
                  value="html"
                  checked={importFormat === 'html'}
                  onChange={(e) => setImportFormat(e.target.value)}
                />
                HTML
              </label>
            </div>
            
            <textarea
              className="import-textarea"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Paste your ${importFormat === 'markdown' ? 'Markdown' : 'HTML'} content here...`}
              rows={10}
            />
            
            <div className="import-modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="import-btn" 
                onClick={handleImport}
                disabled={!importText.trim()}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PageEditor
