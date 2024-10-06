import React from 'react';
import DENRLogo from '../../../assets/denr-logo.png';
import BagongPilipinasLogo from '../../../assets/BAGONG-PILIPINAS-LOGO.png';

const DENRHeader = () => {
    return (
        <header className="bg-green-700 text-white py-4 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center">
                    <div className="flex items-center">
                        <img src={DENRLogo} alt="DENR Logo" className="h-24 w-auto mr-4" />
                        <div className="text-center">
                            <h1 className="text-sm font-semibold tracking-wide">Republic of the Philippines</h1>
                            <div className="w-full border-t border-white my-1"></div>
                            <h2 className="text-2xl font-bold leading-tight">DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES</h2>
                            <p className="text-xs">Kagawaran ng Kapaligiran at Likas na Yaman</p>
                            <p className="text-xs font-medium">PENRO - Marinduque</p>
                        </div>
                        <img src={BagongPilipinasLogo} alt="Bagong Pilipinas Logo" className="h-16 w-auto ml-4" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DENRHeader;
