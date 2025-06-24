import { BookOpen, User, Calendar, FileText, Image as ImageIcon, X } from 'lucide-react'
import { useRef } from 'react'
import './MetadataPanel.css'

const MetadataPanel = ({ metadata, onMetadataChange, onClose }) => {
  const coverInputRef = useRef(null)

  const updateMetadata = (field, value) => {
    onMetadataChange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCoverUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateMetadata('coverImage', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCover = () => {
    updateMetadata('coverImage', null)
  }

  return (
    <div className="metadata-panel">
      <div className="metadata-panel-header">
        <h3>
          <BookOpen size={18} />
          Book Metadata
        </h3>
        <button onClick={onClose} className="close-btn">
          <X size={18} />
        </button>
      </div>

      <div className="metadata-panel-content">
        <div className="metadata-section">
          <h4>Basic Information</h4>
          
          <div className="metadata-group">
            <label>Book Title</label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => updateMetadata('title', e.target.value)}
              className="metadata-input"
              placeholder="Enter book title"
            />
          </div>

          <div className="metadata-group">
            <label>Author</label>
            <input
              type="text"
              value={metadata.author}
              onChange={(e) => updateMetadata('author', e.target.value)}
              className="metadata-input"
              placeholder="Enter author name"
            />
          </div>

          <div className="metadata-group">
            <label>Description</label>
            <textarea
              value={metadata.description || ''}
              onChange={(e) => updateMetadata('description', e.target.value)}
              className="metadata-textarea"
              placeholder="Enter book description or blurb"
              rows={4}
            />
          </div>

          <div className="metadata-row">
            <div className="metadata-group">
              <label>Genre</label>
              <input
                type="text"
                value={metadata.genre || ''}
                onChange={(e) => updateMetadata('genre', e.target.value)}
                className="metadata-input"
                placeholder="e.g., Fiction, Non-fiction"
              />
            </div>
            <div className="metadata-group">
              <label>Language</label>
              <select
                value={metadata.language || 'en'}
                onChange={(e) => updateMetadata('language', e.target.value)}
                className="metadata-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>
        </div>

        <div className="metadata-section">
          <h4>Cover Image</h4>
          
          <div className="cover-upload-area">
            {metadata.coverImage ? (
              <div className="cover-preview">
                <img src={metadata.coverImage} alt="Book cover" className="cover-image" />
                <div className="cover-actions">
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="cover-btn primary"
                  >
                    Change Cover
                  </button>
                  <button
                    onClick={removeCover}
                    className="cover-btn secondary"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="cover-placeholder" onClick={() => coverInputRef.current?.click()}>
                <ImageIcon size={48} />
                <p>Click to upload cover image</p>
                <span>Recommended: 600x900px</span>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <div className="metadata-section">
          <h4>Publishing Details</h4>
          
          <div className="metadata-row">
            <div className="metadata-group">
              <label>Publisher</label>
              <input
                type="text"
                value={metadata.publisher || ''}
                onChange={(e) => updateMetadata('publisher', e.target.value)}
                className="metadata-input"
                placeholder="Publisher name (required for stores)"
              />
              <small className="field-help">Required by Amazon KDP and Google Play</small>
            </div>
            <div className="metadata-group">
              <label>Publication Date</label>
              <input
                type="date"
                value={metadata.publishDate || ''}
                onChange={(e) => updateMetadata('publishDate', e.target.value)}
                className="metadata-input"
              />
              <small className="field-help">Defaults to today if not set</small>
            </div>
          </div>

          <div className="metadata-row">
            <div className="metadata-group">
              <label>ISBN (Optional)</label>
              <input
                type="text"
                value={metadata.isbn || ''}
                onChange={(e) => updateMetadata('isbn', e.target.value)}
                className="metadata-input"
                placeholder="978-0-000-00000-0"
                pattern="^(97[89])-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$"
              />
              <small className="field-help">Format: 978-0-123-45678-9 (optional but recommended)</small>
            </div>
            <div className="metadata-group">
              <label>Series</label>
              <input
                type="text"
                value={metadata.series || ''}
                onChange={(e) => updateMetadata('series', e.target.value)}
                className="metadata-input"
                placeholder="Series name"
              />
              <small className="field-help">If this book is part of a series</small>
            </div>
          </div>

          <div className="metadata-group">
            <label>Content Warning (if applicable)</label>
            <textarea
              value={metadata.contentWarning || ''}
              onChange={(e) => updateMetadata('contentWarning', e.target.value)}
              className="metadata-textarea"
              placeholder="Any content warnings or age restrictions"
              rows={2}
            />
            <small className="field-help">Important for store approval and reader expectations</small>
          </div>
        </div>

        <div className="metadata-section">
          <h4>Copyright</h4>
          
          <div className="metadata-group">
            <label>Copyright Notice</label>
            <textarea
              value={metadata.copyright || `© ${new Date().getFullYear()} ${metadata.author || '[Author Name]'}. All rights reserved.`}
              onChange={(e) => updateMetadata('copyright', e.target.value)}
              className="metadata-textarea"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetadataPanel
