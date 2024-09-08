import React, { useState } from 'react';
import uploadIcon from '../assets/upload_icn.svg';
import closeIcon from '../assets/close_icn.svg';

const FileUpload = ({ fileNames, setFileNames }) => {
    const handleFileChange = (event) => {
        const newFiles = event.target.files;
        const newFileNamesArray = Array.from(newFiles).map(file => file.name);

        // Check for duplicate file names
        const duplicateFiles = newFileNamesArray.filter(fileName => fileNames.includes(fileName));
        if (duplicateFiles.length > 0) {
            alert(`The following files are duplicates and will not be uploaded: ${duplicateFiles.join(', ')}`);
            return;
        }

        if (fileNames.length + newFileNamesArray.length > 5) {
            alert("You can only upload a maximum of 5 files.");
            return;
        }

        setFileNames(prevFileNames => [...prevFileNames, ...newFileNamesArray]);
    };

    const handleRemoveFile = (fileNameToRemove) => {
        setFileNames(prevFileNames => prevFileNames.filter(fileName => fileName !== fileNameToRemove));
    };

    return (
        <div className="file-upload-container flex flex-col items-start mb-4">
            <label className="label-file mb-2">Upload image/s of requirements</label>
            <input
                type="file"
                id="fileUpload"
                name="fileUpload"
                accept="image/*,.pdf,.docx,.svg"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                className="file-upload-label flex items-center justify-center py-2 px-4 bg-gray-300 border border-black rounded cursor-pointer hover:bg-gray-400"
                type="button"
                onClick={() => document.getElementById('fileUpload').click()}
            >
                <img src={uploadIcon} alt="Upload Icon" className="mr-2 w-4 h-4" />
                Add file
            </button>
            <div id="form_fileNames" className="form_file-names mt-4 w-full">
                {fileNames.map((fileName, index) => (
                    <div key={index} className="form_file-name flex justify-between items-center bg-gray-200 p-2 mb-2 rounded w-full">
                        {fileName}
                        <button
                            type="button"
                            className="formRemove-file-button bg-none border-none cursor-pointer"
                            onClick={() => handleRemoveFile(fileName)}
                        >
                            <img className="remove-file-icon w-4 h-4" src={closeIcon} alt="Close Icon" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUpload;
