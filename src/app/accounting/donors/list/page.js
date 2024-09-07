"use client"

import { Typography } from '@mui/material'
import { useGetDonors, useGetDonorStatistics } from '@/lib/hooks/useApi';
import { objectSum, objectMean, getAge, formatCurrency } from '@/lib/utils/utils';
import { givingStages } from '@/lib/utils/constants';
import dayjs from "dayjs";
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import ListViewPage from '@/accounting/list/page';
dayjs.extend(LocalizedFormat)

const ListDonors = () => {
    // Get donor data from backend
    const { data: donorData, isError: isDonorError, isLoading: isDonorLoading } = useGetDonors();
    const { data: analyticsData, isError: isAnalyticsError, isLoading: isAnalyticsLoading } = useGetDonorStatistics();

    const isError = isDonorError || isAnalyticsError;
    const isLoading = isDonorLoading || isAnalyticsLoading;

    console.log('Donor info is: ', donorData);

    // Transform data into format required
    const donors = donorData?.map((e, index) => ({
        ...e,
        id: e.uuid,
        name: `${e.first_name} ${e.last_name}`,
        age: getAge(e.birthdate),
        givingStage: givingStages[e.giving_stage],
        donated: '£' + formatCurrency(e.donated),
    }));

    const sortedChartData = analyticsData?.donor_numbers_by_year?.sort((a, b) => a.year - b.year);
    const sortedRatioData = analyticsData?.recurring_donation_ratio?.sort((a, b) => a.month - b.month);
    
    // Stats: 1) number of donors, 2) Recurring donation ratio
    const summaryChartData = {
        chartTitle: 'Number of donors',
        data: sortedChartData,
        keys: ['total'],
        indexBy: 'year',
        valueFormat: ">-0,~",
    };

    const summaryCardData = [
        { 
            title: sortedChartData?.slice(-1)[0].total,
            subtitle: 'Number of donors', 
            period: '5 years', 
            xAxis: sortedChartData?.map(e => e.year),
            yAxis: sortedChartData?.map(e => e.total),
            // Increases are a good thing for good indicators, and v. versa
            goodIndicator: true,
        },
        {
            title: `${Math.round(objectMean(sortedRatioData, 'total') * 100, 0)}%`,
            subtitle: 'Donations from repeat donors',
            period: 'year', 
            xAxis: sortedRatioData?.map(e => e.month),
            yAxis: sortedRatioData?.map(e => e.total),
            goodIndicator: true,
        },
    ]

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1},
        { field: 'age', headerName: 'Age', flex: 1},
        { field: 'givingStage', headerName: 'Giving stage', flex: 1},
        { field: 'donated', headerName: 'Amount donated', flex: 1},
    ];

    const headerData = {
        title: 'Donors',
        // TODO: move this to layout page
        breadcrumbs: ['Home', 'Donors'],
        buttonText: 'New donor'
    };

    console.log('Transformed donor data: ', donors);
    
    if (isLoading) return "Loading...";
    if (isError) return "An error has occurred";
    // if (status !== "success") return "Still not working";
    
    // Pass data to the components
    return (
        <ListViewPage 
            rows={donors}
            columns={columns}
            headerData={headerData}
            summaryChartData={summaryChartData}
            summaryCardData={summaryCardData}
        />
    );
}

export default ListDonors;