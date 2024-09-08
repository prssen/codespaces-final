import React from "react";
import { FormGroup } from "@mui/material";
import CompanyForm from "./CompanyForm";

const ThirdStep = ({ values, errors, handleValues }) => {
    return (
        <FormGroup>
            <CompanyForm.AccountingDetails
                values={values}
                errors={errors}
                onChange={handleValues}
            />
        </FormGroup>
    );
};

export default ThirdStep;
