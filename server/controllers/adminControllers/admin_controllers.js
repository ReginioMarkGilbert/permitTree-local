const Counter = require('../../models/admin/counter');
const TreeData = require('../../models/admin/treeData');

const resetCounter = async (req, res) => { // endpoint: http://localhost:5000/api/reset-counter
    try {
        const counter = await Counter.findOneAndUpdate(
            { name: 'applicationId' },
            { seq: 0 },
            { new: true }
        );
        res.status(200).json({ message: 'Counter reset successfully', counter });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getTreeData = async (req, res) => {
    try {
        const { timeFrame } = req.query;
        let match = {};

        if (timeFrame === 'day') {
            match = { date: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) } };
        } else if (timeFrame === 'week') {
            match = { date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } };
        } else if (timeFrame === 'month') {
            match = { date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } };
        } else if (timeFrame === 'year') {
            match = { date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } };
        }

        const treeData = await TreeData.find(match).sort({ date: 1 });
        res.status(200).json(treeData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateTreeData = async (req, res) => {
    try {
        const { date, count } = req.body;
        const updatedTreeData = await TreeData.findOneAndUpdate(
            { date: new Date(date) },
            { count },
            { new: true, upsert: true }
        );
        res.status(200).json(updatedTreeData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const createTreeData = async (req, res) => {
    try {
        const { date, count } = req.body;
        const newTreeData = new TreeData({ date, count });
        await newTreeData.save();
        res.status(201).json(newTreeData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    resetCounter,
    getTreeData,
    updateTreeData,
    createTreeData
};