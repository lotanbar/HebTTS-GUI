import { Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useTTSForm } from '../contexts/TTSFormContext'

export function RestoreDefaultsButton() {
  const { resetToDefaults } = useTTSForm()

  return (
    <Button
      icon={<ReloadOutlined />}
      onClick={resetToDefaults}
      type="default"
      size="large"
      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500"
    >
      Restore Defaults
    </Button>
  )
}