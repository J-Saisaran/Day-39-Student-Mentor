const express = require('express');
const Mentor = require('../models/mentor');
const Student = require('../models/student');

const router = express.Router();

// Create Mentor
router.post('/', async (req, res) => {
    try {
        const mentor = new Mentor(req.body);
        await mentor.save();
        res.status(201).send(mentor);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Assign a Student to a Mentor
router.post('/:mentorId/students/:studentId', async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.mentorId);
        const student = await Student.findById(req.params.studentId);

        if (!mentor || !student) {
            return res.status(404).send('Mentor or Student not found');
        }

        if (student.mentor) {
            student.previousMentors.push(student.mentor);
        }
        student.mentor = mentor._id;
        await student.save();

        mentor.students.push(student._id);
        await mentor.save();

        res.send(mentor);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Assign Multiple Students to One Mentor
router.post('/:mentorId/students', async (req, res) => {
    const { mentorId } = req.params;
    const { studentIds } = req.body;

    try {
        // Find the mentor by ID
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Loop through each student ID and update both the student and mentor documents
        const updatedStudents = await Promise.all(studentIds.map(async (studentId) => {
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ message: `Student with ID ${studentId} not found` });
            }

            // Update previous mentors list
            if (student.mentor) {
                student.previousMentors.push(student.mentor);
            }

            // Assign the new mentor
            student.mentor = mentorId;
            await student.save();

            // Add the student to the mentor's students array if not already added
            if (!mentor.students.includes(studentId)) {
                mentor.students.push(studentId);
            }

            return student;
        }));

        // Save the mentor with the updated students array
        await mentor.save();

        res.status(200).json({
            message: 'Students successfully assigned to mentor',
            mentor,
            students: updatedStudents
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Show All Students for a Particular Mentor
router.get('/:mentorId/students', async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.mentorId).populate('students');
        if (!mentor) {
            return res.status(404).send('Mentor not found');
        }
        res.send(mentor.students);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
