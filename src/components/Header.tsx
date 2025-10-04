import { Typography } from 'antd'
import { SoundOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export function Header() {
  return (
    <div className="text-center mb-8">
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
