import React from 'react';
import './styles/MessageBox.css';

const MessageBox = ({ onViewStatus }) => {
    return (
        <div className="message_container">
            <div className="message-box">
                <p>Your application for Chainsaw registration has been submitted. Thank you!</p>
                <button className="view-status-button" onClick={onViewStatus}>View Status</button>
            </div>
        </div>
    );
};

export default MessageBox;
