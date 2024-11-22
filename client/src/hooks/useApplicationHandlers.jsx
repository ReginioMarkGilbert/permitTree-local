import { useNavigate } from 'react-router-dom';

const useApplicationHandlers = () => {
    const navigate = useNavigate();

    const handleSubmitApplication = async (formData) => {
        try {
            const response = await fetch('http://localhost:5000/api/createApplication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Application submitted:', data);
                navigate('/message'); // Navigate to the MessageBox component
            } else {
                console.error('Failed to submit application');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleViewStatus = () => {
        navigate('/status');
    };

    return { handleSubmitApplication, handleViewStatus };
};

export default useApplicationHandlers;