const router = require('express').Router();
const controller = require('../controllers/sections.controller');
const auth = require('../middleware/auth');
const { isAdmin, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /sections:
 *   get:
 *     tags:
 *       - Sections
 *     summary: Get all sections
 *     description: Retrieve a list of all sections in the system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sections retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     tags:
 *       - Sections
 *     summary: Get section by ID
 *     description: Retrieve a specific section by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Section not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /sections:
 *   post:
 *     tags:
 *       - Sections
 *     summary: Create a new section
 *     description: Create a new section (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SectionInput'
 *     responses:
 *       200:
 *         description: Section created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, isAdmin, hasPermission('Sections'), controller.create);

/**
 * @swagger
 * /sections/{id}:
 *   put:
 *     tags:
 *       - Sections
 *     summary: Update a section
 *     description: Update an existing section by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Section ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SectionInput'
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Section not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isAdmin, hasPermission('Sections'), controller.update);

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     tags:
 *       - Sections
 *     summary: Delete a section
 *     description: Delete a section by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Section not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isAdmin, hasPermission('Sections'), controller.delete);

/**
 * @swagger
 * /sections/{id}/students:
 *   get:
 *     tags:
 *       - Sections
 *     summary: Get students in a section
 *     description: Retrieve all students enrolled in a specific section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Section not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/students', auth, controller.getStudents);

module.exports = router;
