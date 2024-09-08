"use client"

import React, { useState, useEffect, useContext } from "react";
import { useThemeMode } from "@/styles/ThemeProvider";
import { Box, Typography, Button, Divider, Link, Alert, Tabs, Tab, Slider, FormGroup, FormControlLabel, Switch } from "@mui/material";
import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
// import TrackerAuthDialog from "./TestingDialog";
import useForm from "@/lib/hooks/formHook";
// import LoginForm fro../../components/auth/LoginFormorm";
import LoginForm from "@/components/auth/LoginForm";
// import Loading from "../Components/Loading";
import Loading from "@/components/Loading";
// import { useAccountingLogin, useAccountingRegister } from "../Hooks/useApi";
import { useAccountingLogin, useAccountingRegister } from "@/lib/hooks/useApi";
import PasswordValidator from "@/components/auth/PasswordValidator";
// import background from "../../assets/login-background.jpg";
import background from "/public/images/flowing-background.webp";
// import background from "./login-background.jpg"

// import { useNavigate } from "react-router-dom";
import { useRouter } from "next/navigation";

// import { keyframes } from "@mui/material/styles";

import { useTheme } from "@mui/material/styles";

// console.log('background is: ', background);


const LoginPage = () => {

    // const navigate = useNavigate();
    const router = useRouter();
    
    const theme = useTheme();
    const themeMode = useThemeMode();

    const [loginOpen, setLoginOpen] = useState(false);
    const handleLoginClose = () => setLoginOpen(false);

    const handleBlur = (field) => () => {
        // TODO: delete this if unnecessary
        };

    const redirect = (response) => {
        // If login response does not include 'has_charity: true',
        // redirect to onboarding/
        if (response.has_charity !== "true") {
            // navigate('/accounting/onboarding')
            router.push('/accounting/onboarding')
        }
        // else, redirect to accounting/projects/
        else {
            // navigate('/accounting/projects')
            router.push('/accounting/projects')
        }
    }

    const { values, errors, isErrors, updateFormValues } = useForm();
    
    const { mutate: login, isError: isLoginError, isLoading: isLoginLoading, error: loginError } = useAccountingLogin(values, redirect);
    const { mutate: register, isError: isRegisterError, isLoading: isRegisterLoading, error: registerError } = useAccountingRegister(values, redirect);
    
    // To make rendering code slightly more concise
    const isError = isLoginError || isRegisterError;
    const isLoading = isLoginLoading || isRegisterLoading;
    const error = loginError || registerError;

    // const [isClientError, setIsClientError] = useState(false);
    // const [cancelError, setCancelError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [isRegister, setIsRegister] = useState(false);
    const [title, setTitle] = useState(null);

    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [tabSwitched, setTabSwitched] = useState(false);

    // const [isDarkMode, setIsDarkMode] = useState(false);
    // const toggleDarkMode = (event) => setIsDarkMode(event.target.checked);
    // const toggleDarkMode = (event) => {
    //     const isDarkMode = theme.palette.mode === 'dark';
    //     theme.palette.mode = isDarkMode ? 'light' : 'dark';
    // }

    // Display server-side error message
    useEffect(() => {
        // TODO: setErrorMessage to this string
        if (isError) {
            let errorMsg = tabValue === 1 ? 'Registration': 'Login';
            errorMsg += ` ${error.response?.status >= 500 ? 'failed due to a server error: please try later.' : 
                'failed. Please try again.'}`;
            // setCancelError(false);
            setErrorMessage(errorMsg);
        }
    }, [isError]);

    // // Clear client-side form validation error alert when user starts 
    // // typing again
    // useEffect(() => {
    //     if (isClientError) {
    //         setIsClientError(false);
    //         setErrorMessage(null);
    //     }
    //     if (isError) {
    //         setCancelError(true);
    //     }
    // }, [values]);

    // useEffect(() => {
    //     tabValue === 1 ? setTitle("Create an account") : setTitle("Login here");
    // }, [tabValue]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 1) {
            setTitle("Create an account")
        } else {
            setTitle("Login here");
        }
    }

    const handleSwitchTabLink = (event, newValue) => {
        setTabValue(1 - tabValue);
        setTabSwitched(true);
    }

    // Display client-side form error message; otherwise, login/register
    const handleSubmit = () => {
        // console.log('handle submit called: values', values);
        // if (!values.password || !values.username) {
        //     console.log(`Missing password: ${!values.password}; Missing username: ${!values.username}`);
        //     setCancelError(false);
        //     setIsClientError(true);
        //     setErrorMessage(!values.password ? 'Password missing' : 'Username missing');
        // } else {
            console.log('The current value of values is: ', values);
            tabValue === 1 ? register() : login();
            // console.log('Handle submit called. Is register: ', isRegister);
        
        // }
    }

    // const loginAnimation = keyframes`
    //     0% {
    //         fontWeight: 'normal',
    //         color: theme.palette.text.primary
    //     }
    //     50% {
    //         fontWeight: 'bold',
    //         color: 'red',
    //     }
    //     100% {
    //         fontWeight: 'normal',
    //         color: theme.palette.text.primary
    //     }
    // `

    // const loginStyles = isError ? {
    //     fontWeight: 'bold',
    //     color: 'red',
    //     transition: '3s'
    // } : {
    //     fontWeight: 'normal',
    //     color: 'black'
    // };

    // console.log('Background is: ', background);

    return (
        <>
            {isLoading && (
                <Loading open={isLoading} />
            )}
            <Box sx={{
                display: 'flex',
                flex: 1, 
                // border: 1,
                // borderColor: 'white',
                // height: '95%', 
                // width: '95%',
                top: '5%',
                right: '5%',
                padding: 2,
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                backgroundColor: 'transparent',
                position: 'absolute',
                // pointerEvents: 'none',
                // '& .clickable': {
                //     pointerEvents: 'auto'
                // }
            }}>
                {/* <FormGroup className='clickable' sx={{pointerEvents: 'auto'}}> */}
                <FormGroup className='clickable' sx={{zIndex: 1000}}>
                    <FormControlLabel 
                        control={
                            <Switch 
                                // checked={theme.palette.mode === 'dark'} 
                                checked={themeMode.mode === 'dark'}
                                onChange={themeMode.toggleMode}
                            />
                        }
                        label="Dark mode" 
                    />
                        
                </FormGroup>
            </Box>
            <Box sx={{
                display: 'flex',
                flex: 1,
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                // border: 2,
                // borderColor: 'pink',
                alignItems: 'center',
                position: 'relative'
                // backgroundImage: `url(${background})`,
                // backgroundRepeat: "no-repeat",
                // backgroundSize: "cover",

                // backgroundSize: `300px 300px`,
            }}>
                <div style={{
                    position: 'absolute',
                    // top: '-90px',
                    left: '-20px',
                    // width: '110%',
                    // border: '2px solid green',
                    // width: 'auto',
                    height: '100%',
                    // height: 'auto',
                    // border: 2,
                    // CSS to invert image for dark mode. Credit: AI response
                    filter: theme.palette.mode === 'dark' ? 'invert(1) brightness(0.8) contrast(1.2)' : 'none',
                    // backgroundColor: 'grey',
                    // backgroundImage: `url('https://random.imagecdn.app/500/150')`,
                    // backgroundPositionY: "bottom",
                    // backgroundSize: "contain",
                    //backgroundPosition: '50% 20%',
                    // Adjust to match size
                    
                    // backgroundImage: `url(${background.src})`,
                    // backgroundRepeat: "no-repeat",
                    // backgroundSize: "cover",
                    borderColor: 'grey',
                    zIndex: -1000,
                }} />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    // backgroundColor: alpha('#F5F5F5', 0.5),
                    backgroundColor: 'transparent',
                    // borderColor: grey[300],
                    // border: 1,
                    width: '40%',
                    borderRadius: 3,
                    p: 3
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="auth-tabs"
                        variant="fullWidth"
                        sx={{ width: '100%', marginBottom: 3, px: 2}}
                    >
                        <Tab label="Login" />
                        <Tab label="Register" />
                    </Tabs>
                    {/* {(isError || isClientError) && !cancelError && ( */}
                    {isError && (
                        <Alert 
                            // severity={isClientError ? "warning" :  "error"} 
                            severity="error"
                            sx={{ 
                                mb: 2,
                                // opacity: (isError || isClientError) ? 1 : 0,
                                // transform: (isError || isClientError) ? 'translateX(0%)' : 'translateX(-10%)',
                                opacity: isError ? 1 : 0,
                                transform: isError ? 'translateX(0%)' : 'translateX(-10%)',
                                transition: 'all 3.0s linear',
                            }}>
                            {/* {tabValue === 1 ? 'Registration': 'Login'}{" "}failed {
                                error.response?.status >= 500 ? ' due to a server error: please try later.' : 
                                '. Please try again.'} */}
                                {/* . Please try again. */}
                                {errorMessage}
                            {console.log(
                                "Login error: ",
                                isError
                            )}
                        </Alert>)
                    }
                    {/* )} */}
                    <Typography
                        variant="h5"
                        my={2}
                        fontWeight="semiBold"
                    >
                        {title}
                    </Typography>
                    <LoginForm
                        values={values}
                        onChange={updateFormValues}
                        // errors={errors}
                        onBlur={handleBlur}
                        // isRegister={isRegister}
                        isRegister={tabValue === 1}
                    />
                    {values.password && tabValue === 1 && <PasswordValidator values={values} setPasswordValidity={setIsPasswordValid} />}
                    {/* {isPasswordValid && <Typography>Password completely valid!</Typography>} */}
                    <Button
                        variant={
                            isErrors()
                                ? "outlined"
                                : "contained"
                        }
                        color={isErrors() ? "error" : "primary"}
                        onClick={handleSubmit}
                        disabled={isLoading || (tabValue === 1 && !isPasswordValid)}
                        disableElevation
                    sx={{
                        marginTop: 2,
                        width: '90%',
                        borderRadius: 5,
                    }}
                    >                
                        {/* {title} */}
                        {tabValue === 1 ? "Register" : "Login"}
                    </Button>
                {/* <TrackerAuthDialog open={true} onClose={() => {}} /> */}
                    {/* <Divider
                            variant="middle"
                            sx={{
                                // opacity: 0.6,
                                color: 'blue',
                                width: "95%",
                                mx: "auto",
                                mt: 3, mb: 1,
                            }}
                    /> */}
                    <Box
                        sx={{
                            px: 2,
                            pt: 2,
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
                                color: isError && !tabSwitched ? 'red' : 'inherit',
                                transition: 'color 2s ease',
                                // animation: isError ? `${loginAnimation} 2s ease`: 'none'

                            }}
                            // variant="body2"
                        >
                            {!(tabValue === 1)
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </Typography>
                        <Typography> </Typography>
                        <Link
                            component="button"
                            // variant="body2"
                            // onClick={() => setIsRegister(!isRegister)}
                            // Toggle tab value between 0 (login) and 1 (register)
                            onClick={handleSwitchTabLink}
                            // onClick={() => setUpdate(true)}
                            // TODO: set this in global state?
                            // onClick={() => setIsRegister(true)}
                        >
                            {/* {isRegister ? "Login" : "Register"} */}
                            {tabValue === 1 ? "Login" : "Register"}
                        </Link>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default LoginPage;