const router = require('express').Router();
const controller = require('../controllers/notices.controller');
const auth = require('../middleware/auth');
const { isAdmin, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /notices:
 *   get:
 *     tags:
 *       - Notices
 *     summary: Get all notices
 *     description: Retrieve a list of all notices with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *         description: Filter by target audience
 *     responses:
 *       200:
 *         description: List of notices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notice'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /notices/{id}:
 *   get:
 *     tags:
 *       - Notices
 *     summary: Get notice by ID
 *     description: Retrieve a specific notice by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notice ID
 *     responses:
 *       200:
 *         description: Notice retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Notice not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /notices:
 *   post:
 *     tags:
 *       - Notices
 *     summary: Create a new notice
 *     description: Create a new notice announcement (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoticeInput'
 *     responses:
 *       200:
 *         description: Notice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, isAdmin, hasPermission('Notices'), controller.create);

/**
 * @swagger
 * /notices/{id}:
 *   put:
 *     tags:
 *       - Notices
 *     summary: Update a notice
 *     description: Update an existing notice (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoticeInput'
 *     responses:
 *       200:
 *         description: Notice updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Notice not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isAdmin, hasPermission('Notices'), controller.update);

/**
 * @swagger
 * /notices/{id}:
 *   delete:
 *     tags:
 *       - Notices
 *     summary: Delete a notice
 *     description: Delete a notice (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notice ID
 *     responses:
 *       200:
 *         description: Notice deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Notice not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isAdmin, hasPermission('Notices'), controller.delete);

/**
 * @swagger
 * /notices/{id}/publish:
 *   post:
 *     tags:
 *       - Notices
 *     summary: Publish a notice
 *     description: Publish a notice to make it visible to users (Admin role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notice ID
 *     responses:
 *       200:
 *         description: Notice published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Notice not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/publish', auth, isAdmin, hasPermission('Notices'), controller.publish);

module.exports = router;
