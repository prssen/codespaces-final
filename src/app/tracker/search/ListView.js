// import { Container, Grid, Divider, Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
// Divider, Box, Typography, List, ListItem, ButtonBase
import { Suspense } from 'react';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ButtonBase from '@mui/material/ButtonBase';

import ListCard from "./ListCard";
import SearchResultsSkeleton from './components/SearchResultsSkeleton';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
// import { List, ListItem, ButtonBase } from "@mui/material";
import Image from "next/image";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";
dayjs.extend(relativeTime);

import icon from 'public/images/404-icon.png';
// import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

const ListView = ({ data: formatted }) => {
    const arrayNotEmpty = formatted && formatted.length > 0 && formatted.every(e => !!e === true);

    // const navigate = useNavigate();
    const router = useRouter();
    const searchParams = useSearchParams();
    console.log('Search result formatted data:', formatted);

    return (
        <>
            <Divider
                variant="middle"
                sx={{
                    opacity: 0.6,
                    width: "95%",
                    mx: "auto",
                    // my: 1,
                }}
            />
            <Suspense fallback={<SearchResultsSkeleton />}> 
                {arrayNotEmpty && formatted.map((charity, index) => (
                    // <ButtonBase onClick={() => navigate(`/tracker/appeals/${charity.uuid}`)} sx={{width: '100%'}}>
                    <ButtonBase onClick={() => router.push(`/tracker/appeals/${charity.uuid}`)} sx={{width: '100%'}}>
                        <Box key={index} sx={{width: '100%', "&:hover": { boxShadow: 1, borderRadius: 3}}}>
                            <ListCard
                                title={charity.title}
                                // subtitle={charity.location}

                                // Convert time to a relative time string ('X days ago')
                                // Credit: Github Copilot
                                subtitle={'Started ' + dayjs(charity.date_started).fromNow()}
                                text={charity.subtitle}
                                photoURL={charity.image}
                                rightDetail={<ChevronRightOutlinedIcon sx={{height: 20, width: 20}}/>}
                                // rightDetail={LeftChevron}
                                sx={{}}
                            />
                            <Divider
                                variant="middle"
                                sx={{
                                    opacity: 0.6,
                                    width: "95%",
                                    mx: "auto",
                                    // my: 1,
                                }}
                            />
                        </Box>
                    </ButtonBase>
                ))}
                {!arrayNotEmpty && <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    height: '100%',
                    padding: 4,
                }}>
                    {/* <Typography sx={{border: 1, borderColor: 'green'}}>Testing</Typography> */}
                    <Box sx={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Box sx={{width: '90%', height: '90%'}}>
                            <Image src={icon.src} width={0} height={0} sizes='100vw' style={{width: '100%', height: 'auto'}} />
                        </Box>
                    </Box>
                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: '-moz-initial'}}>

                        <Typography variant="h6">No results found for <strong>"{searchParams.get('search')}"</strong></Typography>
                        <Typography color="text.secondary" mt={1}>Some suggestions:</Typography>
                        {/* <List sx={{ listStyleType: 'disc', pl: 1 }} disablePadding> */}
                        <List disablePadding>
                            <ListItem sx={{ display: 'list-item', listStylePosition: 'inside', listStyleType: 'disc', pl: 0.2, pt: 0.8, py: 0.3, color: 'text.secondary' }}>Correct any typos</ListItem>
                            <ListItem sx={{ display: 'list-item', listStylePosition: 'inside', listStyleType: 'disc', pl: 0.2, py: 0.3, color: 'text.secondary'}}>Enter a more generic search term</ListItem>
                            <ListItem sx={{ display: 'list-item', listStylePosition: 'inside', listStyleType: 'disc', pl: 0.2, py: 0.3, color: 'text.secondary' }}>If you still can't find what you're looking for, contact customer support</ListItem>
                        </List>
                    </Box>
                </Box>}
            </Suspense>
        </>
    );
};

export default ListView;