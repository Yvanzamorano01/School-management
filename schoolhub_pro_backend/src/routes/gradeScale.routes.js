const router = require('express').Router();
const controller = require('../controllers/gradeScale.controller');
const auth = require('../middleware/auth');
const { isAdmin, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /grade-scale:
 *   get:
 *     tags:
 *       - Grade Scale
 *     summary: Get all grade scales
 *     description: Retrieve a list of all grade scale definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of grade scales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GradeScale'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /grade-scale/{id}:
 *   get:
 *     tags:
 *       - Grade Scale
 *     summary: Get grade scale by ID
 *     description: Retrieve a specific grade scale by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Grade scale ID
 *     responses:
 *       200:
 *         description: Grade scale retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeScale'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Grade scale not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /grade-scale:
 *   post:
 *     tags:
 *       - Grade Scale
 *     summary: Create a new grade scale
 *     description: Create a new grade scale definition (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeScaleInput'
 *     responses:
 *       200:
 *         description: Grade scale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeScale'
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
 * /grade-scale/init-defaults:
 *   post:
 *     tags:
 *       - Grade Scale
 *     summary: Initialize default grade scales
 *     description: Create default grade scale definitions (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default grade scales initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GradeScale'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/init-defaults', auth, isAdmin, hasPermission('Settings'), controller.initDefaults);

/**
 * @swagger
 * /grade-scale/{id}:
 *   put:
 *     tags:
 *       - Grade Scale
 *     summary: Update a grade scale
 *     description: Update an existing grade scale (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Grade scale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeScaleInput'
 *     responses:
 *       200:
 *         description: Grade scale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeScale'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Grade scale not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isAdmin, hasPermission('Settings'), controller.update);

/**
 * @swagger
 * /grade-scale/{id}:
 *   delete:
 *     tags:
 *       - Grade Scale
 *     summary: Delete a grade scale
 *     description: Delete a grade scale (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Grade scale ID
 *     responses:
 *       200:
 *         description: Grade scale deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Grade scale not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isAdmin, hasPermission('Settings'), controller.delete);

module.exports = router;
