import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/PTPRForm.css';

const PTPR = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    letterOfRequest: null,
    titleOrTaxDeclaration: null,
    darCertification: null,
    specialPowerOfAttorney: null,
    // ... other fields ...
  });

  const steps = [
    { title: "Owner Information", fields: ["name", "address", "contactNumber", "email"] },
    { title: "Plantation Location", fields: ["oct", "tct", "taxDeclaration", "barangay", "municipality", "province", "totalLotArea", "areaDevotedToPlantation"] },
    { title: "Tree Details", fields: ["treeSpecies", "numberOfTrees", "treeSpacing", "yearPlanted"] },
    { title: "Requirements Upload", fields: ["letterOfRequest", "titleOrTaxDeclaration", "darCertification", "specialPowerOfAttorney"] },
    { title: "Review and Submit", fields: [] }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    alert('Draft saved successfully!');
  };  

  const handleSubmit = (event) => {
    event.preventDefault();
    // Perform form submission logic here
    alert('Form submitted successfully!');
    // Or navigate to a success page
    // navigate('/success');
  };

  const handleInputChange = (field, value) => {
    if (value instanceof File) {
      // Handle file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prevData => ({
          ...prevData,
          [field]: {
            name: value.name,
            type: value.type,
            size: value.size,
            data: e.target.result
          }
        }));
      };
      reader.readAsDataURL(value);
    } else {
      // Handle regular input
      setFormData(prevData => ({
        ...prevData,
        [field]: value
      }));
    }
  };

  const renderFormFields = (fields) => {
    return fields.map(field => {
      const isFileUpload = field === 'letterOfRequest' || field === 'titleOrTaxDeclaration' || field === 'darCertification' || field === 'specialPowerOfAttorney';
      const isRequired = field !== 'darCertification' && field !== 'specialPowerOfAttorney';

      return (
        <div key={field} className="ptpr-section">
          <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} {isRequired && <span className="ptpr-required">*</span>}</label>
          {isFileUpload ? (
            <div className="ptpr-fileUpload">
              <input 
                type="file"
                id={field}
                className="ptpr-fileInput"
                required={isRequired}
                onChange={(e) => handleInputChange(field, e.target.files[0])}
              />
              <label htmlFor={field} className="ptpr-fileLabel">Choose a file</label>
              {formData[field] && (
                <div className="ptpr-filePreview">
                  <p>File: {formData[field].name}</p>
                  <p>Size: {(formData[field].size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>
          ) : (
            <input 
              type={field.includes('email') ? 'email' : 'text'}
              className="ptpr-inputField"
              required={isRequired}
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
            />
          )}
        </div>
      );
    });
  };

  const renderReviewSection = () => {
    return steps.slice(0, -1).map((step, index) => (
      <div key={index} className="ptpr-reviewSection">
        <h4>{step.title}</h4>
        {step.fields.map(field => {
          const value = formData[field];
          let displayValue;
          if (value && value.name) {
            displayValue = `File uploaded: ${value.name} (${(value.size / 1024).toFixed(2)} KB)`;
          } else if (value) {
            displayValue = value;
          } else {
            displayValue = 'Not provided';
          }
          return (
            <p key={field}>
              <strong>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {displayValue}
            </p>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="ptpr-container">
      <div className="ptpr-background-animation"></div>
      <div className="ptpr-formCard">
        <h2 className="ptpr-formTitle">Private Tree Plantation Registration</h2>
        
        <div className="ptpr-stepIndicator">
          {steps.map((step, index) => (
            <div key={index} className={`ptpr-step ${currentStep === index + 1 ? 'active' : ''}`}>
              <div className="ptpr-stepNumber">{index + 1}</div>
              <div className="ptpr-stepTitle">{step.title}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <h3 className="ptpr-formSubtitle">{steps[currentStep - 1].title}</h3>
          <div className="ptpr-formContent">
            {currentStep < steps.length ? (
              <div className="ptpr-formGrid">
                {renderFormFields(steps[currentStep - 1].fields)}
              </div>
            ) : (
              <div className="ptpr-reviewContainer">
                {renderReviewSection()}
              </div>
            )}
          </div>

          <div className="ptpr-buttonContainer">
            {currentStep > 1 && (
              <button type="button" className="ptpr-button ptpr-backButton" onClick={handlePrevious}>
                <span className="ptpr-buttonIcon">←</span> Previous
              </button>
            )}
            {currentStep < steps.length - 1 && (
              <button type="button" className="ptpr-button ptpr-nextButton" onClick={handleNext}>
                Next <span className="ptpr-buttonIcon">→</span>
              </button>
            )}
            {currentStep === steps.length - 1 && (
              <button type="button" className="ptpr-button ptpr-nextButton" onClick={handleNext}>
                Review <span className="ptpr-buttonIcon">✓</span>
              </button>
            )}
            {currentStep === steps.length && (
              <>
                <button type="button" className="ptpr-button ptpr-saveDraftButton" onClick={handleSaveDraft}>
                  Save as Draft <span className="ptpr-buttonIcon">💾</span>
                </button>
                <button type="submit" className="ptpr-button ptpr-submitButton">
                  Submit Application <span className="ptpr-buttonIcon">📤</span>
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PTPR;
