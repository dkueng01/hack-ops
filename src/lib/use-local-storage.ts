"use client"

import { useState, useEffect } from "react"

type Migrator<T> = (data: unknown) => T

export function useLocalStorage<T>(key: string, initialValue: T, migrator?: Migrator<T>) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        const value = migrator ? migrator(parsed) : parsed
        setStoredValue(value)
        // Save migrated data back to storage
        if (migrator) {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      }
    } catch (error) {
      console.error(error)
    }
    setIsLoaded(true)
  }, [key, migrator])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue, isLoaded] as const
}
