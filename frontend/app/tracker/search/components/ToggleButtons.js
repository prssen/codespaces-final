import React from "react";
// import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { grey } from "@mui/material/colors";

// https://github.com/codefreeeze/filters-materialui-react/blob/master/src/components/common/FilterListToggle/index.jsx
const ToggleFilters = ({ options, onChange }) => {

    const group = {
        width: '100%',
        justifyContent: 'space-between',
        marginLeft: 2,
        display: 'flex',
        flexWrap: 'wrap'
    };

    const button = {
        borderRadius: 10,
        borderColor: grey[300],
        '&.MuiSelected': {
            background: grey[600],
            color: 'white'
        }
    };

    return (
        <ToggleButtonGroup style={group} exclusive onChange={onChange}>
            {options.map((option, i) => (
                <ToggleButton key={i} value={option.text} style={button}>
                    {/* {option.icon} */}
                    <span>{option.text}</span>
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}

export default ToggleFilters;