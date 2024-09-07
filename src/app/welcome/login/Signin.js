import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import {
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
  } from "react-query";

import axios from "axios";

// function useSignin(email, password) {
//     return useMutation("signin", async ({ email, password }) => {
//       const { data } = await axios.post(
//         "http://localhost:8000/dj-rest-auth/register/", { email, password }
//       );
//       return data;
//     });
//   }

const signIn = async ({ email, password1, password2, username }) => {
    const { data } = await axios.post(
    "http://localhost:8000/dj-rest-auth/registration", { email, password1, password2, username }
    );
    return data;
}


// All source code in this page credit; https://github.com/mui/material-ui/blob/v5.15.3/docs/data/material/getting-started/templates/sign-in/SignIn.js

// TODO remove, this demo shouldn't need to reset the theme.

export default function SignIn() {


    // const { status, data, error, isFetching } = useSignin();

    const { mutate, isLoading, isError, error } = useMutation(signIn);

    // const newUser = useMutation({
    //     useSignin: ({ email, password }) => useSignin(email, password),
    //     onSuccess: (data) => window.location.reload(),
    //     onError: (error) =>  console.log(error.message)
    // });

    if (isLoading) return "Loading...";
    if (error) return "An error has occurred: " + JSON.stringify(error);
    // if (status !== 'success') return 'Still not working';


    // Adapted from https://stackoverflow.com/questions/74589907/user-registration-with-react-query-and-firebase
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
        email: data.get('email'),
        password: data.get('password'),
        });

        mutate({ 
            email: data.get('email'), 
            password1: data.get('password1'), 
            password2: data.get('password2'),
            username: data.get('username') 
        });
    };

  return (
      <Container component="main" maxWidth="xs">
        <Paper variant="outlined" sx={{paddingTop: 0, marginTop: 4, padding: 3}}>
            <Box
            sx={{
                // marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
            >
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoFocus
                />
                <TextField
                margin="normal"
                required
                fullWidth
                name="username"
                label="Username"
                id="username"
                />
                <TextField
                margin="normal"
                required
                fullWidth
                name="password1"
                label="Password"
                type="password"
                id="password1"
                />
                <TextField
                margin="normal"
                required
                fullWidth
                name="password2"
                label="Re-enter password"
                type="password"
                id="password2"
                />
                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Sign In
                </Button>
            </Box>
            </Box>
        </Paper>
      </Container>
  );
}