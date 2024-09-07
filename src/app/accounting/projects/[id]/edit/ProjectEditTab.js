"use client"
import React from "react";
import { Grid, Typography, FormGroup, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";
// import useForm from "../Hooks/formHook";
import useForm from "@/lib/hooks/formHook";
import { serialize } from "object-to-formdata";
// import { arr } from "../../utils";
import { arr } from "@/lib/utils/utils";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/components/form-controls/FormInput";
// import FileUpload from "../Components/DropzoneFileUpload";
import FileUpload from "@/components/form-controls/DropzoneFileUpload";
// import TrackingUpdates from "../TrackingPage/TrackingUpdates";
import TrackingUpdates from "@/tracker/donations/[id]/TrackingUpdate";
import { useTheme } from "@mui/material/styles";

const ProjectEditTab = () => {
    const theme = useTheme();
    console.log("theme available: ", theme);
    const initialValues = {
        title: "",
        subtitle: "",
        updates: "",
        spending: "",
        transactions: "",
        impact: "",
        appealPhoto: [],
    };

    const formHandler = (e) => {
        // Convert to multi-part form data, as
        // we have binary image files
        const formValues = serialize(values);
        const formData = new FormData(formValues);
        // Call API code - make a generic useQuery post and get()
    };

    const { values, errors, updateFormValues } = useForm(
        initialValues,
        undefined,
        formHandler
    );

    // Form handler

    return (
        <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
                <Typography variant="subtitle1" color={grey[400]}>
                    PROJECT INFO
                </Typography>
            </Grid>
            {/* <FormGroup> */}
            <Grid container item xs={6} spacing={2}>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.address?.address1}
                        id={"project-title"}
                        name="title"
                        label="Project Title"
                        variant="standard"
                        helperText={
                            arr(errors.fieldErrors?.title).join(`; `) ||
                            "Enter the project's title here"
                        }
                        value={values.title}
                        onChange={updateFormValues}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.subtitle}
                        id={"project-subtitle"}
                        name="subtitle"
                        label="Project Subtitle"
                        variant="standard"
                        helperText={
                            arr(errors.fieldErrors?.subtitle).join(`; `) ||
                            "Subtitle for project appeal"
                        }
                        value={values.subtitle}
                        onChange={updateFormValues}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.subtitle}
                        id={"project-subtitle"}
                        name="subtitle"
                        label="Project Subtitle"
                        variant="standard"
                        helperText={
                            arr(errors.fieldErrors?.subtitle).join(`; `) ||
                            "Subtitle for project appeal"
                        }
                        value={values.subtitle}
                        onChange={updateFormValues}
                    />
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <FileUpload
                    value={values.appealPhoto}
                    caption="Charity appeal photos"
                    title="Add photos to your charity appeal"
                    onChange={(e, newFile) =>
                        updateFormValues({
                            target: {
                                value: newFile,
                            },
                        })
                    }
                    sx={{ height: "100%" }}
                    // formStyles={{
                    //     alignItems: "center",
                    //     justifyContent: "center",
                    //     flexDirection: "column",
                    // }}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1" color={grey[400]}>
                    UPDATES
                </Typography>
            </Grid>
            <Grid item xs={5}>
                <TrackingUpdates
                    titleComponent={
                        <TextField variant="standard" label="Update title" />
                    }
                    subtitleComponent={
                        <TextField
                            variant="standard"
                            label="Update subtitle"
                            InputProps={{
                                fontSize: "0.8rem",
                                ...theme.typography.subtitle1,
                            }}
                        />
                    }
                    descriptionComponent={
                        <TextField
                            variant="standard"
                            label="Update subtitle"
                            multiline
                            minRows={3}
                            InputProps={{
                                ...theme.typography.subtitle1,
                            }}
                        />
                    }
                    imagePicker
                />
            </Grid>
        </Grid>
    );
};

export default ProjectEditTab;