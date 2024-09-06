// CREDIT: ALL CODE FROM https://github.com/iamchathu/react-material-file-upload

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
    Box,
    Button,
    Chip,
    FormControl,
    FormHelperText,
    Typography,
    TextField,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { styled } from "@mui/material/styles";

const ListItem = styled("li")(({ theme }) => ({
    margin: theme.spacing(0.5),
}));

const FileListItem = ({ name, onDelete }) => (
    <ListItem>
        <Chip
            label={name}
            icon={<UploadFileIcon />}
            variant="outlined"
            sx={{ maxWidth: 200 }}
            onDelete={onDelete}
        />
    </ListItem>
);

const FileUpload = ({
    value,
    onChange,
    sx,
    caption,
    title = "Drag 'n' drop some files here, or click to select files",
    buttonText = "Upload",
    typographyProps,
    buttonProps,
    disabled,
    maxSize,
    formStyles,
    ...options
}) => {
    const { fileRejections, getRootProps, getInputProps, open } = useDropzone({
        ...options,
        disabled,
        maxSize,
        onDropAccepted: onChange,
        noClick: true,
        noKeyboard: true,
    });

    const isFileTooLarge =
        maxSize !== undefined &&
        fileRejections.length > 0 &&
        fileRejections[0].file.size > maxSize;

    const remove = (index) => {
        const files = [...value];
        files.splice(index, 1);
        onChange(files);
    };

    const files = value?.map((file, i) => (
        <FileListItem
            key={file.name}
            name={file.name}
            onDelete={() => remove(i)}
        />
    ));

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                // borderColor: "black",
                // border: 1,
                mt: -1,
                height: "100%",
            }}
        >
            <Typography variant="caption" color="text.secondary" ml={1}>
                {caption || `${files.length} Files`}
            </Typography>
            <Box
                {...getRootProps()}
                sx={{
                    border: 1,
                    borderRadius: 1,
                    borderStyle: "dashed",
                    borderColor: "rgba(0, 0, 0, 0.23)",
                    pl: 2,
                    // my: 2,

                    // paddingY: 3,
                    // paddingX: 1,
                    "&:hover": {
                        borderColor: disabled ? undefined : "text.primary",
                    },
                    "&:focus-within": {
                        borderColor: "primary.main",
                        borderWidth: 2,
                    },
                    ...sx,
                }}
            >
                <FormControl
                    error={isFileTooLarge}
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        // justifyContent: "space-between",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <input {...getInputProps()} />
                    <CloudUploadIcon
                        sx={{ fontSize: 40 }}
                        // color={disabled ? "disabled" : "primary"}
                        color={"disabled"}
                    />
                    {/* <Typography
                        variant="caption"
                        textAlign="center"
                        sx={{ paddingY: 0.5 }}
                        {...typographyProps}
                    >
                        {title}
                    </Typography> */}
                    <Box
                        component="ul"
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            listStyle: "none",
                            p: 0.5,
                            m: 0,
                        }}
                    >
                        {files || (
                            <Typography variant="subtitle2">
                                Drop files here
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        onClick={open}
                        disabled={disabled}
                        // sx={{ marginBottom: 1 }}
                        {...buttonProps}
                    >
                        {buttonText}
                    </Button>
                    <FormHelperText>
                        {" "}
                        {fileRejections[0]?.errors[0]?.message}{" "}
                    </FormHelperText>
                </FormControl>
                {/* <Box
                    component="ul"
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        listStyle: "none",
                        p: 0.5,
                        m: 0,
                    }}
                >
                    {files}
                </Box> */}
            </Box>
        </Box>
    );
};

export default FileUpload;
