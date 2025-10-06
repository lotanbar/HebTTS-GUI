import type { FileValidationResult } from '../types/file'

const HEBREW_REGEX = /^[\u0590-\u05FF\u200F\u200E\s0-9.,!?;:()\-"'`\n\r\t]+$/

export const validateHebrewText = (text: string): FileValidationResult => {
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      error: 'File is empty or contains no readable text'
    }
  }

  const cleanText = text.trim()
  
  if (!HEBREW_REGEX.test(cleanText)) {
    return {
      isValid: false,
      error: 'File contains non-Hebrew characters. Only Hebrew, numbers, and basic punctuation are allowed'
    }
  }

  const hebrewCharCount = (cleanText.match(/[\u0590-\u05FF]/g) || []).length
  const totalChars = cleanText.replace(/\s/g, '').length
  
  if (hebrewCharCount < totalChars * 0.3) {
    return {
      isValid: false,
      error: 'File does not contain enough Hebrew text'
    }
  }

  return {
    isValid: true,
    content: cleanText
  }
}

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    
    reader.readAsText(file, 'utf-8')
  })
}