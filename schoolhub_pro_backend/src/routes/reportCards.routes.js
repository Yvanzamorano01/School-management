const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportCardsController = require('../controllers/reportCards.controller');

/**
 * @swagger
 * tags:
 *   name: Report Cards
 *   description: Student report card generation
 */

/**
 * @swagger
 * /report-cards/student/{studentId}:
 *   get:
 *     summary: Generate report card for a student
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report card generated
 *       400:
 *         description: Missing semesterId
 *       404:
 *         description: Student or semester not found
 */
router.get('/student/:studentId', auth, reportCardsController.getStudentReportCard);

/**
 * @swagger
 * /report-cards/class/{classId}:
 *   get:
 *     summary: Generate class-wide report card summaries
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class report cards generated
 */
router.get('/class/:classId', auth, reportCardsController.getClassReportCards);

module.exports = router;
