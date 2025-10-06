import { Typography, Button } from 'antd'
import { SoundOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface HeaderProps {
  onInfoClick: () => void
}

export function Header({ onInfoClick }: HeaderProps) {
  return (
    <div className="relative text-center mb-8">
      <div className="absolute left-0 top-0">
        <Button
          type="link"
          icon={<InfoCircleOutlined />}
          onClick={onInfoClick}
          className="text-blue-400 hover:text-blue-300 p-0 flex items-center"
        >
          Learn More
        </Button>
      </div>
      
      <Title level={1} className="text-white mb-2">
        <SoundOutlined className="mr-3" />
        HebTTS GUI
      </Title>
      <Text type="secondary" className="text-lg">
        Hebrew Text-to-Speech Generator
      </Text>
    </div>
  )
}
