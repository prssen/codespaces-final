import { useState } from "react";
import _ from "lodash";

function useForm(initialValues = {}, validationSchema, submitCallback) {
    // Create an event handler to update form values object, and return the handler + object

    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const isErrors = () => !_.isEmpty(errors.fieldErrors);

    const updateFormValues = (e, type) => {
        // // From https://www.youtube.com/watch?v=-XKaSCU0ZLM
        // const { name, value } = e.target;
        // setFormValues({
        //     ...formValues,
        //     [name]: value
        // });

        //     [
        //         "createOption",
        //         "selectOption",
        //         "removeOption",
        //         "blur",
        //         "clear",
        //     ].includes(reason)
        //   ? type
        //   :

        // Retrieve new value from event object
        const targetValue =
            type === "checkbox" ? e.target.checked : e.target.value;
        // Add to form state object-
        // const updatedValues = {
        //     ...values,
        //     [e.target.name]: targetValue,
        // };

        const updatedValues = _.set(
            _.cloneDeep(values),
            e.target.name,
            // For the 'avatar' form field, we extract the multi-part form data from
            // 'files', not 'value'
            // e.target.name === "avatar" ? e.target.files[0] : e.target.value
            e.target.value
        );
        // setValues(updatedValues);

        // validateForm(updatedValues, validationSchema);
        validateField(e.target.name, targetValue, validationSchema);
        setValues(updatedValues);

        // if (e.target.checked || type === "checkbox") {
        //     // Update the form values when user enters text...
        //     const updatedValues = {
        //         ...values,
        //         [e.target.name]: e.target.checked,
        //     };

        //     /*
        //     formValidate(updatedValues, validationSchema);
        //     setFormValues(updatedValues);
        //     */

        //     const result = validationSchema.safeParse(updatedValues);
        //     setValues(updatedValues);

        //     // ...and propagate any form validaton errors
        //     const _errors = result.success ? {} : result.error.flatten();
        //     setErrors(_errors);
        // }
        // // TODO: handle 'array' type updates below
        // else {
        //     // setFormValues({ ...formValues, [e.target.name]: e.target.value });
        //     const updatedValues = {
        //         ...values,
        //         [e.target.name]: e.target.value,
        //     };
        //     const result = validationSchema.safeParse(updatedValues);
        //     setValues(updatedValues);

        //     const _errors = result.success ? {} : result.error.flatten();
        //     setErrors(_errors);
        // }
        console.log("Form data: ", values);
    };

    const formSubmit = (e) => {
        e.preventDefault();
        const _errors = validateForm(values, validationSchema);
        submitCallback(e, _errors);
    };

    const validateForm = (values, schema) => {
        if (schema) {
            // const result = schema.safeParse(values);

            // Produce a nested errors object - from
            // https://github.com/colinhacks/zod/issues/236#issuecomment-778309966
            const fieldErrors = schema.safeParse(values).error?.errors?.reduce(
                (errors, error) =>
                    error.path.reduce((a, b, level) => {
                        if (level === error.path.length - 1) {
                            a[b] = error.message;

                            return errors;
                        }

                        if (!a[b]) {
                            a[b] = {};
                        }

                        return a[b];
                    }, errors),
                {}
            );
            const _errors = { fieldErrors };

            // const _errors = result.success ? {} : result.error.flatten();
            setErrors(_errors);
            return _errors;
            // console.log(errors);
        }
    };

    // Validate a specific field of a form, for better usability
    // (errors only appear on form when you start typing in a field)
    const validateField = (name, value, schema) => {
        if (schema) {
            // Parse the field value, and extract the errors
            // Get the schema for the field (handles arbritrary level of
            // nesting, for complex schemas)
            let fieldSchema = schema;
            for (const pathName of name.split(".")) {
                fieldSchema = fieldSchema.shape[pathName];
            }
            // TODO: handle the case when schema doesn't contain validation rule
            // for the field
            const result = fieldSchema?.safeParse(value);

            // const result = schema.shape[name].safeParse(value);
            const _errorObject =
                !result || result?.success ? {} : result?.error?.flatten();
            let _updatedErrors;
            let _errors = _.cloneDeep(errors);
            // If the-re are any errors, add to error state variable -
            // if not, clear any existing errors for that field in the error state variable
            if (Object.keys(_errorObject).length !== 0) {
                let _errorArray = _errorObject.formErrors;
                _updatedErrors = _.set(
                    _errors,
                    `fieldErrors.${name}`,
                    _errorArray
                );
                setErrors(_updatedErrors);
            } else {
                _.unset(_errors, `fieldErrors.${name}`);
                setErrors(_errors);
            }
        }
        // let _errors = _.cloneDeep(errors);
        // _updatedErrors = _.set(
        //     _errors,
        //     `fieldErrors.${name}`,
        //     _errorArray
        // );
        // setErrors(_updatedErrors);

        // errors = _.set(errors, `fieldErrors.${name}`, _error);

        // setErrors({
        //     ...errors,
        //     fieldErrors : { [name]: _error}
        // });
        // const result = schema.safeParse({ [name]: value });
        // return result.success ? {} : result.error.flatten();
    };

    // TODO: updateChecked - put all your update form handlers here and export them to each modal

    const updateArrayFormValues = (e, index) => {
        // setFormValues({
        //     ...formValues,
        //     [e.target.name]: formValues[e.target.name].map((item, i) =>
        //         i === index ? e.target.value : item
        //     ),
        // });

        _.set(
            _.cloneDeep(values),
            e.target.name,
            // For the 'avatar' form field, we extract the multi-part form data from
            // 'files', not 'value'
            // e.target.name === "avatar" ? e.target.files[0] : e.target.value

            // e.target.value
            _.get(values, e.target.name).map((item, i) =>
                i === index ? e.target.value : item
            )
        );
    };

    console.log("setValues from WITHIN the hook: ", setValues);

    // TODO: remove the 'setvalues' (not needed)
    // return [values, setFormValues, updateFormValues, errors, setErrors];
    return {
        values,
        updateFormValues,
        setValues,
        formSubmit,
        errors,
        isErrors,
    };
}

export default useForm;


/** OLD VERSION */

// import { useState } from "react";

// // TODO: rename to 'useForm'
// function useFormValues() {
//     // Create an event handler to update form values object, and return the handler + object

//     const [formValues, setFormValues] = useState({});

//     const updateFormValues = (e) => {
//         // // From https://www.youtube.com/watch?v=-XKaSCU0ZLM
//         // const { name, value } = e.target;
//         // setFormValues({
//         //     ...formValues,
//         //     [name]: value
//         // });

//         setFormValues({ ...formValues, [e.target.name]: e.target.value });
//         console.log("Form data: ", formValues);
//     };

//     // TODO: updateChecked - put all your update form handlers here and export them to each modal

//     // const updateArrayFormValues = (e, index) => {
//     //     setFormValues({
//     //         ...formValues,
//     //         [e.target.name]: formValues[e.target.name].map((item, i) =>
//     //             i === index ? e.target.value : item
//     //         ),
//     //     });
//     // };

//     // Validate
//     /*
//     Call schema.safeParse()
//     Add errors to state variable, and expose state variable
//     */

//     return [formValues, setFormValues, updateFormValues];
// }

// export default useFormValues;
