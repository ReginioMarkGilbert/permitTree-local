import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ExpandableServiceCard = ({ icon: Icon, title, description, process, expandDirection, isExpanded, onToggle }) => {
    const getExpandStyles = () => {
        switch (expandDirection) {
            case 'right-bottom':
                return { originX: 0, originY: 0 };
            case 'center-bottom':
                return { originX: 0.5, originY: 0 };
            case 'left-bottom':
                return { originX: 1, originY: 0 };
            case 'right-top':
                return { originX: 0, originY: 1 };
            case 'center-top':
                return { originX: 0.5, originY: 1 };
            case 'left-top':
                return { originX: 1, originY: 1 };
            default:
                return { originX: 0.5, originY: 0.5 };
        }
    };

    return (
        <motion.div
            className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg ${isExpanded ? 'col-span-2 row-span-2 z-10' : 'z-0'}`}
            onClick={onToggle}
            layout
            transition={{
                layout: { duration: 0.3, ease: "easeOut" }
            }}
            style={getExpandStyles()}
        >
            <motion.div layout="position" className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Icon className="h-10 w-10 text-green-600 mr-4" />
                    <h3 className="text-xl font-semibold text-green-800">{title}</h3>
                </div>
                <motion.div
                    initial={false}
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isExpanded ? <ChevronUp className="text-green-600" /> : <ChevronDown className="text-green-600" />}
                </motion.div>
            </motion.div>
            <motion.p layout="position" className="text-gray-600 mb-4">{description}</motion.p>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mt-4 bg-green-50 p-4 rounded-md">
                            <h4 className="font-semibold mb-2 text-green-800">Process:</h4>
                            <ul className="list-disc list-inside space-y-2">
                                {process.map((step, index) => (
                                    <li key={index} className="text-gray-700">{step}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ExpandableServiceCard;

