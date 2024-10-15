import React, { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApplicationRow from '../ApplicationRow';

const TechnicalStaffDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Pending Reviews');
    const [applications, setApplications] = useState([]); // This should be populated with real data

    const tabs = ['Pending Reviews', 'Returned Applications', 'Accepted Applications', 'Inspections'];

    const filteredApplications = useMemo(() => {
        return applications.filter(app =>
            app.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [applications, searchTerm]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending review': return 'bg-yellow-100 text-yellow-800';
            case 'returned': return 'bg-orange-100 text-orange-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'inspection scheduled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderTable = () => {
        if (filteredApplications.length === 0) {
            return <p className="text-center text-gray-500">No applications found.</p>;
        }

        return (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION NUMBER</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION TYPE</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApplications.map((app) => (
                            <ApplicationRow
                                key={app._id}
                                app={app}
                                onView={() => {}} // Implement these functions
                                onPrint={() => {}}
                                onReview={() => {}}
                                getStatusColor={getStatusColor}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-green-50">
            <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-green-800">Technical Staff Dashboard</h1>
                    <Button onClick={() => {}} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
                <div className="mb-6 overflow-x-auto">
                    <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <Input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                {renderTable()}
            </div>
        </div>
    );
};

export default TechnicalStaffDashboard;
