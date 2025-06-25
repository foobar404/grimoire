import JSZip from 'jszip'

// Generate EPUB file
export const generateEPUB = async (book, styles) => {
  try {
    console.log('Starting EPUB generation...', { book, styles })
    
    // Validate required data
    if (!book || !book.title || !book.author || !book.pages || book.pages.length === 0) {
      throw new Error('Missing required book data (title, author, or pages)')
    }

    const zip = new JSZip()

    // EPUB structure
    zip.file('mimetype', 'application/epub+zip')

    // META-INF folder
    const metaInf = zip.folder('META-INF')
    metaInf.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)

    // OEBPS folder
    const oebps = zip.folder('OEBPS')

    // Generate CSS
    const css = generateCSS(styles)
    oebps.file('styles.css', css)

    // Generate content.opf (package file)
    const contentOpf = generateContentOpf(book)
    oebps.file('content.opf', contentOpf)

    // Generate toc.ncx (navigation file for EPUB 2.0 compatibility)
    const tocNcx = generateTocNcx(book)
    oebps.file('toc.ncx', tocNcx)

    // Generate nav.xhtml (EPUB 3.0 navigation document)
    const navHtml = generateNavDocument(book)
    oebps.file('nav.xhtml', navHtml)

    // Add cover image if provided
    if (book.coverImage) {
      try {
        const coverImageData = book.coverImage.split(',')[1] // Remove data:image/jpeg;base64, prefix
        const extension = book.coverImage.includes('png') ? 'png' : 'jpg'
        oebps.file(`cover.${extension}`, coverImageData, { base64: true })
      } catch (error) {
        console.warn('Failed to add cover image:', error)
      }
    }

    // Generate title page
    const titlePageHtml = generateTitlePage(book, styles)
    oebps.file('title.xhtml', titlePageHtml)

    // Generate copyright page (required by Amazon KDP)
    const copyrightPageHtml = generateCopyrightPage(book)
    oebps.file('copyright.xhtml', copyrightPageHtml)

    // Generate table of contents page
    const tocPageHtml = generateTocPage(book, styles)
    oebps.file('toc.xhtml', tocPageHtml)    // Generate chapter files
    book.pages.forEach((page, index) => {
      try {
        const pageHtml = generatePageHtml(page, styles, index + 1)
        oebps.file(`chapter${index + 1}.xhtml`, pageHtml)
      } catch (error) {
        console.error(`Failed to generate chapter ${index + 1}:`, error)
        throw new Error(`Failed to generate chapter ${index + 1}: ${error.message}`)
      }
    })

    console.log('Generating EPUB blob...')
    
    // Generate and download the EPUB
    const content = await zip.generateAsync({ 
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    })
    
    console.log('EPUB blob generated, starting download...', content)
    
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${book.title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase()}.epub`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log('EPUB download initiated successfully')
  } catch (error) {
    console.error('EPUB generation failed:', error)
    throw error
  }
}

const generateCSS = (styles) => {
  // Handle font family mapping
  const getFontFamily = (fontFamilyValue) => {
    const fontMap = {
      'serif': 'Georgia, "Times New Roman", Times, serif',
      'sans-serif': 'Arial, Helvetica, sans-serif', 
      'monospace': '"Courier New", Courier, monospace',
      'sans': 'Arial, Helvetica, sans-serif', // Legacy support
      'mono': '"Courier New", Courier, monospace' // Legacy support
    }
    return fontMap[fontFamilyValue] || fontFamilyValue || 'Georgia, "Times New Roman", Times, serif'
  }

  const fontFamily = getFontFamily(styles.fontFamily)

  // Build responsive CSS with fluid typography and adaptive layouts
  let css = `
    /* ===== RESPONSIVE FOUNDATION ===== */
    /* Viewport and box-sizing reset */
    html {
      box-sizing: border-box;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    *, *:before, *:after {
      box-sizing: inherit;
    }
    
    /* ===== RESPONSIVE TYPOGRAPHY ===== */
    body {
      font-family: ${fontFamily};
      font-size: clamp(14px, 4vw, ${styles.fontSize || '18px'});
      font-weight: ${styles.fontWeight || '400'};
      line-height: ${styles.lineHeight || '1.6'};
      color: ${styles.color || '#2d3748'};
      background-color: ${styles.backgroundColor || '#ffffff'};
      text-align: ${styles.textAlign || 'left'};
      
      /* Responsive margins */
      margin: 0;
      padding: clamp(1rem, 5vw, 2rem);
      max-width: 100%;
      
      /* Advanced Typography */
      letter-spacing: ${styles.letterSpacing || '0.02em'};
      word-spacing: ${styles.wordSpacing || 'normal'};
      text-transform: ${styles.textTransform || 'none'};
      text-indent: ${styles.textIndent || '0'};
      
      /* EPUB Quality Features */
      hyphens: auto;
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
      orphans: 3;
      widows: 3;
      
      /* Advanced Text Rendering */
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-variant-ligatures: common-ligatures;
      font-feature-settings: "kern" 1, "liga" 1;
      
      /* Responsive word wrapping */
      word-wrap: break-word;
      overflow-wrap: break-word;
      
      /* Page Break Control */
      page-break-inside: auto;
    }
    
    /* ===== FLUID TYPOGRAPHY SCALE ===== */
    /* Responsive paragraph styling */
    p {
      margin: 0 0 clamp(0.8rem, 3vw, 1.2rem) 0;
      text-indent: ${styles.textAlign === 'justify' ? 'clamp(1rem, 3vw, 1.5rem)' : '0'};
      text-align: ${styles.textAlign || 'left'};
      hyphens: auto;
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
      orphans: 3;
      widows: 3;
      max-width: 100%;
      word-wrap: break-word;
    }
    
    /* First paragraph in chapters - no indent */
    .chapter-start p:first-of-type,
    .chapter-content > p:first-child {
      text-indent: 0;
    }
    
    /* Drop Cap Styling - Responsive */
    ${styles.dropCap === 'enabled' ? `
    .chapter-start p:first-of-type::first-letter,
    .chapter-content > p:first-child::first-letter {
      font-size: clamp(2.5em, 8vw, 4em);
      float: left;
      line-height: 0.8;
      margin: 0.1em 0.1em 0 0;
      font-weight: bold;
      text-transform: uppercase;
    }
    ` : ''}
    
    /* ===== RESPONSIVE HEADINGS ===== */
    h1, h2, h3, h4, h5, h6 {
      font-family: ${fontFamily};
      color: ${styles.color || '#2d3748'};
      page-break-after: avoid;
      orphans: 3;
      widows: 3;
      text-rendering: optimizeLegibility;
      margin-top: clamp(1rem, 4vw, 2rem);
      margin-bottom: clamp(0.5rem, 2vw, 1rem);
      word-wrap: break-word;
      max-width: 100%;
    }
    
    h1 {
      font-size: clamp(1.5rem, 6vw, 2.5rem);
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 200, 700)};
      text-align: center;
      page-break-before: always;
      margin-top: clamp(1rem, 5vw, 3rem);
      margin-bottom: clamp(1rem, 3vw, 2rem);
    }
    
    h2 {
      font-size: clamp(1.25rem, 5vw, 2rem);
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 100, 600)};
    }
    
    h3 {
      font-size: clamp(1.1rem, 4vw, 1.5rem);
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 100, 600)};
    }
    
    h4, h5, h6 {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 100, 600)};
    }
    
    /* ===== RESPONSIVE CONTENT ELEMENTS ===== */
    /* Responsive blockquotes */
    blockquote {
      margin: clamp(1rem, 4vw, 2rem) clamp(1rem, 5vw, 3rem);
      padding: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem);
      border-left: clamp(2px, 0.5vw, 4px) solid ${styles.color || '#2d3748'};
      font-style: italic;
      color: ${styles.color || '#2d3748'};
      opacity: 0.9;
      background-color: ${styles.backgroundColor === '#ffffff' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'};
      border-radius: clamp(2px, 0.5vw, 6px);
      font-size: clamp(0.9rem, 3.5vw, 1.1rem);
    }
    
    /* Responsive code blocks */
    code, pre {
      font-family: "Courier New", Courier, monospace;
      background-color: ${styles.backgroundColor === '#ffffff' ? '#f8f9fa' : 'rgba(255,255,255,0.1)'};
      border-radius: clamp(2px, 0.3vw, 4px);
      font-size: clamp(0.8rem, 3vw, 0.95rem);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    code {
      padding: clamp(0.1rem, 0.5vw, 0.3rem) clamp(0.2rem, 1vw, 0.5rem);
    }
    
    pre {
      padding: clamp(0.8rem, 3vw, 1.5rem);
      margin: clamp(1rem, 3vw, 2rem) 0;
      overflow-x: auto;
      white-space: pre-wrap;
      max-width: 100%;
      word-break: break-all;
    }
    
    /* ===== RESPONSIVE LISTS ===== */
    ul, ol {
      margin: clamp(0.8rem, 3vw, 1.5rem) 0;
      padding-left: clamp(1.5rem, 4vw, 2.5rem);
      max-width: 100%;
    }
    
    li {
      margin: clamp(0.3rem, 1vw, 0.6rem) 0;
      line-height: ${parseFloat(styles.lineHeight || '1.6') + 0.1};
      word-wrap: break-word;
    }
    
    /* ===== RESPONSIVE IMAGES ===== */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: clamp(1rem, 4vw, 2rem) auto;
      page-break-inside: avoid;
      border-radius: clamp(2px, 0.5vw, 8px);
      box-shadow: 0 clamp(2px, 0.5vw, 4px) clamp(8px, 2vw, 16px) rgba(0,0,0,0.1);
    }
    
    /* Responsive image captions */
    .image-caption {
      font-size: clamp(0.8rem, 3vw, 0.9rem);
      text-align: center;
      font-style: italic;
      margin-top: clamp(0.5rem, 1vw, 0.8rem);
      color: ${styles.color || '#2d3748'};
      opacity: 0.8;
    }
    
    /* ===== RESPONSIVE TABLES ===== */
    table {
      width: 100%;
      max-width: 100%;
      border-collapse: collapse;
      margin: clamp(1rem, 3vw, 2rem) 0;
      page-break-inside: avoid;
      font-size: clamp(0.8rem, 3vw, 1rem);
      overflow-x: auto;
      display: block;
      white-space: nowrap;
    }
    
    th, td {
      border: 1px solid ${styles.color || '#2d3748'};
      padding: clamp(0.3rem, 1.5vw, 0.8rem);
      text-align: left;
      word-wrap: break-word;
      max-width: 200px;
      overflow-wrap: break-word;
    }
    
    th {
      background-color: ${styles.backgroundColor === '#ffffff' ? '#f8f9fa' : 'rgba(255,255,255,0.1)'};
      font-weight: bold;
    }
    
    /* ===== RESPONSIVE LAYOUT CLASSES ===== */
    .title-page {
      text-align: center;
      padding: clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem);
      page-break-after: always;
      max-width: 100%;
    }
    
    .title-page h1 {
      font-size: clamp(2rem, 8vw, 4rem);
      margin-bottom: clamp(1rem, 3vw, 2rem);
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 300, 800)};
      line-height: 1.2;
      word-wrap: break-word;
    }
    
    .title-page .author {
      font-size: clamp(1rem, 4vw, 1.5rem);
      margin-top: clamp(1.5rem, 4vw, 3rem);
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 100, 500)};
    }
    
    .title-page .description {
      font-size: clamp(0.9rem, 3.5vw, 1.1rem);
      margin: clamp(2rem, 5vw, 3rem) auto;
      max-width: min(90%, 500px);
      text-align: justify;
      line-height: ${parseFloat(styles.lineHeight || '1.6') + 0.2};
      hyphens: auto;
    }
    
    .title-page .series {
      font-size: clamp(0.8rem, 3vw, 1rem);
      margin-top: clamp(1rem, 3vw, 2rem);
      font-style: italic;
      opacity: 0.8;
    }
    
    .copyright-page {
      page-break-before: always;
      page-break-after: always;
      padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 2rem);
      max-width: 100%;
    }
    
    .copyright-page h1 {
      text-align: center;
      margin-bottom: clamp(2rem, 5vw, 3rem);
    }
    
    .copyright-content p {
      margin-bottom: clamp(0.8rem, 2vw, 1.2rem);
      text-indent: 0;
      font-size: clamp(0.8rem, 3vw, 1rem);
      text-align: justify;
      hyphens: auto;
    }
    
    .chapter-start {
      page-break-before: always;
      padding-top: clamp(1rem, 4vw, 3rem);
      max-width: 100%;
    }
    
    .chapter-content {
      max-width: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .toc {
      padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 2rem);
      max-width: 100%;
    }
    
    .toc ul {
      list-style: none;
      padding: 0;
    }
    
    .toc li {
      margin: clamp(0.5rem, 2vw, 1rem) 0;
      padding: clamp(0.25rem, 1vw, 0.5rem) 0;
      border-bottom: 1px dotted ${styles.color || '#2d3748'};
      word-wrap: break-word;
    }
    
    .toc a {
      color: ${styles.color || '#2d3748'};
      text-decoration: none;
      font-size: clamp(0.9rem, 3.5vw, 1.1rem);
      display: block;
      padding: clamp(0.3rem, 1vw, 0.5rem) 0;
    }
    
    /* ===== RESPONSIVE UTILITIES ===== */
    /* Responsive text wrapping */
    .text-wrap {
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
    }
    
    /* Responsive spacing utilities */
    .responsive-margin {
      margin: clamp(1rem, 3vw, 2rem) 0;
    }
    
    .responsive-padding {
      padding: clamp(0.5rem, 2vw, 1rem);
    }
    
    /* Print-specific responsive rules */
    @media print {
      body {
        font-size: 12pt;
        line-height: 1.5;
        padding: 1in;
      }
      
      h1 { font-size: 20pt; }
      h2 { font-size: 16pt; }
      h3 { font-size: 14pt; }
      h4, h5, h6 { font-size: 12pt; }
      
      img {
        max-width: 100%;
        page-break-inside: avoid;
      }
      
      blockquote, pre {
        page-break-inside: avoid;
      }
    }
    
    /* ===== MOBILE-FIRST RESPONSIVE BREAKPOINTS ===== */
    @media screen and (max-width: 480px) {
      body {
        padding: 1rem 0.75rem;
        font-size: 16px;
      }
      
      .title-page {
        padding: 2rem 1rem;
      }
      
      table {
        font-size: 12px;
      }
      
      th, td {
        padding: 0.25rem;
      }
    }
    
    @media screen and (min-width: 481px) and (max-width: 768px) {
      body {
        padding: 1.5rem 1rem;
        font-size: 17px;
      }
    }
    
    @media screen and (min-width: 769px) {
      body {
        padding: 2rem 1.5rem;
        font-size: ${styles.fontSize || '18px'};
        max-width: 800px;
        margin: 0 auto;
      }
    }
    
    /* ===== ACCESSIBILITY ENHANCEMENTS ===== */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    @media (prefers-contrast: high) {
      body {
        background-color: white;
        color: black;
      }
      
      a {
        color: blue;
      }
      
      blockquote {
        border-left-color: black;
      }
    }
    
    h3 {
      font-size: 1.3em;
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 100, 600)};
      margin: 1.2em 0 0.6em 0;
    }
    
    h4, h5, h6 {
      font-size: 1.1em;
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 100, 600)};
      margin: 1em 0 0.5em 0;
    }
    
    /* Special Typography Elements */
    blockquote {
      margin: 1em 2em;
      padding-left: 1em;
      border-left: 3px solid ${styles.color || '#2d3748'};
      font-style: italic;
      color: ${styles.color || '#2d3748'};
      opacity: 0.9;
    }
    
    /* Code and Preformatted Text */
    code, pre {
      font-family: 'Courier New', monospace;
      background-color: ${styles.backgroundColor === '#ffffff' ? '#f5f5f5' : 'rgba(255,255,255,0.1)'};
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    pre {
      padding: 1em;
      margin: 1em 0;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    
    /* Lists */
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    li {
      margin: 0.5em 0;
      line-height: ${styles.lineHeight || '1.6'};
    }
    
    /* Images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em auto;
      page-break-inside: avoid;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid ${styles.color || '#2d3748'};
      padding: 0.5em;
      text-align: left;
    }
    
    th {
      background-color: ${styles.backgroundColor === '#ffffff' ? '#f5f5f5' : 'rgba(255,255,255,0.1)'};
      font-weight: bold;
    }
    
    /* Page Layout Classes */
    .title-page {
      text-align: center;
      margin-top: 2em;
      page-break-after: always;
    }
    
    .title-page h1 {
      font-size: 2.5em;
      margin-bottom: 0.5em;
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 300, 800)};
    }
    
    .title-page .author {
      font-size: 1.2em;
      margin-top: 2em;
      font-weight: ${Math.max(parseInt(styles.fontWeight || '400') + 100, 500)};
    }
    
    .title-page .description {
      font-size: 1em;
      margin-top: 2em;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      text-align: justify;
      line-height: ${parseFloat(styles.lineHeight || '1.6') + 0.2};
    }
    
    .title-page .series {
      font-size: 0.9em;
      margin-top: 1em;
      font-style: italic;
      opacity: 0.8;
    }
    
    .copyright-page {
      page-break-before: always;
      page-break-after: always;
      margin: 2em 0;
    }
    
    .copyright-page h1 {
      text-align: center;
      margin-bottom: 2em;
    }
    
    .copyright-content p {
      margin-bottom: 1em;
      text-indent: 0;
      font-size: 0.9em;
      text-align: justify;
    }
    
    .chapter-start {
      page-break-before: always;
      margin-top: 2em;
    }
    
    .toc {
      margin: 2em 0;
    }
    
    .toc ul {
      list-style: none;
      padding: 0;
    }
    
    .toc li {
      margin: 0.5em 0;
      padding: 0.25em 0;
      border-bottom: 1px dotted #ccc;
    }
    
    .toc a {
      text-decoration: none;
      color: inherit;
    }
    
    .toc a:hover {
      text-decoration: underline;
    }
    
    blockquote {
      margin: 1em 2em;
      padding: 0.5em 1em;
      border-left: 3px solid #ccc;      font-style: italic;
    }
    
    /* Chapter Breaks */
    .chapter-break {
      page-break-before: always;
      margin-top: 0;
    }
    
    /* Responsive Design for Different Reading Devices */
    @media screen and (max-width: 600px) {
      body {
        margin: 0.5em;
        font-size: ${parseFloat(styles.fontSize || '16') - 1}px;
      }
      
      .title-page h1 {
        font-size: 2em;
      }
      
      blockquote {
        margin: 1em 1em;
      }
    }
    
    /* Print-specific styles */
    @media print {
      body {
        color: black;
        background-color: white;
      }
      
      a {
        color: inherit;
        text-decoration: none;
      }
    }
    
    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `

  // Add custom CSS if provided
  if (styles.customCSS && styles.customCSS.trim()) {
    css += `\n\n/* Custom User CSS */\n${styles.customCSS}`
  }

  return css
}

const generateContentOpf = (book) => {
  const manifest = book.pages.map((_, index) => 
    `    <item id="chapter${index + 1}" href="chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`
  ).join('\n')

  const spine = book.pages.map((_, index) => 
    `    <itemref idref="chapter${index + 1}"/>`
  ).join('\n')
  const coverImageItem = book.coverImage ? 
    `    <item id="cover-image" href="cover.${book.coverImage.includes('png') ? 'png' : 'jpg'}" media-type="image/${book.coverImage.includes('png') ? 'png' : 'jpeg'}" properties="cover-image"/>` : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" prefix="dc: http://purl.org/dc/elements/1.1/">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${generateUID()}</dc:identifier>
    <dc:title>${escapeXml(book.title)}</dc:title>
    <dc:creator id="creator">${escapeXml(book.author)}</dc:creator>
    <meta refines="#creator" property="file-as">${escapeXml(book.author.split(' ').reverse().join(', '))}</meta>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
    <dc:language>${book.language || 'en'}</dc:language>
    ${book.description ? `<dc:description>${escapeXml(book.description)}</dc:description>` : ''}
    ${book.genre ? `<dc:subject>${escapeXml(book.genre)}</dc:subject>` : ''}
    ${book.publisher ? `<dc:publisher>${escapeXml(book.publisher)}</dc:publisher>` : ''}
    ${book.publishDate ? `<dc:date>${book.publishDate}</dc:date>` : `<dc:date>${new Date().toISOString().split('T')[0]}</dc:date>`}
    ${book.isbn ? `<dc:identifier id="isbn">${escapeXml(book.isbn)}</dc:identifier>` : ''}
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
    ${book.coverImage ? '<meta name="cover" content="cover-image"/>' : ''}
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles.css" media-type="text/css"/>
${coverImageItem}
    <item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>
    <item id="copyright" href="copyright.xhtml" media-type="application/xhtml+xml"/>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml"/>
${manifest}
  </manifest>
  <spine toc="ncx">
    <itemref idref="title"/>
    <itemref idref="copyright"/>
    <itemref idref="toc"/>
${spine}
  </spine>
</package>`
}

const generateTocNcx = (book) => {
  const navPoints = book.pages.map((page, index) => `
    <navPoint id="chapter${index + 1}" playOrder="${index + 3}">
      <navLabel>
        <text>${escapeXml(page.title)}</text>
      </navLabel>
      <content src="chapter${index + 1}.xhtml"/>
    </navPoint>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${generateUID()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(book.title)}</text>
  </docTitle>
  <navMap>
    <navPoint id="title" playOrder="1">
      <navLabel>
        <text>Title Page</text>
      </navLabel>
      <content src="title.xhtml"/>
    </navPoint>
    <navPoint id="toc" playOrder="2">
      <navLabel>
        <text>Table of Contents</text>
      </navLabel>
      <content src="toc.xhtml"/>
    </navPoint>${navPoints}
  </navMap>
</ncx>`
}

const generateNavDocument = (book) => {
  const tocItems = book.pages.map((page, index) => 
    `        <li><a href="chapter${index + 1}.xhtml">${escapeXml(page.title)}</a></li>`
  ).join('\n')

  return generateXhtmlTemplate(`
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        <li><a href="title.xhtml">Title Page</a></li>
        <li><a href="copyright.xhtml">Copyright</a></li>
        <li><a href="toc.xhtml">Table of Contents</a></li>
${tocItems}
      </ol>
    </nav>
  `, 'Navigation', true)
}

const generateTitlePage = (book) => {
  return generateXhtmlTemplate(`    <div class="title-page">
      <h1>${escapeXml(book.title)}</h1>
      <div class="author">by ${escapeXml(book.author)}</div>
      ${book.description ? `<div class="description">${escapeXml(book.description)}</div>` : ''}
      ${book.series ? `<div class="series">Part of the ${escapeXml(book.series)} series</div>` : ''}
    </div>
  `, 'Title Page')
}

const generateCopyrightPage = (book) => {
  const currentYear = new Date().getFullYear()
  const defaultCopyright = `© ${currentYear} ${book.author}. All rights reserved.

No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

${book.publisher ? `Published by ${book.publisher}` : 'Self-published'}

${book.isbn ? `ISBN: ${book.isbn}` : ''}

First published ${book.publishDate || new Date().toISOString().split('T')[0]}`
  return generateXhtmlTemplate(`
    <div class="copyright-page">
      <h1>Copyright</h1>
      <div class="copyright-content">
        ${escapeXml(book.copyright || defaultCopyright).split('\n').map(line => `<p>${line}</p>`).join('')}
      </div>
    </div>
  `, 'Copyright')
}

const generateTocPage = (book) => {
  const tocItems = book.pages.map((page, index) => 
    `      <li><a href="chapter${index + 1}.xhtml">${escapeXml(page.title)}</a></li>`
  ).join('\n')

  return generateXhtmlTemplate(`
    <div class="toc">
      <h1>Table of Contents</h1>
      <ul>
${tocItems}
      </ul>
    </div>
  `, 'Table of Contents')
}

const generatePageHtml = (page, styles, chapterNumber) => {
  if (!page || !page.title) {
    throw new Error(`Invalid page data for chapter ${chapterNumber}`)
  }
  
  const cleanContent = page.content || '<p>This chapter is empty.</p>'
  
  return generateXhtmlTemplate(`
    <div class="chapter-start">
      <h1>${escapeXml(page.title)}</h1>
      <div class="chapter-content">
        ${cleanContent}
      </div>
    </div>
  `, page.title)
}

const generateXhtmlTemplate = (content, title, isNav = false) => {
  const navProperties = isNav ? ' epub:type="bodymatter" xmlns:epub="http://www.idpf.org/2007/ops"' : ''
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"${navProperties}>
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
${content}
</body>
</html>`
}

const escapeXml = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

const generateUID = () => {
  return 'urn:uuid:' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
