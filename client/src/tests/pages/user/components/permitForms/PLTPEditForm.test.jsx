import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PLTPEditForm from '@/pages/user/components/permitForms/PLTPEditForm';

describe('PLTPEditForm', () => {
  const mockFormData = {
    name: 'John Doe',
    address: '123 Main St',
    contactNumber: '1234567890',
    plantedTrees: true,
    naturallyGrown: false,
    standing: true,
    blownDown: false,
    withinPrivateLand: true,
    withinTenuredForestLand: false,
    posingDanger: false,
    forPersonalUse: true,
    purpose: 'Test purpose',
    files: {
      letterOfIntent: [{ filename: 'letter.pdf' }],
    },
  };

  const mockHandleInputChange = vi.fn();
  const mockHandleCheckboxChange = vi.fn();
  const mockHandleFileChange = vi.fn();
  const mockRemoveFile = vi.fn();

  const renderComponent = (formData = mockFormData) => {
    return render(
      <PLTPEditForm
        formData={formData}
        handleInputChange={mockHandleInputChange}
        handleCheckboxChange={mockHandleCheckboxChange}
        handleFileChange={mockHandleFileChange}
        removeFile={mockRemoveFile}
      />
    );
  };

  it('renders all form fields with correct initial values', () => {
    renderComponent();

    expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Main St');
    expect(screen.getByLabelText('Contact Number')).toHaveValue('1234567890');
    expect(screen.getByLabelText('Planted Trees')).toBeChecked();
    expect(screen.getByLabelText('Naturally Grown')).not.toBeChecked();
    expect(screen.getByLabelText('Standing')).toBeChecked();
    expect(screen.getByLabelText('Blown Down')).not.toBeChecked();
    expect(screen.getByLabelText('Within Private Land')).toBeChecked();
    expect(screen.getByLabelText('Within Tenured Forest Land')).not.toBeChecked();
    expect(screen.getByLabelText('Posing Danger')).not.toBeChecked();
    expect(screen.getByLabelText('For Personal Use')).toBeChecked();
    expect(screen.getByLabelText('Purpose')).toHaveValue('Test purpose');
  });

  it('calls handleInputChange when input values change', () => {
    renderComponent();

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    expect(mockHandleInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('calls handleCheckboxChange when checkboxes are toggled', () => {
    renderComponent();

    const plantedTreesCheckbox = screen.getByLabelText('Planted Trees');
    fireEvent.click(plantedTreesCheckbox);

    expect(mockHandleCheckboxChange).toHaveBeenCalledWith('plantedTrees');
  });

  it('displays uploaded files and allows removal', () => {
    renderComponent();

    expect(screen.getByText('letter.pdf')).toBeInTheDocument();

    const removeButton = screen.getByText('letter.pdf').closest('div').querySelector('button');
    expect(removeButton).toBeInTheDocument();
    fireEvent.click(removeButton);

    expect(mockRemoveFile).toHaveBeenCalledWith('letterOfIntent', 0);
  });

  it('allows file upload', () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/letter of intent/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockHandleFileChange).toHaveBeenCalledWith(expect.any(Object), 'letterOfIntent');
  });
});
