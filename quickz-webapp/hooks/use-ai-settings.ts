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
    openai: "gpt-5.4-pro",
    claude: "claude-sonnet-5",
    gemini: "gemini-3.5-flash",
    "open-source": "meta-llama/llama-4-scout-17b-16e-instruct",
    "light-llm": "gemma-3-12b-it"
  }
}

export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("quickz_ai_settings")
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
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
        localStorage.setItem("quickz_ai_settings", JSON.stringify(updated))
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
        localStorage.setItem("quickz_ai_settings", JSON.stringify(updated))
      } catch (e) {
        console.error("Failed to save AI settings to localStorage", e)
      }
      return updated
    })
  }

  return { settings, updateSettings, updateModel, isLoaded }
}
