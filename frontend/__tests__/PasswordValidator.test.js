/**
 * Things to test:
 * 
 * - Renders
 * - 0 check icons + passwordValidity == false for empty password, and invalid password
 * - 1 check icon (passwordValidity ALWAYS false) when password meets 1 condition, 2 when two etc.
 * - When passwords meets conditions, a) passwordValidity == true, and b) 3 checks
 * 
 */

import { render, screen, within } from '@testing-library/react';
import { prettyDOM } from '@testing-library/dom';
import "@testing-library/jest-dom/vitest";

import { assert, describe, test, expect } from 'vitest'
// import { render } from '../../utils/test_utils';
// import PasswordValidator from './PasswordValidator';
import PasswordValidator from '@/components/auth/PasswordValidator';
// import leakedHandles from 'leaked-handles';

// leakedHandles.set({
//     fullStack: true, // use full stack traces
//     timeout: 30000, // run every 30 seconds instead of 5.
//     debugSockets: true // pretty print tcp thrown exceptions.
//   });



// describe('skipped suite', () => {
//     it('test', () => {
//       // Suite skipped, no error
//       assert.equal(Math.sqrt(4), 2)
//     })
//   })

//// >>>>>>> UNCOMMENT THE BELOW


test('renders without crashing', () => {
    const props = {
        values: { username: 'testing', password: 'testing'},
        setPasswordValidity: () => {},
    }

    render(<PasswordValidator {...props} />);

    const element = screen.getByText('Password must contain:');
    expect(element).toBeInTheDocument();
});

/*
Thinking about parameterising tests with each(): 
*/
// let passwordValidity = false;

// const testCases = [
//     { 
//         props: {
//             values: {username: 'test', password: 'test'}, 
//             setPasswordValidity: (status) => passwordValidity = status
//         },
//         successes: 0, 
//         failures: 3, 
//         validity: false   
//     },
//     {

//     }
// ]

// test.each(testCases)('Password meets %o requirements', ({ props, successes, failures, validity}) => {
//     // Rest of test with hardcodd values replaced with args
// })

// afterEach(() => {
//     passwordValidity = false;
// })



test('invalid password meets no requirements', () => {
    let passwordValidity;
    // Pass a password which fails all 3 requirements
    const props = {
        values: { username: 'test', password: 'test'},
        setPasswordValidity: (status) => passwordValidity = status,
    }
    
    render(<PasswordValidator {...props} />);
    console.log('props are', props.values);

    // UI should display the <Circle> icon next to each of the 3 requirements,
    // indicatng 3 failures (and no successful <Check> icons present)
    const container = screen.queryAllByRole('status')[0]
    console.log('Container length: ', container.length);
    console.log('Container children: ', container.children.length);
    console.log(prettyDOM(container));
    const passwordRequirements = within(container);
    const successes = passwordRequirements.queryAllByLabelText('successful requirement');
    const failures = passwordRequirements.queryAllByLabelText('failed requirement');

    // const successes = screen.queryAllByLabelText('successful requirement');
    // const failures = screen.queryAllByLabelText('failed requirement');
    expect(successes.length).toBe(0);
    expect(failures.length).toBe(3);
    expect(passwordValidity).toBe(false);
});


test('password meets 1 requirement', () => {
    let passwordValidity;
    // Password meets first requirement (more than 6 characters)
    const props = {
        values: { username: 'testing', password: 'testing'},
        setPasswordValidity: (status) => passwordValidity = status,
    }

    render(<PasswordValidator {...props} />);

    // UI should display the <Circle> icon next to each of the 3 requirements,
    // indicatng 3 failures (and no successful <Check> icons present)
    // const successes = screen.queryAllByLabelText('successful requirement');
    // const failures = screen.queryAllByLabelText('failed requirement');
    const container = screen.queryAllByRole('status')[0];
    const successes = within(container).queryAllByLabelText('successful requirement');
    const failures = within(container).queryAllByLabelText('failed requirement');

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(2);
    expect(passwordValidity).toBe(false);
});

test('password meets 2 requirements', () => {
    let passwordValidity;
    // Password now also includes letters and numbers
    const props = {
        values: { username: 'testing', password: 'testing123'},
        setPasswordValidity: (status) => passwordValidity = status,
    }

    render(<PasswordValidator {...props} />);

    // UI should display the <Circle> icon next to each of the 3 requirements,
    // indicatng 3 failures (and no successful <Check> icons present)
    // const successes = screen.queryAllByLabelText('successful requirement');
    // const failures = screen.queryAllByLabelText('failed requirement');

    const container = screen.queryAllByRole('status')[0];
    const successes = within(container).queryAllByLabelText('successful requirement');
    const failures = within(container).queryAllByLabelText('failed requirement');

    expect(successes.length).toBe(2);
    expect(failures.length).toBe(1);
    expect(passwordValidity).toBe(false);
});


test('password meets all requirements', () => {
    let passwordValidity;
    // Password now does not include the username
    const props = {
        values: { username: 'testing', password: 'anotherpassword123'},
        setPasswordValidity: (status) => passwordValidity = status,
    }

    render(<PasswordValidator {...props} />);
    // screen.debug()

    // UI should display the <Circle> icon next to each of the 3 requirements,
    // indicatng 3 failures (and no successful <Check> icons present)
    // const successes = screen.queryAllByLabelText('successful requirement');
    // const failures = screen.queryAllByLabelText('failed requirement');

    const container = screen.queryAllByRole('status')[0];
    const successes = within(container).queryAllByLabelText('successful requirement');
    const failures = within(container).queryAllByLabelText('failed requirement');
    
    expect(successes.length).toBe(3);
    expect(failures.length).toBe(0);
    expect(passwordValidity).toBe(true);
});

// test('password meets 1 requirement')

// test('2+2=4', () => {
//     expect(2+2).toEqual(4);
// })

