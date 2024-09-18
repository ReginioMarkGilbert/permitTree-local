import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './styles/customScrollBar.css';

const EditApplicationModal = ({ isOpen, onClose, application, onUpdate }) => {
    const [formData, setFormData] = useState({});

    const chainsawStores = [
        { value: "Green Chainsaw Co.", label: "Green Chainsaw Co." },
        { value: "Forest Tools Inc.", label: "Forest Tools Inc." },
        { value: "EcoSaw Supplies", label: "EcoSaw Supplies" },
        { value: "Timber Tech Equipment", label: "Timber Tech Equipment" },
        { value: "Woodland Machinery", label: "Woodland Machinery" }
    ];

    const registrationTypes = [
        { value: "New", label: "New Registration" },
        { value: "Renewal", label: "Renewal" }
    ];

    useEffect(() => {
        if (application) {
            setFormData({
                customId: application.customId,
                registrationType: application.registrationType,
                chainsawStore: application.chainsawStore,
                ownerName: application.ownerName,
                address: application.address,
                phone: application.phone,
                brand: application.brand,
                model: application.model,
                serialNumber: application.serialNumber,
                dateOfAcquisition: application.dateOfAcquisition.split('T')[0],
                powerOutput: application.powerOutput,
                maxLengthGuidebar: application.maxLengthGuidebar,
                countryOfOrigin: application.countryOfOrigin,
                purchasePrice: application.purchasePrice,
            });
        }
    }, [application]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3000/api/csaw_updateApplication/${application._id}`, formData, {
                headers: { Authorization: token }
            });
            onUpdate(response.data);
            onClose();
            toast.success('Application updated successfully');
        } catch (error) {
            console.error('Error updating application:', error);
            toast.error('Failed to update application');
        }
    };

    if (!isOpen || !application) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
                    <h2 className="text-xl font-semibold">Edit Chainsaw Registration</h2>
                    <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors duration-200">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <Section title="Application Information">
                        <Field label="Application ID" value={application.customId} />
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
                            <select
                                name="registrationType"
                                value={formData.registrationType}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            >
                                <option value="" disabled>Select registration type</option>
                                {registrationTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chainsaw Store</label>
                            <select
                                name="chainsawStore"
                                value={formData.chainsawStore}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            >
                                <option value="" disabled>Select a store</option>
                                {chainsawStores.map((store) => (
                                    <option key={store.value} value={store.value}>
                                        {store.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Section>

                    <Section title="Owner Information">
                        <Field label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleInputChange} />
                        <Field label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                        <Field label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </Section>

                    <Section title="Chainsaw Details">
                        <Field label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} />
                        <Field label="Model" name="model" value={formData.model} onChange={handleInputChange} />
                        <Field label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} />
                        <Field label="Power Output" name="powerOutput" value={formData.powerOutput} onChange={handleInputChange} />
                        <Field label="Max Length Guidebar" name="maxLengthGuidebar" value={formData.maxLengthGuidebar} onChange={handleInputChange} />
                        <Field label="Country of Origin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleInputChange} />
                        <Field label="Purchase Price" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} type="number" />
                    </Section>

                    <Section title="Dates">
                        <Field label="Date of Acquisition" name="dateOfAcquisition" value={formData.dateOfAcquisition} onChange={handleInputChange} type="date" />
                    </Section>
                </form>
                <div className="p-5 bg-gray-50 flex justify-end rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg"
                    >
                        Save Changes
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
            <div className="bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-b-xl">
                {children}
            </div>
        </div>
    );
}

function Field({ label, name, value, onChange, type = "text" }) {
    return (
        <div className="bg-white p-3 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
        </div>
    );
}

export default EditApplicationModal;
