import { useContext, createContext } from 'react';

/**
 * Minimal Context provider to pass values to form field components
 */
const FormContext = createContext();
export const useFormContext = () => useContext(FormContext);

export const FormProvider = ({ children, initialValues }) => {
    return (
        <FormContext.Provider value={initialValues}>
            {children}
        </FormContext.Provider>
    )    
}