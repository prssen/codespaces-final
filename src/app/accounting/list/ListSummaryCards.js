import React from 'react'
import { Box } from "@mui/material"
import DataCard from '@/components/accounting/projects/DataCard';

function ListSummaryCards({ cardData }) {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 2,
            ml: 4.5,
            mr: 2.5,
            // mb: 2,
        }}>
            {/* TODO: 
            'Expense items' (number of them + trend )
            'Expense this month' (number / line)

            map over card data
        */}
            {/* <DataCard paper={{ sx: { width: '30%' } }} /> */}
            {cardData.map(data => (
                <DataCard 
                    key={data}
                    {...data}
                    curve='linear'
                    showMark
                    // or width: Math.floor((100 / cardData.length + 1) / 10) * 10,
                    // so 2 cards -> 30%, 3 cards -> 20%
                    paper={{ 
                        sx: { 
                            width: '30%',
                            border: 1,
                            borderColor: '#dee0e5',
                            // boxShadow: '0px 10px 15px -3px rgb(236, 239, 248)',
                        } 
                    }} 
                />
            ))}
        </Box>
    )
}

export default ListSummaryCards