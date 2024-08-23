const express = require('express');
const Student = require('../models/student');

const router = express.Router();

// Create Student
router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Show Previously Assigned Mentors for a Particular Student
router.get('/:studentId/previous-mentors', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('previousMentors');
        if (!student) {
            return res.status(404).send('Student not found');
        }
        res.send(student.previousMentors);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
