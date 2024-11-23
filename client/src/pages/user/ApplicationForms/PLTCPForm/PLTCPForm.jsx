import React, { useState } from 'react';
import { Card, CardFooter, Button } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const PLTCPForm = () => {
   const [currentStep, setCurrentStep] = useState(0);
   const [steps, setSteps] = useState([]);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSavingDraft, setIsSavingDraft] = useState(false);
   const handlePrevStep = () => {
      setCurrentStep(currentStep - 1);
   };

   const handleNextStep = () => {
      setCurrentStep(currentStep + 1);
