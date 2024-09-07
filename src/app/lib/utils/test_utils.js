import { render } from '@testing-library/react';
import Providers from '../contextProviders';

// Credit: code adapted from https://testing-library.com/docs/react-testing-library/setup#custom-render
const customRender = (ui, options) =>
    render(ui, {wrapper: Providers, ...options})

// re-export everything
export * from '@testing-library/react'

// override render method
export {customRender as render}