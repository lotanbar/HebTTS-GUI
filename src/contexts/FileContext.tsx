import React, { createContext, useContext, useState, useCallback } from 'react'
import type { FileContextType, FileProviderProps, FileItem } from '../types/file'
import { FileStatus } from '../types/file'
import { validateHebrewText, readFileAsText } from '../utils/hebrewValidation'
import { synthesizeSpeech, getJobStatus } from '../services/runpodAPI'
import { useTTSForm } from './TTSFormContext'
import { base64ToBlob } from '../utils/audio'

const FileContext = createContext<FileContextType | undefined>(undefined)

export function FileProvider({ children }: FileProviderProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showFileList, setShowFileList] = useState(false)
  const { getFormParams } = useTTSForm()

  const selectedFiles = files.filter(file => file.isSelected)

  const generateUniqueId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileItem[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileItem: FileItem = {
        id: generateUniqueId(),
        name: file.name,
        originalFile: file,
        content: '',
        status: FileStatus.LOADING,
        isSelected: false
      }
      newFiles.push(fileItem)
    }

    setFiles(prev => [...prev, ...newFiles])
    setShowFileList(true)

    for (const fileItem of newFiles) {
      try {
        const textContent = await readFileAsText(fileItem.originalFile)
        const validation = validateHebrewText(textContent)
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? {
                ...f,
                content: validation.content || '',
                status: validation.isValid ? FileStatus.READY : FileStatus.ERROR,
                error: validation.error
              }
            : f
        ))
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? {
                ...f,
                status: FileStatus.ERROR,
                error: error instanceof Error ? error.message : 'Failed to read file'
              }
            : f
        ))
      }
    }
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const stopFile = useCallback((id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id && (f.status === FileStatus.PROCESSING || f.status === FileStatus.LOADING)
        ? { ...f, status: FileStatus.READY, jobId: undefined, error: undefined }
        : f
    ))
  }, [])

  const toggleFileSelection = useCallback((id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id && f.status === FileStatus.READY 
        ? { ...f, isSelected: !f.isSelected } 
        : f
    ))
  }, [])

  const selectAllFiles = useCallback(() => {
    setFiles(prev => prev.map(f => ({ 
      ...f, 
      isSelected: f.status === FileStatus.READY ? true : f.isSelected 
    })))
  }, [])

  const clearSelection = useCallback(() => {
    setFiles(prev => prev.map(f => ({ 
      ...f, 
      isSelected: f.status === FileStatus.READY ? false : f.isSelected 
    })))
  }, [])

  const removeAllFiles = useCallback(() => {
    setFiles([])
    setIsSelectionMode(false)
  }, [])

  const [allExpanded, setAllExpanded] = useState(false)
  
  const toggleExpandAll = useCallback(() => {
    setAllExpanded(!allExpanded)
  }, [allExpanded])

  const processFiles = useCallback(async (fileIds: string[]) => {
    const filesToProcess = files.filter(f => fileIds.includes(f.id) && f.status === FileStatus.READY)
    const formParams = getFormParams()
    
    if (filesToProcess.length === 0) return

    // Set all files to processing status
    setFiles(prev => prev.map(f => 
      fileIds.includes(f.id) && f.status === FileStatus.READY
        ? { ...f, status: FileStatus.PROCESSING }
        : f
    ))

    // Process files with concurrent request handling
    const processFileWithRetry = async (file: FileItem) => {
      const maxRetries = 2
      let attempt = 0

      while (attempt <= maxRetries) {
        try {
          const response = await synthesizeSpeech({
            text: file.content,
            speaker: formParams.speaker,
            top_k: formParams.top_k,
            temperature: formParams.temperature,
            use_mbd: formParams.use_mbd,
            filename: file.name.replace('.txt', '')
          })

          if (response.id) {
            // Update with job ID
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, jobId: response.id } : f
            ))

            // Poll for completion
            let jobComplete = false
            let pollAttempts = 0
            const maxPollAttempts = 150 // 5 minutes max (2s intervals)

            while (!jobComplete && pollAttempts < maxPollAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000))
              pollAttempts++

              try {
                const statusResponse = await getJobStatus(response.id)
                
                if (statusResponse.status === 'COMPLETED') {
                  let audioUrl: string | undefined = undefined
                  
                  if (statusResponse.output?.audio_base64) {
                    const audioBlob = base64ToBlob(statusResponse.output.audio_base64, 'audio/wav')
                    audioUrl = URL.createObjectURL(audioBlob)
                  }
                  
                  setFiles(prev => prev.map(f => 
                    f.id === file.id 
                      ? { 
                          ...f, 
                          status: FileStatus.SUCCESS,
                          audioUrl 
                        }
                      : f
                  ))
                  jobComplete = true
                  return { success: true, fileId: file.id }
                } else if (statusResponse.status === 'FAILED') {
                  throw new Error(statusResponse.error || 'Job failed on server')
                }
              } catch (pollError) {
                if (pollAttempts >= maxPollAttempts) {
                  throw new Error('Polling timeout - job may still be processing')
                }
                // Continue polling on temporary errors
                if (pollAttempts % 10 === 0) {
                  console.warn(`Polling attempt ${pollAttempts} failed for ${file.name}:`, pollError)
                }
              }
            }

            if (pollAttempts >= maxPollAttempts) {
              throw new Error('Job timeout - processing took too long')
            }
          } else {
            throw new Error('No job ID returned from server')
          }
        } catch (error) {
          attempt++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          if (attempt > maxRetries) {
            // Final failure
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    status: FileStatus.ERROR,
                    error: `Failed after ${maxRetries} attempts: ${errorMessage}`
                  }
                : f
            ))
            return { success: false, fileId: file.id, error: errorMessage }
          } else {
            // Wait before retry (exponential backoff)
            const waitTime = Math.pow(2, attempt) * 1000
            console.warn(`Attempt ${attempt} failed for ${file.name}, retrying in ${waitTime}ms:`, error)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
      }
    }

    // Process files with batching to respect RunPod limits (max 200 concurrent)
    const batchSize = Math.min(50, filesToProcess.length) // Conservative batch size
    const batches = []
    
    for (let i = 0; i < filesToProcess.length; i += batchSize) {
      batches.push(filesToProcess.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      const batchPromises = batch.map(file => processFileWithRetry(file))
      const results = await Promise.allSettled(batchPromises)
      
      // Log batch completion
      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length
      const failed = results.length - successful
      console.log(`Batch completed: ${successful} successful, ${failed} failed`)
      
      // Small delay between batches to avoid overwhelming the API
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }, [files, getFormParams])

  const downloadFile = useCallback(async (id: string) => {
    const file = files.find(f => f.id === id)
    if (!file) {
      console.error('File not found for download:', id)
      return
    }

    if (!file.audioUrl) {
      console.error('No audio URL available for file:', file.name)
      return
    }

    try {
      // Create filename with timestamp to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${file.name.replace('.txt', '')}_${timestamp}.wav`
      
      // Use fetch to download with proper error handling
      const response = await fetch(file.audioUrl)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url)
      
      console.log(`Downloaded: ${filename}`)
    } catch (error) {
      console.error(`Failed to download ${file.name}:`, error)
      // You could show a toast notification here in the future
    }
  }, [files])

  const downloadAllSuccessful = useCallback(async () => {
    const successfulFiles = files.filter(f => f.status === FileStatus.SUCCESS && f.audioUrl)
    
    if (successfulFiles.length === 0) {
      console.warn('No successful files available for download')
      return
    }

    console.log(`Starting batch download of ${successfulFiles.length} files...`)

    // Download files with a small delay between each to avoid overwhelming the browser
    for (const file of successfulFiles) {
      await downloadFile(file.id)
      // Small delay to prevent browser issues with multiple simultaneous downloads
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('Batch download completed')
  }, [files, downloadFile])

  const downloadSelected = useCallback(async () => {
    const selectedSuccessfulFiles = selectedFiles.filter(f => f.status === FileStatus.SUCCESS && f.audioUrl)
    
    if (selectedSuccessfulFiles.length === 0) {
      console.warn('No selected successful files available for download')
      return
    }

    console.log(`Starting download of ${selectedSuccessfulFiles.length} selected files...`)

    for (const file of selectedSuccessfulFiles) {
      await downloadFile(file.id)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('Selected files download completed')
  }, [selectedFiles, downloadFile])

  const contextValue: FileContextType = {
    files,
    selectedFiles,
    isSelectionMode,
    showFileList,
    allExpanded,
    addFiles,
    removeFile,
    stopFile,
    removeAllFiles,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    toggleExpandAll,
    setSelectionMode: setIsSelectionMode,
    setShowFileList,
    processFiles,
    downloadFile,
    downloadAllSuccessful,
    downloadSelected
  }

  return (
    <FileContext.Provider value={contextValue}>
      {children}
    </FileContext.Provider>
  )
}

export function useFiles(): FileContextType {
  const context = useContext(FileContext)
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider')
  }
  return context
}