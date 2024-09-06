import { Paper, Box, Avatar, Typography, LinearProgress, Chip } from '@mui/material';
import { blue, red, green, orange, grey } from '@mui/material/colors';
// import BasicTable from '../../BasicTable';
import BasicTable from "@/components/BasicTable";

const TableListItem = ({ title, subtitle, avatar, sx, ...props }) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            ...sx
        }}>
            <Avatar 
                src={avatar}
                sx={{
                    width: 30,
                    height: 30,
                    mr: 1.8
                }}
            />
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Typography fontWeight="bold" sx={{lineHeight: 1.2}}>{title}</Typography>
                <Typography variant="subtitle2" color="grey.500" sx={{lineHeight: 1.4 }}>{subtitle}</Typography>
            </Box>
        </Box>
    );
}

const TableRating = ({ engagement, sx, ...props}) => {

    let colors, chipText;
    if (!engagement) {
        colors = [blue, 'primary'];
        chipText = 'N/A'
    }
    if (engagement > 75) {
        colors = [green, 'success'];
        chipText = 'GOOD'
    } else if (engagement > 50) {
        colors = [orange, 'warning'];
        chipText = 'FAIR';
    } else {
        colors = [red, 'error'];
        chipText = 'POOR';
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            // border: 1,
            // borderColor: 'blue',
            width: '100%',
            // p: 2
            alignItems: 'center',
            // justifyContent: 'center',
        }}>
            {/* <Box sx={{width: '100%', mr: 1}}> */}

            {/* <Box sx={{flexGrow: 1, mr: 1, alignItems: 'center'}}>
                <LinearProgress 
                    variant="determinate" 
                    value={engagement} 
                    color={colors[1]}
                    sx={{
                        borderRadius: 3
                    }}
                />
            </Box> */}
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <Typography variant="subtitle2" sx={{mr: 3}}>{engagement}%</Typography>
                <Chip 
                    label={chipText}
                    sx={{
                        // backgroundColor: blue[100],
                        // linear-gradient(to top, ${blue[100]}, transparent 25%),
                        // background: `linear-gradient(to bottom, ${blue[200]}, ${blue[100]} 30%), linear-gradient(to top, ${blue[200]}, ${blue[100]} 30%)`,
                        
                        // background: `radial-gradient(${blue[50]}, ${blue[100]})`,
                        background: `linear-gradient(135deg, ${colors[0][50]}, ${colors[0][100]})`,
                        // border: `2px solid ${outlineColor}`,
                        
                        // color: '#fff',
                        color: colors[0][600],
                        fontWeight: 'bold',
                        border: 1,
                        // borderColor: blue[300],
                        borderColor: colors[0][500],
                        
                    }}
                />
            </Box>
        </Box>
    );
}

const KeyDonors = ({ ...props }) => {
    /*
    TODO:
        - Create a ListItem with option to remove avatar (title/subtitle only) component
        - Create ProgressBar component with rounded chip giving ranking: see https://i.pinimg.com/736x/bc/6e/cf/bc6ecf1177ad0b840b3f67911b92c00f.jpg
        - Transform data in 'Donor' and 'Tracker Engagement' columns into components
        - Pass to BasicTable, with appropriate header.labels
    */

    const data = [
        {donor: { name: 'John Smith', email: 'john.smith@gmail.com', avatar: 'https://picsum.photos/200'}, donations: 53, amount: 4232.40, engagement: 0.75},
        {donor: { name: 'Jane Jones', email: 'jane.jones@gmail.com', avatar: 'https://picsum.photos/200'}, donations: 21, amount: 1123.00, engagement: 0.24},
        {donor: { name: 'Patrice de Souza', email: 'jane.jones@gmail.com', avatar: 'https://picsum.photos/200'}, donations: 2, amount: 43.00, engagement: 0.94},
    ];

    const transformedData = data.map((item, i) => ({
        ...item,
        donor: <TableListItem title={item.donor.name} subtitle={item.donor.email} avatar={item.donor.avatar} />,
        engagement: <TableRating engagement={item.engagement * 100} />,
    }));

    const headers = [
        // {name: 'donor', label: <Typography variant="subtitle2" fontWeight="bold" color='text.secondary'>Donors</Typography>},
        {name: 'donor', label: 'Donors'},
        {name: 'donations', label: 'Donations'},
        {name: 'amount', label: 'Total amount'},
        {name: 'engagement', label: 'Tracker engagement'}
    ];
    
    return (
        <Paper sx={{
            p: 2,
            borderRadius: 3,
            // elevation: 0,
            ...props?.sx
        }}
        {...props}>
            {/* <Typography variant="h5" sx={{m: 0, p: 0 }}>Key project donors</Typography> */}
            {/* <TableListItem sx={{marginTop: 2}} title={'John Smith'} subtitle={'john.smith@gmail.com'} avatar='https://picsum.photos/200'/>
            <TableRating engagement={43}/> */}
            <BasicTable 
                data={transformedData}
                headers={headers}
                notJournals
                pagination={false}
                {...props?.tableProps}
                // sx={{borderRadius: '20px', border: 1, borderColor: grey[300]}}
            />
        </Paper>
    );
}

export default KeyDonors;