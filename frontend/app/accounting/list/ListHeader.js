import { Box, Typography, Button } from '@mui/material';
import BasicBreadcrumbs from '@/components/Breadcrumb';
import { BiPlus } from 'react-icons/bi';


const ListHeader = ({ title, breadcrumbs, buttonText }) => {
    return (
        <Box sx={{
            // backgroundColor: blue[100]
            ml: 2,
            px: 3,
            pb: 2,
            
            // mb: 3,
            // pb: 1,

            // borderBottom: 1,
            // borderColor: 'divider'
        }}>
            {/* <BasicBreadcrumbs breadcrumbs={['Home', 'List items']} /> */}
            
            {/* <BasicBreadcrumbs breadcrumbs={breadcrumbs} /> */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5" sx={{fontWeight: 'bold', marginTop: 2}}>{title}</Typography>
                <Button
                    sx={{
                        // background: 'rgb(76,0,222)',
                        // background: 'linear-gradient(90deg, rgba(76,0,222,1) 0%, rgba(147,66,245,1) 100%)',
                        background: 'rgb(127,135,252)',
                        // background: 'linear-gradient(90deg, rgba(127,135,252,1) 0%, rgba(194,152,249,1) 100%) padding-box, conic-gradient(#424bf5, #7c00f1, #424bf5) border-box',
                        // background: 'linear-gradient(90deg, rgba(127,135,252,1) 0%, rgba(194,152,249,1) 100%) padding-box, conic-gradient(#9342f5, #6069f9, #9342f5) border-box',
                        background: 'linear-gradient(90deg, rgba(127,135,252,1) 0%, rgba(194,152,249,1) 100%) padding-box, conic-gradient(#a869f7, #7f87fc, #a869f7) border-box',
                        // color: '#e3f2fd',
                        color: '#fff',
                        borderRadius: 10,
                        paddingLeft: 1.5,
                        paddingRight: 1.5,
                        border: 2, 
                        // borderColor: '#2d00d0'
                        // borderColor: '#4c00de',
                        // borderColor: '#424bf5'
                        borderColor: 'transparent',
                    }}
                >{buttonText}{" "}<BiPlus />
                </Button>
            </Box>
            {/* <Typography>
                Testing {JSON.stringify(selectedRows)}
            </Typography>
            <Typography>
                Sort models: {JSON.stringify(sortModel)}
            </Typography>
            <Typography>
                Selected filter: {selectedFilter}
            </Typography> */}
            {/* 
                <Box sx={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                    <Tabs aria-label="list view tabs" sx={{
                        // Credit: https://mui.com/material-ui/react-tabs/#customization
                        // TODO: pick a color scheme for hover
                        '&:hover': {
                            color: '#40a9ff',
                            opacity: 1,
                        },
                    }}>
                        <Tab label="Item One" sx={{alignItems: 'flex-start'}} />
                        <Tab label="Item Two" />
                    </Tabs>
                </Box>
            */}
        </Box>
    );
}

export default ListHeader;