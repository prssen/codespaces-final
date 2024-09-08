"use client"

import { useState } from "react";
import {
    Container,
    Grid,
    FormGroup,
    FormControl,
    InputLabel,
    TextField,
    Checkbox,
    MenuItem,
    Select,
    FormControlLabel,
} from "@mui/material";
import FormInput from "@/components/form-controls/FormInput";

const CreateAccount = () => {
    const initialValues = {
        name: "",
        accountType: "",
        isSubAccount: false,
        parentAccount: "",
        standardAccount: "",
        description: "",
    };

    // TODO: get this from back end
    const accountTypes = {
        Asset: "asset",
        Liability: "liability",
        Equity: "equity",
        Revenue: "revenue",
        Expense: "expense",
    };

    const [values, setValues] = useState(initialValues);

    // TODO: retrieve choices from API, and set values.accountType to the choice selected
    const handleChange = (e) => {
        console.log(`Current account type: ${values.accountType}`);
        console.log(`Name: ${e.target.name}, Value: ${e.target.value}`);
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    // Checkboxes store their value in 'e.target.checked' rather than 'e.target.value'
    const handleChecked = (e) => {
        setValues({ ...values, [e.target.name]: e.target.checked });
    };

    return (
        <Container>
            <FormGroup>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormInput
                            id="account-name"
                            name="name"
                            label="Account Name"
                            helperText="Enter the name of the account"
                            value={values.name}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormInput
                            select
                            id="account-type"
                            name="accountType"
                            label="Account Type"
                            helperText="Enter the type of account here"
                            value={values.accountType}
                            onChange={handleChange}
                            showHelper={true}
                        >
                            {Object.keys(accountTypes).map((name, index) => (
                                <MenuItem value={accountTypes[name]} key={index}>
                                    {name}
                                </MenuItem>
                            ))}
                        </FormInput>
                        {/* <FormControl fullWidth>
                            <InputLabel id="account-type-label">
                                Account Type
                            </InputLabel>
                            <Select
                                labelId="account-type-label"
                                id="account-type"
                                name="accountType"
                                label="Account Type"
                                helper="Select the type of account"
                                value={values.accountType}
                                // value="asset"
                                onChange={handleChange}
                            >
                                {Object.keys(accountTypes).map(
                                    (type, index) => (
                                        <MenuItem value={accountTypes[type]}>
                                            {type}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl> */}
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    inputProps={{
                                        "aria-label": "primary checkbox",
                                    }}
                                    id="is-sub-account"
                                    name="isSubAccount"
                                    onChange={handleChecked}
                                />
                            }
                            label="Is sub-account"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {/* <StyledSelect
                            name="accountType"
                            label="Account Type"
                            values={values}
                            choices={accountTypes}
                            setValues={setValues}
                        /> */}
                        {/* <Autocomplete
                            freeSolo
                            id="parent-account"
                            disableClearable
                            name="parentAccount"
                            label="Parent account"
                            helperText="Enter the name of the account"
                            value={values.name}
                            sx={{ width: "100%" }}
                        /> */}
                        <FormInput
                            id="parent-account"
                            name="parentAccount"
                            label="Parent Account"
                            helperText="Enter the name of the parent account"
                            value={values.parentAccount}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormInput
                            id="standard-account"
                            name="standardAccount"
                            label="Standard Account"
                            helperText="Enter the name of the account in a standard chart of accounts"
                            value={values.standardAccount}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormInput
                            id="account-description"
                            name="description"
                            label="Description"
                            helperText="Enter a description of the purpose of the account"
                            value={values.description}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </FormGroup>
        </Container>
    );
};

export default CreateAccount;
