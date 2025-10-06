import { Card, Input, Typography } from 'antd'

const { TextArea } = Input
const { Title } = Typography

interface TextInputCardProps {
  text: string
  setText: (text: string) => void
}

export function TextInputCard({ text, setText }: TextInputCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <Title level={3} className="text-white mb-4">
        Text Input
      </Title>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter Hebrew text to synthesize..."
        rows={4}
        className="mb-4"
        size="large"
      />
    </Card>
  )
}
