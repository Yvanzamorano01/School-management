const router = require('express').Router();
const controller = require('../controllers/semesters.controller');
const auth = require('../middleware/auth');
const { isAdmin, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /semesters:
 *   get:
 *     tags:
 *       - Semesters
 *     summary: Get all semesters
 *     description: Retrieve a list of all semesters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by academic year ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of semesters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Semester'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /semesters/{id}:
 *   get:
 *     tags:
 *       - Semesters
 *     summary: Get semester by ID
 *     description: Retrieve a specific semester by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     responses:
 *       200:
 *         description: Semester retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Semester not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /semesters:
 *   post:
 *     tags:
 *       - Semesters
 *     summary: Create a new semester
 *     description: Create a new semester (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SemesterInput'
 *     responses:
 *       200:
 *         description: Semester created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, isAdmin, hasPermission('Settings'), controller.create);

/**
 * @swagger
 * /semesters/{id}:
 *   put:
 *     tags:
 *       - Semesters
 *     summary: Update a semester
 *     description: Update an existing semester (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SemesterInput'
 *     responses:
 *       200:
 *         description: Semester updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Semester not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isAdmin, hasPermission('Settings'), controller.update);

/**
 * @swagger
 * /semesters/{id}:
 *   delete:
 *     tags:
 *       - Semesters
 *     summary: Delete a semester
 *     description: Delete a semester (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     responses:
 *       200:
 *         description: Semester deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Semester not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isAdmin, hasPermission('Settings'), controller.delete);

/**
 * @swagger
 * /semesters/{id}/activate:
 *   post:
 *     tags:
 *       - Semesters
 *     summary: Activate a semester
 *     description: Set a semester as the active semester (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     responses:
 *       200:
 *         description: Semester activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Semester not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/activate', auth, isAdmin, hasPermission('Settings'), controller.activate);

module.exports = router;
