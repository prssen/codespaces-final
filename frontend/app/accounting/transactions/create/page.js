// "use client"

// import { useState } from "react";
// import {
//     Box,
//     TextField,
//     Button,
//     Typography,
//     Grid,
//     Stack,
//     Container,
//     FormControl,
//     InputLabel,
//     InputBase,
// } from "@mui/material";
// import FormInput from "@/components/form-controls/FormInput";
// import TableInputs from "@/components/tableInputs";
// import useFormValues from "@/lib/hooks/formHook";

// // TODO:
// /*
// Replace <TableInputs> with a DataGrid-based component: see
//     https://www.youtube.com/watch?v=KTRFoouGzvY
//     https://mui.com/x/react-data-grid/layout/ skim through docs
//     https://www.youtube.com/watch?v=bgB0vSnyPRw to add/delete rows (Search other vids for this)
//     https://www.youtube.com/watch?v=VOaGpMb5cNA
//     maybe https://www.youtube.com/watch?v=9Nzvw0ycYXw
// */

// // TODO:
// // Put label above the text: https://stackoverflow.com/questions/67742831/textfield-label-to-show-separately-from-input
// // or https://mui.com/material-ui/react-text-field/#using-the-styled-api or
// // https://stackoverflow.com/questions/77279259/how-to-place-the-label-above-the-input-text-in-a-material-ui-textfield-component
// // or maybe

// /*
// Design Ideas:
//     - 'X' icon in corner, at same level as text, with icons for other actions next to them: 
//         https://dribbble.com/shots/21482195-Tailwarden-Cloud-account-notifications and 
//         https://dribbble.com/shots/22889525-Frame-so-File-Panel
//     */
// const CreateTransaction = () => {
//     const [formValues, setFormValues, updateFormValues] = useFormValues();

//     // Update an array of form values of the form:
//     // { 'rowIndex':[{ 'field name': 'field value'}]}
//     // e.g. {
//     //         '1' : [{'description' : 'Utility bills'}, {'amount' : 1000}],
//     //         '2': [{'description' : 'Bank interest charges'}, {'amount' : 200}]
//     //      }
//     const updateArrayFormValues = (e) => {
//         const index = e.target.dataset.index;
//         console.log("Index is: ", index);
//         setFormValues({
//             // Create array at the row index, or push to it if already exists (adapted from Copilot suggestion)
//             ...formValues,
//             // [index]: (formValues[index] || []).concat({
//             //     [e.target.name]: e.target.value,
//             // }),
//             [index]: { ...formValues[index], [e.target.name]: e.target.value },
//         });
//         console.log(
//             "Current form value is (before state update): ",
//             formValues
//         );
//     };

//     const [numLines, setNumLines] = useState(1);
//     const headers = ["amount", "dr", "cr", "unit"];

//     return (
//         <Container>
//             <Box component="form" sx={{ display: "flex" }}>
//                 <Grid container spacing={2}>
//                     <Grid item xs={12}>
//                         <Box
//                             sx={{
//                                 display: "flex",
//                                 alignItems: "space-between",
//                             }}
//                         >
//                             <Typography variant="h5" component="div">
//                                 Create Transaction
//                             </Typography>
//                         </Box>
//                     </Grid>
//                     <Grid item xs={6}>
//                         <FormInput
//                             id="transaction-description"
//                             label="Description"
//                             placeholder="School uniform"
//                             helperText="Enter a description of the transaction"
//                             onChange={updateFormValues}
//                         />
//                     </Grid>
//                     <Grid item xs={6}>
//                         <Stack spacing={4} sx={{ mt: 2 }}>
//                             <FormInput
//                                 id="transaction-fund"
//                                 label="Fund"
//                                 placeholder="General Fund"
//                                 helperText="Select the fund this transaction belongs to"
//                                 onChange={updateFormValues}
//                             />
//                             <FormInput
//                                 id="transaction-project"
//                                 label="Project"
//                                 placeholder="Education - Austin - 2023-24"
//                                 helperText="Select the project this transaction belongs to"
//                                 onChange={updateFormValues}
//                             />
//                         </Stack>

//                         {/* <FormControl>
//                             <InputLabel
//                                 shrink={false}
//                                 htmlFor="transaction-fund"
//                             >
//                                 Fund
//                             </InputLabel>
//                             <TextField
//                                 id="transaction-fund"
//                                 shrink
//                                 placeholder="General Fund"
//                                 helperText="Select the fund this transaction belongs to"
//                             />
//                         </FormControl> */}

//                         {/* <FormControl variant="standard">
//                             <InputLabel shrink htmlFor="bootstrap-input">
//                                 Bootstrap
//                             </InputLabel>
//                             <InputBase
//                                 defaultValue="react-bootstrap"
//                                 id="bootstrap-input"
//                                 size="medium"
//                             />
//                         </FormControl> */}
//                     </Grid>
//                     <Grid item xs={12}>
//                         {/* <TextField
//                             label="hello"
//                             variant="outlined"
//                             helperText="hi"
//                         /> */}

//                         {/* TODO:
//                         small input; flex 3 1 1 2; 
//                         */}
//                         <TableInputs
//                             numLines={numLines}
//                             setNumLines={setNumLines}
//                             headers={headers}
//                             sizes={[3, 1, 1, 2]}
//                             onChange={updateArrayFormValues}
//                         />
//                     </Grid>
//                 </Grid>
//                 <div></div>

//                 {/* <Typography variant='h6'>
//                     Create Transaction
//                 </Typography>
//                 <TextField
//                     label='Transaction Name'
//                     variant='outlined'
//                     fullWidth
//                     margin='normal'
//                 />
//                 <TextField
//                     label='Transaction Amount'
//                     variant='outlined'
//                     fullWidth
//                     margin='normal'
//                 />
//                 <TextField
//                     label='Transaction Date'
//                     variant='outlined'
//                     fullWidth
//                     margin='normal'
//                 />
//                 <Button
//                     type='submit'
//                     variant='contained'
//                     color='primary'
//                 >
//                     Create
//                 </Button> */}
//             </Box>
//         </Container>
//     );
// };

// export default CreateTransaction;
