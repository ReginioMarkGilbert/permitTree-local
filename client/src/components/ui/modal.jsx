import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Modal = ({ isOpen, title, message, onClose, onHome, onApplications }) => {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>{title}</DialogTitle>
               <DialogDescription>{message}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4 mt-6">
               <Button variant="outline" onClick={onHome}>
                  Go to Home
               </Button>
               <Button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  onClick={onApplications}
               >
                  Go to Applications page
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default Modal;
