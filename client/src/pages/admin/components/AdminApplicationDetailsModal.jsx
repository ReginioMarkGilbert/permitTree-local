import React, { useState } from 'react';
import { X, FileText, Image as ImageIcon, Printer } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../../components/ui/styles/customScrollBar.css';

const AdminApplicationDetailsModal = ({ isOpen, onClose, application }) => {
    const [previewImage, setPreviewImage] = useState(null);

    if (!isOpen || !application) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const renderFileLinks = (files) => {
        if (!files) return null;

        return Object.entries(files).map(([key, fileArray]) => {
            if (!fileArray || fileArray.length === 0) return null;

            return (
                <div key={key} className="mb-4">
                    <h4 className="font-semibold mb-2">{formatDocumentLabel(key)}:</h4>
                    <div className="flex flex-wrap gap-4">
                        {fileArray.map((file, index) => (
                            <div key={index} className="relative group">
                                {file.contentType.startsWith('image/') ? (
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleFileClick(file, key, index)}
                                    >
                                        <img
                                            src={`http://localhost:3000/api/admin/file/${application._id}/${key}/${index}`}
                                            alt={file.filename}
                                            className="max-w-[100px] max-h-[100px] object-cover rounded shadow-md group-hover:opacity-75 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImageIcon className="text-black" size={24} />
                                        </div>
                                    </div>
                                ) : (
                                    <a
                                        href={`http://localhost:3000/api/admin/file/${application._id}/${key}/${index}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        <FileText className="mr-2" size={20} />
                                        <span className="text-sm">{file.filename}</span>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }).filter(Boolean);
    };

    const handleFileClick = (file, key, index) => {
        const fileUrl = `http://localhost:3000/api/admin/file/${application._id}/${key}/${index}`;
        setPreviewImage(fileUrl);
    };

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

    const handlePrint = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/print/${application._id}`, {
                headers: { Authorization: token },
                responseType: 'blob', // Important for receiving binary data
            });

            // Create a blob from the PDF data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Open the PDF in a new window
            window.open(url);
        } catch (error) {
            console.error('Error printing application:', error);
            toast.error('Failed to print application');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-20 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
                    <h2 className="text-xl font-semibold">Application Details</h2>
                    <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors duration-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <Section title="Application Information">
                        <Field label="Application ID" value={application.customId} />
                        <Field label="Status" value={application.status} />
                        <Field label="Registration Type" value={application.registrationType} />
                        <Field label="Application Type" value={application.applicationType} />
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
                <div className="p-5 bg-gray-50 flex justify-end rounded-b-2xl space-x-4">
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg flex items-center"
                    >
                        <Printer className="mr-2" size={20} />
                        Print
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 shadow-md hover:shadow-lg"
                    >
                        Close
                    </button>
                </div>
                {previewImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
                        <div className="max-w-3xl max-h-[90vh] relative">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    console.error("Error loading image:", e);
                                    e.target.src = "path/to/fallback/image.png"; // Replace with a path to a fallback image
                                }}
                            />
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-[-10px] right-[-47px]  rounded-full p-2 text-white hover:bg-gray-200 hover:text-black"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )}
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

export default AdminApplicationDetailsModal;
