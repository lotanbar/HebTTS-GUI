import { Card, Button, Typography } from 'antd'
import { SoundOutlined, LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

interface GenerationCardProps {
  text: string
  isGenerating: boolean
  onGenerate: () => void
}

export function GenerationCard({ text, isGenerating, onGenerate }: GenerationCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <div className="text-center">
        <Button
          type="primary"
          size="large"
          icon={isGenerating ? <LoadingOutlined /> : <SoundOutlined />}
          onClick={onGenerate}
          disabled={!text.trim() || isGenerating}
          loading={isGenerating}
          className="px-8 py-6 h-auto text-lg font-medium"
        >
          {isGenerating ? 'Generating...' : 'Generate Speech'}
        </Button>
        
        {!text.trim() && !isGenerating && (
          <div className="mt-3">
            <Text type="secondary" className="text-sm">
              Enter text above to enable generation
            </Text>
          </div>
        )}
      </div>
    </Card>
  )
}
