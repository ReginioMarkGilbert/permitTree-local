import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SA_UserEditDetailsModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-20 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
          <h2 className="text-xl font-semibold">Edit User Details</h2>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors duration-200">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <Section title="User Information">
            <Field label="Username" name="username" value={formData.username} onChange={handleChange} />
            <Field label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <Field label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            <Field label="Email" name="email" value={formData.email} onChange={handleChange} />
            <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <Field label="Company" name="company" value={formData.company} onChange={handleChange} />
            <Field label="Address" name="address" value={formData.address} onChange={handleChange} />
          </Section>
        </form>
        <div className="p-5 bg-gray-50 flex justify-end rounded-b-2xl sticky bottom-0">
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 px-4 pt-4">{title}</h3>
      <div className="bg-gray-50 p-4 grid grid-cols-1 gap-4 rounded-b-xl">
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <label className="text-sm text-gray-500">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
      />
    </div>
  );
}

export default SA_UserEditDetailsModal;
