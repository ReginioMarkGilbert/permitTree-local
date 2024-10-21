import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import PLTPEditForm from '../../../../../pages/user/components/permitForms/PLTPEditForm';

describe('PLTPEditForm', () => {
  const mockFormData = {
    name: 'John Doe',
    address: '123 Main St',
    contactNumber: '1234567890',
    treeType: ['Planted'],
    treeStatus: ['Standing'],
    landType: ['Private Land'],
    posingDanger: false,
    forPersonalUse: true,
    purpose: 'Test purpose',
    files: {
      applicationLetter: [{ filename: 'application.pdf' }],
      lguEndorsement: [{ filename: 'endorsement.pdf' }],
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

    const posingDangerCheckbox = screen.getByLabelText('Posing Danger');
    fireEvent.click(posingDangerCheckbox);

    expect(mockHandleCheckboxChange).toHaveBeenCalledWith('posingDanger', true);
  });

  it('displays uploaded files and allows removal', () => {
    renderComponent();

    expect(screen.getByText('application.pdf')).toBeInTheDocument();
    expect(screen.getByText('endorsement.pdf')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveFile).toHaveBeenCalledWith('applicationLetter', 0);
  });

  it('allows file upload', () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/application letter/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockHandleFileChange).toHaveBeenCalledWith(expect.any(Object), 'applicationLetter');
  });

  it('renders all file upload sections', () => {
    renderComponent();

    const fileTypes = [
      'Application Letter',
      'LGU Endorsement',
      'Homeowner\'s Resolution',
      'PTA Resolution'
    ];

    fileTypes.forEach(fileType => {
      const labels = screen.getAllByText(fileType, { exact: false });
      expect(labels.length).toBeGreaterThan(0);
      expect(labels[0]).toBeInTheDocument();
    });
  });

  it('shows "No uploaded file" when no file is uploaded', () => {
    const formDataWithNoFiles = {
      ...mockFormData,
      files: {}
    };
    renderComponent(formDataWithNoFiles);

    const noFileMessages = screen.getAllByText('No uploaded file');
    expect(noFileMessages.length).toBeGreaterThan(0);
  });
});
