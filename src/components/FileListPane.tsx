import { Card, Typography, Button, Collapse, Checkbox, Progress } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { useFiles } from '../contexts/FileContext'
import { FileStatus } from '../types/file'

const { Title, Text } = Typography
const { Panel } = Collapse

interface FileListPaneProps {
  onClose: () => void
}

const getStatusIcon = (status: FileStatus) => {
  switch (status) {
    case FileStatus.LOADING:
      return <LoadingOutlined className="text-blue-400 animate-spin" />
    case FileStatus.READY:
      return <CheckCircleOutlined className="text-green-400" />
    case FileStatus.ERROR:
      return <ExclamationCircleOutlined className="text-red-400" />
    case FileStatus.PROCESSING:
      return <LoadingOutlined className="text-yellow-400 animate-spin" />
    case FileStatus.SUCCESS:
      return <CheckCircleOutlined className="text-green-500" />
    default:
      return <FileTextOutlined className="text-gray-400" />
  }
}

const getStatusText = (status: FileStatus) => {
  switch (status) {
    case FileStatus.LOADING:
      return 'Loading...'
    case FileStatus.READY:
      return 'Ready'
    case FileStatus.ERROR:
      return 'Error'
    case FileStatus.PROCESSING:
      return 'Processing...'
    case FileStatus.SUCCESS:
      return 'Complete'
    default:
      return 'Unknown'
  }
}

export function FileListPane({ onClose }: FileListPaneProps) {
  const { files, isSelectionMode, toggleFileSelection, removeFile, downloadFile } = useFiles()

  const successfulFiles = files.filter(f => f.status === FileStatus.SUCCESS)

  return (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-y-scroll flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onClose}
            className="text-white hover:text-blue-400 mr-3"
            size="large"
          />
          <Title level={4} className="text-white mb-0">
            Attached Files ({files.length})
          </Title>
        </div>
        {successfulFiles.length > 0 && (
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            className="text-xs"
          >
            Download All
          </Button>
        )}
      </div>

      <div className="space-y-3 text-white flex-1 overflow-y-auto pr-2">
        {files.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FileTextOutlined className="text-4xl mb-3" />
            <Text className="text-gray-400">No files attached yet</Text>
          </div>
        ) : (
          files.map((file) => (
            <Card
              key={file.id}
              size="small"
              className="bg-gray-700 border-gray-600"
              bodyStyle={{ padding: '12px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {isSelectionMode && file.status === FileStatus.READY && (
                    <Checkbox
                      checked={file.isSelected}
                      onChange={() => toggleFileSelection(file.id)}
                    />
                  )}
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getStatusIcon(file.status)}
                    <Text className="text-white truncate text-sm" title={file.name}>
                      {file.name}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Text className="text-xs text-gray-400">
                    {getStatusText(file.status)}
                  </Text>
                  {file.status === FileStatus.SUCCESS && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadFile(file.id)}
                      className="text-blue-400 hover:text-blue-300"
                    />
                  )}
                  <Button
                    type="text"
                    size="small"
                    onClick={() => removeFile(file.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              </div>

              {file.status === FileStatus.PROCESSING && (
                <Progress
                  percent={75}
                  size="small"
                  status="active"
                  showInfo={false}
                  className="mb-2"
                />
              )}

              {(file.error || file.status === FileStatus.SUCCESS) && (
                <Collapse
                  ghost
                  size="small"
                  className="mt-2"
                  expandIconPosition="end"
                >
                  <Panel
                    header={
                      <Text className="text-xs text-gray-400">
                        {file.error ? 'View Error' : 'View Details'}
                      </Text>
                    }
                    key="1"
                    className="text-xs"
                  >
                    {file.error && (
                      <Text className="text-red-300 text-xs">
                        {file.error}
                      </Text>
                    )}
                    {file.status === FileStatus.SUCCESS && file.audioUrl && (
                      <div className="space-y-2">
                        <audio
                          controls
                          className="w-full h-8"
                          src={file.audioUrl}
                        >
                          Your browser does not support the audio element.
                        </audio>
                        <div className="flex justify-end">
                          <Button
                            type="link"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => downloadFile(file.id)}
                            className="text-blue-400 hover:text-blue-300 text-xs p-0"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </Panel>
                </Collapse>
              )}
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}