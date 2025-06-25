import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import './CelebrationToast.css'

const CelebrationToast = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [message, duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  if (!message) return null

  return (
    <div className={`celebration-toast ${isVisible ? 'visible' : ''}`}>
      <div className="celebration-content">
        <div className="celebration-icon">
          <Sparkles size={20} />
        </div>
        <div className="celebration-message">
          {message}
        </div>
        <button className="celebration-close" onClick={handleClose}>
          <X size={16} />
        </button>
      </div>
      <div className="celebration-confetti">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`confetti confetti-${i + 1}`}>🎉</div>
        ))}
      </div>
    </div>
  )
}

export default CelebrationToast
