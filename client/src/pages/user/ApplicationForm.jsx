import { React, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import UserSidebar from '../../components/layout/UserSidebar';
import CSAWForm from '../../ApplicationForms/CSAWForm';
import COVForm from '../../ApplicationForms/COVForm';
import PTPRForm from '../../ApplicationForms/PTPRForm';
import TC_PrivateForm from '../../ApplicationForms/TC_PrivateForm';
import TC_PublicForm from '../../ApplicationForms/TC_PublicForm';
import TC_NGAForm from '../../ApplicationForms/TC_NGAForm';
// import './styles/ApplicationForm.css';
// import uploadIcon from '../assets/upload_icn.svg';
// import closeIcon from '../assets/close_icn.svg';

const formComponents = {
    chainsaw: CSAWForm,
    cov: COVForm,
    ptpr: PTPRForm,
    tc_private: TC_PrivateForm,
    tc_public: TC_PublicForm,
    tc_nga: TC_NGAForm,
};

const ApplicationForm = () => {
    const { formType } = useParams();
    const FormComponent = formComponents[formType];
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex h-screen">
            <UserSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
            <div className="flex-grow flex flex-col transition-all duration-300 ml-0">
                <Navbar sidebarToggle={isOpen} setSidebarToggle={setIsOpen} />
                {FormComponent ? <FormComponent /> : <p>Form not found</p>}
            </div>
        </div>
    );
};

export default ApplicationForm;