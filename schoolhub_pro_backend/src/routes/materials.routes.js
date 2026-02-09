const router = require('express').Router();
const controller = require('../controllers/materials.controller');
const auth = require('../middleware/auth');
const { isTeacher } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /materials:
 *   get:
 *     tags:
 *       - Course Materials
 *     summary: Get all course materials
 *     description: Retrieve a list of all course materials with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *         description: Filter by teacher ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by material type
 *     responses:
 *       200:
 *         description: List of course materials retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseMaterial'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /materials/{id}:
 *   get:
 *     tags:
 *       - Course Materials
 *     summary: Get course material by ID
 *     description: Retrieve a specific course material by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course material ID
 *     responses:
 *       200:
 *         description: Course material retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseMaterial'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Course material not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /materials/{id}/download:
 *   get:
 *     tags:
 *       - Course Materials
 *     summary: Download course material
 *     description: Download a course material file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course material ID
 *     responses:
 *       200:
 *         description: File download initiated successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Course material not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/download', auth, controller.download);

/**
 * @swagger
 * /materials:
 *   post:
 *     tags:
 *       - Course Materials
 *     summary: Upload a new course material
 *     description: Upload a new course material (Teacher role required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               classId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course material uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseMaterial'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, isTeacher, upload.single('file'), controller.create);

/**
 * @swagger
 * /materials/{id}:
 *   put:
 *     tags:
 *       - Course Materials
 *     summary: Update a course material
 *     description: Update an existing course material (Teacher role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseMaterialInput'
 *     responses:
 *       200:
 *         description: Course material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseMaterial'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Course material not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, isTeacher, controller.update);

/**
 * @swagger
 * /materials/{id}:
 *   delete:
 *     tags:
 *       - Course Materials
 *     summary: Delete a course material
 *     description: Delete a course material (Teacher role required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course material ID
 *     responses:
 *       200:
 *         description: Course material deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Course material not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, isTeacher, controller.delete);

module.exports = router;
