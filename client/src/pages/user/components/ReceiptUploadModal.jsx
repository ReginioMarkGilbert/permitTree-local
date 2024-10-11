import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from 'lucide-react';

const ReceiptUploadModal = ({ isOpen, onClose, onUploadComplete }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            // Here you would typically upload the file to your server
            // For now, we'll just simulate the upload
            setTimeout(() => {
                onUploadComplete(file);
                onClose();
            }, 1000);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Payment Receipt</DialogTitle>
                    <DialogDescription>
                        Upload the payment receipt for this application.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="receipt">Upload Receipt</Label>
                            <Input
                                id="receipt"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                required
                            />
                        </div>
                        {file && (
                            <div>
                                <p>Selected file: {file.name}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={!file}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Receipt
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReceiptUploadModal;
