import React from 'react';
import { render, screen } from '@testing-library/react';
import PermitCard from './PermitCard';

test('renders PermitCard with title and description', () => {
    render(<PermitCard title="Test Title" description="Test Description" onApplyClick={() => {}} />);
    expect(screen.getByText(/Test Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
});
