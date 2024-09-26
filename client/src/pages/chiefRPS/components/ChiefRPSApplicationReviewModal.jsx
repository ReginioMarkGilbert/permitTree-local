import React, { useState } from 'react';
import { X, FileText, Image as ImageIcon, Printer, Plus, Minus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../../components/ui/styles/customScrollBar.css';

const ChiefRPSApplicationReviewModal = ({ isOpen, onClose, application, onUpdateStatus }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [center, setCenter] = useState({ x: 50, y: 50 }); // Center of the image
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [initialZoom, setInitialZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isReturning, setIsReturning] = useState(false);
    const [remarks, setRemarks] = useState('');

    if (!isOpen || !application) return null;

    const formatDate = (dateString) => {
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'Asia/Manila'
        };
        return new Date(dateString).toLocaleString('en-US', options);
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
        const img = new Image();
        img.onload = () => {
            const containerWidth = window.innerWidth * 0.9;
            const containerHeight = window.innerHeight * 0.9;
            const initialZoom = calculateInitialZoom(img.width, img.height, containerWidth, containerHeight);
            setInitialZoom(initialZoom);
            setZoomLevel(initialZoom);
        };
        img.src = fileUrl;
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

    const handleAccept = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/api/admin/update-status/${application._id}`,
                { status: 'Accepted' },
                { headers: { Authorization: token } }
            );
            toast.success('Application status updated to Accepted');
            onClose(); // Close the modal after accepting
        } catch (error) {
            console.error('Error updating application status:', error);
            toast.error('Failed to update application status');
        }
    };

    const handleReturn = async () => {
        if (!remarks.trim()) {
            toast.error('Please provide remarks for returning the application.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/admin/return-application/${application._id}`,
                { returnRemarks: remarks },
                { headers: { Authorization: token } }
            );

            if (response.data.success) {
                toast.success('Application returned successfully');
                onUpdateStatus(application._id, 'Returned');
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to return application');
            }
        } catch (error) {
            console.error('Error returning application:', error);
            toast.error('An error occurred while returning the application');
        }
    };

    const handleZoom = (newZoom) => {
        setZoomLevel(prevZoom => {
            const zoomChange = newZoom / prevZoom;
            const newCenter = {
                x: center.x + (50 - center.x) * (1 - 1 / zoomChange),
                y: center.y + (50 - center.y) * (1 - 1 / zoomChange)
            };
            setCenter(newCenter);
            return newZoom;
        });
    };

    const handleZoomIn = () => handleZoom(Math.min(zoomLevel + 0.1, 3));
    const handleZoomOut = () => handleZoom(Math.max(zoomLevel - 0.1, 0.5));

    const calculateInitialZoom = (imgWidth, imgHeight, containerWidth, containerHeight) => {
        const widthRatio = containerWidth / imgWidth;
        const heightRatio = containerHeight / imgHeight;
        return Math.min(1, widthRatio, heightRatio);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setCenter(prevCenter => ({
                x: prevCenter.x - (dx / zoomLevel),
                y: prevCenter.y - (dy / zoomLevel)
            }));
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleBackgroundClick = (e) => {
        // Close the preview if clicking outside the image
        if (e.target === e.currentTarget) {
            setPreviewImage(null);
            setZoomLevel(initialZoom);
            setCenter({ x: 50, y: 50 });
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
                    {!isReturning && (
                        <button
                            onClick={() => setIsReturning(true)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                            Return
                        </button>
                    )}
                    {isReturning && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="remarks" className="block mb-2">Remarks:</label>
                                <textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows="4"
                                ></textarea>
                            </div>
                            <button
                                onClick={handleReturn}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Confirm Return
                            </button>
                            <button
                                onClick={() => setIsReturning(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Accept
                    </button>
                </div>
                {previewImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
                        onClick={handleBackgroundClick}
                    >
                        <div className="w-[60vw] h-[95vh] relative flex items-center justify-center overflow-hidden">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-none max-h-none"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: `${center.x}% ${center.y}%`,
                                    transition: 'transform 0.2s ease-out',
                                }}
                                onMouseMove={handleMouseMove}
                                onError={(e) => {
                                    console.error("Error loading image:", e);
                                    e.target.src = "path/to/fallback/image.png";
                                }}
                            />
                            <button
                                onClick={() => {
                                    setPreviewImage(null);
                                    setZoomLevel(initialZoom);
                                    setCenter({ x: 50, y: 50 });
                                }}
                                className="absolute top-[10px] right-[12rem] text-white rounded-full p-2 hover:bg-gray-200 hover:text-black"
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

export default ChiefRPSApplicationReviewModal;
