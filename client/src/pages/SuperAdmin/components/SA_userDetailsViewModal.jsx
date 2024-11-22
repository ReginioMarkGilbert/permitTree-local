import React from 'react';
import { X } from 'lucide-react';

const SA_UserDetailsViewModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const isPersonnel = user.userType === 'Personnel';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-20 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors duration-200">
            <X size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <Section title={isPersonnel ? "Personnel Information" : "User Information"}>
            {isPersonnel ? (
              <>
                <Field label="Username" value={user.username} />
                <Field label="First Name" value={user.firstName} />
                <Field label="Last Name" value={user.lastName} />
                <Field label="Role" value={user.role} />
              </>
            ) : (
              <>
                <Field label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                <Field label="Email" value={user.email} />
                <Field label="Phone" value={user.phone || 'N/A'} />
                <Field label="Company" value={user.company || 'N/A'} />
                <Field label="Address" value={user.address || 'N/A'} />
              </>
            )}
          </Section>
        </div>
        <div className="p-5 bg-gray-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 px-4 pt-4">{title}</h3>
      <div className="bg-gray-50 p-4 grid grid-cols-1 gap-4 rounded-b-xl">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <span className="text-sm text-gray-500">{label}</span>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}

export default SA_UserDetailsViewModal;
