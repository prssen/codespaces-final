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
    Typography,
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
// import FormInput from "../../CreateTransactionModal/FormInput";
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
import CountrySelect from "@/components/form-controls/CountrySelect";
// import CountrySelect from "../../Components/CountrySelect";

// // TODO: add this to form field + move to Form controls
// const CustomPhoneInput = forwardRef(function phoneInput(props, ref) {
//     return <FormInput {...props} inputRef={ref} />;
// });

// Code to upload the avatar
// TODO: move somewhere else
import axios, { AxiosError } from "axios";
// import { useState } from 'react'
import { useMutation } from "react-query";
// import FileUpload from "../../Components/FileUpload";
import FileUpload from "@/components/form-controls/FileUpload";
// import LocationSelect from "../../Components/LocationSelect";

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

const CreateActivityForm = ({
    updateFormValues,
    values,
    errors,
    options,
    ...props
}) => {
    const theme = useTheme();

    // For supplier
    const initialValues = {
        indicator: "",
        date: "",
        startTime: "",
        endTime: "",
        title: "",
        notes: "",
        amount: "",
        attachments: "",
    };

    console.log("optons passed to CreateActivityForm: ", options);

    // const indicators = [
    //     { name: "Schools built", value: "schools built" },
    //     { name: "People Served", value: "people served" },
    // ];

    const indicators = options;

    // TODO: replace with form hook values
    // const [values, setValues] = useState(initialValues);
    // const [errors, setErrors] = useState({});

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

        // TODO FIXME WARNING!!!: 'attachments' (and other file upload widgets)
        // pass an ARRAY of files (even if just passing 1 file)!
        if (e.target.name === "indicator" && e.target.value === "create") {
            // TODO: replace with Next.js code, or best practices as shown here
            // https://developer.mozilla.org/en-US/docs/Web/API/Window/open
            window.open("http://localhost:8001/new_indicator", "_blank");
        } else {
            updateFormValues(e);
        }
        // const updatedValues = _.set(
        //     _.cloneDeep(values),
        //     e.target.name,
        //     e.target.value
        //     // For the 'avatar' form field, we extract the multi-part form data from
        //     // 'files', not 'value'
        //     // e.target.name === "attachments" ? e.target.files[0] : e.target.value
        // );
        // setValues(updatedValues);
    };

    // Checkboxes store their value in 'e.target.checked' rather than 'e.target.value'
    const handleChecked = (e) => {
        // setValues({ ...values, [e.target.name]: e.target.checked });
    };

    const filter = createFilterOptions();

    return (
        <FormGroup>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Autocomplete
                        disablePortal
                        id="activity-indicator"
                        selectOnFocus
                        clearOnBlur
                        getOptionLabel={(option) => option?.label}
                        isOptionEqualToValue={(option, value) =>
                            option?.value === value.value
                        }
                        options={indicators?.map((option) => option)}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            const inputType = "indicator";
                            filtered.unshift({
                                inputValue: inputType,
                                label: `Create a new ${inputType}`,
                            });

                            return filtered;
                        }}
                        renderOption={(props, option) => (
                            <>
                                <li {...props}>
                                    {/* {option.inputValue ? (
                                        <strong >{option.label}</strong>
                                    ) : (
                                        option.label
                                    )} */}
                                    {option.label}
                                </li>
                                {option.inputValue && (
                                    <Divider
                                        sx={{
                                            opacity: 0.6,
                                            width: "95%",
                                            mx: "auto",
                                            my: 0.5,
                                        }}
                                    />
                                )}
                            </>
                        )}
                        onChange={(event, newValue) => {
                            debugger;
                            const newEvent = { target: { name: "indicator" } };
                            if (newValue?.inputValue) {
                                // Pass 'indicator creation' event to main handler
                                newEvent.target.value = "create";
                            } else {
                                // Pass any other input values to the handler
                                newEvent.target.value = newValue?.value;
                            }
                            handleChange(newEvent);
                            console.log("Autocomplete event: ", newEvent);
                            console.log("Autocomplete value: ", newValue);
                        }}
                        renderInput={(params) => (
                            <FormInput
                                {...params}
                                error={errors.fieldErrors?.indicator}
                                id="activity-indicator-input"
                                name="indicator"
                                label="Project Indicator"
                                helperText={
                                    errors.fieldErrors?.indicator?.join("; ") ||
                                    "Choose an indicator that this activity has contributed to"
                                }
                                inputProps={{
                                    ...params.inputProps,
                                }}
                                value={values.indicator}
                                onChange={handleChange}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={4}>
                    <DatePicker
                        label="Activity Date"
                        id="activity-date"
                        views={["year", "month", "day"]}
                        error={errors.fieldErrors?.date}
                        value={values.date}
                        onChange={(newValue) =>
                            handleChange({
                                target: {
                                    name: "date",
                                    value: dayjs(newValue).format("YYYY-MM-DD"),
                                },
                            })
                        }
                        slotProps={{
                            field: {
                                clearable: true,
                            },
                            textField: {
                                helperText:
                                    "Choose the date that the activity took place",
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TimePicker
                        label="Start time"
                        id="activity-start-time"
                        error={errors.fieldErrors?.startTime}
                        value={values.startTime}
                        onChange={(newValue) =>
                            handleChange({
                                target: {
                                    name: "startTime",
                                    value: dayjs(newValue).format("HH:mm:ss"),
                                },
                            })
                        }
                        slotProps={{
                            field: {
                                clearable: true,
                            },
                            textField: {
                                helperText:
                                    "Choose the time that the activity started",
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TimePicker
                        label="End time"
                        id="activity-end-time"
                        error={errors.fieldErrors?.endTime}
                        value={values.endTime}
                        onChange={(newValue) =>
                            handleChange({
                                target: {
                                    name: "endTime",
                                    value: dayjs(newValue).format("HH:mm:ss"),
                                },
                            })
                        }
                        onError={(newError) =>
                            console.log("Date/time error: ", newError)
                        }
                        slotProps={{
                            field: {
                                clearable: true,
                            },
                            textField: {
                                helperText:
                                    "Choose the time that the activity ended",
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.title}
                        id="supplier-title"
                        name="title"
                        label="Activity"
                        helperText={
                            errors.fieldErrors?.title?.join("; ") ||
                            "State the activity performed here"
                        }
                        value={values.title}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.notes}
                        id="activity-notes"
                        name="notes"
                        multiline
                        minRows={3}
                        label="Notes"
                        helperText={
                            errors.fieldErrors?.notes?.join("; ") ||
                            "Add a description or notes on the activity performed"
                        }
                        value={values.notes}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormInput
                        error={errors.fieldErrors?.indicator_amount}
                        id="activity-amount"
                        name="indicator_amount"
                        label="Activity amount"
                        type="number"
                        inputProps={{
                            inputProps: {
                                min: 0,
                            },
                        }}
                        helperText={
                            errors.fieldErrors?.indicator_amount?.join("; ") ||
                            "State the amount of the indicator this activity has achieved or contributed"
                        }
                        value={values.indicator_amount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FileUpload
                        value={values.attachments}
                        onChange={(newFiles) =>
                            handleChange({
                                target: {
                                    name: "attachments",
                                    value: newFiles,
                                },
                            })
                        }
                    />
                </Grid>
                {/* <Grid item xs={12}>
                    <LocationSelect />
                </Grid> */}
                {/* <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Name
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormInput
                                        error={errors.fieldErrors?.firstName}
                                        id="donor-firstName"
                                        name="firstName"
                                        label="Donor First Name"
                                        helperText={
                                            errors.fieldErrors?.firstName?.join(
                                                "; "
                                            ) ||
                                            "Enter the first name of the donor"
                                        }
                                        value={values.firstName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormInput
                                        error={errors.fieldErrors?.middleNames}
                                        id="donor-middleNames"
                                        name="middleNames"
                                        label="Donor Middle Names"
                                        helperText={
                                            errors.fieldErrors?.middleNames?.join(
                                                "; "
                                            ) ||
                                            "Enter any middle names of the donor"
                                        }
                                        value={values.middleNames}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormInput
                                        error={errors.fieldErrors?.lastName}
                                        id="donor-lastName"
                                        name="lastName"
                                        label="Donor Last Name"
                                        helperText={
                                            errors.fieldErrors?.lastName?.join(
                                                "; "
                                            ) ||
                                            "Enter the last name of the donor"
                                        }
                                        value={values.lastName}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormInput
                                        error={errors.fieldErrors?.title}
                                        id="donor-title"
                                        name="title"
                                        select
                                        label="Donor Title"
                                        helperText={
                                            errors.fieldErrors?.title?.join(
                                                "; "
                                            ) || "Enter the title of the donor"
                                        }
                                        value={values.title}
                                        onChange={handleChange}
                                    >
                                        {titles.map((option) => (
                                            <MenuItem value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </FormInput>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormInput
                                        error={errors.fieldErrors?.suffix}
                                        id="donor-suffix"
                                        name="suffix"
                                        select
                                        label="Donor Suffix"
                                        helperText={
                                            errors.fieldErrors?.title?.join(
                                                "; "
                                            ) || "Enter the suffix of the donor"
                                        }
                                        value={values.suffix}
                                        onChange={handleChange}
                                    >
                                        {titles.map((option) => (
                                            <MenuItem value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </FormInput>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Contact Details
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={5}>
                                    <FormInput
                                        error={errors.fieldErrors?.phoneNumber}
                                        id="supplier-phoneNumber"
                                        name="phoneNumber"
                                        label="Supplier Phone Number"
                                        helperText={
                                            errors.fieldErrors?.phoneNumber?.join(
                                                "; "
                                            ) ||
                                            "Enter the supplier's contact number"
                                            }
                                        InputProps={{
                                            notched: false,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalPhoneOutlinedIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        value={values.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={7}>
                                    <FormInput
                                        error={errors.fieldErrors?.email}
                                        id="supplier-email"
                                        name="email"
                                        label="Supplier Email"
                                        helperText={
                                            errors.fieldErrors?.email?.join(
                                                "; "
                                            ) || "Enter the supplier's email"
                                        }
                                        value={values.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormInput
                                        error={
                                            errors.fieldErrors?.address.address1
                                        }
                                        id="supplier-address-1"
                                        name="address.address1"
                                        label="Supplier Address"
                                        helperText={
                                            errors.fieldErrors?.address?.address1?.join(
                                                "; "
                                            ) || "Enter the supplier's address"
                                        }
                                        value={values.address.address1}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormInput
                                        error={
                                            errors.fieldErrors?.address.address2
                                        }
                                        id="supplier-address-2"
                                        name="address.address2"
                                        label="Supplier Address - Line 2"
                                        helperText={errors.fieldErrors?.address?.address2?.join(
                                            "; "
                                        )}
                                        value={values.address.address2}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormInput
                                        error={
                                            errors.fieldErrors?.address.address3
                                        }
                                        id="supplier-address-3"
                                        name="address.address3"
                                        label="Supplier Address - Line 3"
                                        helperText={errors.fieldErrors?.address?.address3?.join(
                                            "; "
                                        )}
                                        value={values.address.address3}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        error={
                                            errors.fieldErrors?.address
                                                .postalCode
                                        }
                                        id="supplier-postal-code"
                                        name="address.postalCode"
                                        label="Supplier Postcode"
                                        helperText={errors.fieldErrors?.address?.postalCode?.join(
                                            "; "
                                        )}
                                        value={values.address.postcode}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        error={
                                            errors.fieldErrors?.address.district
                                        }
                                        id="supplier-postal-code"
                                        name="address.district"
                                        label="Supplier district"
                                        helperText={errors.fieldErrors?.address?.district?.join(
                                            "; "
                                        )}
                                        value={values.address.district}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormInput
                                        error={errors.fieldErrors?.address.city}
                                        id="supplier-city"
                                        name="address.city"
                                        label="Supplier city"
                                        helperText={errors.fieldErrors?.address?.city?.join(
                                            "; "
                                        )}
                                        value={values.address.city}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormInput
                                        error={
                                            errors.fieldErrors?.address.region
                                        }
                                        id="supplier-region"
                                        name="address.region"
                                        label="Supplier region"
                                        helperText={errors.fieldErrors?.address?.region?.join(
                                            "; "
                                        )}
                                        value={values.address.region}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <CountrySelect
                                        error={
                                            errors.fieldErrors?.address.country
                                        }
                                        id="supplier-country"
                                        name="address.country"
                                        label="Supplier country"
                                        select
                                        helperText={errors.fieldErrors?.address?.country?.join(
                                            "; "
                                        )}
                                        value={values.address.country}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-beween",
                                            alignItems: "baseline",
                                        }}
                                    >
                                        <FormInput
                                            error={
                                                errors.fieldErrors?.address
                                                    .country
                                            }
                                            id="supplier-avatr"
                                            name="avatar"
                                            label="Supplier photo"
                                            select
                                            helperText={errors.fieldErrors?.avatar?.join(
                                                "; "
                                            )}
                                            sx={{ flex: 1 }}
                                            value={values.avatar}
                                            onChange={handleChange}
                                        />
                                        <Button
                                            sx={{
                                                whiteSpace: "nowrap",
                                                px: 2,
                                                py: 2,
                                                m: 2,
                                                height: "100%",
                                            }}
                                            variant="outlined"
                                        >
                                            Select photo
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        error={
                                            errors.fieldErrors?.address.region
                                        }
                                        id="supplier-sector"
                                        name="sector"
                                        label="Supplier sector"
                                        select
                                        helperText={errors.fieldErrors?.address?.region?.join(
                                            "; "
                                        )}
                                        value={values.sector}
                                        onChange={handleChange}
                                    >
                                        {givingStage.map((option) => (
                                            <MenuItem value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </FormInput>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Fundraising Details
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormInput
                                        error={errors.fieldErrors?.occupation}
                                        id="supplier-occupation"
                                        name="occupation"
                                        label="Supplier Occupation"
                                        helperText={errors.fieldErrors?.occupation?.join(
                                            "; "
                                        )}
                                        value={values.occupation}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <CountrySelect
                                        error={errors.fieldErrors?.nationality}
                                        id="supplier-nationality"
                                        name="nationality"
                                        label="Supplier Nationality"
                                        select
                                        helperText={errors.fieldErrors?.nationality?.join(
                                            "; "
                                        )}
                                        value={values.nationality}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <FormInput
                                        error={errors.fieldErrors?.givingStage}
                                        id="donor-givingStage"
                                        name="givingStage"
                                        select
                                        label="Donor Giving Stage"
                                        helperText={
                                            errors.fieldErrors?.givingStage?.join(
                                                "; "
                                            ) ||
                                            "Enter the giving stage of the donor"
                                        }
                                        value={values.givingStage}
                                        onChange={handleChange}
                                    >
                                        {givingStage.map((option) => (
                                            <MenuItem value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </FormInput>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormInput
                                        error={errors.fieldErrors?.description}
                                        id="supplier-description"
                                        name="description"
                                        label="Supplier Description"
                                        helperText={errors.fieldErrors?.description?.join(
                                            "; "
                                        )}
                                        value={values.description}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid> */}

                <Grid item xs={3}></Grid>
                {/* <Grid item xs={12}>
                    <FormInput
                        select
                        id="account-type"
                        name="accountType"
                        label="Account Type"
                        error={errors.fieldErrors?.accountType}
                        helperText={
                            errors.fieldErrors?.accountType?.join("; ") ||
                            "Enter the type of account here"
                        }
                        value={values.accountType}
                        onChange={handleChange}
                        showHelper={true}
                    >
                        {Object.keys(accountTypes).map((name, index) => (
                            <MenuItem value={accountTypes[name]}>
                                {name}
                            </MenuItem>
                        ))}
                    </FormInput>
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                inputProps={{
                                    "aria-label": "primary checkbox",
                                }}
                                id="is-sub-account"
                                errors={errors.fieldErrors?.name}
                                helperText={errors.fieldErrors?.name?.join(
                                    "; "
                                )}
                                name="isSubAccount"
                                onChange={handleChecked}
                            />
                        }
                        label="Is sub-account"
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        id="parent-account"
                        name="parentAccount"
                        label="Parent Account"
                        errors={errors.fieldErrors?.parentAccount}
                        helperText={
                            errors.fieldErrors?.parentAccount ||
                            "Enter the name of the parent account"
                        }
                        value={values.parentAccount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        id="standard-account"
                        name="standardAccount"
                        label="Standard Account"
                        errors={errors.fieldErrors?.standardAccount}
                        helperText={
                            errors.fieldErrors?.standardAccount ||
                            "Enter the name of the account in a standard chart of accounts"
                        }
                        value={values.standardAccount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        id="account-description"
                        name="description"
                        label="Description"
                        errors={errors.fieldErrors?.description}
                        helperText={
                            errors.fieldErrors?.description ||
                            "Enter a description of the purpose of the account"
                        }
                        value={values.description}
                        onChange={handleChange}
                    />
                </Grid> */}
            </Grid>
        </FormGroup>
    );
};

export default CreateActivityForm;
