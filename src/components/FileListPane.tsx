import React from 'react'
import { Card, Typography, Button, Collapse, Checkbox, Progress } from 'antd'
import { ArrowLeftOutlined, CloseOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DownloadOutlined, LoadingOutlined, CaretRightOutlined, CheckSquareOutlined, BorderOutlined, CaretDownOutlined, DeleteOutlined, StopOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons'
import { useFiles } from '../contexts/FileContext'
import { FileStatus } from '../types/file'

const { Title, Text } = Typography
const { Panel } = Collapse

interface FileListPaneProps {
  onClose: () => void
  isMobile: boolean
}

const getStatusIcon = (status: FileStatus) => {
  switch (status) {
    case FileStatus.LOADING:
      return <LoadingOutlined className="text-blue-500 animate-spin" />
    case FileStatus.READY:
      return <CheckCircleOutlined className="text-emerald-500" />
    case FileStatus.ERROR:
      return <CloseOutlined className="text-red-500 bg-red-500/20 rounded-full p-1" />
    case FileStatus.PROCESSING:
      return <LoadingOutlined className="text-amber-500 animate-spin" />
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

export function FileListPane({ onClose, isMobile }: FileListPaneProps) {
  const { 
    files, 
    selectedFiles, 
    isSelectionMode, 
    allExpanded,
    toggleFileSelection, 
    selectAllFiles, 
    clearSelection, 
    setSelectionMode, 
    removeFile, 
    stopFile,
    removeAllFiles,
    toggleExpandAll,
    downloadFile,
    downloadAllSuccessful,
    downloadSelected 
  } = useFiles()

  // Local state for individual file expansions
  const [expandedFiles, setExpandedFiles] = React.useState<Record<string, boolean>>({})

  const toggleFileExpansion = (fileId: string) => {
    setExpandedFiles(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }))
  }

  const successfulFiles = files.filter(f => f.status === FileStatus.SUCCESS)
  const readyFiles = files.filter(f => f.status === FileStatus.READY)
  const allReadySelected = readyFiles.length > 0 && readyFiles.every(f => f.isSelected)
  const selectedSuccessfulFiles = selectedFiles.filter(f => f.status === FileStatus.SUCCESS)

  return (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-y-scroll flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button
            type="text"
            icon={isMobile ? <CloseOutlined /> : <ArrowLeftOutlined />}
            onClick={onClose}
            className="text-white hover:text-blue-400 mr-3"
            size="large"
          />
          <Title level={4} className="text-white mb-0">
            {isSelectionMode ? `${selectedFiles.length} Selected` : `Attached Files (${files.length})`}
          </Title>
        </div>
        <div className="flex items-center space-x-2">
          {files.length > 0 && !isSelectionMode && (
            <>
              <Button
                type="text"
                size="small"
                icon={allExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={toggleExpandAll}
                className="text-gray-400 hover:text-white"
                title={allExpanded ? 'Collapse All' : 'Expand All'}
              >
                {allExpanded ? 'Collapse' : 'Expand'} All
              </Button>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={removeAllFiles}
                className="text-red-400 hover:text-red-300"
                title="Remove All Files"
              >
                Remove All
              </Button>
            </>
          )}
          {readyFiles.length > 0 && !isSelectionMode && (
            <Button
              type="text"
              size="small"
              icon={<CheckSquareOutlined />}
              onClick={() => setSelectionMode(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              Select
            </Button>
          )}
          {isSelectionMode && (
            <>
              <Button
                type="text"
                size="small"
                icon={allReadySelected ? <BorderOutlined /> : <CheckSquareOutlined />}
                onClick={allReadySelected ? clearSelection : selectAllFiles}
                className="text-blue-400 hover:text-blue-300"
              >
                {allReadySelected ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedSuccessfulFiles.length > 0 && (
                <Button
                  type="primary"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={downloadSelected}
                  className="text-xs"
                >
                  Download Selected ({selectedSuccessfulFiles.length})
                </Button>
              )}
              <Button
                type="text"
                size="small"
                onClick={() => setSelectionMode(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </>
          )}
          {successfulFiles.length > 0 && !isSelectionMode && (
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={downloadAllSuccessful}
              className="text-xs"
            >
              Download All ({successfulFiles.length})
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-white flex-1 overflow-y-auto pr-2">
        {files.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FileTextOutlined className="text-4xl mb-3" />
            <Text className="text-gray-400">No files attached yet</Text>
          </div>
        ) : (
          files.map((file) => {
            const expanded = allExpanded || expandedFiles[file.id]
            
            return (
              <div key={file.id} className="border border-gray-600 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors">
                {/* Main thin line */}
                <div className="flex items-center h-12 px-3 gap-3">
                  {/* Expand/Collapse toggle */}
                  <Button
                    type="text"
                    size="small"
                    icon={expanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
                    onClick={() => toggleFileExpansion(file.id)}
                    className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center p-0"
                  />
                  
                  {/* Selection checkbox */}
                  {isSelectionMode && file.status === FileStatus.READY && (
                    <Checkbox
                      checked={file.isSelected}
                      onChange={() => toggleFileSelection(file.id)}
                    />
                  )}
                  
                  {/* File name */}
                  <div className="flex-1 min-w-0">
                    <Text className="text-white text-sm font-medium truncate block" title={file.name}>
                      {file.name}
                    </Text>
                  </div>
                  
                  {/* Status icon (large) */}
                  <div className="text-2xl flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>
                  
                  {/* Stop button (for processing/loading files) */}
                  {(file.status === FileStatus.PROCESSING || file.status === FileStatus.LOADING) && (
                    <Button
                      type="text"
                      size="small"
                      icon={<StopOutlined />}
                      onClick={() => stopFile(file.id)}
                      className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 w-8 h-8 flex items-center justify-center"
                      title="Stop processing"
                    />
                  )}
                  
                  {/* Download button (only for successful files) */}
                  {file.status === FileStatus.SUCCESS && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadFile(file.id)}
                      className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 w-8 h-8 flex items-center justify-center"
                      title="Download audio file"
                    />
                  )}
                  
                  {/* Remove button (only when not processing) */}
                  {file.status !== FileStatus.PROCESSING && file.status !== FileStatus.LOADING && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 w-8 h-8 flex items-center justify-center"
                      title="Remove file"
                    />
                  )}
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-gray-600 p-3 bg-gray-800/50">
                    {/* Loading/Processing progress */}
                    {(file.status === FileStatus.PROCESSING || file.status === FileStatus.LOADING) && (
                      <div className="mb-3">
                        <Progress
                          percent={100}
                          size="small"
                          status="active"
                          showInfo={false}
                        />
                        <Text className="text-xs mt-1 block" style={{ color: file.status === FileStatus.PROCESSING ? '#facc15' : '#60a5fa' }}>
                          {file.status === FileStatus.PROCESSING 
                            ? (file.jobId ? 'Processing on server...' : 'Submitting job...') 
                            : 'Reading and validating file...'
                          }
                        </Text>
                      </div>
                    )}

                    {/* Error details */}
                    {file.error && (
                      <div className="bg-red-900/20 border border-red-700 rounded p-2 mb-3">
                        <Text className="text-red-300 text-xs font-medium block mb-1">
                          Error:
                        </Text>
                        <Text className="text-red-200 text-xs">
                          {file.error}
                        </Text>
                        <Text className="text-red-400 text-xs mt-2 block">
                          You can try removing and re-adding the file, or check if the file contains only Hebrew text.
                        </Text>
                      </div>
                    )}

                    {/* Success details with audio */}
                    {file.status === FileStatus.SUCCESS && file.audioUrl && (
                      <div className="bg-green-900/20 border border-green-700 rounded p-3 mb-3">
                        <Text className="text-green-300 text-xs font-medium block mb-2">
                          ✓ Generation completed successfully
                        </Text>
                        <audio
                          controls
                          className="w-full h-8"
                          src={file.audioUrl}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {/* Ready status */}
                    {file.status === FileStatus.READY && (
                      <div className="bg-green-900/10 border border-green-600 rounded p-2">
                        <Text className="text-green-300 text-xs">
                          ✓ File validation passed - Ready for speech generation
                        </Text>
                      </div>
                    )}

                    {/* Processing details */}
                    {file.status === FileStatus.PROCESSING && (
                      <div className="bg-yellow-900/20 border border-yellow-600 rounded p-2">
                        <Text className="text-yellow-300 text-xs font-medium block mb-1">
                          🎵 Generating speech audio...
                        </Text>
                        {file.jobId && (
                          <Text className="text-yellow-400 text-xs">
                            Job ID: {file.jobId}
                          </Text>
                        )}
                        <Text className="text-yellow-500 text-xs mt-1 block">
                          This may take a few minutes depending on text length
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}