import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/constants'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface EditorPreferences {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  validateOnType: boolean
}

interface SettingsState {
  theme: ThemeMode
  editor: EditorPreferences
  setTheme: (theme: ThemeMode) => void
  setEditorPreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K],
  ) => void
}

const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: false,
  minimap: false,
  validateOnType: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      editor: DEFAULT_EDITOR_PREFERENCES,
      setTheme: (theme) => set({ theme }),
      setEditorPreference: (key, value) =>
        set((state) => ({ editor: { ...state.editor, [key]: value } })),
    }),
    {
      name: STORAGE_KEYS.settings,
      version: 1,
    },
  ),
)
