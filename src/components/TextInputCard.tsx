import { Card, Input, Typography, Button, Alert } from 'antd'
import { PaperClipOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useFiles } from '../contexts/FileContext'
import { validateHebrewText } from '../utils/hebrewValidation'
import { useState, useEffect } from 'react'

const { TextArea } = Input
const { Title } = Typography

interface TextInputCardProps {
  text: string
  setText: (text: string) => void
}

export function TextInputCard({ text, setText }: TextInputCardProps) {
  const { addFiles } = useFiles()
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string } | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      addFiles(files)
    }
    event.target.value = ''
  }

  // Validate text on change with debounce
  useEffect(() => {
    if (!text.trim()) {
      setValidation(null)
      setShowValidation(false)
      return
    }

    const timeoutId = setTimeout(() => {
      const result = validateHebrewText(text)
      setValidation({ isValid: result.isValid, error: result.error })
      setShowValidation(true)
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [text])

  // Calculate rows based on text length and content
  const calculateRows = (text: string) => {
    if (!text) return 2 // Minimum size when empty
    const lines = text.split('\n').length
    const estimatedLines = Math.ceil(text.length / 80) // Rough estimate based on 80 chars per line
    return Math.max(2, Math.min(12, Math.max(lines, estimatedLines))) // Between 2 and 12 rows
  }

  // Get input status for styling
  const getInputStatus = () => {
    if (!showValidation || !validation) return undefined
    return validation.isValid ? undefined : 'error'
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <Title level={3} className="text-white mb-0">
          Text Input
        </Title>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-input"
            multiple
            accept=".txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="default"
            icon={<PaperClipOutlined />}
            onClick={() => document.getElementById('file-input')?.click()}
            className="flex items-center gap-1"
          >
            Attach Files (.txt)
          </Button>
        </div>
      </div>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter Hebrew text to synthesize or attach .txt files..."
        rows={calculateRows(text)}
        className="mb-2"
        size="large"
        autoSize={{ minRows: 2, maxRows: 12 }}
        status={getInputStatus()}
      />
      
      {/* Validation Feedback */}
      {showValidation && validation && (
        <div className="mb-4">
          {validation.isValid ? (
            <Alert
              message="Text validation passed"
              description="Your Hebrew text is ready for speech generation"
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
              className="bg-green-900/20 border-green-600 text-green-300"
            />
          ) : (
            <Alert
              message="Text validation failed"
              description={validation.error}
              type="error"
              icon={<ExclamationCircleOutlined />}
              showIcon
              className="bg-red-900/20 border-red-600 text-red-300"
            />
          )}
        </div>
      )}
    </Card>
  )
}
