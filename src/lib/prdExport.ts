import jsPDF from 'jspdf'
import { PRD, BrandPersonality } from './types'

interface ExportOptions {
  brandName?: string
  tagline?: string
  personality?: BrandPersonality
  colors?: {
    primary: string
    secondary: string
    accent: string
  }
  language?: 'en' | 'ar'
  isRTL?: boolean
}

const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return arabicRegex.test(text)
}

const reverseArabicText = (text: string): string => {
  const lines = text.split('\n')
  return lines.map(line => {
    if (!isArabicText(line)) return line
    
    const words = line.split(' ')
    const reversedWords = words.reverse()
    
    return reversedWords.map(word => {
      if (isArabicText(word)) {
        return word.split('').reverse().join('')
      }
      return word
    }).join(' ')
  }).join('\n')
}

const prepareArabicForPDF = (text: string, isRTL: boolean): string => {
  if (!isRTL && !isArabicText(text)) {
    return text
  }
  
  const arabicChars: Record<string, string> = {
    'ا': '\u0627', 'أ': '\u0623', 'إ': '\u0625', 'آ': '\u0622',
    'ب': '\u0628', 'ت': '\u062A', 'ث': '\u062B', 'ج': '\u062C',
    'ح': '\u062D', 'خ': '\u062E', 'د': '\u062F', 'ذ': '\u0630',
    'ر': '\u0631', 'ز': '\u0632', 'س': '\u0633', 'ش': '\u0634',
    'ص': '\u0635', 'ض': '\u0636', 'ط': '\u0637', 'ظ': '\u0638',
    'ع': '\u0639', 'غ': '\u063A', 'ف': '\u0641', 'ق': '\u0642',
    'ك': '\u0643', 'ل': '\u0644', 'م': '\u0645', 'ن': '\u0646',
    'ه': '\u0647', 'و': '\u0648', 'ي': '\u064A', 'ى': '\u0649',
    'ة': '\u0629', 'ئ': '\u0626', 'ء': '\u0621', 'ؤ': '\u0624'
  }
  
  let normalized = text
  for (const [char, code] of Object.entries(arabicChars)) {
    normalized = normalized.replace(new RegExp(char, 'g'), code)
  }
  
  return normalized
}

const parseOklch = (oklchStr: string): { l: number; c: number; h: number } => {
  const match = oklchStr.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (!match) return { l: 0.5, c: 0.1, h: 200 }
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3])
  }
}

const oklchToRgb = (l: number, c: number, h: number): [number, number, number] => {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)
  
  let y = (l + 0.16) / 1.16
  let x, z
  
  if (l > 0.08) {
    y = Math.pow(y, 3)
  } else {
    y = l / 903.3
  }
  
  x = y * (a / 500 + 1)
  z = y * (1 - b / 200)
  
  x = x > 0.008856 ? Math.pow(x, 3) : (x - 16 / 116) / 7.787
  z = z > 0.008856 ? Math.pow(z, 3) : (z - 16 / 116) / 7.787
  
  x *= 95.047
  y *= 100.000
  z *= 108.883
  
  let r = x * 0.032406 + y * -0.015372 + z * -0.004986
  let g = x * -0.009689 + y * 0.018758 + z * 0.000415
  let bl = x * 0.000557 + y * -0.002040 + z * 0.010570
  
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g
  bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl
  
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(bl * 255)))
  ]
}

const getPersonalityStyles = (personality?: BrandPersonality) => {
  if (!personality) {
    return {
      headerStyle: 'professional',
      useDecorators: false,
      fontWeight: 'normal',
      spacing: 'standard'
    }
  }

  const archetype = personality.archetype.toLowerCase()
  
  if (archetype.includes('caregiver')) {
    return {
      headerStyle: 'warm',
      useDecorators: true,
      fontWeight: 'gentle',
      spacing: 'generous',
      emphasisColor: 'soft'
    }
  } else if (archetype.includes('innovator')) {
    return {
      headerStyle: 'bold',
      useDecorators: true,
      fontWeight: 'strong',
      spacing: 'compact',
      emphasisColor: 'vibrant'
    }
  } else if (archetype.includes('hero')) {
    return {
      headerStyle: 'powerful',
      useDecorators: true,
      fontWeight: 'strong',
      spacing: 'standard',
      emphasisColor: 'strong'
    }
  } else if (archetype.includes('sage')) {
    return {
      headerStyle: 'scholarly',
      useDecorators: false,
      fontWeight: 'normal',
      spacing: 'generous',
      emphasisColor: 'subtle'
    }
  }
  
  return {
    headerStyle: 'professional',
    useDecorators: false,
    fontWeight: 'normal',
    spacing: 'standard'
  }
}

export const exportPRDToPDF = (prd: PRD, options: ExportOptions = {}) => {
  const isRTL = options.isRTL || options.language === 'ar'
  const language = options.language || 'en'
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  const primaryColor = options.colors?.primary ? parseOklch(options.colors.primary) : { l: 0.68, c: 0.14, h: 340 }
  const accentColor = options.colors?.accent ? parseOklch(options.colors.accent) : { l: 0.75, c: 0.12, h: 180 }
  
  const primaryRgb = oklchToRgb(primaryColor.l, primaryColor.c, primaryColor.h)
  const accentRgb = oklchToRgb(accentColor.l, accentColor.c, accentColor.h)

  const styles = getPersonalityStyles(options.personality)

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  const wrapText = (text: string, maxWidth: number): string[] => {
    const preparedText = isRTL ? prepareArabicForPDF(text, isRTL) : text
    return doc.splitTextToSize(preparedText, maxWidth) as string[]
  }

  const addText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    const preparedText = isRTL ? prepareArabicForPDF(text, isRTL) : text
    const xPosition = isRTL && options?.align !== 'center' ? pageWidth - x : x
    const alignment = isRTL ? (options?.align === 'left' ? 'right' : options?.align === 'right' ? 'left' : options?.align) : options?.align
    
    if (alignment) {
      doc.text(preparedText, xPosition, y, { align: alignment })
    } else {
      doc.text(preparedText, xPosition, y)
    }
  }

  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
  
  if (styles.useDecorators) {
    doc.rect(0, 0, pageWidth, 50, 'F')
    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2])
    doc.rect(0, 45, pageWidth, 5, 'F')
  } else {
    doc.rect(0, 0, pageWidth, 40, 'F')
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  
  const title = options.brandName || (language === 'ar' ? 'وثيقة متطلبات المنتج' : 'Product Requirements Document')
  if (isRTL) {
    addText(title, pageWidth - margin, 25, { align: 'right' })
  } else {
    addText(title, margin, 25)
  }

  if (options.tagline) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    if (isRTL) {
      addText(options.tagline, pageWidth - margin, 35, { align: 'right' })
    } else {
      addText(options.tagline, margin, 35)
    }
  }

  yPosition = styles.useDecorators ? 60 : 50

  if (options.personality) {
    addNewPageIfNeeded(25)
    
    doc.setFillColor(245, 245, 250)
    doc.rect(margin, yPosition, contentWidth, 20, 'F')
    
    doc.setTextColor(60, 60, 80)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    
    const personalityLabel = language === 'ar' ? 'شخصية العلامة التجارية' : 'Brand Personality'
    const xPos = isRTL ? pageWidth - margin - 5 : margin + 5
    addText(personalityLabel, xPos, yPosition + 7)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const personalityText = `${options.personality.archetype} • ${options.personality.tone.join(', ')} • ${options.personality.values.join(', ')}`
    addText(personalityText, xPos, yPosition + 14)
    
    yPosition += 30
  }

  doc.setTextColor(40, 40, 40)

  const sectionOrder = ['problem', 'solution', 'targetUsers', 'features', 'metrics', 'regulatory'] as const
  
  const sectionTitlesAr: Record<string, string> = {
    problem: 'بيان المشكلة',
    solution: 'الحل المقترح',
    targetUsers: 'المستخدمون المستهدفون',
    features: 'الميزات الأساسية',
    metrics: 'مقاييس النجاح',
    regulatory: 'التنظيم والامتثال'
  }
  
  sectionOrder.forEach((sectionKey, index) => {
    const section = prd.sections[sectionKey]
    
    if (!section || !section.content.trim()) return

    addNewPageIfNeeded(40)

    if (index > 0) {
      yPosition += 8
    }

    if (styles.useDecorators && styles.headerStyle === 'bold') {
      const decoratorX = isRTL ? pageWidth - margin + 5 : margin - 5
      doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
      doc.rect(decoratorX, yPosition - 2, 5, 10, 'F')
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
    
    const sectionTitle = language === 'ar' ? sectionTitlesAr[sectionKey] : section.title
    const titleX = isRTL ? pageWidth - margin : margin
    addText(sectionTitle, titleX, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 40, 40)

    const lines = section.content.split('\n')
    
    lines.forEach((line) => {
      if (line.trim() === '') {
        yPosition += 3
        return
      }

      const textX = isRTL ? pageWidth - margin : margin
      const bulletX = isRTL ? pageWidth - margin - 2 : margin + 2
      const indentX = isRTL ? pageWidth - margin - 5 : margin + 5

      if (line.startsWith('# ')) {
        addNewPageIfNeeded(15)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
        const heading = line.replace('# ', '')
        addText(heading, textX, yPosition)
        yPosition += 8
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(40, 40, 40)
      } else if (line.startsWith('## ')) {
        addNewPageIfNeeded(12)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        const subheading = line.replace('## ', '')
        addText(subheading, textX, yPosition)
        yPosition += 7
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
      } else if (line.startsWith('### ')) {
        addNewPageIfNeeded(10)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        const subsubheading = line.replace('### ', '')
        addText(subsubheading, textX, yPosition)
        yPosition += 6
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
      } else if (line.match(/^[-*]\s/)) {
        addNewPageIfNeeded(8)
        const bulletText = line.replace(/^[-*]\s/, '')
        const wrappedLines = wrapText(bulletText, contentWidth - 8)
        
        doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2])
        doc.circle(bulletX, yPosition - 1.5, 1, 'F')
        
        wrappedLines.forEach((wrappedLine: string, i: number) => {
          addText(wrappedLine, indentX, yPosition)
          if (i < wrappedLines.length - 1) {
            yPosition += 5
            addNewPageIfNeeded(5)
          }
        })
        yPosition += 5
      } else if (line.match(/^\d+\.\s/)) {
        addNewPageIfNeeded(8)
        const numberMatch = line.match(/^(\d+)\.\s(.+)/)
        if (numberMatch) {
          const number = numberMatch[1]
          const text = numberMatch[2]
          const wrappedLines = wrapText(text, contentWidth - 10)
          
          doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
          doc.setFont('helvetica', 'bold')
          addText(`${number}.`, textX, yPosition)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(40, 40, 40)
          
          const numberIndentX = isRTL ? pageWidth - margin - 7 : margin + 7
          wrappedLines.forEach((wrappedLine: string, i: number) => {
            addText(wrappedLine, numberIndentX, yPosition)
            if (i < wrappedLines.length - 1) {
              yPosition += 5
              addNewPageIfNeeded(5)
            }
          })
          yPosition += 5
        }
      } else if (line.match(/^\*\*(.+?)\*\*/)) {
        addNewPageIfNeeded(6)
        const boldText = line.replace(/\*\*(.+?)\*\*/g, '$1')
        doc.setFont('helvetica', 'bold')
        addText(boldText, textX, yPosition)
        doc.setFont('helvetica', 'normal')
        yPosition += 5
      } else if (line.match(/^[-\[\]x\s]+/)) {
        addNewPageIfNeeded(6)
        const isChecked = line.includes('[x]') || line.includes('[X]')
        const checkboxText = line.replace(/^[-\[\]x\sX]+/, '').trim()
        
        const checkboxX = isRTL ? pageWidth - margin - 3 : margin
        doc.setDrawColor(100, 100, 100)
        doc.setLineWidth(0.3)
        doc.rect(checkboxX, yPosition - 3, 3, 3, 'S')
        
        if (isChecked) {
          doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
          doc.setFont('helvetica', 'bold')
          addText('✓', checkboxX + 0.5, yPosition - 0.5)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(40, 40, 40)
        }
        
        const checkboxIndentX = isRTL ? pageWidth - margin - 8 : margin + 5
        const wrappedLines = wrapText(checkboxText, contentWidth - 8)
        wrappedLines.forEach((wrappedLine: string) => {
          addText(wrappedLine, checkboxIndentX, yPosition)
          yPosition += 5
          addNewPageIfNeeded(5)
        })
      } else if (line.trim().length > 0) {
        addNewPageIfNeeded(6)
        const wrappedLines = wrapText(line, contentWidth)
        wrappedLines.forEach((wrappedLine: string) => {
          addText(wrappedLine, textX, yPosition)
          yPosition += 5
          addNewPageIfNeeded(5)
        })
      }
    })

    yPosition += styles.spacing === 'generous' ? 8 : styles.spacing === 'compact' ? 4 : 6
  })

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    
    const pageLabel = language === 'ar' ? 'صفحة' : 'Page'
    const ofLabel = language === 'ar' ? 'من' : 'of'
    const prdLabel = language === 'ar' ? 'وثيقة المتطلبات' : 'PRD'
    
    const footerText = options.brandName 
      ? `${options.brandName} ${prdLabel} • ${pageLabel} ${i} ${ofLabel} ${totalPages}`
      : `${prdLabel} • ${pageLabel} ${i} ${ofLabel} ${totalPages}`
    
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' })
    
    if (options.personality) {
      const personalityFooter = language === 'ar' 
        ? `علامة ${options.personality.archetype}`
        : `${options.personality.archetype} Brand`
      const footerX = isRTL ? margin : pageWidth - margin
      doc.text(personalityFooter, footerX, pageHeight - 10, { align: isRTL ? 'left' : 'right' })
    }
  }

  const fileName = options.brandName 
    ? `${options.brandName.replace(/\s+/g, '-')}-PRD.pdf`
    : language === 'ar' ? 'وثيقة-المتطلبات.pdf' : 'PRD.pdf'
  
  doc.save(fileName)
}

export const exportStoryToPDF = (
  story: string,
  options: {
    brandName?: string
    tone?: string
    targetPatient?: string
    coreProblem?: string
    impact?: string
    solutionVision?: string
    aiScore?: { clarity: number; emotion: number; healthcare: number }
    colors?: { primary: string; secondary: string; accent: string }
    language?: 'en' | 'ar'
    isRTL?: boolean
  } = {}
) => {
  const isRTL = options.isRTL || options.language === 'ar'
  const language = options.language || 'en'
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  const primaryColor = options.colors?.primary ? parseOklch(options.colors.primary) : { l: 0.58, c: 0.15, h: 65 }
  const accentColor = options.colors?.accent ? parseOklch(options.colors.accent) : { l: 0.78, c: 0.12, h: 45 }
  
  const primaryRgb = oklchToRgb(primaryColor.l, primaryColor.c, primaryColor.h)
  const accentRgb = oklchToRgb(accentColor.l, accentColor.c, accentColor.h)

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  const wrapText = (text: string, maxWidth: number): string[] => {
    const preparedText = isRTL ? prepareArabicForPDF(text, isRTL) : text
    return doc.splitTextToSize(preparedText, maxWidth) as string[]
  }

  const addText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    const preparedText = isRTL ? prepareArabicForPDF(text, isRTL) : text
    const xPosition = isRTL && options?.align !== 'center' ? pageWidth - x : x
    const alignment = isRTL ? (options?.align === 'left' ? 'right' : options?.align === 'right' ? 'left' : options?.align) : options?.align
    
    if (alignment) {
      doc.text(preparedText, xPosition, y, { align: alignment })
    } else {
      doc.text(preparedText, xPosition, y)
    }
  }

  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
  doc.rect(0, 0, pageWidth, 45, 'F')
  doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2])
  doc.rect(0, 40, pageWidth, 5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  
  const title = options.brandName 
    ? (language === 'ar' ? `قصة المؤسس - ${options.brandName}` : `Founder Story - ${options.brandName}`)
    : (language === 'ar' ? 'قصة المؤسس' : 'Founder Story')
  
  if (isRTL) {
    addText(title, pageWidth - margin, 25, { align: 'right' })
  } else {
    addText(title, margin, 25)
  }

  if (options.tone) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const toneLabel = language === 'ar' 
      ? `نمط السرد: ${options.tone === 'empathetic' ? 'عاطفي' : 'علمي'}`
      : `Narrative Tone: ${options.tone === 'empathetic' ? 'Empathetic' : 'Scientific'}`
    
    if (isRTL) {
      addText(toneLabel, pageWidth - margin, 35, { align: 'right' })
    } else {
      addText(toneLabel, margin, 35)
    }
  }

  yPosition = 55

  if (options.aiScore) {
    addNewPageIfNeeded(30)
    
    doc.setFillColor(250, 250, 255)
    doc.rect(margin, yPosition, contentWidth, 25, 'F')
    
    doc.setTextColor(60, 60, 80)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    
    const scoreLabel = language === 'ar' ? 'تقييم جودة القصة بالذكاء الاصطناعي' : 'AI Story Quality Score'
    addText(scoreLabel, isRTL ? pageWidth - margin - 5 : margin + 5, yPosition + 7)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    const clarityLabel = language === 'ar' ? 'الوضوح' : 'Clarity'
    const emotionLabel = language === 'ar' ? 'العاطفة' : 'Emotion'
    const healthcareLabel = language === 'ar' ? 'الرعاية الصحية' : 'Healthcare'
    
    const scoreText = `${clarityLabel}: ${options.aiScore.clarity} • ${emotionLabel}: ${options.aiScore.emotion} • ${healthcareLabel}: ${options.aiScore.healthcare}`
    addText(scoreText, isRTL ? pageWidth - margin - 5 : margin + 5, yPosition + 16)
    
    yPosition += 35
  }

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
  
  const narrativeLabel = language === 'ar' ? 'السرد' : 'Narrative'
  addText(narrativeLabel, isRTL ? pageWidth - margin : margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)

  const storyParagraphs = story.split('\n\n')
  
  storyParagraphs.forEach((paragraph, index) => {
    if (paragraph.trim().length === 0) return
    
    addNewPageIfNeeded(20)
    
    const wrappedLines = wrapText(paragraph, contentWidth)
    wrappedLines.forEach((line: string) => {
      addNewPageIfNeeded(7)
      addText(line, isRTL ? pageWidth - margin : margin, yPosition)
      yPosition += 6
    })
    
    if (index < storyParagraphs.length - 1) {
      yPosition += 5
    }
  })

  yPosition += 15

  if (options.targetPatient || options.coreProblem || options.impact || options.solutionVision) {
    addNewPageIfNeeded(60)
    
    doc.setFillColor(245, 245, 250)
    doc.rect(margin, yPosition, contentWidth, 3, 'F')
    yPosition += 10
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
    
    const elementsLabel = language === 'ar' ? 'عناصر القصة' : 'Story Elements'
    addText(elementsLabel, isRTL ? pageWidth - margin : margin, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 40, 40)

    const elements = [
      { label: language === 'ar' ? 'المريض المستهدف' : 'Target Patient', value: options.targetPatient },
      { label: language === 'ar' ? 'المشكلة الأساسية' : 'Core Problem', value: options.coreProblem },
      { label: language === 'ar' ? 'التأثير الواقعي' : 'Real-world Impact', value: options.impact },
      { label: language === 'ar' ? 'رؤية الحل' : 'Solution Vision', value: options.solutionVision }
    ]

    elements.forEach(({ label, value }) => {
      if (!value) return
      
      addNewPageIfNeeded(15)
      
      doc.setFont('helvetica', 'bold')
      addText(`${label}:`, isRTL ? pageWidth - margin : margin, yPosition)
      yPosition += 5
      
      doc.setFont('helvetica', 'normal')
      const wrappedLines = wrapText(value, contentWidth - 5)
      wrappedLines.forEach((line: string) => {
        addNewPageIfNeeded(5)
        addText(line, isRTL ? pageWidth - margin - 3 : margin + 3, yPosition)
        yPosition += 5
      })
      yPosition += 3
    })
  }

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    
    const pageLabel = language === 'ar' ? 'صفحة' : 'Page'
    const ofLabel = language === 'ar' ? 'من' : 'of'
    const storyLabel = language === 'ar' ? 'قصة المؤسس' : 'Founder Story'
    
    const footerText = options.brandName 
      ? `${options.brandName} ${storyLabel} • ${pageLabel} ${i} ${ofLabel} ${totalPages}`
      : `${storyLabel} • ${pageLabel} ${i} ${ofLabel} ${totalPages}`
    
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  const fileName = options.brandName 
    ? `${options.brandName.replace(/\s+/g, '-')}-Founder-Story.pdf`
    : language === 'ar' ? 'قصة-المؤسس.pdf' : 'Founder-Story.pdf'
  
  doc.save(fileName)
}
