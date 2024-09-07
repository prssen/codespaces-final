// 'checked' = state of checkbox
// 'onChange' = function to change state of checkbox

// import { Checkbox, FormControlLabel, FormGroup, Box } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';

// Adapted from https://github.com/codefreeeze/filters-materialui-react/blob/master/src/components/common/CheckboxProton/index.jsx
const CheckboxFilters = ({ options, onChange, state, orientation } ) => {
    // TODO: implement in parent - on change, set id of selected
    // checkbox to 'true' (others to false)

    if (!Array.isArray(options)) {
        console.error('CheckboxFilters: options must be an array');
        console.log('options is this: ', options);
    }    
    console.log(orientation);

    const checkbox = {
        justifyContent: 'space-between',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginLeft: 3,
        flexWrap: 'wrap'
    }

    return (
        <FormGroup>
            <Box sx={{
                display: 'flex',
                flexDirection: orientation === 'vertical' ? 'column' : 'row'
            }}>
                {options.map((option, i) => (
                    <FormControlLabel
                        style={checkbox}
                        control={
                            <Checkbox
                                // checked={option.state?.id}
                                name={option.text}
                                checked={option.text === option.state}
                                // onChange={() => onChange(option.state?.id)}
                                onChange={() => onChange(option.text)}
                            />
                        }
                        label={option.text}
                    />   
                ))}
            </Box>
        </FormGroup>
    );
}

export default CheckboxFilters;