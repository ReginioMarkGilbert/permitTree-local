import React from 'react';
import { useParams } from 'react-router-dom';
import CSAWForm from '../ApplicationForms/CSAWForm';
import COVForm from '../ApplicationForms/COVForm';
import PTPRForm from '../ApplicationForms/PTPRForm';
import TC_PrivateForm from '../ApplicationForms/TC_PrivateForm';
import TC_PublicForm from '../ApplicationForms/TC_PublicForm';
import TC_NGAForm from '../ApplicationForms/TC_NGAForm';
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

    return (
        <div>
            {FormComponent ? <FormComponent /> : <p>Form not found</p>}
        </div>
    );
};

export default ApplicationForm;