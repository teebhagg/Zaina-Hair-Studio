'use client'

import { createContext, useContext, ReactNode } from 'react'

type Dictionary = typeof import('../../messages/en.json')

interface DictionaryContextType {
  dictionary: Dictionary
  locale: string
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined)

export function DictionaryProvider({
  dictionary,
  locale,
  children,
}: {
  dictionary: Dictionary
  locale: string
  children: ReactNode
}) {
  return (
    <DictionaryContext.Provider value={{ dictionary, locale }}>
      {children}
    </DictionaryContext.Provider>
  )
}

export function useDictionary() {
  const context = useContext(DictionaryContext)
  if (context === undefined) {
    throw new Error('useDictionary must be used within a DictionaryProvider')
  }
  return context
}

// Helper function to get nested dictionary values
export function useTranslation(namespace?: string) {
  const { dictionary } = useDictionary()
  
  const t = (key: string, defaultValue?: string): string => {
    try {
      // If namespace is provided, split it (e.g., "home.services" -> ["home", "services"])
      const namespaceParts = namespace ? namespace.split('.') : []
      const keyParts = key.split('.')
      
      // Start from the root dictionary
      let value: any = dictionary
      
      // Navigate through namespace parts first
      for (const part of namespaceParts) {
        if (value === undefined || value === null) break
        value = value[part]
      }
      
      // Then navigate through key parts
      if (value !== undefined && value !== null) {
        for (const k of keyParts) {
          if (value === undefined || value === null) break
          value = value[k]
        }
      }
      
      // Return the translated string if found, otherwise return defaultValue or key
      if (typeof value === 'string') {
        return value
      }
      
      return defaultValue ?? key
    } catch (error) {
      console.error('Translation error:', error, { namespace, key, dictionary })
      return defaultValue ?? key
    }
  }
  
  return { t }
}
