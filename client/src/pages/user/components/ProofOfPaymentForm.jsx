import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ProofOfPaymentForm = ({ onSubmit }) => {
    const [orNumber, setOrNumber] = useState('');
    const [file, setFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (orNumber && file) {
            onSubmit(orNumber, file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="orNumber">OR Number</Label>
                <Input
                    id="orNumber"
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
