import React, { useRef } from 'react';
import { Button } from './button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const FileUploader = ({ accept, maxSize, onFileSelect }) => {
   const fileInputRef = useRef(null);

   const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Check file size (maxSize is in bytes)
      if (file.size > maxSize) {
         toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
         return;
      }

      // Check file type
      if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
         toast.error('Invalid file type');
         return;
      }

      onFileSelect(file);
   };

   const handleClick = () => {
      fileInputRef.current?.click();
   };

   return (
      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg">
         <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
         />
         <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="w-full"
         >
            <Upload className="mr-2 h-4 w-4" />
            Choose File
         </Button>
      </div>
   );
};

export default FileUploader;
