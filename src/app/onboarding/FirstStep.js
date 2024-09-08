import React, { useState } from "react";
import {
    Box,
    FormGroup,
    Grid,
    InputAdornment,
    Typography,
} from "@mui/material";
import CompanyForm from "./CompanyForm";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/lib/components/form-controls/FormInput";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
// import { arr } from "../../utils";
import { arr } from "@/lib/utils/utils";

const FirstStep = ({ values, handleValues, errors }) => {
    return (
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
                <Typography variant="h3" component="p" sx={{textAlign: 'center'}}>
                    Contact information
                </Typography>
                <Typography variant="subtitle2" paragraph textAlign={"center"}>
                    Tell your donors and customers how they can contact you, and
                    add your details for charity reports and invoices
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
                            error={errors.fieldErrors?.phoneNumber}
                            helperText={
                                arr(errors.fieldErrors?.phoneNumber).join(
                                    "; "
                                ) || "Enter your charity's contact number"
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
                            error={errors.fieldErrors?.email}
                            id="charity-email"
                            name="email"
                            label="Charity Email"
                            helperText={
                                arr(errors.fieldErrors?.email).join("; ") ||
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
    );
};

export default FirstStep;
