const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ============ ADMIN PANEL CONFIGURATION & MANAGEMENT ============

// Get panel configuration
router.get('/config', verifyToken, adminController.getPanelConfiguration);

// Set/update panel configuration
router.post('/config/:academicYear', verifyToken, adminController.setPanelConfiguration);

// Generate panels for a semester
router.post('/generate', verifyToken, adminController.generatePanelsForSemester);

// Get panels by semester
router.get('/semester', verifyToken, adminController.getPanelsBySemester);

// Get specific panel details
router.get('/:panelId', verifyToken, adminController.getPanelDetails);

// Update panel members
router.put('/:panelId/members', verifyToken, adminController.updatePanelMembers);

// Rotate conveyers
router.post('/rotate-conveyers', verifyToken, adminController.rotateConveyersForSemester);

// Get panel load distribution
router.get('/load-distribution', verifyToken, adminController.getPanelLoadDistribution);

// Delete panel
router.delete('/:panelId', verifyToken, adminController.deletePanel);

// ============ FACULTY PANEL VIEW ============

// Get panels assigned to faculty
router.get('/faculty/:facultyId/panels', verifyToken, adminController.getFacultyPanels);

// Get faculty evaluations
router.get('/faculty/:facultyId/evaluations', verifyToken, adminController.getFacultyEvaluations);

// ============ EVALUATION MARKS SUBMISSION ============

// Submit marks for a group by a panel member
router.post('/:panelId/group/:groupId/marks', verifyToken, adminController.submitEvaluationMarks);

// Get evaluation status for a group
router.get('/:panelId/group/:groupId/evaluation-status', verifyToken, adminController.getEvaluationStatus);

// Get semester evaluations
router.get('/semester-evaluations', verifyToken, adminController.getSemesterEvaluations);

// Get group evaluation marks
router.get('/group/:groupId/marks', verifyToken, adminController.getGroupEvaluationMarks);

module.exports = router;
