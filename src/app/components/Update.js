import React from "react";
import { Alert, Snackbar, AlertTitle } from "@mui/material";

/**
 *
 * TODO: 1) Wrap alert in <Collapse> and insert somewhere, so it moves other UI elements
 * out of the way (see https://mui.com/material-ui/react-alert/#transitions)
 * 2)
 */

// Code from https://www.youtube.com/watch?v=8F6Q7TTc0Sk&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=3
const Update = ({ open, setOpen, message, severity, title }) => {
    // // Getting state from global context
    // const { state: { alert}, dispatch} = useValue();

    // Updating state
    // const handleClose = (event, reason) => {
    //     if (reason === 'clickaway') return;
    //     dispatch({ type: 'UPDATE_ALERT' ,payload: { ...alert, open: false}})
    // }

    const handleClose = (e, reason) => {
        setOpen(false);
    };

    console.log("Set update is now " + open);

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                sx={{ width: "100%" }}
                variant="filled"
                elevation={6}
            >
                {title && <AlertTitle>{title}</AlertTitle>}
                {message}
            </Alert>
        </Snackbar>
    );
};

export default Update;