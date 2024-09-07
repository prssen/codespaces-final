import { createContext, useContext, useState, useMemo } from 'react';
import theme from './theme';
import { ThemeProvider } from '@mui/material';

export const ThemeModeContext = createContext('light');

export const useThemeMode = () => 
    useContext(ThemeModeContext);

const CustomThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    const toggleMode = () => {
        const isDarkMode = mode === 'dark';
        setMode(isDarkMode ? 'light' : 'dark');
    }

    console.log('Current mode is: ', mode);
    // const memoisedTheme = useMemo((mode) => theme(mode), [mode]);
    const themeFunc = () => theme(mode);

    return (
        <ThemeModeContext.Provider value = {{ mode, toggleMode }}>
            {/* <ThemeProvider theme={() => theme(mode)}> */}
            <ThemeProvider theme={themeFunc}>
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
}

export default CustomThemeProvider;