import React, { useState } from 'react';
import './styles/COVForm.css';

const COVForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', address: '', cellphone: '', purpose: '',
        driverName: '', driverLicenseNumber: '', vehiclePlateNumber: '',
        originAddress: '', destinationAddress: '',
        letterOfIntent: null, tallySheet: null, forestCertification: null,
        orCr: null, driverLicense: null, specialPowerOfAttorney: null,
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const formSections = [
        { title: 'Applicant Details', fields: ['name', 'address', 'cellphone', 'purpose'] },
        { title: 'Driver Information', fields: ['driverName', 'driverLicenseNumber', 'vehiclePlateNumber'] },
        { title: 'Transport Details', fields: ['originAddress', 'destinationAddress'] },
        { title: 'Required Documents', files: ['letterOfIntent', 'tallySheet', 'forestCertification'] },
        { title: 'Additional Documents', files: ['orCr', 'driverLicense', 'specialPowerOfAttorney'] },
    ];

    const renderFormGroup = (name, label, type = 'text') => (
        <div className="form-group" key={name}>
            <input type={type} id={name} name={name} value={formData[name]} onChange={handleChange} required placeholder=" " />
            <label htmlFor={name}>{label}</label>
        </div>
    );

    const renderFileUpload = (name, label, required = true) => (
        <div className="file-upload-group" key={name}>
            <input type="file" id={name} name={name} onChange={handleFileChange} required={required} />
            <label htmlFor={name}>{label}</label>
        </div>
    );

    const renderSection = (section) => (
        <div className="form-section" key={section.title}>
            <h4 className='form-title'>{section.title}</h4>
            {section.fields?.map(field => renderFormGroup(field, field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())))}
            {section.files?.map(file => renderFileUpload(file, file.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), section.title === 'Required Documents'))}
        </div>
    );

    const renderReview = () => (
        <div className="review-section">
            {Object.entries(formData).map(([key, value]) => (
                <p key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value instanceof File ? '✓' : value || '✗'}</p>
            ))}
        </div>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Form submitted successfully!');
    };

    const handleSaveDraft = () => {
        console.log('Draft saved:', formData);
        alert('Application saved as draft!');
    };

    return (
        <div className="cov-container">
            <h3 className="cov-title">Certificate of Verification</h3>
            <div className="progress-bar">
                {[1, 2, 3, 4, 5, 6].map(num => (
                    <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>{num}</div>
                ))}
            </div>
            <form id="covForm" onSubmit={handleSubmit}>
                {step <= 5 ? renderSection(formSections[step - 1]) : renderReview()}
                <div className="form-navigation">
                    {step > 1 && <button type="button" className="nav-button prev-button" onClick={prevStep}>Previous</button>}
                    {step < 6 && <button type="button" className="nav-button next-button" onClick={nextStep}>Next</button>}
                    {step === 6 && (
                        <>
                            <button type="button" className="nav-button draft-button" onClick={handleSaveDraft}>Save as Draft</button>
                            <button type="submit" className="nav-button submit-button">Submit</button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default COVForm;