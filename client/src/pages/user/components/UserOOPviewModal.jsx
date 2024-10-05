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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'react-toastify';
import { Loader2, FileText, Calendar, User, MapPin, Tag, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800">Order of Payment</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : oopData ? (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billNo">Bill No.</Label>
                <Input id="billNo" value={oopData.billNo} readOnly />
              </div>
              <div>
                <Label>Date</Label>
                <Input value={format(new Date(oopData.dateCreated), "MMM d, yyyy")} readOnly />
              </div>
            </div>
            <div>
              <Label htmlFor="applicantName">Name/Payee:</Label>
              <Input id="applicantName" value={oopData.applicantName} readOnly />
            </div>
            <div>
              <Label htmlFor="address">Address:</Label>
              <Input id="address" value={oopData.address} readOnly />
            </div>
            <div>
              <Label htmlFor="natureOfApplication">Nature of Application/Permit/Documents being secured:</Label>
              <Input id="natureOfApplication" value={oopData.natureOfApplication} readOnly />
            </div>
            <div>
              <Label>Payment Details</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Legal Basis (DAO/SEC)</TableHead>
                    <TableHead>Description and Computation of Fees and Charges Assessed</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oopData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.legalBasis}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>₱ {item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end items-center">
              <Label className="mr-2">Total Amount:</Label>
              <Input
                className="w-32"
                value={`₱ ${oopData.totalAmount.toFixed(2)}`}
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="text-center">
                <Label>SVEMS/Chief, RPS</Label>
                <Input className="text-center font-semibold mt-2" value={oopData.signatures.chiefRPS ? "Signed" : "Pending"} readOnly />
              </div>
              <div className="text-center">
                <Label>Chief, Technical Services Division</Label>
                <Input className="text-center font-semibold mt-2" value={oopData.signatures.technicalServices ? "Signed" : "Pending"} readOnly />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-yellow-800">Status:</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800">
                  {oopData.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No Order of Payment data found.</p>
        )}
        <DialogFooter>
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserOOPviewModal;
