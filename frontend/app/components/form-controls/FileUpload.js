import React from "react";
import { Button, InputAdornment } from "@mui/material";
import { MuiFileInput } from "mui-file-input";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { FileUploadOutlined } from "@mui/icons-material";
// TODO:
/*
    - Get file from target.files
*/
function FileUpload(props) {
    const [show, setShow] = React.useState(false);

    // const [file, setFile] = React.useState(null);
    // const handleChange = (newFile) => {
    //     setFile(newFile);
    // };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        // Display the file name in file upload input field
        props.onChange(file.name);
    };

    return (
        <>
            {/* Fromhttps://stackoverflow.com/a/49408555 */}
            {/* <input
                accept="image/*"
                // className={classes.input}
                style={{ display: 'none' }}
                id="raised-button-file"
                multiple
                type="file"
            />
            <label htmlFor="raised-button-file">
                <Button 
                    variant="contained" 
                    component="span" 
                    className={classes.button}>
                Upload
                </Button>
            </label>  */}
            <MuiFileInput
                {...props}
                value={props.value}
                onChange={handleFileChange}
                multiple
                clearIconButtonProps={{
                    title: "Remove",
                    children: <CloseOutlinedIcon fontSize="small" />,
                }}
                label="Attachments"
                helperText="Upload attachments here"
                InputProps={{
                    notched: false,
                    startAdornment: (
                        <InputAdornment>
                            <FileUploadOutlined />
                        </InputAdornment>
                    ),
                }}
                FormHelperTextProps={{
                    sx: {
                        ml: 1,
                        display: show ? "" : "none",
                    },
                }}
                onFocus={() => setShow(true)}
                onBlur={() => setShow(false)}
                sx={{ marginTop: 2, width: "100%" }}
                InputLabelProps={{
                    shrink: true,
                    sx: {
                        fontSize: "0.8rem",
                        color: "secondary.text",
                        transform: "translate(8px, -21px)",
                    },
                }}
            />
        </>
    );
}

export default FileUpload;

// label={props.label || "My label"}
//             onFocus={() => (!props.showHelper ? setShow(true) : "")}
//             onBlur={() =>
//                 !props.showHelper && !props.error ? setShow(false) : ""
//             }
//             sx={{ marginTop: 2, width: "100%", ...props.sx }}
//             InputProps={{
//                 notched: false,
//             }}
//             InputLabelProps={{
//                 shrink: true,
//                 sx: {
//                     fontSize: "0.8rem",
//                     color: "secondary.text",
//                     transform: "translate(8px, -21px)",
//                 },
//             }}
//             FormHelperTextProps={{
//                 sx: {
//                     ml: 1,
//                     display: show ? "" : "none",
//                 },
//             }}
