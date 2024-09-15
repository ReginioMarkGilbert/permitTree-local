import { useState, useEffect } from 'react';
import { FaSearch, FaCheck, FaTimes, FaEdit, FaEye, FaPrint, FaArchive, FaChevronDown, FaChevronUp, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios'; // Add axios for API calls

const applicationTypes = [
    'Chainsaw Registration',
    'Certificate of Verification',
    'Private Tree Plantation Registration (PTPR)',
    'Government Project Timber Permit',
    'Private Land Timber Permit',
    'Public Land Timber Permit'
];

const MyApplicationsPage = () => {
    const [activeTab, setActiveTab] = useState('draft');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [requirementsFilter, setRequirementsFilter] = useState([]);
    const [typeFilter, setTypeFilter] = useState([]);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [showFilters, setShowFilters] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/csaw_getApplications');
                console.log('Fetched applications:', response.data); // Log the fetched applications
                setApplications(Array.isArray(response.data) ? response.data : []);
                setFilteredApplications(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };
        fetchApplications();
    }, []);

    useEffect(() => {
        if (!Array.isArray(applications)) return;
        const filtered = applications.filter(app => {
            const matchesSearch = app.customId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.permitNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = !dateFilter || (app.dateOfSubmission && app.dateOfSubmission.includes(dateFilter));
            const matchesRequirements = requirementsFilter.length === 0 ||
                (requirementsFilter.includes('uploaded') && app.uploadedRequirements) ||
                (requirementsFilter.includes('notUploaded') && !app.uploadedRequirements);
            const matchesType = typeFilter.length === 0 || typeFilter.includes(app.applicationType);
            return matchesSearch && matchesDate && matchesRequirements && matchesType;
        });
        console.log('Filtered applications:', filtered); // Add this line to debug filtered applications
        setFilteredApplications(filtered);
    }, [searchTerm, dateFilter, requirementsFilter, typeFilter, applications]);

    const handleAction = (action, app) => {
        console.log(`${action} application:`, app);
        // Implement actual functionality here
    };

    const renderTable = () => {
        if (!Array.isArray(filteredApplications)) {
            return <p className="text-center text-gray-500 my-4">No applications found.</p>;
        }

        const applicationsToShow = filteredApplications.filter(app => app.status === activeTab);
        console.log('Applications to show:', applicationsToShow); // Add this line to debug applications to show
        if (!applicationsToShow || applicationsToShow.length === 0) {
            return <p className="text-center text-gray-500 my-4">No applications found.</p>;
        }

        const columns = {
            draft: ['Application Number', 'Application Type', 'Date & Time Updated', 'Uploaded Requirements', 'Action'],
            submitted: ['Application Number', 'Application Type', 'Received By', 'Date & Time Updated', 'Date & Time Submitted', 'Uploaded Requirements', 'Action'],
            returned: ['Application Number', 'Application Type', 'Returned By', 'Date & Time Updated', 'Date & Time Returned', 'Uploaded Requirements', 'Action'],
            accepted: ['Application Number', 'Application Type', 'Accepted By', 'Date & Time Updated', 'Date & Time Accepted', 'Uploaded Requirements', 'Action'],
            released: ['Permit Number', 'Application Type', 'Date & Time Issued', 'Issued By', 'Date & Time Released', 'Released By', 'Validity Date', 'Date & Time Accepted', 'Accepted By', 'Certificate Copy', 'Action'],
            expired: ['Permit Number', 'Application Type', 'Date & Time Released', 'Released By', 'Validity Date', 'Certificate Copy', 'Action'],
        };

        return (
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns[activeTab].map((column, index) => (
                                <th key={index} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applicationsToShow.map((app, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {columns[activeTab].map((column, i) => (
                                    <td key={i} className="px-3 py-4 text-sm text-gray-500">
                                        <div className="break-words">
                                            {column === 'Uploaded Requirements'
                                                ? (app.uploadedRequirements ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />)
                                                : app[column.replace(/ /g, '')] || 'N/A'}
                                        </div>
                                    </td>
                                ))}
                                <td className="px-3 py-4 text-sm font-medium">
                                    <div className="flex flex-wrap gap-2">
                                        {activeTab === 'draft' && (
                                            <button onClick={() => handleAction('edit', app)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">
                                                <FaEdit className="inline mr-1" /> Edit
                                            </button>
                                        )}
                                        <button onClick={() => handleAction('view', app)} className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded">
                                            <FaEye className="inline mr-1" /> View
                                        </button>
                                        <button onClick={() => handleAction('print', app)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded">
                                            <FaPrint className="inline mr-1" /> Print
                                        </button>
                                        <button onClick={() => handleAction('archive', app)} className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                                            <FaArchive className="inline mr-1" /> Archive
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col pt-16">
            <main className="flex-grow p-8">
                <h1 className="text-3xl font-bold text-green-800 mb-6">My Applications</h1>

                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex flex-row items-center justify-between p-6">
                        <h2 className="text-xl font-semibold text-green-800">Search and Filter</h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>
                    <div className={`p-6 ${showFilters ? '' : 'hidden'}`}>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-grow">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by Application/Permit Number"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                </div>
                            </div>
                            <div className="w-full md:w-48 relative">
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Requirements Status:</h3>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={requirementsFilter.includes('uploaded')}
                                        onChange={(e) => {
                                            setRequirementsFilter(prev =>
                                                e.target.checked
                                                    ? [...prev, 'uploaded']
                                                    : prev.filter(item => item !== 'uploaded')
                                            );
                                        }}
                                        className="rounded border-gray-300 text-green-600 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2">Uploaded</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={requirementsFilter.includes('notUploaded')}
                                        onChange={(e) => {
                                            setRequirementsFilter(prev =>
                                                e.target.checked
                                                    ? [...prev, 'notUploaded']
                                                    : prev.filter(item => item !== 'notUploaded')
                                            );
                                        }}
                                        className="rounded border-gray-300 text-green-600 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2">Not Uploaded</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Application Type:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {applicationTypes.map((type) => (
                                    <label key={type} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={typeFilter.includes(type)}
                                            onChange={(e) => {
                                                setTypeFilter(prev =>
                                                    e.target.checked
                                                        ? [...prev, type]
                                                        : prev.filter(item => item !== type)
                                                );
                                            }}
                                            className="rounded border-gray-300 text-green-600 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-green-800">Application List</h2>
                    </div>
                    <div className="p-6">
                        <div className="mb-4">
                            <div className="inline-flex rounded-md bg-gray-100 p-1">
                                {['draft', 'submitted', 'returned', 'accepted', 'released', 'expired'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === tab
                                            ? 'bg-white text-gray-900 shadow-sm transform scale-105'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {renderTable()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyApplicationsPage;
