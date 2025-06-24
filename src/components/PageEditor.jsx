import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Undo, Redo, Image as ImageIcon, Subscript as SubIcon, Superscript as SuperIcon } from 'lucide-react'
import { useEffect, useRef, useCallback } from 'react'
import Comments from './Comments'
import './PageEditor.css'

const PageEditor = ({ page, onUpdate, styles }) => {
  const fileInputRef = useRef(null)
  const updateTimeoutRef = useRef(null)
  
  // Debounced update function to reduce typing lag
  const debouncedUpdate = useCallback((updates) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate(updates)
    }, 300) // 300ms debounce
  }, [onUpdate])
  
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
    ],    content: page.content,
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
      },
    },
  })

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
        </div>

        <div className="toolbar-group">
          <button
            onClick={addImage}
            className="toolbar-btn"
            title="Insert Image"
          >
            <ImageIcon size={16} />
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
      </div>

      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default PageEditor
