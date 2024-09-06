import { useQuery, useMutation } from "react-query";
import { useEffect, useState } from "react";
import axios from "axios";
import { useQueryClient } from "react-query";

// export const Login = async ({ username, password, csrfToken }) => {
export const Login = async ({ username, password }) => {
    // console.log(`The url is: ${base_url}/api-auth/login/`);
    console.log(`The url is: http://localhost:8000/dj-rest-auth/login/`);
    // const csrfToken = getCsrfToken();
    // console.log("csrfToken is: ", csrfToken);

    const { data } = await axios.post(
        // `${base_url}/api-auth/login/`,
        "http://127.0.0.1:8000/dj-rest-auth/login/",
        // "https://www.google.com",
        {
            username: username,
            password: password,
            // username: "testing",
            // password: "testing123",
        },
        {
            // "X-CSRFToken": csrfToken,
            // withCredentials: true,
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
        }
    );

    // localStorage.set("token", data.token);

    return data;
};

export const useLogin = ({ username, password }) => {
    console.log("Username and password: ", username, password);
    return useQuery("login", () => {
        console.log("Is inner function called by useQuery?");
        return Login({ username, password });
    });
};

export const useLogin2 = ({ username, password, onClose }) => {
    console.log("Username and password: ", username, password);
    const queryClient = useQueryClient();
    return useMutation(async () => await Login({ username, password }), {
        onSuccess: (data) => {
            // Store the user data in the query client
            console.log("Saved data: ", data);
            queryClient.setQueryData("user", data);
            // Clear the form fields
            console.log("Successfully logged in!");
            // Close the dialog
            onClose ?? onClose();
        },
        onError: (error) => {
            // Log the error or show an error message to the user
            console.error(error);
        },
    });
};

export const useLogin3 = ({ values, onClose }) =>
    useMutation(
        async () => {
            const response = await axios.post(
                "http://127.0.0.1:8000/dj-rest-auth/login/",
                {
                    username: values.username,
                    password: values.password,
                },
                {
                    // "X-CSRFToken": csrfToken,
                    // withCredentials: true,
                    "Content-Type": "application/json",
                    Origin: "http://localhost:3000",
                }
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                // Store the user data in the query client
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
// let csrfToken = null;
// if (typeof window !== "undefined") {
//     csrfToken = getCookie("csrftoken");
// }

// const [csrfToken, setCsrfToken] = useState(null);
// useEffect(() => {
//     setCsrfToken(getCookie("csrftoken"));
// }, []);

// console.log("Csrf token is: ", csrfToken);

// Testing the API endpoint (test the useQuery after that)
// Login({ username, password, csrfToken })

// THIS WORKS
/*
    Login({ username, password })
        .then((response) => {
            console.log("Response: ", response);
            return response;
        })
        .catch((error) => {
            console.error("Error: ", error);
        });
    */

// try {
//     // response = await Login({ username, password });
//     return response;
// } catch (error) {
//     console.error("Error found: ", error);
// }
// };
