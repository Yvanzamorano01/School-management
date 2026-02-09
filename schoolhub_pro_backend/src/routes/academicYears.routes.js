const router = require('express').Router();
const controller = require('../controllers/academicYears.controller');
const auth = require('../middleware/auth');
const { isAdmin, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /academic-years:
 *   get:
 *     tags:
 *       - Academic Years
 *     summary: Get all academic years
 *     description: Retrieve a list of all academic years
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of academic years retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicYear'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /academic-years/{id}:
 *   get:
 *     tags:
 *       - Academic Years
 *     summary: Get academic year by ID
 *     description: Retrieve a specific academic year by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYear'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Academic year not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /academic-years:
 *   post:
 *     tags:
 *       - Academic Years
 *     summary: Create a new academic year
 *     description: Create a new academic year (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYearInput'
 *     responses:
 *       200:
 *         description: Academic year created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYear'
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
 * /academic-years/{id}:
 *   put:
 *     tags:
 *       - Academic Years
 *     summary: Update an academic year
 *     description: Update an existing academic year (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYearInput'
 *     responses:
 *       200:
 *         description: Academic year updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYear'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Academic year not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isAdmin, hasPermission('Settings'), controller.update);

/**
 * @swagger
 * /academic-years/{id}:
 *   delete:
 *     tags:
 *       - Academic Years
 *     summary: Delete an academic year
 *     description: Delete an academic year (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Academic year not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isAdmin, hasPermission('Settings'), controller.delete);

/**
 * @swagger
 * /academic-years/{id}/activate:
 *   post:
 *     tags:
 *       - Academic Years
 *     summary: Activate an academic year
 *     description: Set an academic year as the active year (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYear'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Academic year not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/activate', auth, isAdmin, hasPermission('Settings'), controller.activate);

module.exports = router;
