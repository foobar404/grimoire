import { useState, useEffect, useRef } from 'react'
import { BookOpen, Plus, Eye, Settings, Info, Save, FolderOpen, CheckCircle, Download, Menu, X, Sparkles, TrendingUp, Focus, Clock } from 'lucide-react'
import PageEditor from './PageEditor'
import TableOfContents from './TableOfContents'
import StylePanel from './StylePanel'
import PreviewModal from './PreviewModal'
import MetadataPanel from './MetadataPanel'
import ValidationPanel from './ValidationPanel'
import KeyboardShortcuts from './KeyboardShortcuts'
import QuickActionsBar from './QuickActionsBar'
import WritingInsights from './WritingInsights'
import CelebrationToast from './CelebrationToast'
import { generateEPUB } from '../utils/epubGenerator'
import { saveProject, loadProject } from '../utils/exportUtils'
import { 
  calculateReadingTime, 
  formatReadingTime, 
  getWordCount, 
  updateWritingStreak, 
  getCelebrationMessage,
  getWritingInsights,
  getWritingStreak
} from '../utils/readingTimeUtils'
import './EbookCreator.css'

const EbookCreator = () => {  const [book, setBook] = useState({
    title: 'Untitled Book',
    author: 'Author Name',
    pages: [
      { 
        id: 1, 
        title: 'Chapter 1: Getting Started', 
        content: '<p>Welcome to your new book! This is your first chapter.</p><p>Click here to start writing your story, and watch as your ideas come to life. You can add formatting, images, and create as many chapters as you need.</p><p>When you\'re ready, use the Export button to create your professional EPUB file!</p>',
        comments: []
      }
    ]
  })
    const [metadata, setMetadata] = useState({
    title: 'Untitled Book',
    author: 'Author Name',
    description: '',
    genre: '',
    language: 'en',
    publisher: '',
    publishDate: '',
    isbn: '',
    series: '',
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
  const [isExporting, setIsExporting] = useState(false)
  const [distractionFreeMode, setDistractionFreeMode] = useState(false)
  const [showWritingInsights, setShowWritingInsights] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const [previousWordCount, setPreviousWordCount] = useState(0)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const currentEditorRef = useRef(null)

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
      if (book.title !== 'Untitled Book' && book.pages.length > 0) {
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

  // Load auto-save on mount and apply smart defaults
  useEffect(() => {
    // Load auto-save
    try {
      const autoSaveData = localStorage.getItem('autoSave')
      if (autoSaveData) {
        const saved = JSON.parse(autoSaveData)
        if (saved.book && saved.book.title !== 'Untitled Book') {
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

    // Apply smart defaults based on user's previous preferences
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}')
    if (userPreferences.favoriteGenre) {
      setMetadata(prev => ({ ...prev, genre: userPreferences.favoriteGenre }))
    }
    if (userPreferences.preferredTheme) {
      setStyles(prev => ({ ...prev, ...userPreferences.preferredTheme }))
    }
  }, [])

  // Track word count changes for celebrations
  useEffect(() => {
    const currentWordCount = getTotalWordCount()
    const celebration = getCelebrationMessage(currentWordCount, previousWordCount)
    
    if (celebration && currentWordCount > previousWordCount) {
      setCelebrationMessage(celebration.message)
      updateWritingStreak() // Update streak when user writes
    }
    
    setPreviousWordCount(currentWordCount)
  }, [book.pages])

  // Save user preferences for smart defaults
  useEffect(() => {
    const preferences = {
      favoriteGenre: metadata.genre,
      preferredTheme: {
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        color: styles.color,
        backgroundColor: styles.backgroundColor
      }
    }
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
  }, [metadata.genre, styles.fontFamily, styles.fontSize, styles.color, styles.backgroundColor])

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
          case 'f':
            e.preventDefault()
            setDistractionFreeMode(!distractionFreeMode)
            break
          case 'z':
            if (e.shiftKey) {
              e.preventDefault()
              handleRedo()
            } else {
              e.preventDefault()
              handleUndo()
            }
            break
          default:
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [book, styles, metadata, showStylePanel, showMetadataPanel, currentPageId])

  const addNewPage = () => {
    // Save current state for undo
    saveToUndoStack()
    
    const newId = Math.max(...book.pages.map(p => p.id)) + 1
    
    // Smart chapter title suggestions
    const chapterTemplates = [
      `Chapter ${newId}`,
      `Chapter ${newId}: The Journey Continues`,
      `Part ${newId}`,
      `Section ${newId}`,
      // Genre-specific suggestions
      ...(metadata.genre?.toLowerCase().includes('fiction') ? [
        `Chapter ${newId}: A New Adventure`,
        `Chapter ${newId}: The Plot Thickens`
      ] : []),
      ...(metadata.genre?.toLowerCase().includes('non-fiction') ? [
        `Chapter ${newId}: Key Concepts`,
        `Section ${newId}: Implementation`
      ] : [])
    ]
    
    const suggestedTitle = chapterTemplates[Math.floor(Math.random() * Math.min(chapterTemplates.length, 4))]
    
    const newPage = {
      id: newId,
      title: suggestedTitle,
      content: '<p>Begin writing your next chapter here...</p>',
      comments: []
    }
    setBook(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }))
    setCurrentPageId(newId)
  }

  const duplicateCurrentPage = () => {
    saveToUndoStack()
    
    const currentPage = book.pages.find(page => page.id === currentPageId)
    if (currentPage) {
      const newId = Math.max(...book.pages.map(p => p.id)) + 1
      const duplicatedPage = {
        ...currentPage,
        id: newId,
        title: `${currentPage.title} (Copy)`,
        comments: []
      }
      setBook(prev => ({
        ...prev,
        pages: [...prev.pages, duplicatedPage]
      }))
      setCurrentPageId(newId)
    }
  }

  const updatePage = (pageId, updates) => {
    // Only save to undo stack for content changes, not every keystroke
    if (updates.content && updates.content !== book.pages.find(p => p.id === pageId)?.content) {
      saveToUndoStack()
    }
    
    setBook(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === pageId ? { ...page, ...updates } : page
      )
    }))
  }

  // Undo/Redo functionality
  const saveToUndoStack = () => {
    setUndoStack(prev => {
      const newStack = [...prev, { book, styles, metadata }]
      return newStack.slice(-20) // Keep only last 20 states
    })
    setRedoStack([]) // Clear redo stack when new action is performed
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    
    const previousState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, { book, styles, metadata }])
    setUndoStack(prev => prev.slice(0, -1))
    
    setBook(previousState.book)
    setStyles(previousState.styles)
    setMetadata(previousState.metadata)
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    
    const nextState = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, { book, styles, metadata }])
    setRedoStack(prev => prev.slice(0, -1))
    
    setBook(nextState.book)
    setStyles(nextState.styles)
    setMetadata(nextState.metadata)
  }

  const deletePage = (pageId) => {
    // Don't allow deleting the last page
    if (book.pages.length <= 1) {
      alert('📚 You need at least one chapter in your book!')
      return
    }

    saveToUndoStack()
    
    const pageToDelete = book.pages.find(page => page.id === pageId)
    if (pageToDelete && window.confirm(`Are you sure you want to delete "${pageToDelete.title}"?`)) {
      const newPages = book.pages.filter(page => page.id !== pageId)
      setBook(prev => ({
        ...prev,
        pages: newPages
      }))
      
      // If we deleted the current page, switch to the first available page
      if (currentPageId === pageId) {
        setCurrentPageId(newPages[0].id)
      }
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
      // Smart export naming with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const version = localStorage.getItem(`${book.title}_version`) || '1.0'
      const smartName = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${version}_${timestamp}`
      
      saveProject(book, styles, metadata, smartName)
      
      // Increment version for next save
      const nextVersion = parseFloat(version) + 0.1
      localStorage.setItem(`${book.title}_version`, nextVersion.toFixed(1))
      
      setAutoSaveStatus('Project saved!')
      setTimeout(() => setAutoSaveStatus(''), 2000)
    } catch (error) {
      alert('Failed to save project: ' + error.message)
    }
  }

  const handleExportEPUB = async () => {
    try {
      setIsExporting(true)
      
      // Enhanced validation with better messages
      if (!book.title || book.title.trim() === '' || book.title === 'My Book' || book.title === 'Untitled Book') {
        setAutoSaveStatus('📚 Please set a custom book title first')
        setTimeout(() => setAutoSaveStatus(''), 3000)
        return
      }
      
      if (!book.author || book.author.trim() === '' || book.author === 'Author Name') {
        setAutoSaveStatus('✍️ Please set an author name first')
        setTimeout(() => setAutoSaveStatus(''), 3000)
        return
      }

      if (!book.pages || book.pages.length === 0) {
        setAutoSaveStatus('📝 Add at least one chapter first')
        setTimeout(() => setAutoSaveStatus(''), 3000)
        return
      }

      // Check if any pages have content
      const hasContent = book.pages.some(page => 
        page.content && page.content.replace(/<[^>]*>/g, '').trim().length > 0
      )
      
      if (!hasContent) {
        setAutoSaveStatus('📄 Add some content to your chapters first')
        setTimeout(() => setAutoSaveStatus(''), 3000)
        return
      }

      // Show progress updates
      setAutoSaveStatus('📚 Preparing your book...')
      
      // Smart export naming
      const timestamp = new Date().toISOString().split('T')[0]
      const sanitizedTitle = book.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
      const exportName = `${sanitizedTitle}_${timestamp}`

      // Merge book data with metadata for export
      const exportData = {
        ...book,
        title: metadata.title || book.title,
        author: metadata.author || book.author,
        description: metadata.description || '',
        genre: metadata.genre || '',
        language: metadata.language || 'en',
        publisher: metadata.publisher || '',
        publishDate: metadata.publishDate || new Date().toISOString().split('T')[0],
        isbn: metadata.isbn || '',
        series: metadata.series || '',
        copyright: metadata.copyright || `Copyright © ${new Date().getFullYear()} ${metadata.author || book.author}`,
        coverImage: metadata.coverImage,
        exportName: exportName
      }

      setAutoSaveStatus('🔧 Building chapters...')
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UX
      
      setAutoSaveStatus('🎨 Applying styles...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setAutoSaveStatus('📖 Creating EPUB...')
      await generateEPUB(exportData, styles)
      
      setAutoSaveStatus('🎉 Export complete!')
      setTimeout(() => setAutoSaveStatus(''), 3000)
      
      // Show celebration
      setCelebrationMessage(`🎉 Your book "${book.title}" has been exported successfully!`)
      
    } catch (error) {
      console.error('Export failed:', error)
      
      let errorMessage = 'Export failed. Please try again.'
      
      if (error.message.includes('Missing required book data')) {
        errorMessage = '❌ Missing required information. Please check your book details.'
      } else if (error.message.includes('JSZip')) {
        errorMessage = '❌ Export library error. Please refresh and try again.'
      }
      
      setAutoSaveStatus(errorMessage)
      setTimeout(() => setAutoSaveStatus(''), 4000)
    } finally {
      setIsExporting(false)
    }
  }

  // Enhanced word count and reading time functions
  const getTotalWordCount = () => {
    return book.pages.reduce((total, page) => {
      return total + getWordCount(page.content)
    }, 0)
  }

  const getTotalReadingTime = () => {
    return book.pages.reduce((total, page) => {
      return total + calculateReadingTime(page.content)
    }, 0)
  }

  const getPageReadingTime = (pageId) => {
    const page = book.pages.find(p => p.id === pageId)
    return page ? calculateReadingTime(page.content) : 0
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
              onClick={() => {
                setShowPreview(true)
                setShowMobileMenu(false)
              }}
              className="action-btn"
              title="Preview Book (Ctrl+P)"
            >
              <Eye size={18} />
              <span>Preview</span>
            </button>
            
            <button 
              onClick={async () => {
                await handleExportEPUB()
                setShowMobileMenu(false)
              }}
              className={`action-btn export-btn ${isExporting ? 'loading' : ''}`}
              title="Export EPUB 3.0 (Ctrl+E)"
              disabled={isExporting}
            >
              {!isExporting && <Download size={18} />}
              <span>{isExporting ? 'Exporting...' : 'Export EPUB'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className={`main-content ${distractionFreeMode ? 'distraction-free' : ''}`}>
        {!distractionFreeMode && (
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
                getReadingTime={getPageReadingTime}
              />
            </div>
          </aside>
        )}

        <main className="editor-area">
          <PageEditor
            page={currentPage}
            onUpdate={(updates) => updatePage(currentPage.id, updates)}
            styles={styles}
            distractionFreeMode={distractionFreeMode}
            onToggleDistractionFree={() => setDistractionFreeMode(!distractionFreeMode)}
            ref={currentEditorRef}
          />
          
          {/* Quick Actions Bar */}
          <QuickActionsBar
            editor={currentEditorRef.current}
            onAddChapter={addNewPage}
            onSave={handleSaveProject}
            onExport={handleExportEPUB}
            currentPage={currentPage}
          />
        </main>

        {!distractionFreeMode && showStylePanel && (
          <aside className="style-panel">
            <StylePanel
              styles={styles}
              onStyleChange={setStyles}
              onClose={() => setShowStylePanel(false)}
            />
          </aside>
        )}

        {!distractionFreeMode && showMetadataPanel && (
          <aside className="metadata-panel-container">
            <MetadataPanel
              metadata={metadata}
              onMetadataChange={setMetadata}
              onClose={() => setShowMetadataPanel(false)}
            />
          </aside>
        )}

        {!distractionFreeMode && showValidationPanel && (
          <aside className="validation-panel-container">
            <ValidationPanel
              book={book}
              metadata={metadata}
              onClose={() => setShowValidationPanel(false)}
            />
          </aside>
        )}
      </div>

      {/* Modals and Overlays */}
      {showPreview && (
        <PreviewModal
          book={book}
          styles={styles}
          metadata={metadata}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Footer with stats and utilities */}
      {!distractionFreeMode && (
        <footer className="app-footer">
          <div className="footer-left">
            <KeyboardShortcuts />
            {autoSaveStatus && <span className="auto-save-status">{autoSaveStatus}</span>}
          </div>
          
          <div className="footer-stats">
            <span className="word-count" title={`Average ${Math.round(getTotalWordCount() / book.pages.length)} words per chapter`}>
              <Clock size={12} />
              {getTotalWordCount().toLocaleString()} words
            </span>
            <span className="reading-time" title={`${book.pages.length} chapters • ${getTotalWordCount() >= 50000 ? '📚 Novel length!' : getTotalWordCount() >= 10000 ? '📖 Novella territory!' : getTotalWordCount() >= 1000 ? '📝 Strong progress!' : '🌱 Growing!'}`}>
              📖 {formatReadingTime(getTotalReadingTime())}
            </span>
            {getWritingStreak().currentStreak > 0 && (
              <span className="writing-streak" title={`You've written for ${getWritingStreak().currentStreak} consecutive days!`}>
                🔥 {getWritingStreak().currentStreak} day streak
              </span>
            )}
          </div>
        </footer>
      )}

      {/* Modals and Overlays */}
      {showPreview && (
        <PreviewModal
          book={book}
          styles={styles}
          metadata={metadata}
          onClose={() => setShowPreview(false)}
        />
      )}

      {celebrationMessage && (
        <CelebrationToast
          message={celebrationMessage}
          onClose={() => setCelebrationMessage('')}
        />
      )}
    </div>
  )
}

export default EbookCreator
