import React from "react";
import Image from 'next/image';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

// import { Box, Button } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { timelineItemClasses } from "@mui/lab/TimelineItem";
// import { Typography, Divider } from "@mui/material";

/**
 * 
 * @param {Array[Object]} data Expected format of data: 
 *                  [{ 
 *                      titleComponent | title, 
 *                      subtitleComponent | subtitle,
 *                      descriptionComponent | description,
 *                      image
 *                  }] 
 * @returns 
 */
const TrackingUpdates = ({
    // title,
    // titleComponent,
    // subtitle,
    // subtitleComponent,
    // imagePicker,
    // description,
    // descriptionComponent,
    data,
    values,
    updateFormValues,
    ...props
}) => {
    console.log('Timeline data received:', data);
    const [selectedImage, setSelectedImage] = React.useState(null);
    // const [selectedImage, setSelectedImage] = React.useState(data?.[0]?.image);

    const handleImageChange = (e) => {
        // Create URL for uploaded image to be previewed
        setSelectedImage(URL.createObjectURL(e.target.files[0]));
        // Update main form state object
        updateFormValues ??
            updateFormValues({
                target: { value: e.target.files[0] },
            });
    };

    return (
        <Timeline
            sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                    flex: 0,
                    padding: 0,
                },
                ...props?.timelineProps?.sx,
            }}
            {...props?.timelineProps}
        >
        {data?.map((item, i) => (
            <TimelineItem key={i}>
                <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent {...props?.timelineContentProps}>
                        <>
                            {item.titleComponent || (
                                <Typography fontWeight="bold">
                                    {item.title || "Activity record"}
                                </Typography>
                            )}
                            {item.subtitleComponent || (
                                <Typography variant="subtitle2" color="text.secondary">
                                    {item.subtitle || "12th Jan, 2024"}
                                </Typography>
                            )}
                            {item.descriptionComponent || (
                                <Typography paragraph mt={1}>
                                    {item.description ||
                                        "200 school books distributed to rural schoolchildren in Country Z"}
                                </Typography>
                            )}
                            {/* Image picker - adapted from GitHub copilot response */}
                            <Box
                                sx={{
                                    display: "flex",
                                    pr: 1,
                                    mt: 1,
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                {(item.image || selectedImage) &&                            
                                    // <img
                                    <Image
                                        src={item.image || selectedImage || "https://placehold.co/100"}
                                        alt="random"
                                        width={100}
                                        height={100}
                                    />
                                }
                                {item.imagePicker && (
                                    <>
                                        <input
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            id="contained-button-file"
                                            type="file"
                                            onChange={handleImageChange}
                                        />
                                        <label htmlFor="contained-button-file">
                                            <Button
                                                variant="contained"
                                                component="span"
                                            >
                                                Select Image
                                            </Button>
                                        </label>
                                    </>
                                )}
                            </Box>
                            <Divider
                                variant="middle"
                                sx={{
                                    opacity: 0.6,
                                    width: "95%",
                                    mx: "auto",
                                    my: 1,
                                }}
                            />
                        </>
                </TimelineContent>
            </TimelineItem>
                    ))}
            {/* <TimelineItem>
                <TimelineSeparator>
                    <TimelineDot />
                </TimelineSeparator>
                <TimelineContent>Code</TimelineContent>
            </TimelineItem> */}
        </Timeline>
    );
};

export default TrackingUpdates;
