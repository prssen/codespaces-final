import Slider from '@mui/material/Slider';

const SliderFilter = ({ value, onChange }) => {

    const styles = {
        '&.MuiSlider-markLabel': {
            color: 'green',
            fontWeight: 'bold',
            backgroundColor: 'blue'
        },
        '&.MuiSlider-mark': {
            color: 'green'
        }
    }

    const sliderMarks = [
        { value: 0, label: '$0'},
        { value: 100000, label: '$100,000+'}
    ]
    return (
        <Slider 
            sx={{width: '100%', ...styles}}
            min={0}
            max={100000}
            marks={sliderMarks}
            value={value}
            onChange={onChange}
            // valueLabelDisplay='on'
        />
    );
}

export default SliderFilter;