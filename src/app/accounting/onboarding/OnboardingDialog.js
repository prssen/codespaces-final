"use client"
import React, { useEffect, useState } from "react";
// import { connect } from "react-redux";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    Button,
    Typography,
    Paper,
    Container,
    Stepper,
    StepButton,
    StepLabel,
    Step,
    IconButton,
} from "@mui/material";
import Draggable from "react-draggable";
import { CloseOutlined, Send } from "@mui/icons-material/";
// import Loading from "../Components/Loading";
import Loading from "@/components/Loading"
// import Update from "../Components/Update";
import Update from "@/components/Update";
// import useForm from "../Hooks/formHook";
import useForm from "@/lib/hooks/formHook";
import { useTheme, Link } from "@mui/material";
import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";
import Intro from "./Intro";
// import { charitySchema } from "../Hooks/validationSchema";
import { charitySchema } from "@/lib/hooks/validationSchema";
import { serialize } from "object-to-formdata";
import _ from "lodash";
// import { useCreateCharity } from "../Hooks/useApi";
import { useCreateCharity } from "@/lib/hooks/useApi";
// import { isEmpty } from "../../utils";
import { isEmpty } from "@/lib/utils/utils";
// import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation'

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

export const OnboardingDialog = ({
    open,
    handleClose,
    startTransition,
    title,
    setTitle = () => {},
    ChildComponent,
    ...props
}) => {
    const theme = useTheme();

    // TODO: decide whether to use React Context or Redux to store state,
    // enable this if React context
    // const { state { openLogin}, dispatch }  useValue();
    const [openLogin, setOpenLogin] = useState(false);

    // const navigate = useNavigate();
    const router = useRouter();

    // // TODO: from https://www.youtube.com/watch?v=8F6Q7TTc0Sk&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=3 -
    // //  if using state, it's:
    // const handleClose = () => dispatch({ type: "CLOSE_LOGIN"})
    // const handleClose = () => setOpenLogin(false);

    // To switch login b/w login and register
    // const [title, setTitle] = useState("Login");
    const [isRegister, setIsRegister] = useState(false);

    useEffect(() => {
        isRegister ? setTitle("Register") : setTitle("Login");
    }, [isRegister]);

    // TODO: if handleSubmit fails (for whatever reason), launch an alert
    // explaining the issue (idea from https://www.youtube.com/watch?v=8F6Q7TTc0Sk&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=3)
    const formHandler = (e) => {
        const innerHandler = () => {
            e.preventDefault();
            // other logic here, e.g. this from https://mui.com/material-ui/react-dialog/#form-dialogs
            const formData = new FormData(e.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();

            // await a response, and set the state variable to loading

            // if response is successful, set loading to false and redirect
        };

        if (startTransition) {
            startTransition(() => innerHandler());
        } else {
            return innerHandler();
        }
    };

    // if (errors) {
    //     dispatch({ type: 'ADD_ALERT', payload: { open: true, severity: 'error', message: errors.message } })
    // }

    const [loading, setLoading] = useState(false);
    // const [alert, setAlert] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);

    // // TODO: pass these to children
    // const [clickHandlers, setClickHandlers] = useState({
    //     clickPrimary: () => {},
    //     clickSecondary: () => {},
    // });

    // const updateClickHandlers = (newHandler) => {
    //     return setClickHandlers({ ...clickHandlers, newHandler });
    // };

    const [activeStep, setActiveStep] = React.useState(0);
    const [stepCompleted, setStepCompleted] = React.useState({});
    const [formCompleted, setFormCompleted] = React.useState(false);

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
        if (isIntro) {
            setIsIntro(false);
            setActiveStep(0);
            return;
        }
        // if (formValues.isValid) {
        //     console.log("Steps completed so far: ", stepCompleted);
        //     console.log("Total number of steps: ", steps);

        //     // Check form fields, and mark step as completed
        //     setStepCompleted({ ...stepCompleted, [activeStep]: true });

        //     // If all steps are completed, complete and submit form
        //     if (
        //         Object.entries(stepCompleted).filter((item) => item === true)
        //             .length === steps.length
        //     ) {
        //         console.log(
        //             "You completed these steps: ",
        //             Object.entries(stepCompleted)
        //         );
        //         console.log(
        //             "Number true: ",
        //             Object.entries(stepCompleted).filter(
        //                 (item) => item === true
        //             ).length
        //         );
        //         console.log("Total number of steps: ", steps.length);

        //         console.log("Form completed!");
        //         setFormCompleted(true);
        //         // TODO: return, submit form data and redirect to project summary page
        //     } else {
        //         // If completed, proceed to the next step (up to the
        //         // maximum number of steps available)
        //         setActiveStep(Math.min(activeStep + 1, steps.length - 1));
        //     }
        // }
        let updatedSteps = stepCompleted;
        if (!isErrors()) {
            updatedSteps = { ...stepCompleted, [activeStep]: true };
            // setStepCompleted({ ...stepCompleted, [activeStep]: true });
            setStepCompleted(updatedSteps);
        }
        else {
            console.log('Errors still present: ',errors);
        }
        if (
            Object.entries(updatedSteps).filter((item) => item[1] === true)
                .length === steps.length
        ) {
            console.log(
                "You completed these steps: ",
                Object.entries(stepCompleted)
            );
            console.log(
                "Number true: ",
                Object.entries(stepCompleted).filter((item) => item === true)
                    .length
            );
            console.log("Total number of steps: ", steps.length);

            console.log("Form completed!");
            setFormCompleted(true);
            formSubmit(e);
            // TODO: return, submit form data and redirect to project summary page
            // navigate('/accounting/project')
        } else {
            // If completed, proceed to the next step (up to the
            // maximum number of steps available)
            setActiveStep(Math.min(activeStep + 1, steps.length - 1));
        }
    };

    const skipStep = (e) => {
        const nextStep = (activeStep + 1) % steps.length;
        console.log("next step is: ", nextStep);
        setActiveStep(nextStep);
    };

    const steps = [
        "Contact Details",
        "Organisation details",
        "Accounting details",
    ];

    const initialValues = {
        name: "",
        phoneNumber: "",
        email: "",
        address: {
            address1: "",
            address2: "",
            address3: "",
            postal_code: "",
            district: { name: "" },
            city: { name: "" },
            region: { name: "" },
            country: "",
        },
        // avatar: "",
        sector: "",
        legalStructure: "",
        charityCommissionNumber: "",
        slogan: "",
        mission: "",
    };

    // const successCallback = () => navigate('/accounting/project');
    const successCallback = () => router.push('/accounting/project');
    const mutation = useCreateCharity(successCallback);

    const handleForm = (e, _errors) => {
        // if (!_.isEmpty(_errors.fieldErrors)) {
        if (!isEmpty(_errors.fieldErrors)) {
            console.log('Cannot submit: field errors', _errors.fieldErrors);
            setAlertOpen(true);
        } else {
            const formData = serialize(values);
            console.log("form data: ", Array.from(formData.entries()));
            console.log("form values are: ", values);
            mutation.mutate(values);
            handleClose?.();
        }
    };

    // TODO: replace with form hook
    const { values, errors, isErrors, formSubmit, updateFormValues } = useForm(
        initialValues,
        charitySchema,
        handleForm
    );

    console.log('Errors: ', isErrors());

    // const [values, setValues] = React.useState({
    //     name: "",
    //     phoneNumber: "",
    //     email: "",
    //     address: {
    //         address1: "",
    //         address2: "",
    //         address3: "",
    //         postalCode: "",
    //         district: "",
    //         city: "",
    //         region: "",
    //         country: "",
    //     },
    //     avatar: "",
    //     sector: "",
    //     legalStructure: "",
    //     charityCommissionNumber: "",
    //     slogan: "",
    //     mission: "",
    // });

    const [isIntro, setIsIntro] = useState(true);

    // TODO: replace by actual form-handling logic

    // const handleValues = (e) =>
    //     setValues({ ...values, [e.target.name]: e.target.value });

    // Placeholder for form validation errors
    // const errors = { fieldValues: null };

    return (
        <>
            {/* {alert && <Update open={(alert, setAlert)} />} */}
            <Update
                open={alertOpen}
                setOpen={setAlertOpen}
                message="There were errors in your form. Please correct and try again."
                severity="error"
                // title="Form submission error"
            />
            {/* {mutation. && <Loading open={loading} />} */}
            {mutation.isLoading && <Loading open={mutation.isLoading} />}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                // Responsive behaviour - expands to full width on smaller screens
                fullWidth={theme.breakpoints.down("md")}
                PaperComponent={PaperComponent}
                PaperProps={
                    {
                        // onSubmit: (event) => {
                        //     startTransition(() => {
                        //         event.preventDefault();
                        //         const formData = new FormData(formValues);
                        //         // TODO: send form data to server
                        //         handleClose();
                        //     });
                        // },
                    }
                }
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
                        <Typography sx={{ flexGrow: 1 }}>{title}</Typography>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                // From https://www.youtube.com/watch?v=8F6Q7TTc0Sk&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=3
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseOutlined />
                        </IconButton>
                    </Box>
                </DialogTitle>
                {isIntro ? (
                    <DialogContent dividers>
                        <Intro />
                    </DialogContent>
                ) : (
                    <DialogContent dividers>
                        <DialogContentText sx={{ mb: 2 }}>
                            <Typography>
                                {title ||
                                    "Enter the details for your new account below"}
                            </Typography>
                        </DialogContentText>
                        {/* {(
                        <ChildComponent
                            testing="abc123"
                            clickHandlers={clickHandlers}
                            updateClickHandlers={updateClickHandlers}
                        />
                    ) || <Typography>Testing</Typography>} */}
                        <Container sx={{ my: 4 }}>
                            <Stepper
                                alternativeLabel
                                nonLinear
                                activeStep={activeStep}
                                // From video
                                sx={{ mb: 3 }}
                            >
                                {steps.map((label, index) => (
                                    <Step
                                        key={label}
                                        completed={stepCompleted[index]}
                                    >
                                        <StepButton
                                            color="inherit"
                                            completed={stepCompleted[index]}
                                            onClick={(e) =>
                                                changeStep(e, index)
                                            }
                                        >
                                            <StepLabel
                                                sx={{
                                                    "& .Mui-active": {
                                                        fontWeight:
                                                            "600!important",
                                                    },
                                                }}
                                            >
                                                {label}
                                            </StepLabel>
                                        </StepButton>
                                    </Step>
                                ))}
                            </Stepper>
                        </Container>
                        {/* {steps.map(
                        (step, index) =>
                            activeStep === index && (
                                <Typography>Step {index}</Typography>
                            )
                    )} */}
                        {activeStep === 0 && (
                            <FirstStep
                                values={values}
                                handleValues={updateFormValues}
                                errors={errors}
                            />
                        )}
                        {activeStep === 1 && (
                            <SecondStep
                                values={values}
                                handleValues={updateFormValues}
                                errors={errors}
                            />
                        )}
                        {activeStep === 2 && (
                            <ThirdStep
                                values={values}
                                handleValues={updateFormValues}
                                errors={errors}
                            />
                        )}
                    </DialogContent>
                )}
                <DialogActions>
                    <Box display="flex" flexDirection="column">
                        <Box>
                            <Button
                                type="submit"
                                // variant={isErrors() ? "outlined" : "contained"}
                                // color={isErrors() ? "error" : "primary"}
                                variant="contained"
                                color="primary"
                                // disabled={isErrors() && !isIntro}
                                disabled={!isEmpty(errors) && !isIntro}
                                endIcon={<Send />}
                                onClick={submitStep}
                                // onClick={() => clickHandlers.clickPrimary()}
                            >
                                {activeStep >= steps.length - 1
                                    ? "Submit"
                                    : "Next step"}
                            </Button>
                            {!isIntro && (
                                <Button onClick={skipStep} autoFocus>
                                    Skip
                                </Button>
                            )}
                        </Box>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};
