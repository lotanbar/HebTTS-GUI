import { Card, Input, Typography, Button } from 'antd'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import { useFiles } from '../contexts/FileContext'

const { TextArea } = Input
const { Title } = Typography

interface TextInputCardProps {
  text: string
  setText: (text: string) => void
}

export function TextInputCard({ text, setText }: TextInputCardProps) {
  const { addFiles } = useFiles()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      addFiles(files)
    }
    event.target.value = ''
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
            icon={<PaperClipIcon className="w-4 h-4" />}
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
        rows={4}
        className="mb-4"
        size="large"
      />
    </Card>
  )
}
