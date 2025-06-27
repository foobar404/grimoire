import { X, ChevronLeft, ChevronRight, Menu, Settings, Smartphone, Tablet, Monitor } from 'lucide-react'
import { useState } from 'react'
import './PreviewModal.css'

const PreviewModal = ({ book, styles, metadata, onClose }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [showToc, setShowToc] = useState(false)
  const [devicePreset, setDevicePreset] = useState('tablet') // phone, tablet, desktop
  const currentPage = book.pages[currentPageIndex]

  const devicePresets = {
    phone: { width: '375px', height: '812px', name: 'Phone' },
    tablet: { width: '768px', height: '1024px', name: 'Tablet' },
    desktop: { width: '100%', height: '100%', name: 'Desktop' }
  }

  const nextPage = () => {
    if (currentPageIndex < book.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  const goToPage = (index) => {
    setCurrentPageIndex(index)
    setShowToc(false)
  }

  const toggleToc = () => {
    setShowToc(!showToc)
  }

  const currentDevice = devicePresets[devicePreset]
  
  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div 
        className={`preview-modal device-${devicePreset}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="preview-header">
          <div className="preview-book-info">
            <h2>{book.title}</h2>
            <p>by {book.author}</p>
          </div>
          
          <div className="preview-controls">
            <div className="device-selector">
              <button
                onClick={() => setDevicePreset('phone')}
                className={`device-btn ${devicePreset === 'phone' ? 'active' : ''}`}
                title="Phone view"
              >
                <Smartphone size={12} />
              </button>
              <button
                onClick={() => setDevicePreset('tablet')}
                className={`device-btn ${devicePreset === 'tablet' ? 'active' : ''}`}
                title="Tablet view"
              >
                <Tablet size={12} />
              </button>
              <button
                onClick={() => setDevicePreset('desktop')}
                className={`device-btn ${devicePreset === 'desktop' ? 'active' : ''}`}
                title="Desktop view"
              >
                <Monitor size={12} />
              </button>
            </div>
            
            <button onClick={toggleToc} className="control-btn" title="Contents">
              <Menu size={16} />
            </button>
            
            <button onClick={onClose} className="control-btn close-btn" title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Table of Contents Overlay */}
        {showToc && (
          <div className="toc-overlay" onClick={() => setShowToc(false)}>
            <div className="toc-panel" onClick={(e) => e.stopPropagation()}>
              <div className="preview-toc-header">
                <h3>Table of Contents</h3>
                <button onClick={() => setShowToc(false)} className="toc-close">
                  <X size={18} />
                </button>
              </div>
              <div className="toc-list">
                {book.pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => goToPage(index)}
                    className={`toc-item ${index === currentPageIndex ? 'active' : ''}`}
                  >
                    <span className="toc-number">{index + 1}</span>
                    <span className="toc-title">{page.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Reading Area */}
        <div className="preview-reader">
          {/* Navigation Areas */}
          <button 
            onClick={prevPage}
            disabled={currentPageIndex === 0}
            className="page-nav page-nav-left"
            aria-label="Previous page"
          />
          
          <button 
            onClick={nextPage}
            disabled={currentPageIndex === book.pages.length - 1}
            className="page-nav page-nav-right"
            aria-label="Next page"
          />

          {/* Page Content */}
          <div className="reader-content">
            <div className="reader-page">
              <h1 className="chapter-title">{currentPage.title}</h1>
              <div 
                className="chapter-content"
                style={{
                  fontFamily: styles.fontFamily === 'serif' ? 'Charter, Georgia, serif' : 
                             styles.fontFamily === 'sans' ? 'system-ui, -apple-system, sans-serif' : 
                             'ui-monospace, monospace',
                  fontSize: styles.fontSize,
                  lineHeight: styles.lineHeight,
                  textAlign: styles.textAlign,
                }}
                dangerouslySetInnerHTML={{ __html: currentPage.content }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="reading-progress">
            <div className="progress-info">
              <span>{currentPageIndex + 1} of {book.pages.length}</span>
              <span>{Math.round(((currentPageIndex + 1) / book.pages.length) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{
                  width: `${((currentPageIndex + 1) / book.pages.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewModal
