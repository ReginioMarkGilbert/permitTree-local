import React from 'react';

const PaymentStepIndicator = ({ currentStep }) => {
   const steps = [
      { number: 1, title: 'Payment Information' },
      { number: 2, title: 'Billing Details' },
      { number: 3, title: 'Summary' },
      { number: 4, title: 'Payment' }
   ];

   return (
      <div className="w-full py-4">
         <div className="flex justify-between items-center">
            {steps.map((step, index) => (
               <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${currentStep >= step.number
                           ? 'bg-green-600 text-white'
                           : 'bg-gray-200 text-gray-500'}`}
                     >
                        {step.number}
                     </div>
                     <span className={`mt-2 text-xs ${currentStep >= step.number
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500'}`}>
                        {step.title}
                     </span>
                  </div>
                  {index < steps.length - 1 && (
                     <div className={`flex-1 h-0.5 mx-4
                        ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'}`}
                     />
                  )}
               </React.Fragment>
            ))}
         </div>
      </div>
   );
};

export default PaymentStepIndicator;
