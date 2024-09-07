// Tests:
/*
    1. Renders without crashing
    2. Props displayed
    3. Correct number of rows at start (numLines === highest index of TextField id)
        Or just number of TextFields = numLines * rowHeaders.length
    3.5 Data entered into a <TextField> is displayed (check text value === item entered)
    4. Clicking 'remove line' reduces number fo rows (numLines and highest index decrement after click)
    5. Clicking 'add line' increases number of rowsAdding new line (increments numLines and highest index)
    6. Correct headers displayed (each item from expenseHeaders in a corresponding <typography> element)
    7. Correct data values
*/














// From copilot - DO NOT LOOK UNTIL YOU'VE TRIED FOR YOURSELF
import '@testing-library/jest-dom';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import TableInputs from '../TableInputs';

describe('Testing the TableInputs component', () => {
    let numLines, setNumLines, setData;

    beforeEach(() => {
        numLines = 3;
        setNumLines = jest.fn();
        setData = jest.fn();
    });

    afterEach(() => {
        numLines = null;
        setNumLines = null;
        setData = null;

        cleanup();
    });

    it('renders the table without crashing', () => {
        render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData}/>);
    });

    it('accepts data props', () => {
        // Get props from the component rendered
        const { baseElement } = render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData}/>);
        const props = baseElement.props; // Does this work?
        expect(props.numLines).toEqual(numLines); // TODO: correct these
        expect(props.setNumLines).toEqual(setNumLines);
        expect(props.setData).toEqual(setData);
    });

    it('displays the correct number of rows at start', () => {
        render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData}/>);
        const textFields = screen.getAllByRole('textbox');
        expect(textFields.length).toBe(numLines * 4);
    });

    it('clicking "remove line" reduces number of rows', () => {
        render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData}/>);
        const removeButton = screen.getByText('Remove new line item');
        fireEvent.click(removeButton);
        expect(setNumLines).toHaveBeenCalledWith(numLines - 1);
    });

    it ('clicking "add line" increases number of rows', () => {
        render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData}/>);
        const addButton = screen.getByText('Add new line item');
        fireEvent.click(addButton);
        expect(setNumLines).toHaveBeenCalledWith(numLines + 1);
    });

    it ('displays the correct headers', () => {
        render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData}/>);
        const headers = ['expense account', 'description', 'fund', 'amount'];
        headers.forEach((header) => {
            expect(screen.getByText(header)).toBeTruthy();
        });
    });

    it ('displays the correct data values for each row', () => {
        render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData}/>);
        const textFields = screen.getAllByRole('textbox');
        textFields.forEach((textField, index) => {
            expect(textField.id).toBe(`expense-account-${index}`);
        });
    });

});

// // From copilot chat
// it('calls setNumLines with numLines - 1 when "Remove new line item" button is clicked', () => {
//     const numLines = 5;
//     const setNumLines = jest.fn();
//     const setData = jest.fn();
  
//     render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData} />);
  
//     const removeButton = screen.getByText('Remove new line item');
//     fireEvent.click(removeButton);
  
//     expect(setNumLines).toHaveBeenCalledWith(numLines - 1);
//   });

//   it('calls setNumLines with numLines + 1 when "Add new line item" button is clicked', () => {
//     const numLines = 5;
//     const setNumLines = jest.fn();
//     const setData = jest.fn();
  
//     render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData} />);
  
//     const addButton = screen.getByText('Add new line item');
//     fireEvent.click(addButton);
  
//     expect(setNumLines).toHaveBeenCalledWith(numLines + 1);
//   });

//   it('uses props correctly', () => {
//     const numLines = 5;
//     const setNumLines = jest.fn();
//     const setData = jest.fn();
  
//     render(<TableInputs numLines={numLines} setNumLines={setNumLines} setData={setData} />);
  
//     // Check if the correct number of TextFields are rendered
//     const textFields = screen.getAllByRole('textbox');
//     expect(textFields).toHaveLength(numLines * expenseHeaders.length);
//   });

//   it('renders without crashing', () => {
//     const div = document.createElement('div');
//     ReactDOM.render(<TableInputs />, div);
//   });