import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import PTPREditForm from '../../../../../pages/user/components/permitForms/PTPREditForm';

describe('PTPREditForm', () => {
  const mockFormData = {
    ownerName: 'John Doe',
    address: '123 Main St',
    contactNumber: '1234567890',
    lotArea: '5.5',
    treeSpecies: ['Pine', 'Oak'],
    totalTrees: '100',
    treeSpacing: '2x2 meters',
    yearPlanted: '2020',
    files: {
      letterRequest: [{ filename: 'letter.pdf' }],
      titleOrTaxDeclaration: [{ filename: 'title.pdf' }],
    },
  };

  const mockHandleInputChange = vi.fn();
  const mockHandleFileChange = vi.fn();
  const mockRemoveFile = vi.fn();

  const renderComponent = (formData = mockFormData) => {
    return render(
      <PTPREditForm
        formData={formData}
        handleInputChange={mockHandleInputChange}
        handleFileChange={mockHandleFileChange}
        removeFile={mockRemoveFile}
      />
    );
  };

  it('renders all form fields with correct initial values', () => {
    renderComponent();

    expect(screen.getByLabelText('Name of Lot Owner')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Main St');
    expect(screen.getByLabelText('Contact Number')).toHaveValue('1234567890');
    expect(screen.getByLabelText('Lot area devoted to plantation (in hectares)')).toHaveValue(5.5);
    expect(screen.getByLabelText('Tree Species Planted (comma-separated)')).toHaveValue('Pine, Oak');
    expect(screen.getByLabelText('Total No. of Trees Planted')).toHaveValue(100);
    expect(screen.getByLabelText('Spacing of trees')).toHaveValue('2x2 meters');
    expect(screen.getByLabelText('Year Planted')).toHaveValue(2020);
  });

  it('calls handleInputChange when input values change', () => {
    renderComponent();

    const ownerNameInput = screen.getByLabelText('Name of Lot Owner');
    fireEvent.change(ownerNameInput, { target: { value: 'Jane Smith' } });

    expect(mockHandleInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('displays uploaded files and allows removal', () => {
    renderComponent();

    expect(screen.getByText('letter.pdf')).toBeInTheDocument();
    expect(screen.getByText('title.pdf')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveFile).toHaveBeenCalledWith('letterRequest', 0);
  });

  it('allows file upload', () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/letter request/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockHandleFileChange).toHaveBeenCalledWith(expect.any(Object), 'letterRequest');
  });

  it('renders all file upload sections', () => {
    renderComponent();

    const fileTypes = [
      'Letter Request',
      'Title or Tax Declaration',
      'DAR Certification',
      'Special Power of Attorney'
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

  it('handles tree species input correctly', () => {
    renderComponent();

    const treeSpeciesInput = screen.getByLabelText('Tree Species Planted (comma-separated)');
    fireEvent.change(treeSpeciesInput, { target: { value: 'Maple, Birch, Cedar' } });

    expect(mockHandleInputChange).toHaveBeenCalledWith({
      target: {
        name: 'treeSpecies',
        value: ['Maple', 'Birch', 'Cedar']
      }
    });
  });
});
