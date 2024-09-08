import React from 'react'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

// Credit: adapted from https://www.youtube.com/watch?v=TuMWZxzIZxU
const ListItemSkeleton = () => (
    <Stack direction='row' spacing={1} sx={{width: '100%', mt: '2px'}}>
        <Skeleton variant="circular" width={80} height={80} />
        <Box>
            <Skeleton variant="text" sx={{ fontSize: '1rem '}} />
            <Skeleton variant="rectangular" width={200} height={20} />
        </Box>
    </Stack>
);

const SearchResultsSkeleton = ({ size = 3 }) => {
  return (
    <>
      {[...Array(size)].map((_, index) => (
        <ListItemSkeleton key={index} />
      ))}
    </>
  )
}

export default SearchResultsSkeleton