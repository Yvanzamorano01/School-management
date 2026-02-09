const router = require('express').Router();
const controller = require('../controllers/attendance.controller');
const auth = require('../middleware/auth');
const { isTeacher, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /attendance:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get all attendance records
 *     description: Retrieve a list of all attendance records in the system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance records retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /attendance/by-date:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get attendance by date
 *     description: Retrieve attendance records for a specific date and optionally filter by class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to retrieve attendance for (YYYY-MM-DD)
 *       - in: query
 *         name: classId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Optional class ID to filter results
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *       400:
 *         description: Bad request - Missing or invalid date parameter
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/by-date', auth, controller.getByDate);

/**
 * @swagger
 * /attendance/summary:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get attendance summary
 *     description: Retrieve attendance summary statistics for a class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Class ID to get summary for
 *     responses:
 *       200:
 *         description: Attendance summary retrieved successfully
 *       400:
 *         description: Bad request - Missing or invalid classId parameter
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/summary', auth, controller.getClassSummary);

/**
 * @swagger
 * /attendance/student/{studentId}:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get attendance for a student
 *     description: Retrieve attendance history for a specific student
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student attendance retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/student/:studentId', auth, controller.getByStudent);

/**
 * @swagger
 * /attendance:
 *   post:
 *     tags:
 *       - Attendance
 *     summary: Create attendance record
 *     description: Create a new attendance record (Teacher only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceInput'
 *     responses:
 *       200:
 *         description: Attendance record created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, isTeacher, hasPermission('Attendance'), controller.create);

/**
 * @swagger
 * /attendance/{id}:
 *   put:
 *     tags:
 *       - Attendance
 *     summary: Update attendance record
 *     description: Update an existing attendance record by ID (Teacher only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceInput'
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isTeacher, hasPermission('Attendance'), controller.update);

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     tags:
 *       - Attendance
 *     summary: Delete attendance record
 *     description: Delete an attendance record by ID (Teacher only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isTeacher, hasPermission('Attendance'), controller.delete);

module.exports = router;
