const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const complain = new Complain(req.body)
        const result = await complain.save()
        res.send(result)
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ school: req.params.id }).populate("user", "name");
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteComplain = async (req, res) => {
    try {
        const result = await Complain.findByIdAndDelete(req.params.id);
        if (result) {
            res.send(result);
        } else {
            res.send({ message: "Complain not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteComplaints = async (req, res) => {
    try {
        const result = await Complain.deleteMany({ school: req.params.id });
        if (result.deletedCount === 0) {
            res.send({ message: "No complains found to delete" });
        } else {
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { complainCreate, complainList, deleteComplain, deleteComplaints };
