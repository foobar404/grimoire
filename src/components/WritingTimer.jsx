import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import './WritingTimer.css'

const WritingTimer = () => {
  const [sessionTime, setSessionTime] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="writing-timer">
      <Clock size={14} />
      <span className="session-time">{formatTime(sessionTime)}</span>
    </div>
  )
}

export default WritingTimer
