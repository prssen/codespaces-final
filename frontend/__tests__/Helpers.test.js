import { describe, test, expect } from 'vitest';
import { getBreadcrumbs } from '@/lib/utils/utils';

describe('getBreadcrumbs', () => {
    test('Returns breadcrumbs for list view correctly', () => {
        const path = '/accounting/projects/list';
        const expectedOutput = [
            { label: 'Home', url: '/accounting' },
            { label: 'Projects', url: '/accounting/projects/list' },
            { label: 'List', url: '/accounting/projects/list' }
        ];
    
        const breadcrumbs = getBreadcrumbs(path);
    
        expect(breadcrumbs).toEqual(expectedOutput);
    })
    
    
    test('Returns breadcrumbs for non-list views correctly', () => {
        const path = '/accounting/expenses/create';
        const expectedOutput = [
            { label: 'Home', url: '/accounting' },
            { label: 'Expenses', url: '/accounting/expenses' },
            { label: 'Create', url: '/accounting/expenses/create' }
        ];
    
        const breadcrumbs = getBreadcrumbs(path);
    
        expect(breadcrumbs).toEqual(expectedOutput);
    })
});
