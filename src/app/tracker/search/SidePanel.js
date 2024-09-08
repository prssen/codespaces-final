import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import ToggleFilters from "./components/ToggleButtons";
import CheckboxFilters from "./components/CheckboxFilters";
import SliderFilter from "./components/SliderFilter";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, Box, Typography, AccordionSummary, AccordionDetails } from "@mui/material";

const SidePanel = ({ stateValues, setStateValues }) => {

    // TODO: move 'checked' and 'id' (State variables) to form handlers
    const accordionData = [
        {
            name: 'Search type',
            options: [
                {text: 'Appeals', icon: <Diversity3OutlinedIcon/>},
                {text: 'Charities', icon: <CorporateFareOutlinedIcon/>}
            ],
            // onChange: (event, searchType) => stateValues.current.searchType = searchType,
            onChange: (searchType) => setStateValues({...stateValues, searchType: searchType}),
            component: ToggleFilters
        },
        {
            name: 'Project duration',
            options: [
                // {text: '<1 year', state: { checked: false, id: 1}},
                // {text: '1-3 years', state: { checked: false, id: 2}},
                // {text: '>3 years', state: { checked: false, id: 3}}
                {text: '<1 year', state: stateValues.duration},
                {text: '1-3 years', state: stateValues.duration},
                {text: '>3 years', state: stateValues.duration}
            ],
            orientation: 'vertical',
            // onChange: (event, selectedId) => stateValues.duration = options.find(e => e.state.id === selectedId)[0].text,
            // onChange: (event, selectedOption) => stateValues.duration = selectedOption,
            
            onChange: (selectedOption) => {
                console.log('Selected checkbox: ', selectedOption);
                setStateValues({...stateValues, duration: selectedOption})
            },
            // onChange: (evt) => {
            //     console.log('Selected checkbox: ', evt.target.name);
            //     setStateValues({...stateValues, duration: evt.target.value})
            // },
            component: CheckboxFilters
        },
        {
            name: 'Fundraising goal',
            options: [
                {text: '$0 - $100,000+'}
            ],
            // onChange: (event, newValue) => stateValues.targetDonations = newValue,
            onChange: (event, newValue) => setStateValues({...stateValues, targetDonations: newValue}),
            component: SliderFilter
        }
    ];

    // // From 'date_started' field of ProjectAppeal - <1 year, 1-3 years, >3 years
    // const projectDuration = [];
    
    // // From the 'target_donations' field of Project - slider of $0 to $100,000+
    // const fundraisingGoal = [];

    return (
        // <Box sx={{backgroundColor: '#F5F5F5', borderRadius: 5, padding: 1}}>
        <Box sx={{borderRadius: 5, padding: 1}}>
            {accordionData.map(({ component: Component, ...accordion }, i) => (
                <Accordion
                    sx={{
                        elevation: 0,
                        boxShadow: 'none',
                        border: 0,
                        borderColor: 'white',
                        backgroundColor: 'rgba(242, 242, 242, 0.1)',
                    }}
                    defaultExpanded
                    disableGutters={true}
                    key={i}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{border: 'none'}}
                    >
                        <Typography>{accordion.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{border: 'none'}}>
                        <Component options={accordion.options} onChange={accordion.onChange} orientation={accordion.orientation}/>
                        {/* <CheckboxFilters options={accordion.options} orientation={accordion.orientation}/> */}
                    </AccordionDetails>
                </Accordion>
            ))
            }
        </Box>
    );
}

export default SidePanel;