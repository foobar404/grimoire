import { useState, useEffect } from 'react'
import { BookOpen, Plus, Eye, Settings, Info, Save, FolderOpen, CheckCircle, Download, Menu, X, Sparkles } from 'lucide-react'
import PageEditor from './PageEditor'
import TableOfContents from './TableOfContents'
import StylePanel from './StylePanel'
import PreviewModal from './PreviewModal'
import MetadataPanel from './MetadataPanel'
import ValidationPanel from './ValidationPanel'
import KeyboardShortcuts from './KeyboardShortcuts'
import { generateEPUB } from '../utils/epubGenerator'
import { saveProject, loadProject } from '../utils/exportUtils'
import './EbookCreator.css'

const EbookCreator = () => {  const [book, setBook] = useState({
    title: 'My Book',
    author: 'Author Name',
    pages: [
      { 
        id: 1, 
        title: 'Chapter 1', 
        content: '<p>Start writing your story here...</p>',
        comments: []
      }
    ]
  })
  
  const [metadata, setMetadata] = useState({
    title: 'My Book',
    author: 'Author Name',
    description: '',
    genre: '',
    language: 'en',
    publisher: '',
    publishDate: '',
    isbn: '',    series: '',
    copyright: '',
    coverImage: null
  })
  
  const [currentPageId, setCurrentPageId] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [showMetadataPanel, setShowMetadataPanel] = useState(false)
  const [showValidationPanel, setShowValidationPanel] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const [styles, setStyles] = useState({
    fontFamily: 'serif',
    fontSize: '16px',
    lineHeight: '1.6',
    textAlign: 'left',
    color: '#333333',
    backgroundColor: '#ffffff'
  })

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (book.title !== 'My Book' && book.pages.length > 0) {
        try {
          localStorage.setItem('autoSave', JSON.stringify({ book, styles, metadata, timestamp: Date.now() }))
          setAutoSaveStatus('Auto-saved')
          setTimeout(() => setAutoSaveStatus(''), 2000)
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSave)
  }, [book, styles, metadata])

  // Load auto-save on mount
  useEffect(() => {
    try {
      const autoSaveData = localStorage.getItem('autoSave')
      if (autoSaveData) {
        const saved = JSON.parse(autoSaveData)
        if (saved.book && saved.book.title !== 'My Book') {
          const shouldRestore = window.confirm('Found auto-saved work. Would you like to restore it?')
          if (shouldRestore) {
            setBook(saved.book)
            setStyles(saved.styles || styles)
            setMetadata(saved.metadata || metadata)
            if (saved.book.pages?.length > 0) {
              setCurrentPageId(saved.book.pages[0].id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load auto-save:', error)
    }
  }, [])
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSaveProject()
            break
          case 'e':
            e.preventDefault()
            handleExportEPUB()
            break
          case 'p':
            e.preventDefault()
            setShowPreview(true)
            break
          case 'n':
            e.preventDefault()
            addNewPage()
            break
          case 'd':
            e.preventDefault()
            duplicateCurrentPage()
            break
          case '1':
            e.preventDefault()
            setShowStylePanel(!showStylePanel)
            break
          case '2':
            e.preventDefault()
            setShowMetadataPanel(!showMetadataPanel)
            break
          default:
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [book, styles, metadata, showStylePanel, showMetadataPanel, currentPageId])

  const addNewPage = () => {    const newId = Math.max(...book.pages.map(p => p.id)) + 1
    const newPage = {
      id: newId,
      title: `Chapter ${newId}`,
      content: '<p>New chapter content...</p>',
      comments: []
    }
    setBook(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }))
    setCurrentPageId(newId)
  }

  const duplicateCurrentPage = () => {
    const currentPage = book.pages.find(page => page.id === currentPageId)
    if (currentPage) {
      const newId = Math.max(...book.pages.map(p => p.id)) + 1
      const duplicatedPage = {
        ...currentPage,
        id: newId,
        title: `${currentPage.title} (Copy)`,
        comments: [] // Start with no comments for duplicated page
      }
      setBook(prev => ({
        ...prev,
        pages: [...prev.pages, duplicatedPage]
      }))
      setCurrentPageId(newId)
    }
  }

  const updatePage = (pageId, updates) => {
    setBook(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === pageId ? { ...page, ...updates } : page
      )
    }))
  }

  const deletePage = (pageId) => {
    if (book.pages.length <= 1) return // Don't delete the last page
    
    setBook(prev => ({
      ...prev,
      pages: prev.pages.filter(page => page.id !== pageId)
    }))
    
    // If we deleted the current page, switch to the first available page
    if (currentPageId === pageId) {
      const remainingPages = book.pages.filter(page => page.id !== pageId)
      setCurrentPageId(remainingPages[0]?.id || 1)
    }
  }
  const updateBookInfo = (field, value) => {
    setBook(prev => ({
      ...prev,
      [field]: value
    }))
    // Also update metadata
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLoadProject = async () => {
    try {
      const project = await loadProject()
      if (project.book) setBook(project.book)
      if (project.styles) setStyles(project.styles)
      if (project.metadata) setMetadata(project.metadata)
      if (project.book?.pages?.length > 0) {
        setCurrentPageId(project.book.pages[0].id)
      }
      alert('Project loaded successfully!')
    } catch (error) {
      alert('Failed to load project: ' + error.message)
    }
  }

  const handleSaveProject = () => {
    try {
      saveProject(book, styles, metadata)
      alert('Project saved successfully!')    } catch (error) {
      alert('Failed to save project: ' + error.message)
    }
  }

  const handleExportEPUB = async () => {
    try {
      await generateEPUB({ ...book, ...metadata }, styles)
      alert('EPUB 3.0 exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const getWordCount = () => {
    return book.pages.reduce((total, page) => {
      const textContent = page.content.replace(/<[^>]*>/g, ' ').trim()
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
      return total + wordCount
    }, 0)
  }

  const currentPage = book.pages.find(page => page.id === currentPageId) || book.pages[0]

  return (
    <div className="ebook-creator">      <header className="header">
        <div className="header-left">
          <div className="logo">
            <Sparkles size={24} className="logo-icon" />
            <span className="logo-text">Grimoire</span>
          </div>
          <input
            type="text"
            value={book.title}
            onChange={(e) => updateBookInfo('title', e.target.value)}
            className="book-title-input"
            placeholder="Book Title"
          />
          <span className="author-text">by</span>
          <input
            type="text"
            value={book.author}
            onChange={(e) => updateBookInfo('author', e.target.value)}
            className="author-input"
            placeholder="Author Name"
          />
        </div>        <div className="header-actions">
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu size={18} />
          </button>
          
          <div className={`header-actions-content ${showMobileMenu ? 'mobile-open' : ''}`}>
            {showMobileMenu && (
              <button 
                className="mobile-close-btn"
                onClick={() => setShowMobileMenu(false)}
              >
                <X size={18} />
              </button>
            )}
            
            <button 
              onClick={handleLoadProject}
              className="action-btn"
              title="Load Project"
            >
              <FolderOpen size={18} />
              <span>Load</span>
            </button>
            <button 
              onClick={handleSaveProject}
              className="action-btn"
              title="Save Project"
            >
              <Save size={18} />
              <span>Save</span>
            </button>
            <button 
              onClick={() => setShowMetadataPanel(!showMetadataPanel)}
              className="action-btn"
              title="Book Metadata"
            >
              <Info size={18} />
              <span>Info</span>
            </button>
            <button 
              onClick={() => setShowValidationPanel(!showValidationPanel)}
              className="action-btn"
              title="Publishing Readiness Check"
            >
              <CheckCircle size={18} />
              <span>Check</span>
            </button>
            <button 
              onClick={() => setShowStylePanel(!showStylePanel)}
              className="action-btn"
              title="Style Settings"
            >
              <Settings size={18} />
              <span>Style</span>
            </button>
            <button 
              onClick={() => setShowPreview(true)}
              className="action-btn"
              title="Preview Book (Ctrl+P)"
            >
              <Eye size={18} />
              <span>Preview</span>
            </button>
            
            <button 
              onClick={handleExportEPUB}
              className="action-btn export-btn"
              title="Export EPUB 3.0 (Ctrl+E)"
            >
              <Download size={18} />
              <span>Export EPUB</span>
            </button>
          </div>
            <div className="header-stats">
            {autoSaveStatus && <span className="auto-save-status">{autoSaveStatus}</span>}
            <span className="word-count">{getWordCount()} words</span>
          </div>
          
          <KeyboardShortcuts />
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>Table of Contents</h3>
              <button onClick={addNewPage} className="add-page-btn" title="Add New Chapter">
                <Plus size={16} />
              </button>
            </div>
            <TableOfContents
              pages={book.pages}
              currentPageId={currentPageId}
              onPageSelect={setCurrentPageId}
              onPageUpdate={updatePage}
              onPageDelete={deletePage}
            />
          </div>
        </aside>

        <main className="editor-area">
          <PageEditor
            page={currentPage}
            onUpdate={(updates) => updatePage(currentPage.id, updates)}
            styles={styles}
          />
        </main>        {showStylePanel && (
          <aside className="style-panel">
            <StylePanel
              styles={styles}
              onStyleChange={setStyles}
              onClose={() => setShowStylePanel(false)}
            />
          </aside>
        )}{showMetadataPanel && (
          <aside className="metadata-panel-container">
            <MetadataPanel
              metadata={metadata}
              onMetadataChange={setMetadata}
              onClose={() => setShowMetadataPanel(false)}
            />
          </aside>
        )}

        {showValidationPanel && (
          <aside className="validation-panel-container">
            <ValidationPanel
              book={book}
              metadata={metadata}
              onClose={() => setShowValidationPanel(false)}
            />
          </aside>
        )}
      </div>      {showPreview && (
        <PreviewModal
          book={book}
          styles={styles}
          metadata={metadata}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

export default EbookCreator
