import { React, useState } from 'react';
// import Navbar from '../../components/layout/Navbar';
// import UserSidebar from '../../components/layout/UserSidebar';
import { useNavigate } from 'react-router-dom';
import './styles/PermitsPage.css';

const PermitsPage = () => {


   const [isOpen, setIsOpen] = useState(false);
   const navigate = useNavigate();

   const handleApplyClick = (formType) => {
      navigate(`/apply/${formType}`);
   };

   const permits = [
      { title: 'Chainsaw registration', description: 'Application for Chainsaw registration', formType: 'chainsaw' },

      { title: 'Certificate of Verification', description: 'Application for Certificate of Verification', formType: 'cov' },

      { title: 'Private  Tree Plantation Registration', description: 'Application for Private Tree Plantation Registration', formType: 'ptpr' },

      // { title: 'Public Land Timber Permit', description: 'Application for Public Land Timber Permit', formType: 'tc_public' },
      { title: 'Public Land Tree Cutting Permit', description: 'Application for Public Land Tree Cutting Permit', formType: 'tc_public' },

      // { title: 'Special/Private Land Timber Permit', description: 'Application for Special Private Land Timber Permit', formType: 'tc_private' },
      { title: 'Private Land Timber Permit', description: 'Application for Private Land Timber Permit', formType: 'tc_private' },

      { title: 'National Government Agency Tree Cutting Permit', description: 'Application for Public Tree cutting permit', formType: 'tc_nga' },
   ];

   return (
      <div className="bg-green-50 min-h-screen flex flex-col pt-14">
         <main className="container mx-auto py-8 flex-grow mt-4">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Permit Applications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mt-20">
               {permits.map((permit, index) => (
                  <div key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 rounded-lg min-h-[200px] w-full">
                     <div className="flex items-center text-green-800 mb-4">
                        <span className="ml-2 text-l font-bold">{permit.title}</span>
                     </div>
                     <p className="mb-4">{permit.description}</p>
                     <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded" onClick={() => handleApplyClick(permit.formType)}>APPLY</button>
                  </div>
               ))}
            </div>
         </main>
         <footer className="bg-green-800 text-white py-6 mt-12">
            <div className="container mx-auto text-center">
               <p>&copy; 2023 PermitTree - DENR-PENRO. All rights reserved.</p>
            </div>
         </footer>
      </div>
   );
};

export default PermitsPage;
