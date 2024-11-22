import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import COVEditForm from '@/pages/user/components/permitForms/COVEditForm';

describe('COVEditForm', () => {
  const mockFormData = {
    name: 'John Doe',
    address: '123 Main St',
    cellphone: '1234567890',
    purpose: 'Test purpose',
    driverName: 'Jane Driver',
    driverLicenseNumber: 'DL123456',
    vehiclePlateNumber: 'ABC123',
    originAddress: 'Origin St',
    destinationAddress: 'Destination Ave',
    files: {
      letterOfIntent: [{ filename: 'letter.pdf' }],
      tallySheet: [{ filename: 'tally.pdf' }],
    },
  };

  const mockHandleInputChange = vi.fn();
  const mockHandleFileChange = vi.fn();
  const mockRemoveFile = vi.fn();

  const renderComponent = (formData = mockFormData) => {
    return render(
      <COVEditForm
        formData={formData}
        handleInputChange={mockHandleInputChange}
        handleFileChange={mockHandleFileChange}
        removeFile={mockRemoveFile}
      />
    );
  };

  it('renders all form fields with correct initial values', () => {
    renderComponent();

    expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Main St');
    expect(screen.getByLabelText('Cellphone')).toHaveValue('1234567890');
    expect(screen.getByLabelText('Purpose')).toHaveValue('Test purpose');
    expect(screen.getByLabelText('Driver Name')).toHaveValue('Jane Driver');
    expect(screen.getByLabelText('Driver License Number')).toHaveValue('DL123456');
    expect(screen.getByLabelText('Vehicle Plate Number')).toHaveValue('ABC123');
    expect(screen.getByLabelText('Origin Address')).toHaveValue('Origin St');
    expect(screen.getByLabelText('Destination Address')).toHaveValue('Destination Ave');
  });

  it('calls handleInputChange when input values change', () => {
    renderComponent();

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    expect(mockHandleInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('displays uploaded files and allows removal', () => {
    renderComponent();

    expect(screen.getByText('letter.pdf')).toBeInTheDocument();
    expect(screen.getByText('tally.pdf')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveFile).toHaveBeenCalledWith('letterOfIntent', 0);
  });

  it('allows file upload', () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/letter of intent/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockHandleFileChange).toHaveBeenCalledWith(expect.any(Object), 'letterOfIntent');
  });

  it('renders all file upload sections', () => {
    renderComponent();

    const fileTypes = [
      'Letter Of Intent',
      'Tally Sheet',
      'Forest Certification',
      'Or Cr',
      'Driver License',
      'Special Power Of Attorney'
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
