"use client"

import { useState, useEffect } from "react"

export type AiProvider = "openai" | "claude" | "gemini" | "open-source" | "light-llm"

export interface AiSettings {
  activeProvider: AiProvider
  models: {
    openai: string
    claude: string
    gemini: string
    "open-source": string
    "light-llm": string
  }
}

const DEFAULT_SETTINGS: AiSettings = {
  activeProvider: "gemini",
  models: {
    openai: "gpt-4o-mini",
    claude: "claude-3-5-sonnet-20241022",
    gemini: "gemini-2.5-flash",
    "open-source": "llama-3.3-70b-versatile",
    "light-llm": "gemma-3-12b-it"
  }
}

const SETTINGS_STORAGE_KEY = "huenxt_ai_settings"
const LEGACY_SETTINGS_STORAGE_KEY = "somae_ai_settings"

export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY) || localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
        setSettings(parsed)
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed))
      }
    } catch (e) {
      console.error("Failed to load AI settings from localStorage", e)
    }
    setIsLoaded(true)
  }, [])

  const updateSettings = (newSettings: Partial<AiSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error("Failed to save AI settings to localStorage", e)
      }
      return updated
    })
  }

  const updateModel = (provider: AiProvider, modelId: string) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        models: {
          ...prev.models,
          [provider]: modelId
        }
      }
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error("Failed to save AI settings to localStorage", e)
      }
      return updated
    })
  }

  return { settings, updateSettings, updateModel, isLoaded }
}
