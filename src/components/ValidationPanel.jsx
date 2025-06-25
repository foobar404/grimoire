import { CheckCircle, XCircle, AlertCircle, Info, X, ShieldCheck } from 'lucide-react'
import './ValidationPanel.css'

const ValidationPanel = ({ book, metadata, onClose }) => {  const checks = [
    {
      id: 'title',
      label: 'Book Title',
      status: book.title && book.title.trim().length > 0 ? 'pass' : 'fail',
      message: book.title ? 'Title is set' : 'Title is required',
      required: true
    },
    {
      id: 'author',
      label: 'Author Name',
      status: book.author && book.author.trim().length > 0 ? 'pass' : 'fail',
      message: book.author ? 'Author is set' : 'Author name is required',
      required: true
    },
    {
      id: 'description',
      label: 'Book Description',
      status: metadata.description && metadata.description.trim().length >= 150 ? 'pass' : 
              metadata.description && metadata.description.trim().length >= 20 ? 'warning' : 'fail',
      message: !metadata.description ? 'Description is required for store listings' :
               metadata.description.length < 20 ? 'Description should be at least 20 characters' :
               metadata.description.length < 150 ? 'Description should be 150-300 words for better discovery' :
               'Description looks good',
      required: true
    },
    {
      id: 'cover',
      label: 'Cover Image',
      status: metadata.coverImage ? 'pass' : 'fail',
      message: metadata.coverImage ? 'Cover image is set' : 'Cover image is required for Amazon KDP and Google Play Books',
      required: true
    },
    {
      id: 'genre',
      label: 'Genre/Category',
      status: metadata.genre && metadata.genre.trim().length > 0 ? 'pass' : 'fail',
      message: metadata.genre ? 'Genre is set' : 'Genre/category is required for store categorization',
      required: true
    },
    {
      id: 'publisher',
      label: 'Publisher',
      status: metadata.publisher && metadata.publisher.trim().length > 0 ? 'pass' : 'warning',
      message: metadata.publisher ? 'Publisher is set' : 'Publisher name recommended for professional appearance',
      required: false
    },    {
      id: 'chapters',
      label: 'Content Length',
      status: (() => {
        if (!book.pages || book.pages.length === 0) return 'fail'
        const totalWords = book.pages.reduce((total, page) => {
          const textContent = page.content.replace(/<[^>]*>/g, ' ').trim()
          const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
          return total + wordCount
        }, 0)
        if (totalWords < 1000) return 'warning'
        return 'pass'
      })(),
      message: (() => {
        if (!book.pages || book.pages.length === 0) return 'At least one chapter is required'
        const totalWords = book.pages.reduce((total, page) => {
          const textContent = page.content.replace(/<[^>]*>/g, ' ').trim()
          const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
          return total + wordCount
        }, 0)
        if (totalWords < 1000) return `${totalWords} words - Consider adding more content (1000+ words recommended)`
        return `${book.pages.length} chapter${book.pages.length > 1 ? 's' : ''}, ~${totalWords} words`
      })(),
      required: true
    },
    {
      id: 'isbn',
      label: 'ISBN',
      status: metadata.isbn ? 
              /^(97[89])-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$/.test(metadata.isbn.replace(/[^0-9]/g, '')) ? 'pass' : 'warning' :
              'info',
      message: !metadata.isbn ? 'ISBN is optional but recommended for professional publishing' :
               /^(97[89])-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$/.test(metadata.isbn.replace(/[^0-9]/g, '')) ? 'ISBN format is valid' :
               'ISBN format may be invalid',
      required: false
    },
    {
      id: 'copyright',
      label: 'Copyright Information',
      status: metadata.copyright && metadata.copyright.trim().length > 10 ? 'pass' : 'warning',
      message: metadata.copyright ? 'Copyright notice is set' : 'Copyright notice recommended for legal protection',
      required: false
    },    {
      id: 'language',
      label: 'Language Setting',
      status: metadata.language ? 'pass' : 'warning',
      message: metadata.language ? `Language set to ${metadata.language}` : 'Language setting helps with international distribution',
      required: false
    },
    {
      id: 'formatQuality',
      label: 'Format Quality',
      status: (() => {
        if (!book.pages || book.pages.length === 0) return 'fail'
        // Check if chapters have proper titles
        const hasGoodTitles = book.pages.every(page => page.title && page.title.trim().length > 0)
        // Check if content has proper structure (not just empty paragraphs)
        const hasGoodContent = book.pages.every(page => {
          const textContent = page.content.replace(/<[^>]*>/g, ' ').trim()
          return textContent.length > 10
        })
        if (hasGoodTitles && hasGoodContent) return 'pass'
        if (hasGoodTitles || hasGoodContent) return 'warning'
        return 'fail'
      })(),
      message: (() => {
        if (!book.pages || book.pages.length === 0) return 'No content to validate'
        const hasGoodTitles = book.pages.every(page => page.title && page.title.trim().length > 0)
        const hasGoodContent = book.pages.every(page => {
          const textContent = page.content.replace(/<[^>]*>/g, ' ').trim()
          return textContent.length > 10
        })
        if (hasGoodTitles && hasGoodContent) return 'All chapters have proper titles and content'
        if (!hasGoodTitles && !hasGoodContent) return 'Chapters need proper titles and content'
        if (!hasGoodTitles) return 'Some chapters need proper titles'
        return 'Some chapters need more content'
      })(),
      required: false
    }
  ]

  const passCount = checks.filter(check => check.status === 'pass').length
  const failCount = checks.filter(check => check.status === 'fail').length
  const warningCount = checks.filter(check => check.status === 'warning').length

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={16} className="status-icon pass" />
      case 'fail':
        return <XCircle size={16} className="status-icon fail" />
      case 'warning':
        return <AlertCircle size={16} className="status-icon warning" />
      default:
        return <Info size={16} className="status-icon info" />
    }
  }

  const readinessScore = Math.round((passCount / checks.length) * 100)

  return (
    <div className="validation-panel">
      <div className="validation-header">
        <h3>
          <ShieldCheck size={18} />
          Publishing Readiness Check
        </h3>
        <button onClick={onClose} className="close-btn">
          <X size={18} />
        </button>
      </div>

      <div className="validation-content">
        <div className="readiness-score">
          <div className="score-circle">
            <span className="score-number">{readinessScore}%</span>
            <span className="score-label">Ready</span>
          </div>
          <div className="score-details">
            <div className="score-item">
              <CheckCircle size={14} className="pass" />
              <span>{passCount} passed</span>
            </div>
            {warningCount > 0 && (
              <div className="score-item">
                <AlertCircle size={14} className="warning" />
                <span>{warningCount} warnings</span>
              </div>
            )}
            {failCount > 0 && (
              <div className="score-item">
                <XCircle size={14} className="fail" />
                <span>{failCount} issues</span>
              </div>
            )}
          </div>
        </div>

        <div className="checks-list">
          <h4>Store Requirements</h4>
          {checks.map(check => (
            <div key={check.id} className={`check-item ${check.status}`}>
              {getStatusIcon(check.status)}
              <div className="check-content">
                <div className="check-label">
                  {check.label}
                  {check.required && <span className="required">*</span>}
                </div>
                <div className="check-message">{check.message}</div>
              </div>
            </div>
          ))}
        </div>        <div className="validation-tips">
          <h4>Amazon KDP & Google Play Books Requirements</h4>
          <ul>
            <li><strong>Amazon KDP:</strong> Requires copyright page, no blank pages, professional formatting, and cover image</li>
            <li><strong>Google Play Books:</strong> Needs complete metadata, proper EPUB 3.0 structure, and valid cover</li>
            <li><strong>Cover Requirements:</strong> Minimum 1400x2100px, maximum 50MB, JPEG/PNG format</li>
            <li><strong>Description:</strong> 150-300 words optimal for better discoverability and conversion</li>
            <li><strong>Categories:</strong> Choose specific genres to help readers find your book</li>
            <li><strong>Content Quality:</strong> Must be error-free, properly formatted, and complete</li>
            <li><strong>Metadata:</strong> Complete author info, publication date, and accurate descriptions required</li>
          </ul>
        </div>

        {readinessScore >= 80 && (
          <div className="ready-message">
            <CheckCircle size={20} />
            <span>Your book looks ready for publishing! 🎉</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ValidationPanel
