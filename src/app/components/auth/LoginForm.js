import React from "react";
import { Typography, Box, FormGroup, Grid } from "@mui/material";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/components/form-controls/FormInput";
// import useFormValues from "../Hooks/formHook";
import useForm from "@/lib/hooks/formHook";
// import PasswordField from "../Components/PasswordField";
import PasswordField from "@/components/form-controls/PasswordField";
import { arr } from "@/lib/utils/utils";

// Include title and description in <meta> tags to improve SEO
export const metadata = {
    title: 'Login to AccountTrack',
    description: 'Login page for the AccountTrack accounting system'
}

function LoginForm({
    values,
    errors,
    isRegister,
    // setIsRegister,
    onChange,
    onBlur,
    ...props
}) {
    // const errors = {};
    // const { values, updateFormValues = useFormValues();

    // TODO: fetch from global state instead
    // const [isRegister, setIsRegister] = useState(true);

    // const handleChange = () => console.log("Submit forms here");

    /* TODO: validation rules:
        - Password: min length 6, requir
        - Username: unique? 
    */
    return (
        <FormGroup>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormInput
                        error={errors?.fieldErrors?.username}
                        id="username"
                        name="username"
                        label="Username"
                        helperText={
                            arr(errors?.fieldErrors?.username).join("; ") ||
                            "Enter your username here"
                        }
                        value={values.username}
                        onChange={onChange}
                        onBlur={() => onBlur("username")}
                    />
                </Grid>
                <Grid item xs={12}>
                    <PasswordField
                        id="password"
                        name="password"
                        label="Password"
                        value={values.password}
                        onChange={onChange}
                        onBlur={() => onBlur("password")}
                    />
                </Grid>
                <Grid item xs={12}>
                    {isRegister && (
                        <PasswordField
                            id="password-2"
                            name="confirmPassword"
                            label="Confirm Password"
                            value={values.confirmPassword}
                            onBlur={() => onBlur("confirmPassword")}
                            onChange={onChange}
                        />
                    )}
                </Grid>
            </Grid>
        </FormGroup>
    );
}

export default LoginForm;