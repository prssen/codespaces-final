"use client"
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Box, IconButton, useTheme, Link, Alert } from "@mui/material";
import * as z from "zod";
import _ from "lodash";
import { serialize } from "object-to-formdata";

// import useForm from "../../Hooks/formHook";
import useForm from "@/lib/hooks/formHook";
import { useState, useEffect } from "react";
import { Cancel, CancelOutlined, Send } from "@mui/icons-material";
// import Update from "../../Components/Update";
import Update from "@/components/Update";
// import { partnerSchema } from "../../Hooks/validationSchema";

import {
    useCreateActivity,
    useCreateSupplier,
    useGetIndicators,
    useGetServices
// } from "../../Hooks/useApi";
} from "@/lib/hooks/useApi";
import CreateActivityForm from "./CreateActivity";
// import Loading from "../../Components/Loading";
import Loading from "@/components/Loading";

// TODO: handleClose = () => setOpen(!open)
//      in parent component

// Higher-order component making the dialog box draggable
// Credit: code from https://mui.com/material-ui/react-dialog/#draggable-dialog
export const PaperComponent = (props) => {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
};
/*
TODO: to make this reusable
- 'dialogTitle' and 'dialogSubtitle' props
- instantiate 'formValues' and 'updateFormValues' and pass to child form
*/

// Credit: code adapted from https://mui.com/material-ui/react-dialog/
const CreateActivityDialog = ({
    open,
    handleClose,
    startTransition,
    title,
    serviceID,
    projectID,
    children,
}) => {
    const theme = useTheme();


    const [activityCreated, setActivityCreated] = useState(false);
    const [currentService, setCurrentService] = useState(serviceID || "38413231-0a82-42d9-a393-0b33966ea16d");
    // const [currentProject, setCurrentProject] = useState(projectID || "b5870836-51c7-436e-a9fe-c25958e6579e");


    // Gets all the indicators for a given project service
    const { data, isLoading, isError, error } = useGetIndicators(
        // serviceID || "38413231-0a82-42d9-a393-0b33966ea16d"
        currentService
    );

    // const { 
    //     data: services, 
    //     isLoading: servicesLoading, 
    //     isError: isServicesError, 
    //     error: servicesError } = useGetServices(currentProject);

    const { mutate: createActivity } = useCreateActivity(handleClose);

    const initialValues = {
        indicator: "",
        date: "",
        startTime: "",
        endTime: "",
        title: "",
        notes: "",
        indicator_amount: "",
        attachments: "",
    };

    // const options = {
    //     sectors: [
    //         { value: "health", label: "Health" },
    //         { value: "utilities", label: "Utilities" },
    //         { value: "ngoPartner", label: "NGO Partner" },
    //     ],
    // };

    const [canSubmit, setCanSubmit] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);

    // Check if there are any errors in the form
    // const isErrors = () => !_.isEmpty(errors.fieldErrors);

    const [update, setUpdate] = useState(false);
    const mutation = useCreateSupplier();

    const formHandler = (e, _errors) => {
        // if (!_.isEmpty(errors.fieldErrors)) {
        if (isErrors()) {
            setAlertOpen(true);
        } else {
            const formData = serialize(values);
            console.log("form data: ", Array.from(formData.entries()));
            console.log("form values are: ", values);
            createActivity(formData);
        }
    };

    const { values, updateFormValues, formSubmit, errors, isErrors } = useForm(
        initialValues,
        undefined,
        formHandler
    );

    if (isLoading) return <Loading open={isLoading} />;

    const options = data?.indicators?.map((indicator, index) => ({
        label: indicator.name,
        value: indicator.uuid,
    }));
    // const options = { sectors };

    console.log("Errors are: ", errors);
    console.log("Values are: ", values);

    return (
        <>
            <Update
                open={alertOpen}
                setOpen={setAlertOpen}
                message="There were errors in your form. Please correct and try again."
                severity="error"
                // title="Form submission error"
            />
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                // Responsive behaviour - expands to full width on smaller screens
                fullWidth={theme.breakpoints.down("md")}
                PaperComponent={PaperComponent}
                PaperProps={{
                    onSubmit: (event) => {
                        startTransition(() => {
                            event.preventDefault();
                            // const formData = new FormData(formValues);
                            // TODO: send form data to server
                            handleClose();
                        });
                    },
                }}
                aria-labelledby="draggable-dialog-title"
            >
                <DialogTitle
                    style={{ cursor: "move" }}
                    id="draggable-dialog-title"
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <Typography sx={{ flexGrow: 1, alignSelf: "center" }}>
                            Create Activity
                        </Typography>
                        <IconButton aria-label="close" onClick={handleClose}>
                            <CloseOutlinedIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <DialogContentText sx={{ mb: 2 }}>
                        <Typography>
                            {title ||
                                "Enter the details for your new contact below"}
                        </Typography>
                    </DialogContentText>
                    {/* {"Errors are" + JSON.stringify(errors)}
                    {"Values are" + JSON.stringify(values)} */}
                    {isError && (
                        <Alert severity="warning">
                            Indicators failed to load from API. Please try
                            later.
                        </Alert>
                    )}
                    <CreateActivityForm
                        updateFormValues={updateFormValues}
                        values={values}
                        errors={errors}
                        options={options}
                    />
                </DialogContent>
                <DialogActions>
                    <Box display="flex" flexDirection="column">
                        <Box>
                            <Button
                                type="submit"
                                variant={isErrors() ? "outlined" : "contained"}
                                color={isErrors() ? "error" : "primary"}
                                // disabled={isErrors()}
                                // endIcon={<Send />}
                                onClick={formSubmit}
                            >
                                Save
                            </Button>
                            <Button onClick={handleClose} autofocus>
                                Discard
                            </Button>
                        </Box>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CreateActivityDialog;
