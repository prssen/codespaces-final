"use client"

/**
 * 
 * TODO: add Poppins font
 */
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon} from "@mui/material";
import { Circle, Check } from "@mui/icons-material";
import { grey, green } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useTheme } from '@mui/material/styles';

/**
 * Validates password against requirements.
 * 
 * @param {*} values Note this is an object in the form { values: { password: ..., username: ... }},
 *                   hence the destructuring
 */
const PasswordValidator = ({ values, setPasswordValidity }) => {

    // console.log('Values passed to password validator:', values);

    const theme = useTheme();

    // Credit: selection logic adapted from https://www.youtube.com/watch?v=UHAuPmPtwuQ
    const [requirements, setRequirements] = useState([
        { regex: /.{6,}/, isValid: false, text: 'At least 6 characters'}, // Minimum 6 characters
        { regex: /[0-9]/, isValid: false, text: 'At least one number'}, // At least one number
        // Does not contain the username (credit: regex from AI)
        { regex: new RegExp(`^(?!.*${values.username}).*$`), isValid: false, text: 'Does not include the username'}
    ]);

    useEffect(() => {
        
        const updatedValues = requirements.map((item, index) => {
            // Check if password meets the requirement regex
            const isValid = item.regex.test(values.password);
            
            if (isValid) {
                // console.log('Password valid against requirement: ' + item.regex);
                // reqs[index].isValid = true;
                item.isValid = true;
                // setRequirements([...requirements, { ...item, isValid: true}])
            } else {
                // console.log('Password NOT valid against requirement: ' + item.regex);
                // reqs[index].isValid = false;
                // setRequirements([...requirements, { ...item, isValid: false}])
                item.isValid = false;
            }
            return item;
        });

        if (updatedValues.every(item => item.isValid === true)) {
            setPasswordValidity(true);
        } else { 
            setPasswordValidity(false);
        }

        setRequirements(updatedValues);

    }, [values.password])

    // console.log('New requirements', requirements);
    return (
        <Box sx={{
            width: '100%', 
            // border: 2, 
            // borderColor: 'gray', 
            // border: '1px solid rgba(255, 255, 255, 0.28)',
            border: 1,
            borderColor: grey[100],
            // background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(1px)',
            borderRadius: 2,
            p: 1,
            // boxShadow: '0px 0px 15px 3px rgba(0, 0, 0, 0.1)',
            // boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.1)',
        }}>
            <Typography>Password must contain:</Typography>
            <List role="status" aria-live="polite" aria-atomic="true">
                {requirements.map((item, index) => (
                    <ListItem key={index}>
                        <ListItemIcon>
                            {/* {console.log('Is requirement valid? ', item)} */}
                            {item.isValid ? 
                                (<Check aria-label="successful requirement" color='success' sx={{marginLeft: -1}}/>) : 
                                <Circle aria-label="failed requirement" color={grey[400]} sx={{height: '10px', width: '10px' }} />}
                        </ListItemIcon>
                        <ListItemText sx={{ml: -4}}>
                            <Typography color={item.isValid ? theme.palette.success.main : 'inherit'}>
                                {item.text}
                            </Typography>
                        </ListItemText>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default PasswordValidator;