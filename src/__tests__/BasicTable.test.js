// import renderer from 'react-test-renderer';

// import '@testing-library/jest-dom';
// import {cleanup, fireEvent, render, screen} from '@testing-library/react';
// import BasicTable from '../components/BasicTable';

// describe('Testing the data values', () => {
//     let data, headers;

//     beforeEach(() => {
//         data = [
//             { id: 1, name: 'John', age: '24', occupation: 'Doctor' },
//             { id: 2, name: 'Jane', age: '23', occupation: 'Nurse' },
//             { id: 3, name: 'Bob', age: '25', occupation: 'Engineer' },
//             { id: 4, name: 'Sue', age: '26', occupation: 'Teacher' },
//             { id: 5, name: 'Mike', age: '27', occupation: 'Pilot' }
//         ];

//         headers = [
//             { id: 1, name: 'name'},
//             { id: 2, name: 'age'},
//             { id: 3, name: 'occupation'}
//         ];
//     });
//     afterEach(() => {
//         data = null;
//         headers = null;

//         cleanup();
//     });

//     it('renders the table without crashing', () => {
//         render(<BasicTable data={data} headers={headers}/>);
//     });

//     it('accepts data props', () => {
//         // Get props from the component rendered
//         const { baseElement } = render(<BasicTable data={data} headers={headers}/>);
//         const props = component.props; // Does this work?
//         expect(props.data).toEqual(data); // TODO: correct these
//         expect(props.headers).toEqual(headers);
//     });

//     it ('displays the correct table headers', () => {
//         render(<BasicTable data={data} headers={headers}/>);

//         // TODO: change to make sure this doesn't trigger if the word 'name' is found in the data
//         expect(screen.getByText('name')).toBeTruthy();
//     });

//     it ('displays the correct data values for each row', () => {

//     });
// });
