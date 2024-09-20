import React from 'react';
import { X, FileText } from 'lucide-react';
import './styles/customScrollBar.css';

const ApplicationDetailsModal = ({ isOpen, onClose, application }) => {
    if (!isOpen || !application) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Updated renderFileLinks function
    const renderFileLinks = (files) => {
        return Object.entries(files).map(([key, fileArray]) => {
            // Only render if the fileArray is not empty
            if (fileArray && fileArray.length > 0) {
                return (
                    <div key={key} className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">{formatDocumentLabel(key)}</h4>
                        {fileArray.map((file, index) => (
                            <div key={`${key}-${index}`} className="flex items-center space-x-2 ml-4">
                                <FileText size={16} className="text-gray-500" />
                                <a
                                    href={`http://localhost:3000/api/file/${application._id}/${key}/${index}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {file.filename || `${key} ${index + 1}`}
                                </a>
                            </div>
                        ))}
                    </div>
                );
            }
            return null; // Return null for empty file arrays
        }).filter(Boolean); // Filter out null values
    };

    // Helper function to format document labels
    const formatDocumentLabel = (key) => {
        const labels = {
            officialReceipt: "Official Receipt",
            deedOfSale: "Deed of Sale",
            specialPowerOfAttorney: "Special Power of Attorney",
            forestTenureAgreement: "Forest Tenure Agreement",
            businessPermit: "Business Permit",
            certificateOfRegistration: "Certificate of Registration",
            woodProcessingPlantPermit: "Wood Processing Plant Permit"
        };
        return labels[key] || key.replace(/([A-Z])/g, ' $1').trim();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
                    <h2 className="text-xl font-semibold">Chainsaw Registration Details</h2>
                    <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors duration-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <Section title="Application Information">
                        <Field label="Application ID" value={application.customId} />
                        <Field label="Status" value={application.status} />
                        <Field label="Registration Type" value={application.registrationType} />
                    </Section>

                    <Section title="Owner Information">
                        <Field label="Owner Name" value={application.ownerName} />
                        <Field label="Address" value={application.address} />
                        <Field label="Phone" value={application.phone} />
                    </Section>

                    <Section title="Chainsaw Details">
                        <Field label="Chainsaw Store" value={application.chainsawStore} />
                        <Field label="Brand" value={application.brand} />
                        <Field label="Model" value={application.model} />
                        <Field label="Serial Number" value={application.serialNumber} />
                        <Field label="Power Output" value={application.powerOutput} />
                        <Field label="Max Length Guidebar" value={application.maxLengthGuidebar} />
                        <Field label="Country of Origin" value={application.countryOfOrigin} />
                        <Field label="Purchase Price" value={`₱${application.purchasePrice.toFixed(2)}`} />
                    </Section>

                    <Section title="Dates">
                        <Field label="Date of Acquisition" value={formatDate(application.dateOfAcquisition)} />
                        <Field label="Date of Submission" value={formatDate(application.dateOfSubmission)} />
                    </Section>

                    {application.files && Object.keys(application.files).length > 0 && (
                        <Section title="Uploaded Documents">
                            <div className="col-span-2">
                                {renderFileLinks(application.files)}
                            </div>
                        </Section>
                    )}
                </div>
                <div className="p-5 bg-gray-50 flex justify-end rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg"
                    >
                        Close
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

function Field({ label, value }) {
    return (
        <div className="bg-white p-3 rounded-lg shadow-sm">
            <span className="text-sm text-gray-500">{label}</span>
            <p className="font-medium text-gray-800">{value}</p>
        </div>
    );
}

export default ApplicationDetailsModal;
