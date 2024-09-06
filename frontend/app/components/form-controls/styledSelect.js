import React, { useState } from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    FormHelperText,
} from "@mui/material";

const SelectInput = () => {
    return <></>;
};

// Params: takes a 'choices' object containing names and values for each select option,
// a 'values' state object which contains the name and value of the currently selected option
// as well as other state values,
// and a setValue function to update the state of the values object
const StyledSelect = ({
    label,
    name,
    values,
    choices,
    setValues,
    ...props
}) => {
    const [show, setShow] = useState(false);

    const handleChange2 = (e) => {
        console.log(`Current account type: ${values.accountType}`);
        console.log(`Name: ${e.target.name}, Value: ${e.target.value}`);
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    return (
        <>
            <FormControl
                fullWidth
                sx={{ mt: 2 }}
                onFocus={() => setShow(true)}
                onBlur={() => setShow(false)}
            >
                <InputLabel
                    shrink={true}
                    sx={{
                        fontSize: "0.8rem",
                        color: "secondary.text",
                        transform: "translate(8px, -21px)",
                    }}
                    variant="standard"
                    htmlFor="styled-select-label"
                />
                <Select
                    defaultValue="hello"
                    value={10}
                    label={label}
                    labelId="styled-select-label"
                    inputProps={{
                        // name: "hello", // TODO: change to 'name' and `styled-select-${name}`
                        // id: "styled-select",
                        name: { name }, // TODO: change to 'name' and `styled-select-${name}`
                        id: `styled-select-${name}`,
                        notched: false,
                    }}
                    onChange={handleChange2} // TODO: enable this
                    {...props}
                >
                    {/* <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem> */}
                    {Object.keys(choices).map((name, index) => (
                        <MenuItem value={choices[name]}>{name}</MenuItem>
                    ))}
                </Select>
                <FormHelperText
                    sx={{
                        ml: 1,
                        // display: show ? "" : "none",
                    }}
                >
                    With label + helper text
                </FormHelperText>
            </FormControl>
        </>
    );
};

export default StyledSelect;
