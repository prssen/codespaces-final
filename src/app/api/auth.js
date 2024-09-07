"use client";

import axios from "axios";
import { getCsrfToken } from "next-auth/react";

const base_url = process.env.BASE_URL;

// From https://stackoverflow.com/a/50735730
export function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}

// export const Register = async ({ username, password }) => {
export const Register = async ({ token }) => {
    const csrfToken = getCsrfToken();

    const { data } = await axios.post(
        `${base_url}/api-auth/`,
        {
            username: username,
            password: password,
        },
        {
            headers: {
                // "X-CSRFToken": getCookie("csrftoken"),
                "X-CSRFToken": csrfToken,
                Authorization: `Token ${token}`,
            },
            withCredentials: true,
        }
    );
    return data;
};

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

export const Logout = async () => {
    const { data } = await axios.post(
        `${base_url}/api-auth/logout/`,
        {},
        {
            // "X-CSRFToken": csrfToken,
            withCredentials: true,
        }
    );
    return data;
};
