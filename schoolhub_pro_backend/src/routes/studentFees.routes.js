const router = require('express').Router();
const controller = require('../controllers/studentFees.controller');
const auth = require('../middleware/auth');
const { isFinance, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /student-fees:
 *   get:
 *     tags:
 *       - Student Fees
 *     summary: Get all student fees
 *     description: Retrieve a list of all student fee records in the system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student fees retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /student-fees/student/{studentId}:
 *   get:
 *     tags:
 *       - Student Fees
 *     summary: Get fees by student ID
 *     description: Retrieve all fee records for a specific student
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student fees retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.get('/student/:studentId', auth, controller.getByStudent);

/**
 * @swagger
 * /student-fees/{id}:
 *   get:
 *     tags:
 *       - Student Fees
 *     summary: Get student fee by ID
 *     description: Retrieve a specific student fee record by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student fee ID
 *     responses:
 *       200:
 *         description: Student fee retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Student fee not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /student-fees:
 *   post:
 *     tags:
 *       - Student Fees
 *     summary: Create a new student fee
 *     description: Create a new student fee record (Finance role only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentFeeInput'
 *     responses:
 *       200:
 *         description: Student fee created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, isFinance, hasPermission('Fees'), controller.create);

/**
 * @swagger
 * /student-fees/{id}:
 *   put:
 *     tags:
 *       - Student Fees
 *     summary: Update a student fee
 *     description: Update an existing student fee record by ID (Finance role only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student fee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentFeeInput'
 *     responses:
 *       200:
 *         description: Student fee updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Student fee not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isFinance, hasPermission('Fees'), controller.update);

/**
 * @swagger
 * /student-fees/{id}:
 *   delete:
 *     tags:
 *       - Student Fees
 *     summary: Delete a student fee
 *     description: Delete a student fee record by ID (Finance role only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student fee ID
 *     responses:
 *       200:
 *         description: Student fee deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Student fee not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isFinance, hasPermission('Fees'), controller.delete);

module.exports = router;
