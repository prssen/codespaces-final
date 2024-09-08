import React from "react";
import { FormGroup } from "@mui/material";
import CompanyForm from "./CompanyForm";

const SecondStep = ({ values, errors, handleValues }) => {
    return (
        <FormGroup>
            <CompanyForm.OrganisationDetails
                values={values}
                errors={errors}
                onChange={handleValues}
            />
        </FormGroup>
    );
};

export default SecondStep;
