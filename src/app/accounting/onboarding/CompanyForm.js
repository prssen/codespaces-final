"use client"
import React from "react";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/components/form-controls/FormInput";
import { InputAdornment, Grid, MenuItem } from "@mui/material";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
// import CountrySelect from "../Components/CountrySelect";
// import { ReplayCircleFilled } from "@mui/icons-material";
// import getAddressFields from "../Components/AddressFields";

// import getAddressFields from "./components/AddressFields";
import * as Fields from "./components/AddressFields";

// import { arr, toTitleCase } from "../../utils";
import { arr, toTitleCase} from "@/lib/utils/utils";

/**
 * I have separated the three parts of the company
 * onboarding form into separate components for reusability.
 * They are exposed as 'dot notation exports', following
 * best practices in React development (https://andreidobrinski.com/blog/react-component-composition-with-dot-notation-exports/)
 */
const OrganisationDetails = ({ values, errors, onChange }) => {
    // const contactTypes = ["Supplier", "Customer", "Charity", "Donor"];

    // Taxonomy of charity types (AI-generated)
    const sectors = {
        arts: "Arts, Culture, Heritage or Science",
        education: "Education and Research",
        health: "Health and Social Care",
        religion: "Religious Activities",
        environment: "Environment and Animal Welfare",
        international: "International",
        community: "Social and Community",
        sports: "Sports and Recreation",
        economic: "Economic, Community and Social Development",
        law: "Law, Advocacy and Politics",
        other: "Other",
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormInput
                        error={errors.fieldErrors?.name}
                        id="charity-name"
                        name="name"
                        label="Charity Name"
                        helperText={
                            arr(errors.fieldErrors?.name).join("; ") ||
                            "Enter the name of the charity"
                        }
                        value={values.name}
                        onChange={onChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormInput
                        select
                        id="charity-sector"
                        name="sector"
                        label="Charity Sector"
                        error={errors.fieldErrors?.sector}
                        helperText={
                            arr(errors.fieldErrors?.sector).join("; ") ||
                            "Enter the sector your charity operates within"
                        }
                        value={values.sector}
                        onChange={onChange}
                        showHelper={true}
                    >
                        {Object.keys(sectors).map((name, index) => (
                            <MenuItem value={name}>{sectors[name]}</MenuItem>
                        ))}
                    </FormInput>
                </Grid>
            </Grid>
        </>
    );
};

export const PhoneNumberField = ({
    contactType,
    values,
    errors,
    handleChange,
    ...props
}) => {
    return (
        <FormInput
            error={errors.fieldErrors?.phoneNumber}
            id={`${contactType}-phoneNumber`}
            name="phoneNumber"
            label={`${toTitleCase(contactType)} Phone Number`}
            helperText={
                arr(errors.fieldErrors?.phoneNumber).join("; ") ||
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
    );
};

const EmailField = ({ contactType, values, errors, handleChange }) => {
    return (
        <FormInput
            error={errors.fieldErrors?.email}
            id={`${contactType}-email`}
            name="email"
            label={`${toTitleCase(contactType)} Email`}
            helperText={
                arr(errors.fieldErrors?.email).join("; ") ||
                `Enter the ${contactType}'s email`
            }
            value={values.email}
            onChange={handleChange}
        />
    );
};

export const AddressFields = ({ values, errors, onChange }) => {
    // console.log("Values read are: ", values);

    // const Fields = getAddressFields({
    //     values,
    //     errors,
    //     updateFormValues: onChange,
    //     type: "Charity",
    // });

    return (
        <>
            <Grid item xs={12}>
                <Fields.Address1 
                    error={errors.fieldErrors?.address?.address1}
                    value={values.address.address1}
                    onChange={onChange}
                />
                {/* <FormInput
                    error={errors?.fieldErrors?.address?.address1}
                    id="charity-address-1"
                    name="address.address1"
                    label="Charity Address"
                    helperText={
                        errors?.fieldErrors?.address?.address1?.join("; ") ||
                        "Enter the Charity's address"
                    }
                    value={values.address.address1}
                    onChange={handleChange}
                /> */}
            </Grid>
            <Grid item xs={12}>
                <Fields.Address2 
                    error={errors.fieldErrors?.address?.address2}
                    value={values.address.address2}
                    onChange={onChange}
                />
                {/* <FormInput
                    error={errors.fieldErrors?.address?.address2}
                    id="charity-address-2"
                    name="address.address2"
                    label="Address - Line 2"
                    helperText={errors.fieldErrors?.address?.address2?.join(
                        "; "
                    )}
                    value={values.address.address2}
                    onChange={handleChange}
                /> */}
            </Grid>
            <Grid item xs={12}>
                <Fields.Address3 
                    error={errors.fieldErrors?.address?.address3}
                    value={values.address.address3}
                    onChange={onChange}
                />
                {/* <FormInput
                    error={errors.fieldErrors?.address?.address3}
                    id="charity-address-3"
                    name="address.address3"
                    label="Address - Line 3"
                    helperText={errors.fieldErrors?.address?.address3?.join(
                        "; "
                    )}
                    value={values.address.address3}
                    onChange={handleChange}
                /> */}
            </Grid>
            <Grid item xs={6}>
                <Fields.Postcode 
                    error={errors.fieldErrors?.address?.postal_code}
                    value={values.address.postal_code}
                    onChange={onChange}
                />
                {/* <FormInput
                    error={errors.fieldErrors?.address?.postal_code}
                    id="charity-postal-code"
                    name="address.postal_code"
                    label="Postcode"
                    helperText={errors.fieldErrors?.address?.postal_code?.join(
                        "; "
                    )}
                    value={values.address.postal_code}
                    onChange={handleChange}
                /> */}
            </Grid>
            <Grid item xs={6}>
                <Fields.District 
                    error={errors.fieldErrors?.address?.district?.name}
                    value={values.address.district.name}
                    onChange={onChange}
                />
                {/* <FormInput
                    error={errors.fieldErrors?.address?.district?.name}
                    id="charity-postal-code"
                    name="address.district.name"
                    label="Borough"
                    helperText={errors.fieldErrors?.address?.district?.name.join(
                        "; "
                    )}
                    value={values.address.district?.name}
                    onChange={handleChange}
                /> */}
            </Grid>
            <Grid item xs={4}>
                <Fields.City 
                    error={errors.fieldErrors?.address?.city?.name}
                    value={values.address.city.name}
                    onChange={onChange}
                />
                {/* <FormInput
                    error={errors.fieldErrors?.address?.city?.name}
                    id="charity-city"
                    name="address.city.name"
                    label="City"
                    helperText={errors.fieldErrors?.address?.city?.name?.join(
                        "; "
                    )}
                    value={values.address.city.name}
                    onChange={handleChange}
                /> */}
            </Grid>
            <Grid item xs={4}>
                {/* <FormInput
                    error={errors.fieldErrors?.address?.region?.name}
                    id="charity-region"
                    name="address.region.name"
                    label="Region"
                    helperText={errors.fieldErrors?.address?.region?.name?.join(
                        "; "
                    )}
                    value={values.address.region.name}
                    onChange={handleChange}
                /> */}
                <Fields.Region 
                    error={errors.fieldErrors?.address?.region?.name}
                    value={values.address.region.name}
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={4}>
                {/* TODO: debug this */}
                {/* <CountrySelect
                    error={errors.fieldErrors?.address?.country?.name}
                    id="charity-country"
                    name="address.country"
                    label="Country"
                    select
                    helperText={errors.fieldErrors?.address?.country?.name?.join(
                        "; "
                    )}
                    value={values.address.country.name}
                    onChange={handleChange}
                /> */}
                <Fields.Country />
            </Grid>
        </>
    );
};

const AccountingDetails = ({ values, errors, onChange }) => {
    const legalStructures = {
        CIO: "CIO: Charitable Incorporated Organisation",
        COMP: "Charity company (limited by guarantee)",
        UNC: "Unincorporated association",
        TR: "Trust",
        OTH: "Other",
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <FormInput
                    select
                    id="charity-legal-structure"
                    name="legalStructure"
                    label="Charity Legal Structure"
                    error={errors.fieldErrors?.legalStructure}
                    helperText={
                        arr(errors.fieldErrors?.legalStructures).join("; ") ||
                        "Enter the legal structure of your charity (optional)"
                    }
                    value={values.legalStructure}
                    onChange={onChange}
                >
                    {Object.keys(legalStructures).map((name, index) => (
                        <MenuItem value={name}>
                            {legalStructures[name]}
                        </MenuItem>
                    ))}
                </FormInput>
            </Grid>
            <Grid item xs={12}>
                <FormInput
                    id="charity-charity-number"
                    name="charityCommissionNumber"
                    label="Charity Commission Number"
                    error={errors.fieldErrors?.charityCommissionNumber}
                    helperText={
                        arr(errors.fieldErrors?.charityCommissionNumber).join(
                            "; "
                        ) ||
                        "If you are a registered charity, enter your Charity Commision number here"
                    }
                    value={values.charityCommissionNumber}
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={12}>
                <FormInput
                    error={errors.fieldErrors?.slogan}
                    id="charity-slogan"
                    name="slogan"
                    label="Charity Slogan"
                    helperText={
                        arr(errors.fieldErrors?.slogan).join("; ") ||
                        "Enter the marketing slogan used by your charity (optional)"
                    }
                    value={values.slogan}
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={12}>
                <FormInput
                    error={errors.fieldErrors?.mission}
                    id="charity-mission"
                    name="mission"
                    multiline
                    minRows={3}
                    label="Mission"
                    helperText={
                        arr(errors.fieldErrors?.mission).join("; ") ||
                        "Describe the purpose of your organisation - what is your charity trying to achieve, and how?"
                    }
                    value={values.mission}
                    onChange={onChange}
                />
            </Grid>
        </Grid>
    );
};

// const AccountingForm = () => {
//     return <div>CompanyForm</div>;
// };

// const CompanyForm = {
//     ContactDetails: ContactForm,
//     OrganisationDetails: OrganisationForm,
//     AccountingDetails: AccountingForm,
// };

const CompanyForm = {
    AddressFields,
    OrganisationDetails,
    AccountingDetails,
};

export default CompanyForm;
