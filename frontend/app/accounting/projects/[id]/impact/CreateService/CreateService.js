"use client"
import { useState, useEffect, forwardRef } from "react";
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
    Box,
    Button,
    Divider,
    FormControlLabel,
    Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { createFilterOptions } from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import { useTheme } from "@mui/material/styles";
import * as z from "zod";
import validator from "validator";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/components/form-controls/FormInput";
import dayjs from "dayjs";
import _ from "lodash";

import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// import "react-phone-number-input/style.css";
// import PhoneInput from "react-phone-number-input";

import { MuiTelInput } from "mui-tel-input";
// import CountrySelect from "../Components/CountrySelect";
import CountrySelect from "@/components/form-controls/CountrySelect";

// // TODO: add this to form field + move to Form controls
// const CustomPhoneInput = forwardRef(function phoneInput(props, ref) {
//     return <FormInput {...props} inputRef={ref} />;
// });

// Code to upload the avatar
// TODO: move somewhere else
import axios, { AxiosError } from "axios";
// import { useState } from 'react'
import { useMutation } from "react-query";
import FileUpload from "../Components/FileUpload";

// From https://github.com/TanStack/query/discussions/1098#discussioncomment-1004724
const useFileUploadMutation = () => {
    const [progress, setProgress] = useState(0);

    const mutation = useMutation((args) =>
        axios.put(args.presignedUploadUrl, args.file, {
            onUploadProgress: (ev) =>
                setProgress(Math.round((ev.loaded * 100) / ev.total)),
        })
    );

    return { ...mutation, progress };
};

const CreateServiceForm = () => {
    const theme = useTheme();

    // For supplier
    const initialValues = {
        name: "",
        targetQuantity: "",
        unit: "",
        baseline: "",
        description: "",
        isCumulative: "",
        service: "",
    };

    // TODO: change to fit API
    const projects = [
        {
            name: "Education - North Colombia 2024",
            value: "education Colombia",
        },
        { name: "Cleaning the Thames", value: "clean Thames" },
    ];

    // TODO: replace with form hook values
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    // TODO: make the autocomplete for 'indicator'/'unit' a SelectWithCrete()
    // re-usable component
    // 1. renderOption prop, 2. filterOption, 3. AutocompleteOptions (obj), 4. InputOptions

    // TODO: see https://www.bezkoder.com/material-ui-file-upload/
    // and https://www.dhiwise.com/post/how-to-implement-react-mui-file-upload-in-your-applications
    // (and possible https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.telerik.com%2Fblazor-ui%2Fupload&psig=AOvVaw2quyN9URrmfw_A9AYvWl62&ust=1709325846383000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCNjq_aG10YQDFQAAAAAdAAAAABAD for UI ideas)
    // to complete this
    // Code to handle the file upload - from https://www.dhiwise.com/post/how-to-implement-react-mui-file-upload-in-your-applications
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        axios
            .post("/upload", formData)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // Validation schema, mirroring the model constraints defined in Django
    const supplierSchema = z
        .object({
            name: z
                .string()
                .min(1, { message: "Supplier name required" })
                .max(200, { message: "Supplier name too long" })
                .refine(
                    // Regex adapted from https://stackoverflow.com/a/18058033
                    (value) => /^([^$&+,:;=?@#|'<>*()%!-]+|)$/.test(value),
                    "Account name can not contain special characters: try replacing punctuation with letters and numbers."
                ),
            phoneNumber: z
                .string()
                .refine(
                    validator.isMobilePhone,
                    "Please enter a valid telephone number"
                ),
            email: z
                .string()
                .refine(validator.isEmail, "Please enter a valid email"),
            address: z.object({
                address1: z.string().min(1, { message: "Address required" }),
                address2: z
                    .string()
                    .max(200, { message: "Address too long" })
                    .nullish(),
                address3: z.string().max(200, { message: "Address too long" }),
                // .nullish(),
                postal_code: z
                    .string()
                    .refine(
                        // Regex for UK postal codes - from https://stackoverflow.com/a/51885364
                        (value) =>
                            /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/.test(value),
                        "Please enter a valid postcode"
                    )
                    .nullish(),
                district: z
                    .string()
                    .max(200, { message: "District too long" })
                    .nullish(),
                city: z
                    .string()
                    .max(200, { message: "City too long" })
                    .nullish(),
                // Region can be be empty (undefined or empty string) or a maximum 200-char
                // string (from https://stackoverflow.com/a/76924595)
                region: z
                    .union([
                        z.string().max(200, { message: "Region too long" }),
                        z.string().length(0),
                    ])
                    .optional()
                    .transform((e) => (e === "" ? undefined : e)),
                country: z
                    .string()
                    .refine(
                        validator.isISO31661Alpha3,
                        "Please select a valid country"
                    ),
            }),
            avatar: z.string().nullish(),
            sector: z.string().nullish(),
            VATNumber: z.string().nullish(),
            isVATNumberValidated: z.boolean(),
        })
        // .refine(
        //     (data) => validator.isVAT(data.VATNumber, data.country),
        //     `VAT number is invalid. Please enter a valid VAT number for the selected country`
        // )
        .strict();

    // TODO: re-enable when you're done

    // useEffect(() => {
    //     const result = supplierSchema.safeParse(values);
    //     const _errors = result.success ? {} : result.error.flatten();
    //     setErrors(_errors);
    //     console.log(errors);
    //     // window.alert(JSON.stringify(_errors));
    // }, [values]);

    // TODO: retrieve choices from API, and set values.accountType to the choice selected
    const handleChange = (e) => {
        // console.log(`Current account type: ${values.accountType}`);
        console.log(`Name: ${e.target.name}, Value: ${e.target.value}`);
        // setValues({ ...values, [e.target.name]: e.target.value });
        // Using lodash's _set() method to handle nested paths (e.g. 'address.address1')

        if (e.target.name === "indicator" && e.target.value === "create") {
            // TODO: replace with Next.js code, or best practices as shown here
            // https://developer.mozilla.org/en-US/docs/Web/API/Window/open
            window.open("http://localhost:8001/new_indicator", "_blank");
        }
        const updatedValues = _.set(
            _.cloneDeep(values),
            e.target.name,
            // For the 'avatar' form field, we extract the multi-part form data from
            // 'files', not 'value'
            e.target.name === "attachments" ? e.target.files[0] : e.target.value
        );
        setValues(updatedValues);
    };

    // Checkboxes store their value in 'e.target.checked' rather than 'e.target.value'
    const handleChecked = (e) => {
        setValues({ ...values, [e.target.name]: e.target.checked });
    };

    const filter = createFilterOptions();

    // TODO: indicator unit is a 'freeSolo' autocomplete
    return (
        <FormGroup>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Autocomplete
                        disablePortal
                        id="service-project"
                        selectOnFocus
                        clearOnBlur
                        getOptionLabel={(option) => option.name}
                        options={projects.map((option) => option)}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            const inputType = "project";
                            filtered.unshift({
                                inputValue: inputType,
                                name: `Create a new ${inputType}`,
                            });

                            return filtered;
                        }}
                        renderOption={(props, option) => (
                            <>
                                <li {...props}>{option.name}</li>
                                {option.inputValue && (
                                    <Divider variant="middle" />
                                )}
                            </>
                        )}
                        onChange={(event, newValue) => {
                            const newEvent = { target: { name: "project" } };
                            if (newValue?.inputValue) {
                                // Pass 'indicator creation' event to main handler
                                newEvent.target.value = "create";
                            } else {
                                // Pass any other input values to the handler
                                newEvent.target.value = newValue?.value;
                            }
                            handleChange(newEvent);
                            console.log("Autocomplete event: ", event);
                            console.log("Autocomplete value: ", newValue);
                        }}
                        renderInput={(params) => (
                            <FormInput
                                {...params}
                                error={errors.fieldErrors?.project}
                                id="service-project-input"
                                name="project"
                                label="Project Service"
                                helperText={
                                    errors.fieldErrors?.project?.join("; ") ||
                                    "Choose the project that this service belongs to"
                                }
                                inputProps={{
                                    ...params.inputProps,
                                }}
                                value={values.project}
                                onChange={handleChange}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.name}
                        id="service-name"
                        name="name"
                        label="Service Name"
                        sx={{ mt: 3, width: "100%" }}
                        helperText={
                            errors.fieldErrors?.name?.join("; ") ||
                            "Add a name for this service"
                        }
                        value={values.name}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.description}
                        id="service-description"
                        name="description"
                        multiline
                        minRows={3}
                        label="Description"
                        sx={{ mt: 3, width: "100%" }}
                        helperText={
                            errors.fieldErrors?.description?.join("; ") ||
                            "Add a description of this service"
                        }
                        value={values.description}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
        </FormGroup>
    );
};

export default CreateServiceForm;
