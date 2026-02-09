const router = require('express').Router();
const controller = require('../controllers/feeTypes.controller');
const auth = require('../middleware/auth');
const { isFinance, hasPermission } = require('../middleware/roleCheck');

/**
 * @swagger
 * /fee-types:
 *   get:
 *     tags:
 *       - Fee Types
 *     summary: Get all fee types
 *     description: Retrieve a list of all fee types in the system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fee types retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /fee-types/{id}:
 *   get:
 *     tags:
 *       - Fee Types
 *     summary: Get fee type by ID
 *     description: Retrieve a specific fee type by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fee type ID
 *     responses:
 *       200:
 *         description: Fee type retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Fee type not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /fee-types:
 *   post:
 *     tags:
 *       - Fee Types
 *     summary: Create a new fee type
 *     description: Create a new fee type (Finance role only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeeTypeInput'
 *     responses:
 *       200:
 *         description: Fee type created successfully
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
 * /fee-types/{id}:
 *   put:
 *     tags:
 *       - Fee Types
 *     summary: Update a fee type
 *     description: Update an existing fee type by ID (Finance role only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fee type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeeTypeInput'
 *     responses:
 *       200:
 *         description: Fee type updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Fee type not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isFinance, hasPermission('Fees'), controller.update);

/**
 * @swagger
 * /fee-types/{id}:
 *   delete:
 *     tags:
 *       - Fee Types
 *     summary: Delete a fee type
 *     description: Delete a fee type by ID (Finance role only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fee type ID
 *     responses:
 *       200:
 *         description: Fee type deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Fee type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isFinance, hasPermission('Fees'), controller.delete);

module.exports = router;
