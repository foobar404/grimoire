import { X, Palette, Type, AlignLeft, AlignCenter, AlignRight, ChevronDown, ChevronUp, Eye, Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'
import './StylePanel.css'

const StylePanel = ({ styles, onStyleChange, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    typography: true,
    spacing: false,
    themes: true,
    advanced: false,
    custom: false
  })

  const updateStyle = (property, value) => {
    onStyleChange(prev => ({
      ...prev,
      [property]: value
    }))
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const fontSizes = [
    { label: 'Small', value: '14px' },
    { label: 'Medium', value: '16px' },
    { label: 'Large', value: '18px' },
    { label: 'Extra Large', value: '20px' },
    { label: 'Huge', value: '24px' }
  ]

  const fontFamilies = [
    { label: 'Serif (Georgia)', value: 'serif' },
    { label: 'Sans Serif (Arial)', value: 'sans-serif' },
    { label: 'Monospace (Courier)', value: 'monospace' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Garamond', value: 'Garamond, serif' },
    { label: 'Book Antiqua', value: '"Book Antiqua", serif' },
    { label: 'Palatino', value: '"Palatino Linotype", serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' }
  ]

  const fontWeights = [
    { label: 'Light', value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semi Bold', value: '600' },
    { label: 'Bold', value: '700' }
  ]

  const colorPresets = [
    { name: 'Classic', color: '#2d3748', bg: '#ffffff', desc: 'Traditional reading' },
    { name: 'Dark Mode', color: '#e2e8f0', bg: '#1a202c', desc: 'Easy on eyes' },
    { name: 'Sepia', color: '#744210', bg: '#fef5e7', desc: 'Warm & comfortable' },
    { name: 'High Contrast', color: '#000000', bg: '#ffffff', desc: 'Maximum readability' },
    { name: 'Forest', color: '#22543d', bg: '#f0fff4', desc: 'Nature inspired' },
    { name: 'Ocean', color: '#1a365d', bg: '#ebf8ff', desc: 'Cool & calm' },
    { name: 'Lavender', color: '#553c9a', bg: '#faf5ff', desc: 'Elegant purple' },
    { name: 'Rust', color: '#9c4221', bg: '#fffaf0', desc: 'Warm orange' }
  ]
  const SectionHeader = ({ title, icon, section, isExpanded }) => (
    <div 
      className="section-header" 
      onClick={() => toggleSection(section)}
    >
      <div className="section-title">
        {icon}
        <span>{title}</span>
      </div>
      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </div>
  )

  return (
    <div className="style-panel">
      <div className="style-panel-header">
        <h3>
          <Palette size={18} />
          Advanced Styling
        </h3>
        <button onClick={onClose} className="close-btn">
          <X size={18} />
        </button>
      </div>

      <div className="style-panel-content">
        {/* Typography Section */}
        <div className="style-section">
          <SectionHeader 
            title="Typography" 
            icon={<Type size={16} />}
            section="typography"
            isExpanded={expandedSections.typography}
          />
          
          {expandedSections.typography && (
            <div className="section-content">
              <div className="style-group">
                <label>Font Family</label>
                <select
                  value={styles.fontFamily || 'serif'}
                  onChange={(e) => updateStyle('fontFamily', e.target.value)}
                  className="style-select"
                >
                  {fontFamilies.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="style-row">
                <div className="style-group">
                  <label>Font Size</label>
                  <select
                    value={styles.fontSize || '16px'}
                    onChange={(e) => updateStyle('fontSize', e.target.value)}
                    className="style-select"
                  >
                    {fontSizes.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="style-group">
                  <label>Font Weight</label>
                  <select
                    value={styles.fontWeight || '400'}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                    className="style-select"
                  >
                    {fontWeights.map(weight => (
                      <option key={weight.value} value={weight.value}>
                        {weight.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="style-group">
                <label>Line Height</label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={parseFloat(styles.lineHeight || 1.6)}
                  onChange={(e) => updateStyle('lineHeight', e.target.value)}
                  className="style-range"
                />
                <span className="range-value">{styles.lineHeight || 1.6}</span>
              </div>

              <div className="style-row">
                <div className="style-group">
                  <label>Letter Spacing</label>
                  <input
                    type="range"
                    min="-1"
                    max="3"
                    step="0.1"
                    value={parseFloat(styles.letterSpacing || 0)}
                    onChange={(e) => updateStyle('letterSpacing', `${e.target.value}px`)}
                    className="style-range"
                  />
                  <span className="range-value">{styles.letterSpacing || '0px'}</span>
                </div>

                <div className="style-group">
                  <label>Word Spacing</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={parseFloat(styles.wordSpacing || 0)}
                    onChange={(e) => updateStyle('wordSpacing', `${e.target.value}px`)}
                    className="style-range"
                  />
                  <span className="range-value">{styles.wordSpacing || '0px'}</span>
                </div>
              </div>

              <div className="style-group">
                <label>Text Alignment</label>
                <div className="alignment-buttons">
                  <button
                    onClick={() => updateStyle('textAlign', 'left')}
                    className={`align-btn ${(styles.textAlign || 'left') === 'left' ? 'active' : ''}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onClick={() => updateStyle('textAlign', 'center')}
                    className={`align-btn ${styles.textAlign === 'center' ? 'active' : ''}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onClick={() => updateStyle('textAlign', 'right')}
                    className={`align-btn ${styles.textAlign === 'right' ? 'active' : ''}`}
                  >
                    <AlignRight size={16} />
                  </button>
                  <button
                    onClick={() => updateStyle('textAlign', 'justify')}
                    className={`align-btn ${styles.textAlign === 'justify' ? 'active' : ''}`}
                  >
                    Justify
                  </button>
                </div>
              </div>

              <div className="style-group">
                <label>Text Transform</label>
                <select
                  value={styles.textTransform || 'none'}
                  onChange={(e) => updateStyle('textTransform', e.target.value)}
                  className="style-select"
                >
                  <option value="none">None</option>
                  <option value="capitalize">Capitalize</option>
                  <option value="uppercase">Uppercase</option>
                  <option value="lowercase">Lowercase</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Spacing & Layout Section */}
        <div className="style-section">
          <SectionHeader 
            title="Spacing & Layout" 
            icon={<Settings size={16} />}
            section="spacing"
            isExpanded={expandedSections.spacing}
          />
          
          {expandedSections.spacing && (
            <div className="section-content">
              <div className="style-group">
                <label>Text Indent (First Line)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="2"
                  value={parseFloat(styles.textIndent || 0)}
                  onChange={(e) => updateStyle('textIndent', `${e.target.value}px`)}
                  className="style-range"
                />
                <span className="range-value">{styles.textIndent || '0px'}</span>
              </div>

              <div className="style-row">
                <div className="style-group">
                  <label>Margin Top</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={parseFloat(styles.marginTop || 0)}
                    onChange={(e) => updateStyle('marginTop', `${e.target.value}px`)}
                    className="style-range"
                  />
                  <span className="range-value">{styles.marginTop || '0px'}</span>
                </div>

                <div className="style-group">
                  <label>Margin Bottom</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={parseFloat(styles.marginBottom || 16)}
                    onChange={(e) => updateStyle('marginBottom', `${e.target.value}px`)}
                    className="style-range"
                  />
                  <span className="range-value">{styles.marginBottom || '16px'}</span>
                </div>
              </div>

              <div className="style-row">
                <div className="style-group">
                  <label>Padding Left</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={parseFloat(styles.paddingLeft || 0)}
                    onChange={(e) => updateStyle('paddingLeft', `${e.target.value}px`)}
                    className="style-range"
                  />
                  <span className="range-value">{styles.paddingLeft || '0px'}</span>
                </div>

                <div className="style-group">
                  <label>Padding Right</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={parseFloat(styles.paddingRight || 0)}
                    onChange={(e) => updateStyle('paddingRight', `${e.target.value}px`)}
                    className="style-range"
                  />
                  <span className="range-value">{styles.paddingRight || '0px'}</span>
                </div>
              </div>

              <div className="style-group">
                <label>
                  <input
                    type="checkbox"
                    checked={styles.orphans === '3' && styles.widows === '3'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateStyle('orphans', '3')
                        updateStyle('widows', '3')
                      } else {
                        updateStyle('orphans', 'auto')
                        updateStyle('widows', 'auto')
                      }
                    }}
                    className="checkbox-input"
                  />
                  Prevent orphans & widows (EPUB quality)
                </label>
              </div>

              <div className="style-group">
                <label>
                  <input
                    type="checkbox"
                    checked={styles.hyphens === 'auto'}
                    onChange={(e) => updateStyle('hyphens', e.target.checked ? 'auto' : 'none')}
                    className="checkbox-input"
                  />
                  Enable hyphenation (better text flow)
                </label>
              </div>
            </div>
          )}
        </div>        {/* Reading Themes Section */}
        <div className="style-section">
          <SectionHeader 
            title="Reading Themes" 
            icon={<Eye size={16} />}
            section="themes"
            isExpanded={expandedSections.themes}
          />
          
          {expandedSections.themes && (
            <div className="section-content">
              <div className="color-presets">
                {colorPresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      updateStyle('color', preset.color)
                      updateStyle('backgroundColor', preset.bg)
                    }}
                    className="color-preset"
                    style={{ 
                      color: preset.color, 
                      backgroundColor: preset.bg,
                      border: `1px solid ${preset.color}20`
                    }}
                  >
                    <div className="preset-name">{preset.name}</div>
                    <div className="preset-desc">{preset.desc}</div>
                  </button>
                ))}
              </div>

              <div className="custom-colors">
                <div className="style-group">
                  <label>Custom Text Color</label>
                  <input
                    type="color"
                    value={styles.color || '#2d3748'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="color-input"
                  />
                </div>
                <div className="style-group">
                  <label>Custom Background</label>
                  <input
                    type="color"
                    value={styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="color-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced EPUB Features */}
        <div className="style-section">
          <SectionHeader 
            title="Advanced EPUB Features" 
            icon={<Sparkles size={16} />}
            section="advanced"
            isExpanded={expandedSections.advanced}
          />
          
          {expandedSections.advanced && (
            <div className="section-content">
              <div className="style-group">
                <label>
                  <input
                    type="checkbox"
                    checked={styles.dropCap === 'enabled'}
                    onChange={(e) => updateStyle('dropCap', e.target.checked ? 'enabled' : 'disabled')}
                    className="checkbox-input"
                  />
                  Enable drop caps (first letter styling)
                </label>
              </div>

              <div className="style-group">
                <label>Page Break Behavior</label>
                <select
                  value={styles.pageBreakInside || 'auto'}
                  onChange={(e) => updateStyle('pageBreakInside', e.target.value)}
                  className="style-select"
                >
                  <option value="auto">Auto</option>
                  <option value="avoid">Avoid breaks inside</option>
                  <option value="avoid-page">Avoid page breaks</option>
                  <option value="avoid-column">Avoid column breaks</option>
                </select>
              </div>

              <div className="style-group">
                <label>Text Rendering</label>
                <select
                  value={styles.textRendering || 'auto'}
                  onChange={(e) => updateStyle('textRendering', e.target.value)}
                  className="style-select"
                >
                  <option value="auto">Auto</option>
                  <option value="optimizeSpeed">Optimize Speed</option>
                  <option value="optimizeLegibility">Optimize Legibility</option>
                  <option value="geometricPrecision">Geometric Precision</option>
                </select>
              </div>

              <div className="style-group">
                <label>Font Smoothing</label>
                <select
                  value={styles.fontSmoothing || 'auto'}
                  onChange={(e) => {
                    updateStyle('WebkitFontSmoothing', e.target.value)
                    updateStyle('MozOsxFontSmoothing', e.target.value === 'antialiased' ? 'grayscale' : 'auto')
                  }}
                  className="style-select"
                >
                  <option value="auto">Auto</option>
                  <option value="antialiased">Antialiased</option>
                  <option value="subpixel-antialiased">Subpixel Antialiased</option>
                </select>
              </div>

              <div className="style-group">
                <label>
                  <input
                    type="checkbox"
                    checked={styles.fontVariantLigatures === 'common-ligatures'}
                    onChange={(e) => updateStyle('fontVariantLigatures', e.target.checked ? 'common-ligatures' : 'none')}
                    className="checkbox-input"
                  />
                  Enable font ligatures (fi, fl, etc.)
                </label>
              </div>

              <div className="style-group">
                <label>
                  <input
                    type="checkbox"
                    checked={styles.fontVariantNumeric === 'oldstyle-nums'}
                    onChange={(e) => updateStyle('fontVariantNumeric', e.target.checked ? 'oldstyle-nums' : 'normal')}
                    className="checkbox-input"
                  />
                  Use old-style numerals (if font supports)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Custom CSS Section */}
        <div className="style-section">
          <SectionHeader 
            title="Custom CSS" 
            icon={<Settings size={16} />}
            section="custom"
            isExpanded={expandedSections.custom}
          />
          
          {expandedSections.custom && (
            <div className="section-content">
              <div className="style-group">
                <label>Custom CSS Rules</label>
                <textarea
                  value={styles.customCSS || ''}
                  onChange={(e) => updateStyle('customCSS', e.target.value)}
                  className="custom-css-input"
                  placeholder="Enter custom CSS rules here...&#10;Example:&#10;p {&#10;  margin-bottom: 1.2em;&#10;  text-align: justify;&#10;}"
                  rows="6"
                />
                <small className="css-help">
                  This CSS will be applied to your EPUB content. Use standard CSS properties.
                </small>
              </div>

              <div className="css-presets">
                <button
                  onClick={() => updateStyle('customCSS', 
                    'p { margin-bottom: 1.2em; text-align: justify; }\n' +
                    'h1, h2, h3 { page-break-after: avoid; }\n' +
                    'blockquote { font-style: italic; margin: 1em 2em; }'
                  )}
                  className="preset-btn"
                >
                  Professional Book Style
                </button>
                <button
                  onClick={() => updateStyle('customCSS',
                    'p:first-of-type::first-letter {\n' +
                    '  font-size: 3em;\n' +
                    '  float: left;\n' +
                    '  line-height: 1;\n' +
                    '  margin: 0 0.1em 0 0;\n' +
                    '}'
                  )}
                  className="preset-btn"
                >
                  Drop Cap Style
                </button>
                <button
                  onClick={() => updateStyle('customCSS',
                    'p { hyphens: auto; text-align: justify; }\n' +
                    'h1, h2, h3 { text-align: center; }\n' +
                    'blockquote { border-left: 3px solid #ccc; padding-left: 1em; }'
                  )}
                  className="preset-btn"
                >
                  Magazine Style
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="style-section">
          <h4>💡 EPUB Styling Tips</h4>
          <div className="tips-content">
            <p><strong>For Best Results:</strong></p>
            <ul>
              <li>Use relative units (em, %) for font sizes</li>
              <li>Enable hyphenation for justified text</li>
              <li>Test on multiple devices with the Preview</li>
              <li>Avoid fixed widths - let content flow</li>
              <li>Use page-break-* properties for chapter breaks</li>
              <li>Consider accessibility with good contrast ratios</li>
            </ul>
            <p><strong>EPUB 3.0 Features:</strong></p>
            <ul>
              <li>CSS3 support for advanced typography</li>
              <li>Media queries for responsive design</li>
              <li>Font-face embedding (when supported)</li>
              <li>Advanced text layout properties</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StylePanel
