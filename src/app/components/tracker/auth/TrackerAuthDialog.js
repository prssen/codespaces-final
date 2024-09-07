import React, { useState, useEffect, useContext } from "react";
import { useMutation, useQueryClient } from "react-query";
import Cookies from "js-cookie";
import axios from "axios";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    Alert,
    TextField,
    Link,
    CircularProgress,
    Tabs, Tab
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
// import Loading from "../Components/Loading";
import Loading from "@/components/Loading";
import { useTheme } from "@mui/material";
// import useForm from "../Hooks/formHook";
import useForm from "@/lib/hooks/formHook";
// import LoginForm from "./LoginForm";
import LoginForm from "@/components/auth/LoginForm";
// import { useLogin2 } from "../Hooks/useAuth";
import { red } from "@mui/material/colors";
// import PasswordValidator from "./PasswordValidator";
import PasswordValidator from "@/components/auth/PasswordValidator";

// import { Context } from "../services/context/ContextProvider";
import { Context } from "@/lib/context/ContextProvider";
// import { useNavigate } from "react-router-dom";
// import { useTrackerLogin, useTrackerRegister } from '../Hooks/useApi';
import { useTrackerLogin, useTrackerRegister } from '@/lib/hooks/useApi';


export default function TrackerAuthDialog({ open, onClose }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const queryClient = useQueryClient();

    const theme = useTheme();
    // const navigate = useNavigate();

    // Logic to highlight 'submit' button when all form fields have been
    // completed - from GitHub Copilot
    const [touchedFields, setTouchedFields] = useState({});
    const handleBlur = (field) => () => {
        setTouchedFields({ ...touchedFields, [field]: true });
    };
    const allFieldsTouched = Object.values(touchedFields).every(
        (touched) => touched
    );

    const { values, errors, isErrors, updateFormValues } = useForm();
    const [isRegister, setIsRegister] = useState(false);
    const [title, setTitle] = useState(null);
    useEffect(() => {
        isRegister ? setTitle("Register") : setTitle("Login");
    }, [isRegister]);

    const { state, dispatch } = useContext(Context);

    const successCallback = () => {
        dispatch({ type: "LOGIN", payload: null });
        if (state.authCallbackOnce) {
            state.authCallbackOnce();
            dispatch({ type: "CLEAR_AUTH_CALLBACK", payload: null});
        }
        onClose();
    }

    // const loginMutation = useLogin2({ username, password, onClose });
    const { mutate: login, isError: isLoginError, isLoading: isLoginLoading, error: loginError } = useTrackerLogin(values, successCallback);
    const { mutate: register, isError: isRegisterError, isLoading: isRegisterLoading, error: registerError } = useTrackerRegister(values, successCallback);
    
    // To make rendering code slightly more concise
    const isError = isLoginError || isRegisterError;
    const isLoading = isLoginLoading || isRegisterLoading;
    const error = loginError || registerError;

    // Handling tabs
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [tabSwitched, setTabSwitched] = useState(false);


    useEffect(() => {
        tabValue === 1 ? setTitle("Register") : setTitle("Login");
    }, [tabValue]);

    // Submit user data to auth endpoint - adapted from Github Copilo
    const loginMutation = useMutation(
        async () => {
            const response = await axios.post(
                // "http://127.0.0.1:8000/dj-rest-auth/login/",
                "http://localhost:8000/dj-rest-auth/login/",
                {
                    username: values.username,
                    password: values.password,
                },
                {
                    // "X-CSRFToken": csrfToken,
                    // withCredentials: true,
                    "Content-Type": "application/json",
                    // Origin: "http://localhost:3000",
                }
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                // Store the user data in the query client
                dispatch({ type: "LOGIN", payload: null });
                console.log("Saved data: ", data);
                queryClient.setQueryData("user", data);
                // Clear the form fields
                console.log("Successfully logged in!");
                // Close the dialog
                onClose();
            },
            onError: (error) => {
                // Log the error or show an error message to the user
                console.error(error);
            },
        }
    );

    const handleLogin = () => {
        // loginMutation.mutate();
        // isRegister ? register() : login();
        tabValue === 1 ? register() : login();
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    }

    const handleSwitchTabLink = (event, newValue) => {
        setTabValue(1 - tabValue);
        setTabSwitched(true);
    }

    if (error) { console.log('Tracker authentication error:', error) };

    return (
        <>
            {isLoading && (
                <Loading open={isLoading} />
            )}
            <Dialog
                open={open}
                fullWidth
                maxWidth="xs"
                onClose={onClose} // Change to handleClose
                // maxWidth="md"
                // Responsive behaviour - expands to full width on smaller screens
                // fullWidth={th-eme.breakpoints.down("md")}
                // PaperComponent={PaperComponent}
                // PaperComponent={DraggableCard}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        backdopFilter: 'blur(5px) sepia(5%)'
                    }
                }}
            >
                {/* <DialogTitle>{title}</DialogTitle> */}
                <div styles={{
                    // backgroundColor: 'black',
                    borderRadius: '4px',
                    padding: '4px'
                }}>
                    <IconButton style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        color: 'black'
                    }}
                        onClick={onClose}
                    >
                        <CloseOutlined color='white'/>
                    </IconButton>
                </div>
                <DialogContent>
                    {/* <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    /> */}
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        aria-label="auth-tabs"
                        variant="fullWidth"
                        sx={{ width: '100%', marginBottom: 3}}
                    >
                        <Tab label="Login" />
                        <Tab label="Register" />
                    </Tabs>
                    {isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {isLoginError ? 'Login' : 'Registration'}{" "}failed. Please try again.
                            {console.log(
                                // "Login error: ",
                                // loginMutation.isError
                                `${isLoginError ? 'Login' : 'Registration'} error: ${isLoginError || isRegisterError}`
                            )}
                        </Alert> 
                    )}
                    {/* <Typography
                        variant="h5"
                        mb={1}
                    >
                        {title}
                    </Typography> */}
                    <LoginForm
                        values={values}
                        onChange={updateFormValues}
                        errors={errors}
                        onBlur={handleBlur}
                        isRegister={tabValue === 1}
                    />
                    {values.password && tabValue === 1 && <PasswordValidator values={values} setPasswordValidity={setIsPasswordValid}/>}
                </DialogContent>
                <DialogActions sx={{justifyContent: 'center'}}>
                    {/* <Button onClick={onClose}>Cancel</Button> */}
                    <Button
                        type="submit"
                        variant={
                            isErrors()
                                ? "outlined"
                                : allFieldsTouched
                                ? "contained"
                                : ""
                        }
                        color={isErrors() ? "error" : "primary"}
                        onClick={handleLogin}
                        disabled={isLoading || (tabValue === 1 && !isPasswordValid)}
                        sx={{
                            width: '90%',
                            borderRadius: 5
                        }}
                        disableElevation
                    >
                        {title}
                        {/* {loginMutation.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            "Login"
                        )} */}
                    </Button>
                </DialogActions>
                <Box
                    sx={{
                        p: 3,
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "baseline",
                        gap: 0.3,
                    }}
                >
                    {/* Create LoginDialog, and set isRegister state there, pass to form */}
                    {/* Hide for login dialog/pass in as extra 'action'*/}
                    <Typography
                        sx={{
                            color: isError && !tabSwitched ? red[400] : 'inherit',
                            transition: 'color 2s ease',

                        }}
                    >
                        {tabValue === 1
                            ? "Don't have an account?"
                            : "Already have an account?"}
                    </Typography>
                    <Typography> </Typography>
                    <Link
                        component="button"
                        // onClick={() => setIsRegister(!isRegister)}
                        onClick={handleSwitchTabLink}
                        // onClick={() => setUpdate(true)}
                        // TODO: set this in global state?
                        // onClick={() => setIsRegister(true)}
                        sx={{
                            fontWeight: isError && !tabSwitched ? 'bold' : 'normal',
                            transition: 'fontWeight 2s ease 2s',
                        }}
                    >
                        {tabValue === 1 ? "Login" : "Register"}
                    </Link>
                </Box>
            </Dialog>
        </>
    );
}