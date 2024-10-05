import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';

const UserOOPviewModal = ({ isOpen, onClose, applicationId }) => {
  const [oopData, setOopData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchOOPData();
    }
  }, [isOpen, applicationId]);

  const fetchOOPData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/user/oop/${applicationId}`, {
        headers: { Authorization: token }
      });
      setOopData(response.data);
    } catch (error) {
      console.error('Error fetching OOP data:', error);
      toast.error('Failed to fetch Order of Payment data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order of Payment</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading Order of Payment data...</p>
        ) : oopData ? (
          <div className="mt-4">
            {/* Render OOP data here */}
            <h3 className="text-lg font-semibold mb-2">Bill No: {oopData.billNo}</h3>
            <p><strong>Applicant:</strong> {oopData.applicantName}</p>
            <p><strong>Address:</strong> {oopData.address}</p>
            <p><strong>Nature of Application:</strong> {oopData.natureOfApplication}</p>
            <p><strong>Date Created:</strong> {new Date(oopData.dateCreated).toLocaleDateString()}</p>
            {/* Add more OOP details here */}
          </div>
        ) : (
          <p>No Order of Payment data found.</p>
        )}
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserOOPviewModal;
