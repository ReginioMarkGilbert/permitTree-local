import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CSAWEditForm from '@/pages/user/components/permitForms/CSAWEditForm';

describe('CSAWEditForm', () => {
   const mockFormData = {
      registrationType: 'New',
      chainsawStore: 'Green Chainsaw Co.',
      ownerName: 'John Doe',
      address: '123 Main St',
      phone: '1234567890',
      brand: 'TestBrand',
      model: 'TestModel',
      serialNumber: 'SN123456',
      dateOfAcquisition: '1634567890000',
      powerOutput: '5',
      maxLengthGuidebar: '20',
      countryOfOrigin: 'USA',
      purchasePrice: '1000',
      isOwner: true,
      isTenureHolder: false,
      isBusinessOwner: true,
      isPTPRHolder: false,
      isWPPHolder: true,
      files: {
         officialReceipt: [{ filename: 'receipt.pdf' }],
      },
   };

   const mockHandleInputChange = vi.fn();
   const mockHandleCheckboxChange = vi.fn();
   const mockHandleFileChange = vi.fn();
   const mockRemoveFile = vi.fn();

   const renderComponent = (formData = mockFormData) => {
      return render(
         <CSAWEditForm
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

      expect(screen.getByLabelText('Registration Type')).toHaveValue('New');
      expect(screen.getByText('Chainsaw Store')).toBeInTheDocument();

      const chainsawStoreButton = screen.getByRole('combobox', { name: /chainsaw store/i });
      expect(chainsawStoreButton).toBeInTheDocument();
      expect(chainsawStoreButton).toHaveTextContent('Green Chainsaw Co.');

      expect(screen.getByLabelText('Owner Name')).toHaveValue('John Doe');
      expect(screen.getByLabelText('Address')).toHaveValue('123 Main St');
      expect(screen.getByLabelText('Phone')).toHaveValue('1234567890');
      expect(screen.getByLabelText('Brand')).toHaveValue('TestBrand');
      expect(screen.getByLabelText('Model')).toHaveValue('TestModel');
      expect(screen.getByLabelText('Serial Number')).toHaveValue('SN123456');
      expect(screen.getByLabelText('Date of Acquisition')).toHaveValue('2021-10-18');
      expect(screen.getByLabelText('Power Output')).toHaveValue('5');
      expect(screen.getByLabelText('Max Length Guidebar')).toHaveValue('20');
      expect(screen.getByLabelText('Country of Origin')).toHaveValue('USA');
      expect(screen.getByLabelText('Purchase Price')).toHaveValue(1000);
      expect(screen.getByLabelText('Is Owner')).toBeChecked();
      expect(screen.getByLabelText('Is Tenure Holder')).not.toBeChecked();
      expect(screen.getByLabelText('Is Business Owner')).toBeChecked();
      expect(screen.getByLabelText('Is PTPR Holder')).not.toBeChecked();
      expect(screen.getByLabelText('Is WPP Holder')).toBeChecked();
   });

   it('calls handleInputChange when input values change', () => {
      renderComponent();

      const ownerNameInput = screen.getByLabelText('Owner Name');
      fireEvent.change(ownerNameInput, { target: { value: 'Jane Smith' } });

      expect(mockHandleInputChange).toHaveBeenCalledWith(expect.any(Object));
   });

   it('calls handleCheckboxChange when checkboxes are toggled', () => {
      renderComponent();

      const isOwnerCheckbox = screen.getByLabelText('Is Owner');
      fireEvent.click(isOwnerCheckbox);

      expect(mockHandleCheckboxChange).toHaveBeenCalledWith('isOwner', false);
   });

   it('displays uploaded files and allows removal', () => {
      renderComponent();

      expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
      const removeButton = screen.getByText('receipt.pdf').closest('div').querySelector('button');
      expect(removeButton).toBeInTheDocument();
      fireEvent.click(removeButton);

      expect(mockRemoveFile).toHaveBeenCalledWith('officialReceipt', 0);
   });

   it('allows file upload', () => {
      renderComponent();

      const fileInput = screen.getByLabelText(/official receipt/i);
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockHandleFileChange).toHaveBeenCalledWith(expect.any(Object), 'officialReceipt');
   });

   it('renders chainsaw store select with correct initial value', () => {
      renderComponent();

      const chainsawStoreSelect = screen.getByLabelText('Chainsaw Store');
      expect(chainsawStoreSelect).toBeInTheDocument();
      expect(chainsawStoreSelect).toHaveTextContent('Green Chainsaw Co.');
   });

   it('shows custom input when "Other" is selected for chainsaw store', async () => {
      renderComponent({
         ...mockFormData,
         chainsawStore: 'other'
      });

      const chainsawStoreSelect = screen.getByLabelText('Chainsaw Store');
      expect(chainsawStoreSelect).toBeInTheDocument();

      const customInput = screen.getByPlaceholderText('Enter Chainsaw Store');
      expect(customInput).toBeInTheDocument();
   });
});
