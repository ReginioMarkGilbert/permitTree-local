import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ErrorPage = ({ status = 404 }) => {
   const location = useLocation();
   const navigate = useNavigate();

   const errorMessages = {
      404: 'Page Not Found',
      403: 'Access Forbidden',
      500: 'Internal Server Error',
   };

   const message = errorMessages[status] || 'An error occurred';

   return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100">
         <h1 className="text-6xl font-bold mb-4">{status}</h1>
         <h2 className="text-4xl font-semibold mb-4">{message}</h2>
         <p className="text-lg mb-2">
            The page you're looking for doesn't exist or you don't have permission to access it.
         </p>
         <p className="text-sm text-gray-600 mb-4">
            Requested URL: {location.pathname}
         </p>
         <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
         >
            Go Back
         </button>
      </div>
   );
};

export default ErrorPage;
