// https://github.com/gilbarbara/react-joyride?tab=readme-ov-file

// TODO: Implement product tour of key pages (project, transactions, chart of accounts etc.)


// // Some ideas from Copilot

// import React, { useState } from 'react';
// import Joyride from 'react-joyride';
// import { useLocalStorage } from 'react-use';
// import { useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../features/userSlice';

// const ProductTour = () => {
//     const [tourRun, setTourRun] = useLocalStorage('tourRun', true);
//     const [steps] = useState([
//         {
//             target: '.project',
//             content: 'This is the
//             project page'
//         },
//         {
//             target: '.transactions',
//             content: 'This is the transactions page'
//         },
//         {
//             target: '.chartOfAccounts',
//             content: 'This is the chart of accounts page'
//         }
//     ]);

//     const location = useLocation();
//     const user = useSelector(selectUser);
// };