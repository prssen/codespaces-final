import React from "react";
// import FormInput from "../CreateTransactionModal/FormInput";
import FormInput from "@/components/form-controls/FormInput";
// import CountrySelect from "./CountrySelect";
import CountrySelect from "@/components/form-controls/CountrySelect";
// import { arr, toTitleCase } from "../../utils";
import { arr, toTitleCase } from "@/lib/utils/utils";

const Address1 = ({ error, value, onChange, type }) => (
    <FormInput
        // error={errors.fieldErrors?.address?.address1}
        error={error}
        id={`${type}-address-1`}
        name={`address.address1`}
        label={`${toTitleCase(type)} Address`}
        helperText={
            // arr(errors.fieldErrors?.address?.address1).join(`; `) ||
            arr(error).join(`; `) ||
            `Enter the ${toTitleCase(type)}'s address`
        }
        // value={values.address.address1}
        value={value}
        // onChange={updateFormValues}
        onChange={onChange}
    />
);

const Address2 = ({ error, value, updateFormValue, type }) => (
    <FormInput
        // error={errors.fieldErrors?.address?.address2}
        error={error}
        id={`${type}-address-2`}
        name="address.address2"
        label={`${toTitleCase(type)} Address - Line 2`}
        // helperText={arr(errors.fieldErrors?.address?.address2).join(`; `)}
        helperText={arr(error).join(`; `)}
        // value={values.address.address2}
        value={value}
        // onChange={updateFormValues}
        onChange={onChange}
    />
);

const Address3 = ({ error, value, onChange, type }) => (
    <FormInput
        // error={errors.fieldErrors?.address?.address3}
        error={error}
        id={`${type}-address-3`}
        name="address.address3"
        label={`${toTitleCase(type)} Address - Line 3`}
        // helperText={arr(errors.fieldErrors?.address?.address3).join(`; `)}
        helperText={arr(error).join(`; `)}
        // value={values.address.address3}
        value={value}
        // onChange={updateFormValues}
        onChange={onChange}
    />
);


const Postcode = ({ error, value, onChange, type }) => (
    <FormInput
        // error={errors.fieldErrors?.address?.postal_code}
        error={error}
        id={`${type}-postal-code`}
        name="address.postal_code"
        label={`${toTitleCase(type)} Postcode`}
        // helperText={arr(errors.fieldErrors?.address?.postal_code).join(
        helperText={arr(error).join(
            `; `
        )}
        // value={values.address.postal_code}
        value={value}
        // onChange={updateFormValues}
        onChange={onChange}
    />
);

const District = ({ error, value, onChange, type }) => (
    <FormInput
        // error={errors.fieldErrors?.address?.district?.name}
        error={error}
        id={`${type}-district`}
        name="address.district.name"
        label={`${toTitleCase(type)} district`}
        // helperText={arr(errors.fieldErrors?.address?.district?.name).join(
        helperText={arr(error).join(
            `; `
        )}
        // value={values.address.district.name}
        value={value}
        // onChange={updateFormValues}
        onChange={onChange}
    />
);

const City = ({ error, value, onChange, type }) => (
    <FormInput
        // error={errors.fieldErrors?.address?.city?.name}
        error={error}
        id={`${type}-city`}
        name="address.city.name"
        label={`${toTitleCase(type)} city`}
        // helperText={arr(errors.fieldErrors?.address?.city?.name).join(`; `)}
        helperText={arr(error).join(`; `)}
        // value={values.address.city.name}
        value={value}
        // onChange={updateFormValues}
        onChange={onChange}
    />
);

const Region = ({ error, value, onChange, type }) => (
    <FormInput
        // error={errors.fieldErrors?.address?.region?.name}
        error={error}
        id={`${type}-region`}
        name="address.region.name"
        label={`${toTitleCase(type)} region`}
        // helperText={arr(errors.fieldErrors?.address?.region?.name).join(
        helperText={arr(error).join(
            `; `
        )}
        // value={values.address.region.name}
        value={value}
        // onChange={updateFormValues}
        onChange={onChange}
    />
);

const Country = ({ error, value, onChange, type }) => (
    <CountrySelect
        // error={errors.fieldErrors?.address?.country}
        error={error}
        id={`${type}-country`}
        name="address.country"
        label={`${toTitleCase(type)} country`}
        // helperText={arr(errors.fieldErrors?.address?.country).join(`; `)}
        helperText={arr(error).join(`; `)}
        // value={values.address.country}
        value={value}
        onChange={(e, newValue) => {
            const evt = {
                target: {
                    name: `address.country`,
                    value: newValue.code,
                },
            };
            // return updateFormValues(evt);
            return onChange(evt);
        }}
    />
);

// const getAddressFields = ({ values, errors, updateFormValues, type }) => {
//     console.log(`updateFormValues is: `, updateFormValues);
//     // const Address1 = () => <_Address1 {...{ values, errors, updateFormValues, type }} />
//     // const Address2 = () => <_Address2 { ...{ values, errors, updateFormValues, type }} />


//     return {
//         Address1,
//         Address2,
//         Address3,
//         Postcode,
//         District,
//         City,
//         Region,
//         Country,
//     };
// };

// export default getAddressFields;

export {
    Address1,
    Address2,
    Address3,
    Postcode,
    District,
    City,
    Region,
    Country,
}
