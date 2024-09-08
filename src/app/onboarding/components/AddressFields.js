import React from "react";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/lib/components/form-controls/FormInput";
// import CountrySelect from "./CountrySelect";
import CountrySelect from "@/lib/components/form-controls/CountrySelect";
// import { arr, toTitleCase } from "../../utils";
import { arr, toTitleCase } from "@/lib/utils/utils";

const getAddressFields = ({ values, errors, updateFormValues, type }) => {
    console.log(`updateFormValues is: `, updateFormValues);
    const Address1 = () => (
        <FormInput
            error={errors.fieldErrors?.address?.address1}
            id={`${type}-address-1`}
            name={`address.address1`}
            label={`${toTitleCase(type)} Address`}
            helperText={
                arr(errors.fieldErrors?.address?.address1).join(`; `) ||
                `Enter the ${toTitleCase(type)}'s address`
            }
            value={values.address.address1}
            onChange={updateFormValues}
        />
    );

    const Address2 = () => (
        <FormInput
            error={errors.fieldErrors?.address?.address2}
            id={`${type}-address-2`}
            name="address.address2"
            label={`${toTitleCase(type)} Address - Line 2`}
            helperText={arr(errors.fieldErrors?.address?.address2).join(`; `)}
            value={values.address.address2}
            onChange={updateFormValues}
        />
    );

    const Address3 = () => (
        <FormInput
            error={errors.fieldErrors?.address?.address3}
            id={`${type}-address-3`}
            name="address.address3"
            label={`${toTitleCase(type)} Address - Line 3`}
            helperText={arr(errors.fieldErrors?.address?.address3).join(`; `)}
            value={values.address.address3}
            onChange={updateFormValues}
        />
    );

    const Postcode = () => (
        <FormInput
            error={errors.fieldErrors?.address?.postal_code}
            id={`${type}-postal-code`}
            name="address.postal_code"
            label={`${toTitleCase(type)} Postcode`}
            helperText={arr(errors.fieldErrors?.address?.postal_code).join(
                `; `
            )}
            value={values.address.postal_code}
            onChange={updateFormValues}
        />
    );

    const District = () => (
        <FormInput
            error={errors.fieldErrors?.address?.district?.name}
            id={`${type}-district`}
            name="address.district.name"
            label={`${toTitleCase(type)} district`}
            helperText={arr(errors.fieldErrors?.address?.district?.name).join(
                `; `
            )}
            value={values.address.district.name}
            onChange={updateFormValues}
        />
    );

    const City = () => (
        <FormInput
            error={errors.fieldErrors?.address?.city?.name}
            id={`${type}-city`}
            name="address.city.name"
            label={`${toTitleCase(type)} city`}
            helperText={arr(errors.fieldErrors?.address?.city?.name).join(`; `)}
            value={values.address.city.name}
            onChange={updateFormValues}
        />
    );

    const Region = () => (
        <FormInput
            error={errors.fieldErrors?.address?.region?.name}
            id={`${type}-region`}
            name="address.region.name"
            label={`${toTitleCase(type)} region`}
            helperText={arr(errors.fieldErrors?.address?.region?.name).join(
                `; `
            )}
            value={values.address.region.name}
            onChange={updateFormValues}
        />
    );

    const Country = () => (
        <CountrySelect
            error={errors.fieldErrors?.address?.country}
            id={`${type}-country`}
            name="address.country"
            label={`${toTitleCase(type)} country`}
            // select
            helperText={arr(errors.fieldErrors?.address?.country).join(`; `)}
            value={values.address.country}
            onChange={(e, newValue) => {
                const evt = {
                    target: {
                        name: `address.country`,
                        value: newValue.code,
                    },
                };
                return updateFormValues(evt);
            }}
        />
    );

    return {
        Address1,
        Address2,
        Address3,
        Postcode,
        District,
        City,
        Region,
        Country,
    };
};

export default getAddressFields;
