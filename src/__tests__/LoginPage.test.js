/*
    - Click login tab: test that two form fields
    - Click register tab: 3 form fields with appropriate labels
    - Mock API call with 500 server error: check alert is displayed
    - No account? Register link -> 'Register' tab text appears AND 'no account? '
        text changed to 'No account? Login'
    - When 'login' button is pressed, onSubmit handler is called + appropriate
    API endpoint is called?
    - When username w/o password is provided, error message 'password missing'
    - Vice versa

    TODO: remove existing password/username checking logic, replace with useForm
    validation

*/

// import { render, screen } from '@testing-library/react';
// import { render, screen } from '../../utils/test_utils';
import { vi, expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import "@testing-library/jest-dom/vitest";
import { server } from './mocks/server';
import { apiUrl } from './mocks/handlers';
// import { rest } from 'msw';
// import { logRoles } from '@testing-library/dom';
import { render, screen, prettyDOM, fireEvent, within, logRoles } from '@/lib/utils/test_utils'
import userEvent from '@testing-library/user-event'
import LoginPage from  '@/accounting/auth/page';
// import { useRouter } from 'next/navigation';
import { loginErrorServer } from './mocks/nockHandlers';
import nock from 'nock';

// import { useRouter } from 'next/router';

// // Mocking the useRouter hook to simulate navigation - 
// // adapted from https://github.com/vercel/next.js/issues/7479#issuecomment-778586840
// vi.mock("next/router", () => ({
//     useRouter: vi.fn(),
//   }));

test('renders successfully', () => {
    // const push = vi.fn();
    // useRouter.mockImplementation(() => ({
    //   push,
    //   pathname: "/",
    //   route: "/",
    //   asPath: "/",
    //   query: "",
    // }));

    // const props = {
    //     values: { username: 'testing', password: 'testing'},
    //     setPasswordValidity: () => {},
    // }

    render(<LoginPage />);

    // TODO: replace with AccountTrack when logo is put in place
    const element = screen.getAllByText(/Login/i)[0];
    expect(element).toBeInTheDocument();
});


test('Clicking register tab displays registration form', async () => {
    // Click on Register tab of login page
    const user = userEvent.setup();
    // const registerTab = await screen.findAllByRole('tab');
    const { container } = render(<LoginPage />);
    // Print container + getRoles() for them
    // const registerTab = await screen.getAllByLabelText(/Register/i)
    // const registerTab = await screen.findAllByLabelText('Register', { selector: 'role=["tab"]'})[0]
    const registerTab = await screen.findByRole('tab', {name: /Register/i});
    await user.click(registerTab);
    // await user.click(screen.getAllByRole('tab')[0]);

    // screen.debug();
    // const tabs = screen.getAllByRole('tab');
    // expect(screen.getAllByRole('tab').length).toBeGreaterThan(0);
    // console.log(getRoles(container));
    const tabs = await screen.findByRole('tablist');
    // console.log(tabs);
    const formContainer = container.querySelector('.mui-mhc70k-MuiGrid-root');
    // screen.debug(formContainer);
    // logRoles(container);
    // screen.debug(tabs);
    // const formFields = await screen.findAllByRole('textbox');

    // There should be 3 form fields in the registration form
    const formFields = container.querySelectorAll('.MuiFormControl-root');
    // console.log(prettyDOM(formFields[0]));
    // const formFields = within(tabs).querySelector('.MuiInputBase-input');
    // const formFields = container.querySelector('.MuiInputBase-input');
    expect(formFields.length).toBe(3);
        // const registerTab = await screen.findAllByLabelText('Register', { selector: 'role=["tab"]'})[0]

    // Check that the 3 form fields are 'username', 'password' and 'confirm password'
    const username = within(formContainer).getByLabelText('Username');
    const password = within(formContainer).getByLabelText('Password');
    const confirmPassword = within(formContainer).getByLabelText('Confirm Password');
    [username, password, confirmPassword].forEach(formField => 
        expect(formField).toBeInTheDocument()
    );
});

test('click login tab displays login form', async () => {
    const user = userEvent.setup();

    // Click on 'Login' tab
    const { container } = render(<LoginPage />);
    const loginTab = await screen.findByRole('tab', {name: /Login/i});   
    await user.click(loginTab);
    
    const tabs = await screen.findByRole('tablist');
    const formContainer = container.querySelector('.mui-mhc70k-MuiGrid-root');
    
    // There should only be two form fields in the login screen now
    const formFields = container.querySelectorAll('.MuiFormControl-root');
    expect(formFields.length).toBe(2);

    // Check that the two form fields are for 'username' and 'password'
    const username = within(formContainer).getByLabelText('Username');
    const password = within(formContainer).getByLabelText('Password');
    [username, password].forEach(formField => 
        expect(formField).toBeInTheDocument()
    );
    }
);

test('Server error results in correct error message', async () => {
    // Add endpoint for accounting_login returning 500 error
    // server.use(
    //     rest.post(apiUrl("accounting_login"), (req, res, ctx) => {
    //         // Credit: https://balavishnuvj.com/blog/integration-tests-with-msw/
    //         return res.once(
    //             ctx.status(500),
    //             ctx.json({ message: 'Internal server error'})
    //         )
    //     })
    // );
    // process.env.SERVER_ERROR_RESPONSE = 'true';
    
    // console.log('__dirname: ', __dirname);
    // console.log('process.cwd(): ', process.cwd());
    // const configPath = path.resolve(__dirname, '..', '..', 'mock_api', 'config.json');
    // // Update mock server config to return an error response
    // let config = JSON.parse(fs.readFileSync(configPath));
    // config.server_error = true;
    // fs.writeFileSync(configPath, JSON.stringify(config));

    // loginErrorServer();
    // console.error('active mocks: %j', nock.activeMocks())

    // Render login page
    const { container } = render(< LoginPage />);
    
    // Enter username and password - these credentials are hardcoded
    // to trigger a 403 Unauthenticated error on the mock API server, thus
    // allowing us to test the UI's response
    fireEvent.change(screen.getByLabelText(/Username/i), {target: {value: 'serverFailure'}});
    fireEvent.change(screen.getByLabelText(/Password/i), {target: {value: 'changepassword'}});
    // await userEvent.type(screen.getByLabelText(/Username/i), 'testing');
    // await userEvent.type(screen.getByLabelText(/Password/i), 'changepassword');

    // console.log(prettyDOM(screen.getByLabelText(/Username/i)));
    await userEvent.click(screen.getByRole('button', { name: /Login/i}))
    const loginContainer  = container.querySelector('mui-1i32egh');
    // console.log(container.textContent);
    // console.log(prettyDOM(loginContainer));
    // screen.debug(loginContainer);
    // Check that alert with correct text is present
    const alerts = screen.queryAllByText('server error');
    console.log('Alerts found:', alerts);
    screen.debug();

    // const alert = screen.getByRole('alert');
    // console.log('Text content of alert is: ', alert.textContent);
    alerts.forEach(alert => expect(alert).toBeInTheDocument());
    alerts.forEach(alert => expect(alert.textContent).toContain("server error"));
    // process.env.SERVER_ERROR_RESPONSE = 'false';
    config.server_error = false;
    fs.writeFileSync(configPath, JSON.stringify(config));
});

test('"No account/Already have an account?" link navigates to other tab', async () => {
    // Set up
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);
    
    // Click on 'Login' tab
    const loginTab = await screen.findByRole('tab', {name: /Login/i});
    await user.click(loginTab);
    
    // Click on 'No account? Register' link
    const linkContainer = screen.getByText((_, el) => el.textContent == "Don't have an account? Register");
    const link = within(linkContainer).getByRole('button');
    await user.click(link);
    
    // const registerLinkText = screen.getByText(/Don't have an account\?/i);
    // const linkContainer = within(registerLinkText.parentElement);
    

    // console.log(registerLinkText.parentElement.textContent);
    // screen.debug();
    // console.log(registerLink.parentElement.textContent);
    // console.log(prettyDOM((link)));

    // Check that text below tab now says 'Register here'
    const registerTab = screen.getByRole('tab', { name: /Register/i});
    expect(registerTab).toBeInTheDocument();
});

test("Successful login redirects to home page", async () => {
    // Test that mocking useRouter works
    console.log('useRouter is', useRouter);

    // Render login page
    const { container } = render(< LoginPage />);

    // Fill in login form and press 'Login' button
    fireEvent.change(screen.getByLabelText(/Username/i), {target: {value: 'testing'}});
    fireEvent.change(screen.getByLabelText(/Password/i), {target: {value: 'changepassword'}});
    await userEvent.click(screen.getByRole('button', { name: /Login/i}));

    // Check that user is redirected to home page
    expect(useRouter.push).toBeCalledWith('/accounting/projects');
});

test("Invalid login credentials gives error alert", async () => {
    
})

