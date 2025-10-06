export enum FileStatus {
  LOADING = 'loading',
  READY = 'ready', 
  ERROR = 'error',
  PROCESSING = 'processing',
  SUCCESS = 'success'
}

export interface FileItem {
  id: string
  name: string
  originalFile: File
  content: string
  status: FileStatus
  error?: string
  isSelected: boolean
  jobId?: string
  audioUrl?: string
}

export interface FileContextType {
  files: FileItem[]
  selectedFiles: FileItem[]
  isSelectionMode: boolean
  showFileList: boolean
  addFiles: (files: FileList) => Promise<void>
  removeFile: (id: string) => void
  toggleFileSelection: (id: string) => void
  selectAllFiles: () => void
  clearSelection: () => void
  setSelectionMode: (mode: boolean) => void
  setShowFileList: (show: boolean) => void
  processFiles: (fileIds: string[]) => Promise<void>
  downloadFile: (id: string) => void
  downloadAllSuccessful: () => void
}

export interface FileProviderProps {
  children: React.ReactNode
}

export interface FileValidationResult {
  isValid: boolean
  content?: string
  error?: string
}