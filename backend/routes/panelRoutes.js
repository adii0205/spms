const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ============ FACULTY AVAILABILITY ============

// Check available faculty by department
router.get('/faculty-availability', authenticateToken, adminController.checkFacultyAvailability);

// ============ ADMIN PANEL CONFIGURATION & MANAGEMENT ============

// Get panel configuration
router.get('/config', authenticateToken, adminController.getPanelConfiguration);

// Set/update panel configuration
router.post('/config/:academicYear', authenticateToken, adminController.setPanelConfiguration);

// Generate panels for a semester
router.post('/generate', authenticateToken, adminController.generatePanelsForSemester);

// Get panels by semester
router.get('/semester', authenticateToken, adminController.getPanelsBySemester);

// Get specific panel details
router.get('/:panelId', authenticateToken, adminController.getPanelDetails);

// Update panel members
router.put('/:panelId/members', authenticateToken, adminController.updatePanelMembers);

// Rotate conveyers
router.post('/rotate-conveyers', authenticateToken, adminController.rotateConveyersForSemester);

// Get panel load distribution
router.get('/load-distribution', authenticateToken, adminController.getPanelLoadDistribution);

// Delete panel
router.delete('/:panelId', authenticateToken, adminController.deletePanel);

// ============ FACULTY PANEL VIEW ============

// Get panels assigned to faculty (using authenticated user's ID)
router.get('/faculty/panels', authenticateToken, adminController.getFacultyPanels);

// Get faculty evaluations (using authenticated user's ID)
router.get('/faculty/evaluations', authenticateToken, adminController.getFacultyEvaluations);

// ============ EVALUATION MARKS SUBMISSION ============

// Submit marks for a group by a panel member
router.post('/:panelId/group/:groupId/marks', authenticateToken, adminController.submitEvaluationMarks);

// Get evaluation status for a group
router.get('/:panelId/group/:groupId/evaluation-status', authenticateToken, adminController.getEvaluationStatus);

// Get semester evaluations
router.get('/semester-evaluations', authenticateToken, adminController.getSemesterEvaluations);

// Get group evaluation marks
router.get('/group/:groupId/marks', authenticateToken, adminController.getGroupEvaluationMarks);

module.exports = router;
