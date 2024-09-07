"use client"

import React, { useState } from "react";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from '@/components/form-controls/FormInput';
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const PasswordField = ({ ...props }) => {
    // Code adapted from https://www.youtube.com/watch?v=8F6Q7TTc0Sk&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=3
    const [showPassword, setShowPassword] = useState(false);

    const handleClick = () => setShowPassword(!showPassword);

    // TODO: find out why this is necessary
    const onMouseDown = (e) => e.preventDefault();

    return (
        <FormInput
            {...props}
            type={showPassword ? "" : "password"}
            autoComplete={showPassword ? "current-password" : ""}
            InputProps={{
                notched: false,
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={handleClick}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default PasswordField;