// From https://www.youtube.com/watch?v=FQcDr7LauFM&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=21
// This function operates on the state variable, changing it
// in a predefined way
const reducer = (state, action) => {
    switch (action.type) {
        case "CHANGE_LOCATION":
            return { ...state, location: action.payload };
        // Open/close the login dialog box in donation tracker
        case "OPEN_LOGIN":
            return { ...state, openLogin: true };
        case "CLOSE_LOGIN":
            return { ...state, openLogin: false };
        // login only has 2 possible states, so we can define
        // separate actions for each
        case "LOGIN":
            return { ...state, loggedIn: true };
        case "LOGOUT":
            return { ...state, loggedIn: false };
        // Used to get notifications from DB first (when first logging in)
        // and then fetch updates via WebSockets thereafter
        case "FIRST_LOGIN": {
            // return { ...state, firstLogin: true};
            const newState = { ...state, firstLogin: true};
            console.log('New FIRST_LOGIN state: ', newState);
            return newState;
        }
        case "LOGGED_IN": {
            return { ...state, firstLogin: false};
        }
        // Transaction confirmation dialog for TEA
        case "CONFIRM_OPEN":
            return { ...state, confirmOpen: true, confirmNotification: action.payload };
        case "CONFIRM_CLOSE":
            console.log('Close dialog is being called');
            return { ...state, confirmOpen: false, confirmNotification: null };
        case "UPDATE_USER":
            return { ...state, currentUser: action.payload };
        case "CHANGE_CHARITY":
            return { ...state, currentCharity: action.paylod };
        case "ADD_AUTH_CALLBACK":
            return { ...state, authCallbackOnce: action.payload };
        case "CLEAR_AUTH_CALLBACK":
            return { ...state, authCallbackOnce: null };
        default:
            throw new Error("No matched action!");
    }
};

export default reducer;
