"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({})

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }) {
   const [theme, setTheme] = useState(
      () => localStorage.getItem(storageKey) || defaultTheme
   )

   useEffect(() => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")

      // set light theme if on auth page
      const token = localStorage.getItem('token')
      if (!token) {
         root.classList.add("light")
         return
      }

      if (theme === "system") {
         const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light"
         root.classList.add(systemTheme)
         return
      }

      root.classList.add(theme)
   }, [theme])

   const value = {
      theme,
      setTheme: (theme) => {
         localStorage.setItem(storageKey, theme)
         setTheme(theme)
      },
   }

   return (
      <ThemeProviderContext.Provider {...props} value={value}>
         {children}
      </ThemeProviderContext.Provider>
   )
}

export const useTheme = () => {
   const context = useContext(ThemeProviderContext)

   if (context === undefined)
      throw new Error("useTheme must be used within a ThemeProvider")

   return context
}