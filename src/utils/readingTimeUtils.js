// Reading time and writing insights utilities

// Average reading speed: 200-300 words per minute, we'll use 250
const WORDS_PER_MINUTE = 250

export const calculateReadingTime = (content) => {
  if (!content) return 0
  
  // Strip HTML tags and count words
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = text.split(' ').filter(word => word.length > 0).length
  
  return Math.ceil(wordCount / WORDS_PER_MINUTE)
}

export const getWordCount = (content) => {
  if (!content) return 0
  
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.split(' ').filter(word => word.length > 0).length
}

export const formatReadingTime = (minutes) => {
  if (minutes < 1) return '< 1 min read'
  if (minutes === 1) return '1 min read'
  if (minutes < 60) return `${minutes} min read`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h read`
  }
  
  return `${hours}h ${remainingMinutes}m read`
}

export const getWritingStreak = () => {
  const streakData = JSON.parse(localStorage.getItem('writingStreak') || '{}')
  const today = new Date().toDateString()
  
  return {
    currentStreak: streakData.currentStreak || 0,
    lastWriteDate: streakData.lastWriteDate,
    totalDays: streakData.totalDays || 0,
    isToday: streakData.lastWriteDate === today
  }
}

export const updateWritingStreak = () => {
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
  const streakData = JSON.parse(localStorage.getItem('writingStreak') || '{}')
  
  let newStreak = streakData.currentStreak || 0
  
  if (streakData.lastWriteDate === today) {
    // Already wrote today, no change
    return getWritingStreak()
  } else if (streakData.lastWriteDate === yesterday) {
    // Continuing streak
    newStreak += 1
  } else {
    // Broken streak or first time
    newStreak = 1
  }
  
  const newStreakData = {
    currentStreak: newStreak,
    lastWriteDate: today,
    totalDays: (streakData.totalDays || 0) + 1
  }
  
  localStorage.setItem('writingStreak', JSON.stringify(newStreakData))
  return newStreakData
}

export const getWritingInsights = (book) => {
  const insights = []
  
  if (!book.pages || book.pages.length === 0) return insights
  
  // Calculate total words
  const totalWords = book.pages.reduce((total, page) => {
    return total + getWordCount(page.content)
  }, 0)
  
  // Average words per chapter
  const avgWordsPerChapter = Math.round(totalWords / book.pages.length)
  
  // Longest and shortest chapters
  const chapterWordCounts = book.pages.map(page => ({
    title: page.title,
    words: getWordCount(page.content)
  }))
  
  const longestChapter = chapterWordCounts.reduce((max, current) => 
    current.words > max.words ? current : max, chapterWordCounts[0])
  
  const shortestChapter = chapterWordCounts.reduce((min, current) => 
    current.words < min.words && current.words > 0 ? current : min, chapterWordCounts[0])
  
  // Total reading time
  const totalReadingTime = book.pages.reduce((total, page) => {
    return total + calculateReadingTime(page.content)
  }, 0)
  
  insights.push({
    icon: '📊',
    label: 'Total Words',
    value: totalWords.toLocaleString()
  })
  
  insights.push({
    icon: '📖',
    label: 'Reading Time',
    value: formatReadingTime(totalReadingTime)
  })
  
  insights.push({
    icon: '📝',
    label: 'Avg. Chapter Length',
    value: `${avgWordsPerChapter.toLocaleString()} words`
  })
  
  if (longestChapter && longestChapter.words > 0) {
    insights.push({
      icon: '📏',
      label: 'Longest Chapter',
      value: `${longestChapter.title} (${longestChapter.words} words)`
    })
  }
  
  // Writing streak
  const streak = getWritingStreak()
  if (streak.currentStreak > 0) {
    insights.push({
      icon: '🔥',
      label: 'Writing Streak',
      value: `${streak.currentStreak} day${streak.currentStreak === 1 ? '' : 's'}`
    })
  }
  
  return insights
}

export const getCelebrationMessage = (wordCount, previousWordCount) => {
  const milestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]
  
  for (const milestone of milestones) {
    if (previousWordCount < milestone && wordCount >= milestone) {
      const messages = {
        100: "🌱 First 100 words down! You've started your journey!",
        250: "📝 Quarter way to your first 1000! Keep the momentum!",
        500: "💪 500 words! You're building serious writing muscle!",
        1000: "🎯 1,000 words! That's a solid short story length!",
        2500: "🚀 2,500 words! You're really hitting your stride!",
        5000: "⭐ 5,000 words! That's a short novella territory!",
        10000: "🏆 10,000 words! You've got a serious manuscript going!",
        25000: "👑 25,000 words! You're in full novel-writing mode!",
        50000: "🎊 50,000 words! NaNoWriMo champion level!",
        100000: "🌟 100,000 words! You've written a full-length novel!"
      }
      
      return {
        message: messages[milestone] || `🎉 Congratulations! You've reached ${milestone.toLocaleString()} words!`,
        milestone: milestone
      }
    }
  }
  
  return null
}
