"use client"
import {
    Container,
    Stepper,
    Step,
    StepButton,
    StepLabel,
    Box,
    Button,
    Grid,
    FormGroup,
    Typography,
    InputAdornment,
} from "@mui/material";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/components/form-controls/FormInput";
import React, { useCallback } from "react";

import CompanyForm from "./CompanyForm";

/**
 *
 * Parts of the company form:
 * - Contact details: phone number, email, address, avatar for charity profile
 * - Organisation details: name of charity, sector
 * - Accounting details: legal structure, charity commissionn number, slogan, mission
 *
 */
// Stepper from https://mui.com/material-ui/react-stepper/ and https://www.youtube.com/watch?v=rNwlD68Zkik&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=7
const CompanyFlow = ({
    // clickHandlers,
    // updateClickHandlers,
    ...props
}) => {
    const [activeStep, setActiveStep] = React.useState(0);
    const [stepCompleted, setStepCompleted] = React.useState({});
    const [formCompleted, setFormCompleted] = React.useState(false);

    console.log("Testing prop passing: ", props.testing);

    const changeStep = (e, index) => {
        console.log("current active step is: " + index);
        console.log("old one is: " + activeStep);
        setActiveStep(index);
    };

    const submitStep = (e) => {
        // Dummy step - form validation of values in activeStep here
        const formValues = {
            a: 1,
            b: 2,
            isValid: () => {
                return true;
            },
        };
        if (formValues.isValid) {
            console.log("Steps completed so far: ", stepCompleted);
            console.log("Total number of steps: ", steps);

            // Check form fields, and mark step as completed
            setStepCompleted({ ...stepCompleted, [activeStep]: true });

            // If all steps are completed, complete and submit form
            if (
                Object.entries(stepCompleted).filter((item) => item === true)
                    .length === steps.length
            ) {
                console.log(
                    "You completed these steps: ",
                    Object.entries(stepCompleted)
                );
                console.log(
                    "Number true: ",
                    Object.entries(stepCompleted).filter(
                        (item) => item === true
                    ).length
                );
                console.log("Total number of steps: ", steps.length);

                console.log("Form completed!");
                setFormCompleted(true);
                // TODO: return, submit form data and redirect to project summary page
            } else {
                // If completed, proceed to the next step
                setActiveStep(activeStep + 1);
            }
        }
    };

    const skipStep = (e) => {
        const nextStep = (activeStep + 1) % steps.length;
        console.log("next step is: ", nextStep);
        setActiveStep(nextStep);
    };

    // React.useEffect(() => {
    //     // setClickHandlers({ ...clickHandlers, clickPrimary: submitStep });
    //     updateClickHandlers({ clickPrimary: submitStep });
    // }, []);

    const steps = [
        "Contact Details",
        "Organisation details",
        "Accounting details",
    ];

    // TODO: replace with form hook
    const [values, setValues] = React.useState({
        name: "",
        phoneNumber: "",
        email: "",
        address: {
            address1: "",
            address2: "",
            address3: "",
            postalCode: "",
            district: "",
            city: "",
            region: "",
            country: "",
        },
        avatar: "",
        sector: "",
        legalStructure: "",
        charityCommissionNumber: "",
        slogan: "",
        mission: "",
    });

    // const handleValues = (e) =>
        // setValues({ ...values, [e.target.name]: e.target.value });

    const handleValues = useCallback((e) => {
        // setValues({ ...values, [e.target.name]: e.target.value })
        setValues(prevValues => 
            ({ ...prevValues, [e.target.name]: e.target.value })
        )
    }, [setValues]);
    // Placeholder for form validation errors
    const errors = { fieldValues: null };

    return (
        <Container sx={{ my: 4 }}>
            <Stepper
                alternativeLabel
                nonLinear
                activeStep={activeStep}
                // From video
                sx={{ mb: 3 }}
            >
                {steps.map((label, index) => (
                    <Step key={label} completed={stepCompleted[index]}>
                        <StepButton
                            color="inherit"
                            completed={stepCompleted[index]}
                            onClick={(e) => changeStep(e, index)}
                        >
                            <StepLabel
                                sx={{
                                    "& .Mui-active": {
                                        fontWeight: "600!important",
                                    },
                                }}
                            >
                                {label}
                            </StepLabel>
                        </StepButton>
                    </Step>
                ))}
            </Stepper>
            {activeStep === 0 && (
                <>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            m: 2,
                            px: 15,
                            gap: 2,
                        }}
                    >
                        <Typography variant="h3" component="p">
                            Contact information
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            paragraph
                            textAlign={"center"}
                        >
                            Tell your donors and customers how they can contact
                            you, and add your details for charity reports and
                            invoices
                        </Typography>
                    </Box>
                    <FormGroup>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormInput
                                    // error={errors.fieldErrors?.phoneNumber}
                                    id="charity-phoneNumber"
                                    name="phoneNumber"
                                    label="Charity Phone Number"
                                    helperText={
                                        // errors.fieldErrors?.phoneNumber?.join("; ") ||
                                        "Enter your charity's contact number"
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
                                    onChange={handleValues}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormInput
                                    // error={errors.fieldErrors?.email}
                                    id="charity-email"
                                    name="email"
                                    label="Charity Email"
                                    helperText={
                                        // errors.fieldErrors?.email?.join("; ") ||
                                        "Enter the charity's primary email address"
                                    }
                                    value={values.email}
                                    onChange={handleValues}
                                />
                            </Grid>
                            <CompanyForm.AddressFields
                                values={values}
                                onChange={handleValues}
                                errors={errors}
                            />
                        </Grid>
                    </FormGroup>
                </>
            )}
            {activeStep === 1 && (
                <FormGroup>
                    <CompanyForm.OrganisationDetails
                        values={values}
                        errors={errors}
                        onChange={handleValues}
                    />
                </FormGroup>
            )}
            {activeStep === 2 && (
                <FormGroup>
                    <CompanyForm.AccountingDetails
                        values={values}
                        errors={errors}
                        onChange={handleValues}
                    />
                </FormGroup>
            )}
            <Box>
                <Button onClick={skipStep}>Skip</Button>
                {/* Logic for checking form is complete */}
                <Button onClick={submitStep}>Next step</Button>
            </Box>
        </Container>
    );
};

export default CompanyFlow;
