const router = require('express').Router();
const controller = require('../controllers/exams.controller');
const auth = require('../middleware/auth');
const { isAdmin, isTeacher, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /exams:
 *   get:
 *     tags:
 *       - Exams
 *     summary: Get all exams
 *     description: Retrieve a list of all exams in the system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exams retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     tags:
 *       - Exams
 *     summary: Get exam by ID
 *     description: Retrieve a specific exam by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /exams:
 *   post:
 *     tags:
 *       - Exams
 *     summary: Create a new exam
 *     description: Create a new exam (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamInput'
 *     responses:
 *       200:
 *         description: Exam created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, isAdmin, hasPermission('Exams'), controller.create);

/**
 * @swagger
 * /exams/{id}:
 *   put:
 *     tags:
 *       - Exams
 *     summary: Update an exam
 *     description: Update an existing exam by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamInput'
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isAdmin, hasPermission('Exams'), controller.update);

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     tags:
 *       - Exams
 *     summary: Delete an exam
 *     description: Delete an exam by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isAdmin, hasPermission('Exams'), controller.delete);

/**
 * @swagger
 * /exams/{id}/results:
 *   get:
 *     tags:
 *       - Exams
 *     summary: Get exam results
 *     description: Retrieve all results for a specific exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam results retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/results', auth, controller.getResults);

/**
 * @swagger
 * /exams/{id}/marks:
 *   post:
 *     tags:
 *       - Exams
 *     summary: Enter exam marks
 *     description: Enter or update marks for students in an exam (Teacher only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamMarksInput'
 *     responses:
 *       200:
 *         description: Marks entered successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/marks', auth, isTeacher, hasPermission('Exams'), controller.enterMarks);

module.exports = router;
