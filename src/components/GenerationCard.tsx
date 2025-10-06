import { Card, Button, Typography, Space } from 'antd'
import { SoundOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons'

const { Text } = Typography

interface GenerationCardProps {
  text: string
  isGenerating: boolean
  onGenerate: () => void
  onStop: () => void
}

export function GenerationCard({ text, isGenerating, onGenerate, onStop }: GenerationCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="text-center">
        <Space size="middle">
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
          
          <Button
            type="default"
            size="large"
            icon={<StopOutlined />}
            onClick={onStop}
            disabled={!isGenerating}
            className={`px-6 py-6 h-auto text-lg font-medium ${
              isGenerating 
                ? 'bg-red-600 border-red-500 text-white hover:bg-red-700 hover:border-red-600' 
                : 'bg-gray-600 border-gray-500 text-gray-400'
            }`}
          >
            Stop
          </Button>
        </Space>
        
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
