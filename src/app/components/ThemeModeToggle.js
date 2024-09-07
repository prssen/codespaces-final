import { useThemeMode } from '@/styles/ThemeProvider'
import Switch from '@mui/material/Switch'
import React from 'react'

const ThemeModeToggle = () => {
    const themeMode = useThemeMode();
  
    return (
        <Switch 
            checked={themeMode.mode === 'dark'}
            onChange={themeMode.toggleMode}
        />
    )
}

export default ThemeModeToggle