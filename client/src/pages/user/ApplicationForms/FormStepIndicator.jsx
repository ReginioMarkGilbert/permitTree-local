import React from 'react';

const FormStepIndicator = ({ currentStep, formType }) => {
   const csawSteps = [
      { number: 1, title: 'Registration Type' },
      { number: 2, title: 'Chainsaw Store' },
      { number: 3, title: 'Requirements' },
      { number: 4, title: 'Documents' },
      { number: 5, title: 'Details' },
      { number: 6, title: 'Review' }
   ];

   const covSteps = [
      { number: 1, title: 'Application Details' },
      { number: 2, title: 'Documents' },
      { number: 3, title: 'Additional Documents' },
      { number: 4, title: 'Review' }
   ];

   const ptprSteps = [
      { number: 1, title: 'Personal Information' },
      { number: 2, title: 'Plantation Details' },
      { number: 3, title: 'Documents' },
      { number: 4, title: 'Review' }
   ];

   const pltcpSteps = [
      { number: 1, title: 'Applicant Details' },
      { number: 2, title: 'Tree Information' },
      { number: 3, title: 'Required Documents' },
      { number: 4, title: 'Review' }
   ];

   const pltpSteps = [
      { number: 1, title: 'Applicant Details' },
      { number: 2, title: 'Tree and Land Details' },
      { number: 3, title: 'Document Requirements' },
      { number: 4, title: 'Review' }
   ];

   const tcebpSteps = [
      { number: 1, title: 'Request Type' },
      { number: 2, title: 'Personal Information' },
      { number: 3, title: 'Required Documents' },
      { number: 4, title: 'Review' }
   ];

   const getSteps = () => {
      switch (formType) {
         case 'COV':
            return covSteps;
         case 'PTPR':
            return ptprSteps;
         case 'PLTCP':
            return pltcpSteps;
         case 'PLTP':
            return pltpSteps;
         case 'TCEBP':
            return tcebpSteps;
         default:
            return csawSteps;
      }
   };

   const steps = getSteps();

   return (
      <div className="w-full py-4 overflow-x-auto">
         <div className="flex justify-between items-center min-w-[600px]">
            {steps.map((step, index) => (
               <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${currentStep >= step.number
                           ? 'bg-green-600 text-white'
                           : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}
                     >
                        {step.number}
                     </div>
                     <span className={`mt-2 text-xs ${currentStep >= step.number
                        ? 'text-green-600 dark:text-green-500 font-medium'
                        : 'text-gray-500'}`}>
                        {step.title}
                     </span>
                  </div>
                  {index < steps.length - 1 && (
                     <div className={`flex-1 h-0.5 mx-2
                        ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                     />
                  )}
               </React.Fragment>
            ))}
         </div>
      </div>
   );
};

export default FormStepIndicator;
