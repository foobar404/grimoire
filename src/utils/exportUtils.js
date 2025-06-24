import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Export to PDF
export const exportToPDF = async (book, styles, metadata) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  
  let yPosition = margin

  // Add title page
  pdf.setFontSize(24)
  pdf.setFont(undefined, 'bold')
  const titleLines = pdf.splitTextToSize(book.title, contentWidth)
  pdf.text(titleLines, margin, yPosition)
  yPosition += titleLines.length * 12

  pdf.setFontSize(16)
  pdf.setFont(undefined, 'normal')
  pdf.text(`by ${book.author}`, margin, yPosition + 20)
  
  pdf.addPage()
  yPosition = margin

  // Add table of contents
  pdf.setFontSize(18)
  pdf.setFont(undefined, 'bold')
  pdf.text('Table of Contents', margin, yPosition)
  yPosition += 20

  pdf.setFontSize(12)
  pdf.setFont(undefined, 'normal')
  book.pages.forEach((page, index) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = margin
    }
    pdf.text(`${index + 1}. ${page.title}`, margin, yPosition)
    yPosition += 10
  })

  // Add chapters
  book.pages.forEach((page, index) => {
    pdf.addPage()
    yPosition = margin

    // Chapter title
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    const chapterTitle = `Chapter ${index + 1}: ${page.title}`
    const titleLines = pdf.splitTextToSize(chapterTitle, contentWidth)
    pdf.text(titleLines, margin, yPosition)
    yPosition += titleLines.length * 8 + 10

    // Chapter content (strip HTML tags for basic conversion)
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    const textContent = stripHtml(page.content)
    const contentLines = pdf.splitTextToSize(textContent, contentWidth)
    
    contentLines.forEach(line => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = margin + 20
      }
      pdf.text(line, margin, yPosition)
      yPosition += 6
    })
  })

  // Save the PDF
  pdf.save(`${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`)
}

// Export to HTML
export const exportToHTML = (book, styles, metadata) => {
  const fontFamily = styles.fontFamily === 'serif' ? 'Georgia, serif' : 
                    styles.fontFamily === 'sans' ? 'Arial, sans-serif' : 
                    'Courier, monospace'

  const html = `<!DOCTYPE html>
<html lang="${metadata.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(book.title)}</title>
  <meta name="author" content="${escapeHtml(book.author)}">
  ${metadata.description ? `<meta name="description" content="${escapeHtml(metadata.description)}">` : ''}
  <style>
    body {
      font-family: ${fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      color: ${styles.color};
      background-color: ${styles.backgroundColor};
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      text-align: ${styles.textAlign};
    }
    
    .title-page {
      text-align: center;
      margin-bottom: 3rem;
      page-break-after: always;
    }
    
    .title-page h1 {
      font-size: 2.5em;
      margin-bottom: 0.5em;
      color: ${styles.color};
    }
    
    .title-page .author {
      font-size: 1.2em;
      margin-bottom: 2em;
      font-style: italic;
    }
    
    .title-page .description {
      font-size: 1em;
      max-width: 600px;
      margin: 0 auto;
      text-align: justify;
    }
    
    .toc {
      margin: 2rem 0;
      page-break-after: always;
    }
    
    .toc h2 {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .toc ul {
      list-style: none;
      padding: 0;
    }
    
    .toc li {
      margin: 0.5em 0;
      padding: 0.5em;
      border-bottom: 1px dotted #ccc;
    }
    
    .toc a {
      text-decoration: none;
      color: inherit;
    }
    
    .toc a:hover {
      text-decoration: underline;
    }
    
    .chapter {
      margin: 2rem 0;
      page-break-before: always;
    }
    
    .chapter h1 {
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.8em;
    }
    
    .chapter-content p {
      margin-bottom: 1em;
      text-indent: 1.5em;
    }
    
    .chapter-content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5rem auto;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    blockquote {
      margin: 1.5rem 2rem;
      padding: 1rem;
      border-left: 4px solid #ccc;
      font-style: italic;
      background: rgba(0, 0, 0, 0.05);
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 1rem;
      }
      
      .chapter {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>${escapeHtml(book.title)}</h1>
    <div class="author">by ${escapeHtml(book.author)}</div>
    ${metadata.description ? `<div class="description">${escapeHtml(metadata.description)}</div>` : ''}
  </div>
  
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      ${book.pages.map((page, index) => 
        `<li><a href="#chapter${index + 1}">${index + 1}. ${escapeHtml(page.title)}</a></li>`
      ).join('')}
    </ul>
  </div>
  
  ${book.pages.map((page, index) => `
    <div class="chapter" id="chapter${index + 1}">
      <h1>Chapter ${index + 1}: ${escapeHtml(page.title)}</h1>
      <div class="chapter-content">
        ${page.content}
      </div>
    </div>
  `).join('')}
  
  ${metadata.copyright ? `
    <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ccc; font-size: 0.9em; text-align: center;">
      ${escapeHtml(metadata.copyright)}
    </div>
  ` : ''}
</body>
</html>`

  // Create and download the HTML file
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Export to plain text
export const exportToText = (book, metadata) => {
  let content = `${book.title}\n`
  content += `by ${book.author}\n`
  content += '='.repeat(book.title.length + book.author.length + 4) + '\n\n'
  
  if (metadata.description) {
    content += `${metadata.description}\n\n`
  }
  
  content += 'TABLE OF CONTENTS\n'
  content += '-'.repeat(17) + '\n\n'
  
  book.pages.forEach((page, index) => {
    content += `${index + 1}. ${page.title}\n`
  })
  
  content += '\n' + '='.repeat(50) + '\n\n'
  
  book.pages.forEach((page, index) => {
    content += `CHAPTER ${index + 1}: ${page.title.toUpperCase()}\n`
    content += '-'.repeat(page.title.length + 12) + '\n\n'
    content += stripHtml(page.content) + '\n\n'
    content += '='.repeat(50) + '\n\n'
  })
  
  if (metadata.copyright) {
    content += metadata.copyright + '\n'
  }

  // Create and download the text file
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Save project as JSON
export const saveProject = (book, styles, metadata) => {
  const project = {
    version: '1.0',
    book,
    styles,
    metadata,
    exportedAt: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Load project from JSON
export const loadProject = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (event) => {
      const file = event.target.files[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target.result)
          resolve(project)
        } catch (error) {
          reject(new Error('Invalid project file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    }
    
    input.click()
  })
}

// Utility functions
const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
