import { X, ChevronLeft, ChevronRight, Smartphone, Tablet, Monitor, BookOpen } from 'lucide-react'
import { useState } from 'react'
import './PreviewModal.css'

const PreviewModal = ({ book, styles, metadata, onClose }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [deviceType, setDeviceType] = useState('desktop')
  const currentPage = book.pages[currentPageIndex]

  const deviceSizes = {
    phone: { width: '375px', height: '667px', name: 'Phone', icon: Smartphone },
    tablet: { width: '768px', height: '1024px', name: 'Tablet', icon: Tablet },
    desktop: { width: '100%', height: 'auto', name: 'Desktop', icon: Monitor },
    ereader: { width: '600px', height: '800px', name: 'E-Reader', icon: BookOpen }
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
  }
  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-book-info">
            <h2>{book.title}</h2>
            <p>by {book.author}</p>
            {metadata?.description && (
              <p className="book-description">{metadata.description}</p>
            )}
          </div>
          
          <div className="device-selector">
            {Object.entries(deviceSizes).map(([key, device]) => {
              const IconComponent = device.icon
              return (
                <button
                  key={key}
                  onClick={() => setDeviceType(key)}
                  className={`device-btn ${deviceType === key ? 'active' : ''}`}
                  title={`Preview on ${device.name}`}
                >
                  <IconComponent size={16} />
                  <span>{device.name}</span>
                </button>
              )
            })}
          </div>
          
          <button onClick={onClose} className="preview-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="preview-content">
          <div className="preview-sidebar">
            <h3>Table of Contents</h3>
            <div className="preview-toc">
              {book.pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => goToPage(index)}
                  className={`preview-toc-item ${index === currentPageIndex ? 'active' : ''}`}
                >
                  <span className="toc-number">{index + 1}.</span>
                  <span className="toc-title">{page.title}</span>
                </button>
              ))}
            </div>
          </div>          <div className="preview-main">
            <div className="preview-navigation">
              <button
                onClick={prevPage}
                disabled={currentPageIndex === 0}
                className="nav-btn"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              
              <span className="page-indicator">
                {currentPageIndex + 1} of {book.pages.length}
              </span>
              
              <button
                onClick={nextPage}
                disabled={currentPageIndex === book.pages.length - 1}
                className="nav-btn"
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="preview-viewport">
              <div 
                className={`preview-device ${deviceType}`}
                style={{
                  width: deviceSizes[deviceType].width,
                  height: deviceSizes[deviceType].height,
                  maxWidth: deviceType === 'desktop' ? '100%' : deviceSizes[deviceType].width
                }}
              >
                <div className="preview-page">
                  <div
                    className="preview-page-content"
                    style={{
                      fontFamily: styles.fontFamily === 'serif' ? 'Georgia, serif' : 
                                 styles.fontFamily === 'sans' ? 'Arial, sans-serif' : 
                                 'Courier, monospace',
                      fontSize: styles.fontSize,
                      lineHeight: styles.lineHeight,
                      textAlign: styles.textAlign,
                      color: styles.color,
                      backgroundColor: styles.backgroundColor,
                    }}
                  >
                    <h1 className="preview-page-title">{currentPage.title}</h1>
                    <div 
                      className="preview-page-text"
                      dangerouslySetInnerHTML={{ __html: currentPage.content }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewModal
