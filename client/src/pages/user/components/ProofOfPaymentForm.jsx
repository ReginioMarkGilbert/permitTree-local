import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProofOfPaymentForm = ({ onSubmit }) => {
    const [orNumber, setOrNumber] = useState('');
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!orNumber || !file) {
            alert('Please fill in all fields');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64File = event.target.result.split(',')[1]; // Get the base64 part
            const payload = {
                orNumber,
                proofOfPayment: {
                    filename: file.name,
                    contentType: file.type,
                    data: base64File
                }
            };
            onSubmit(payload);
        };
        reader.readAsDataURL(file);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="orNumber">OR Number</Label>
                <Input
                    id="orNumber"
                    type="text"
                    value={orNumber}
                    onChange={(e) => setOrNumber(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="proofOfPayment">Proof of Payment</Label>
                <Input
                    id="proofOfPayment"
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                />
            </div>
            <Button type="submit">Submit Proof of Payment</Button>
        </form>
    );
};

export default ProofOfPaymentForm;
