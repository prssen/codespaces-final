import { createContext, useContext, useReducer } from "react";
import reducer from "./reducer";

// From https://www.youtube.com/watch?v=FQcDr7LauFM&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=21
// (comments my own)
const initialState = {
    currentCharity: null,
    userCharities: [],
    currentUser: null,
    // Determines whether login dialog is open or closed,
    // as it can be opened in multiple places
    confirmOpen: false,
    openLogin: false,
    loggedIn: false,
    loading: false,
    firstLogin: false,
    profile: { photoURL: "" },
    location: { lat: 0, lon: 0 },
    alert: { open: false, severity: "info", message: "" },
};

export const Context = createContext(initialState);

// Hook that wraps the useContext() hook, letting us access the global
// state in the Context object wherever we import this in the
// app
export const useValue = () => {
    return useContext(Context);
};

const ContextProvider = ({ children }) => {
    // useReducer is a hook that lets you store a deeply nested object,
    // and provides a dispatch() method to efficiently update it
    const [state, dispatch] = useReducer(reducer, initialState);

    // Here we are adding the state to the global context available throughout
    // the app
    return (
        <Context.Provider value={{ state, dispatch }}>
            {children}
        </Context.Provider>
    );
};

export default ContextProvider;
