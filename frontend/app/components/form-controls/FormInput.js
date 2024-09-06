import TextField from "@mui/material/TextField";
import { InputBase, Autocomplete, styled, alpha } from "@mui/material";
import { useState } from "react";

// Code adapted from https://mui.com/material-ui/react-text-field/#using-the-styled-api
const testing = styled(InputBase)(({ theme }) => ({
    "label + &": {
        marginTop: theme.spacing(3),
    },
    "& .MuiInputBase-input": {
        borderRadius: 4,
        position: "relative",
        // backgroundColor: theme.palette.mode === "light" ? "#F3F6F9" : "#1A2027",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid",
        borderColor: theme.palette.mode === "light" ? "#E0E3E7" : "#2D3843",
        fontSize: 16,
        // width: "auto",
        padding: "10px 12px",
        transition: theme.transitions.create([
            "border-color",
            "background-color",
            "box-shadow",
        ]),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        "&:focus": {
            boxShadow: `${alpha(
                theme.palette.primary.main,
                0.25
            )} 0 0 0 0.2rem`,
            borderColor: theme.palette.primary.main,
        },
    },
}));
const FormInput = (props) => {
    // Show helper text if there is an error, or the showHelper property is set
    const [show, setShow] = useState(
        props.error ? true : props.showHelper ? !!props.showHelper : false
    );
    return (
        // <Autocomplete
        //     freeSolo
        //     disableClearable
        //     id={props.id || "free-solo-autocomplete"}
        //     options={props.options || []} // TODO: check [] is correct for no options
        //     renderInput={(params) => (
        <TextField
            label={props.label}
            onFocus={() => (!props.showHelper ? setShow(true) : "")}
            onBlur={() =>
                !props.showHelper && !props.error ? setShow(false) : ""
            }
            sx={{ marginTop: 2, width: "100%", ...props.sx }}
            InputProps={{
                notched: false,
            }}
            InputLabelProps={{
                shrink: true,
                sx: {
                    fontSize: "0.8rem",
                    color: "secondary.text",
                    transform: "translate(8px, -21px)",
                },
            }}
            FormHelperTextProps={{
                sx: {
                    ml: 1,
                    display: show ? "" : "none",
                },
            }}
            {...props}
        >
            {props.children}
        </TextField>
        //     )}
        // />
    );
};

export default FormInput;
