import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Delete Draft Application</DialogTitle>
               <DialogDescription>
                  Are you sure you want to delete this draft application? This action cannot be undone.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button variant="destructive" onClick={onConfirm}>Delete</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export const UnsubmitConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Unsubmit Application</DialogTitle>
               <DialogDescription>
                  Are you sure you want to unsubmit this application? This will allow you to make changes.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button variant="destructive" onClick={onConfirm}>Unsubmit</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export const SubmitConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Submit Application</DialogTitle>
               <DialogDescription>
                  Are you sure you want to submit this application? You won't be able to make changes after submission.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">Submit</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export const ResubmitConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Resubmit Application</DialogTitle>
               <DialogDescription>
                  Are you sure you want to resubmit this application? Make sure you have addressed all the remarks.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">Resubmit</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};
