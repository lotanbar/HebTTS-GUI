const STORAGE_KEY = 'hebtts-form-state'

export async function loadPersistedState(): Promise<Record<string, any>> {
  try {
    if (typeof window !== 'undefined' && window.electronAPI?.store) {
      const savedState = await window.electronAPI.store.get(STORAGE_KEY)
      return savedState || {}
    }
    
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    }
  } catch (error) {
    console.warn('Failed to load persisted state:', error)
  }
  return {}
}

export async function saveToStorage(key: string, value: any): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.electronAPI?.store) {
      const currentState = await window.electronAPI.store.get(STORAGE_KEY) || {}
      await window.electronAPI.store.set(STORAGE_KEY, { ...currentState, [key]: value })
      return
    }
    
    if (typeof localStorage !== 'undefined') {
      const currentState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...currentState, [key]: value }))
    }
  } catch (error) {
    console.warn('Failed to save to storage:', error)
  }
}

export async function saveFullState(state: Record<string, any>): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.electronAPI?.store) {
      await window.electronAPI.store.set(STORAGE_KEY, state)
      return
    }
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  } catch (error) {
    console.warn('Failed to save full state:', error)
  }
}