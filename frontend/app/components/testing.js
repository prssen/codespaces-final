"use client";

import React, { useState, useEffect } from "react";
import { useLogin, useLogin2 } from "@/lib/hooks/useAuth";

const Testing = () => {
    const userCredentials = {
        username: "senaypetros",
        password: "football89",
    };
    // const { data, status, error, isFetching } = useLogin(userCredentials);
    const { mutate, isLoading, isError, data, error } =
        useLogin2(userCredentials);
    // mutate();
    // const [testing, setTesting] = useState(null);
    // useEffect(() => {
    //     (async () => {
    //         const response = await useLogin(userCredentials);
    //         setTesting(response);
    //         console.log("Response is: ", response);
    //     })();
    //     console.log("check if this runs");
    // }, []);
    // const response = useLogin(userCredentials);
    // TODO: testing onlly - delete when useQuery works
    console.log("Data: ", data);

    const handleLogin = () => {
        mutate();
    };

    if (isLoading) {
        return <div>Loading....</div>;
    }

    if (isError) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Testing</h1>
            <button onClick={handleLogin}>Click me</button>
            {data && <p>Response data: {data}</p>}
            {/* <p>Response status: {status}</p> */}
            {isLoading && <p>Response status: {isLoading}</p>}
            {error && <p>Response errors: {error}</p>}
            {/* <p>is Fetching: {isFetching}</p> */}
        </div>
    );
};

export default Testing;
