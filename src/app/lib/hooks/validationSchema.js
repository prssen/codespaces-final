import * as z from "zod";
import validator from "validator";
import _ from "lodash";

// Validation schema, mirroring the model constraints defined in Django
export const accountSchema = z
    .object({
        name: z
            .string()
            .min(1, { message: "Account name required" })
            .max(200, { message: "Account name too long" })
            .refine(
                // Regex adapted from https://stackoverflow.com/a/18058033
                (value) => /^([^$&+,:;=?@#|'<>*()%!-]+|)$/.test(value),
                "Account name can not contain special characters: try replacing punctuation with letters and numbers."
            ),
        accountType: z.enum(["AST", "LIA", "INC", "EXP", "EQU"]),
        // .string()
        // .refine((value) =>
        //     Object.values(options.accountTypes).includes(value)
        // ),
        // isSubAccount: z.any().refine(value => 'boolean' === typeof value),
        isSubAccount: z.boolean(),
        parentAccount: z
            .string()
            .min(1, { message: "Account name required" })
            .max(200, { message: "Account name too long" }),
        standardAccount: z.string(),
        description: z.string(),
    })
    .strict(); // strict() disallows unrecognised keys

export const contactSchema = z.object({
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
    email: z.string().refine(validator.isEmail, "Please enter a valid email"),
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
                (value) => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/.test(value),
                "Please enter a valid postcode"
            )
            .nullish(),
        district: z.object({
            name: z
                .string()
                .max(200, { message: "District too long" })
                .nullish(),
        }),
        city: z.object({
            name: z.string().max(200, { message: "City too long" }).nullish(),
        }),
        // Region can be be empty (undefined or empty string) or a maximum 200-char
        // string (from https://stackoverflow.com/a/76924595)
        region: z.object({
            name: z
                .union([
                    z.string().max(200, { message: "Region too long" }),
                    z.string().length(0),
                ])
                .optional()
                .transform((e) => (e === "" ? undefined : e)),
        }),
        country: z
            .string()
            .refine(
                validator.isISO31661Alpha2,
                "Please select a valid country"
            ),
    }),
    avatar: z.any().nullish(),
});

export const organisationSchema = contactSchema.extend({
    name: z
        .string()
        .min(1, { message: "Organisation name required" })
        .max(160, { message: "Organisation name too long" }),
    sector: z
        .string()
        .min(1, { message: "Sector required" })
        .max(64, { message: "Name of sector too long" })
        .nullish(),
});

export const personSchema = contactSchema.extend({
    title: z
        .number()
        .int()
        .min(0, { message: "Invalid title selected" })
        .max(3, { message: "Invalid title selected" })
        .nullish(),
    firstName: z
        .string()
        .max(64, { message: "Reduce length of first name" })
        .nullish(),
    middleNames: z
        .string()
        .max(400, { message: "Middle names too long" })
        .nullish(),
    lastName: z
        .string()
        .max(64, { message: "Reduce length of last name" })
        .nullish(),
    birthdate: z
        .date()
        .refine((data) => data > new Date(), {
            message: "Date must be in the past",
        })
        .nullish(),
    suffix: z.string().max(100, { message: "Suffix too long" }).nullish(),
    occupation: z
        .string()
        .max(200, { message: "Please provide a shorter description" })
        .nullish(),
    nationality: z
        .string()
        .max(64, { message: "Nationality too long" })
        .nullish(),
});

export const charitySchema = organisationSchema
    .extend({
        legalStructure: z
            .string()
            .max(64, { message: "Description too long" })
            .nullish(),
        charityCommissionNumber: z
            .string()
            .min(8, { message: "Incorrect length" })
            .max(8, { message: "Incorrect length" })
            // .refine((value) => /^([^$&+,:;=?@#|'<>*()%!-]+|)$/.test(value), {
            .refine((value) => /^[0-9]*/.test(value), {
                message:
                    "Invalid characters - charity number may only contain numeric characters",
            })
            .nullish()
            .or(z.literal("")),
        slogan: z.string().max(64, { message: "Slogan too long" }).nullish(),
        mission: z.string().nullish(),
    })
    .strict();

export const donorSchema = personSchema
    .extend({
        givingStage: z.string().max(2, { message: "Invalid giving stage" }),
        description: z.string().nullish(),
        isVATNumberValidated: z.boolean(),
    })
    .strict();

export const partnerSchema = organisationSchema
    .extend({
        displayName: z
            .string()
            .max(200, { message: "Display name too long" })
            .nullish(),
        // UUID
        // primaryContact: z.string(),
        VATNumber: z
            .string()
            .max(15, { message: "VAT number incorrect length" })
            .nullish(),
        isVATNumberValidated: z.boolean(),
    })
    .strict();

export const expenseSchema = z.object({
    expense_type: z
        .string()
        .min(1, { message: "Please enter an expense type" }),
    line_items: z.array(z.any()).min(1, "Please enter at least one line item"),

    // line_items: z.object({
    //     description: z
    //         .string()
    //         .min(1, { message: "Please enter a description" }),
    //     amount: z
    //         .number()
    //         .min(0.01, { message: "Amount must be greater than zero" }),
    //     quantity: z
    //         .number()
    //         .min(1, { message: "Quantity must be greater than zero" }),
    //     unit_price: z
    //         .number()
    //         .min(0.01, { message: "Unit price must be greater than zero" }),
    // }),
    // })
});

export const registrationSchema = z
    .object({
        username: z.string().min(1, { message: "Name is required" }),
        password: z.string().min(6, { message: "Password is too short" }),
        email: z
            .string()
            .refine(validator.isEmail, "Please enter a valid email"),
        confirmPassword: z.string().min(6),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

export const loginSchema = z
    .object({
        username: z.string().min(1, { message: "Username is required" }),
        password: z
            .string()
            .min(7, { message: "Password must be at least 7 characters" }),
    })
    .strict();

/*
// Validation schema for business customers and suppliers
// const partnerSchema = z
//     .object({
//         name: z
//             .string()
//             .min(1, { message: "Supplier name required" })
//             .max(200, { message: "Supplier name too long" })
//             .refine(
//                 // Regex adapted from https://stackoverflow.com/a/18058033
//                 (value) => /^([^$&+,:;=?@#|'<>*()%!-]+|)$/.test(value),
//                 "Account name can not contain special characters: try replacing punctuation with letters and numbers."
//             ),
//         phoneNumber: z
//             .string()
//             .refine(
//                 validator.isMobilePhone,
//                 "Please enter a valid telephone number"
//             ),
//         email: z
//             .string()
//             .refine(validator.isEmail, "Please enter a valid email"),
//         address: z.object({
//             address1: z.string().min(1, { message: "Address required" }),
//             address2: z
//                 .string()
//                 .max(200, { message: "Address too long" })
//                 .nullish(),
//             address3: z.string().max(200, { message: "Address too long" }),
//             // .nullish(),
//             postal_code: z
//                 .string()
//                 .refine(
//                     // Regex for UK postal codes - from https://stackoverflow.com/a/51885364
//                     (value) => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/.test(value),
//                     "Please enter a valid postcode"
//                 )
//                 .nullish(),
//             district: z
//                 .string()
//                 .max(200, { message: "District too long" })
//                 .nullish(),
//             city: z.string().max(200, { message: "City too long" }).nullish(),
//             // Region can be be empty (undefined or empty string) or a maximum 200-char
//             // string (from https://stackoverflow.com/a/76924595)
//             region: z
//                 .union([
//                     z.string().max(200, { message: "Region too long" }),
//                     z.string().length(0),
//                 ])
//                 .optional()
//                 .transform((e) => (e === "" ? undefined : e)),
//             country: z
//                 .string()
//                 .refine(
//                     validator.isISO31661Alpha3,
//                     "Please select a valid country"
//                 ),
//         }),
//         avatar: z.string().nullish(),
//         sector: z.string().nullish(),
//         VATNumber: z.string().nullish(),
//         isVATNumberValidated: z.boolean(),
//     })
//     // .refine(
//     //     (data) => validator.isVAT(data.VATNumber, data.country),
//     //     `VAT number is invalid. Please enter a valid VAT number for the selected country`
//     // )
//     .strict();


// TODO: schema for accounts

// // Validation schema for transactions
// const transactionSchema = z
//     .object({
//         date: z.date(),
//         description: z.string(),
//         amount: z.number(),
//         category: z.string(),
//         account: z.string(),
//         partner: z.string(),
//         isRecurring: z.boolean(),
//         frequency: z.string().optional(),
//         endDate: z.date().optional(),
//     })

//     .strict();

// Validation schema for user registration


// const userSchema = z
//     .object({
//         username: z.string().min(1, { message: "Username required" }),
//         email: z.string().email(),
//         password: z.string().min(8, { message: "Password must be at least 8 characters" }),
//         confirmPassword: z.string().refine((value, data) => value === data.password, { message: "Passwords must match" }),
//     })
//     .strict();

// // Validation schema for user login
// const loginSchema = z
//     .object({
//         username: z.string().min(1, { message: "Username required" }),
//         password: z.string().min(8, { message: "Password must be at least 8 characters" }),
//     })
//     .strict();

// // Validation schema for user profile
// const profileSchema = z
//     .object({
//         username: z.string().min(1, { message: "Username required" }),
//         email: z.string().email(),
//         avatar: z.string().nullish(),
//     })
//     .strict();

// // Validation schema for user password reset
// const passwordResetSchema = z
//     .object({
//         email: z.string().email(),
//     })
//     .strict();

// // Validation schema for user password reset confirmation
// const passwordResetConfirmSchema = z
//     .object({
//         password: z.string().min(8, { message: "Password must be at least 8 characters" }),
//         confirmPassword: z.string().refine((value, data) => value === data.password, { message: "Passwords must match" }),
//     })
//     .strict();

// // Validation schema for user password change
// const passwordChangeSchema = z
//     .object({
//         oldPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
//         newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
//         confirmPassword: z.string().refine((value, data) => value === data.newPassword, { message: "Passwords must match" }),
//     })
//     .strict();

// // Validation schema for user email change
// const emailChangeSchema = z
//     .object({
//         email: z.string().email(),
//     })
//     .strict();

// // Validation schema for user email change confirmation
// const emailChangeConfirmSchema = z
//     .object({
//         email: z.string().email(),
//     })
//     .strict();
*/
