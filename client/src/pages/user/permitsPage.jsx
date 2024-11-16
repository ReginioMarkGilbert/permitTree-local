import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTree, FaFileAlt, FaCertificate, FaBuilding, FaUserTie } from 'react-icons/fa';
import { GiChainsaw } from 'react-icons/gi';
import './styles/PermitsPage.css';

const PermitsPage = () => {
   const navigate = useNavigate();

   const handleApplyClick = (formType) => {
      navigate(`/apply/${formType}`);
   };

   const permits = [
      {
         title: 'Chainsaw Registration',
         description: 'Register your chainsaw equipment with proper documentation and compliance.',
         formType: 'chainsaw',
         icon: GiChainsaw,
         color: 'from-orange-500 to-amber-500'
      },
      {
         title: 'Certificate of Verification',
         description: 'Obtain official verification for your forestry-related activities and documents.',
         formType: 'cov',
         icon: FaCertificate,
         color: 'from-blue-500 to-cyan-500'
      },
      {
         title: 'Private Tree Plantation Registration',
         description: 'Register your private tree plantation for proper documentation and management.',
         formType: 'ptpr',
         icon: FaTree,
         color: 'from-green-500 to-emerald-500'
      },
      {
         title: 'Public Land Tree Cutting Permit',
         description: 'Apply for permission to cut trees on public land with proper authorization.',
         formType: 'tc_public',
         icon: FaFileAlt,
         color: 'from-purple-500 to-violet-500'
      },
      {
         title: 'Private Land Timber Permit',
         description: 'Get authorization for timber-related activities on private property.',
         formType: 'tc_private',
         icon: FaUserTie,
         color: 'from-pink-500 to-rose-500'
      },
      {
         title: 'NGA Tree Cutting Permit',
         description: 'Special permit for National Government Agencies requiring tree cutting authorization.',
         formType: 'tc_nga',
         icon: FaBuilding,
         color: 'from-indigo-500 to-blue-500'
      },
   ];

   return (
      <div className="bg-gradient-to-b from-green-50 to-white min-h-screen flex flex-col pt-16">
         <main className="container mx-auto px-6 py-8 flex-grow">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                     Permit Applications
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                     Choose from our range of environmental permits and start your application process today.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {permits.map((permit, index) => {
                     const Icon = permit.icon;
                     return (
                        <div
                           key={index}
                           className="group relative bg-white rounded-xl shadow-md hover:shadow-xl
                              transition-all duration-300 overflow-hidden min-w-[280px]"
                        >
                           {/* Gradient Background */}
                           <div className={`absolute inset-0 bg-gradient-to-br ${permit.color}
                              opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                           />

                           <div className="relative p-8">
                              <div className="flex items-center mb-4">
                                 <Icon className={`w-8 h-8 bg-gradient-to-br ${permit.color}
                                    rounded-lg p-1.5 text-white shadow-md`}/>
                                 <h3 className="ml-3 text-lg font-semibold text-gray-900">
                                    {permit.title}
                                 </h3>
                              </div>

                              <p className="text-gray-600 mb-6 text-sm">
                                 {permit.description}
                              </p>

                              <button
                                 onClick={() => handleApplyClick(permit.formType)}
                                 className="w-full bg-gradient-to-r from-green-600 to-green-700
                                    hover:from-green-700 hover:to-green-800 text-white font-medium
                                    py-2.5 px-4 rounded-lg transition-all duration-300
                                    transform hover:translate-y-[-2px] active:translate-y-0
                                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                              >
                                 Apply Now
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </main>

         <footer className="bg-gradient-to-r from-green-800 to-green-900 text-white py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
               <p className="text-sm opacity-90">
                  &copy; {new Date().getFullYear()} PermitTree - DENR-PENRO. All rights reserved.
               </p>
            </div>
         </footer>
      </div>
   );
};

export default PermitsPage;
