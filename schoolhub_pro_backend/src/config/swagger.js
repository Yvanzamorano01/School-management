const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SchoolHub Pro API',
      version: '1.0.0',
      description: 'API documentation for the SchoolHub Pro School Management System',
      contact: {
        name: 'SchoolHub Pro',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ===== AUTH =====
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@schoolhub.com' },
            password: { type: 'string', minLength: 6, example: 'admin123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['super_admin', 'admin', 'moderator', 'teacher', 'student', 'parent', 'bursar'] },
            name: { type: 'string' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
          },
        },

        // ===== USER =====
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['super_admin', 'admin', 'moderator', 'teacher', 'student', 'parent', 'bursar'] },
            profileId: { type: 'string' },
            profileModel: { type: 'string', enum: ['Admin', 'Teacher', 'Student', 'Parent'] },
            isActive: { type: 'boolean', default: true },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ===== STUDENT =====
        Student: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            studentId: { type: 'string', example: 'STU001' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            photo: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
            bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''] },
            address: { type: 'string' },
            rollNumber: { type: 'string' },
            classId: { type: 'string' },
            sectionId: { type: 'string' },
            parentId: { type: 'string' },
            parentName: { type: 'string' },
            parentContact: { type: 'string' },
            parentEmail: { type: 'string' },
            relationship: { type: 'string', enum: ['Father', 'Mother', 'Guardian', ''] },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Graduated', 'Transferred'], default: 'Active' },
            admissionDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        StudentInput: {
          type: 'object',
          required: ['name', 'classId', 'sectionId'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
            bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
            address: { type: 'string' },
            rollNumber: { type: 'string' },
            classId: { type: 'string' },
            sectionId: { type: 'string' },
            parentId: { type: 'string' },
            parentName: { type: 'string' },
            parentContact: { type: 'string' },
            parentEmail: { type: 'string' },
            relationship: { type: 'string', enum: ['Father', 'Mother', 'Guardian'] },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Graduated', 'Transferred'] },
          },
        },

        // ===== TEACHER =====
        Teacher: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            teacherId: { type: 'string', example: 'TCH001' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            photo: { type: 'string' },
            subjects: { type: 'array', items: { type: 'string' } },
            classIds: { type: 'array', items: { type: 'string' } },
            qualification: { type: 'string' },
            experience: { type: 'string' },
            status: { type: 'string', enum: ['Active', 'Inactive'], default: 'Active' },
            joinDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TeacherInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            subjects: { type: 'array', items: { type: 'string' } },
            classIds: { type: 'array', items: { type: 'string' } },
            qualification: { type: 'string' },
            experience: { type: 'string' },
            status: { type: 'string', enum: ['Active', 'Inactive'] },
          },
        },

        // ===== PARENT =====
        Parent: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            parentId: { type: 'string', example: 'PAR001' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            photo: { type: 'string' },
            occupation: { type: 'string' },
            address: { type: 'string' },
            childrenIds: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['Active', 'Inactive'], default: 'Active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ParentInput: {
          type: 'object',
          required: ['name', 'phone'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            occupation: { type: 'string' },
            address: { type: 'string' },
            childrenIds: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['Active', 'Inactive'] },
          },
        },

        // ===== ADMIN =====
        Admin: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            adminId: { type: 'string', example: 'ADM001' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['Super Admin', 'Admin', 'Moderator'] },
            permissions: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['Active', 'Inactive'], default: 'Active' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AdminInput: {
          type: 'object',
          required: ['name', 'email', 'role'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['Super Admin', 'Admin', 'Moderator'] },
            permissions: { type: 'array', items: { type: 'string', enum: ['All', 'Students', 'Teachers', 'Parents', 'Classes', 'Sections', 'Subjects', 'Exams', 'Attendance', 'Fees', 'Notices', 'Reports', 'Settings'] } },
            status: { type: 'string', enum: ['Active', 'Inactive'] },
          },
        },

        // ===== CLASS =====
        Class: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string' },
            academicYearId: { type: 'string' },
            subjects: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ClassInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string' },
            academicYearId: { type: 'string' },
            subjects: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
          },
        },

        // ===== SECTION =====
        Section: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            classId: { type: 'string' },
            room: { type: 'string' },
            capacity: { type: 'integer', default: 30 },
            teachers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  teacherId: { type: 'string' },
                  subject: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SectionInput: {
          type: 'object',
          required: ['name', 'classId'],
          properties: {
            name: { type: 'string' },
            classId: { type: 'string' },
            room: { type: 'string' },
            capacity: { type: 'integer' },
            teachers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  teacherId: { type: 'string' },
                  subject: { type: 'string' },
                },
              },
            },
          },
        },

        // ===== SUBJECT =====
        Subject: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string' },
            classId: { type: 'string' },
            hoursPerWeek: { type: 'integer', default: 0 },
            chapters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  number: { type: 'integer' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  topics: { type: 'integer' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SubjectInput: {
          type: 'object',
          required: ['name', 'code'],
          properties: {
            name: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string' },
            classId: { type: 'string' },
            hoursPerWeek: { type: 'integer' },
            chapters: {
              type: 'array',
              items: {
                type: 'object',
                required: ['number', 'title'],
                properties: {
                  number: { type: 'integer' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  topics: { type: 'integer' },
                },
              },
            },
          },
        },

        // ===== EXAM =====
        Exam: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            subjectId: { type: 'string' },
            classId: { type: 'string' },
            semesterId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            duration: { type: 'integer', default: 60 },
            totalMarks: { type: 'integer' },
            passingMarks: { type: 'integer' },
            status: { type: 'string', enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ExamInput: {
          type: 'object',
          required: ['title', 'subjectId', 'classId', 'date', 'totalMarks'],
          properties: {
            title: { type: 'string' },
            subjectId: { type: 'string' },
            classId: { type: 'string' },
            semesterId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            duration: { type: 'integer' },
            totalMarks: { type: 'integer' },
            passingMarks: { type: 'integer' },
            status: { type: 'string', enum: ['upcoming', 'completed', 'cancelled'] },
          },
        },

        // ===== EXAM RESULT =====
        ExamResult: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            examId: { type: 'string' },
            studentId: { type: 'string' },
            marksObtained: { type: 'number', minimum: 0 },
            grade: { type: 'string' },
            remarks: { type: 'string' },
            percentage: { type: 'number' },
            isPassed: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ExamMarksInput: {
          type: 'object',
          required: ['marks'],
          properties: {
            marks: {
              type: 'array',
              items: {
                type: 'object',
                required: ['studentId', 'marksObtained'],
                properties: {
                  studentId: { type: 'string' },
                  marksObtained: { type: 'number', minimum: 0 },
                  remarks: { type: 'string' },
                },
              },
            },
          },
        },

        // ===== ATTENDANCE =====
        Attendance: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            classId: { type: 'string' },
            sectionId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            records: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  studentId: { type: 'string' },
                  status: { type: 'string', enum: ['present', 'absent', 'late'], default: 'present' },
                },
              },
            },
            recordedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AttendanceInput: {
          type: 'object',
          required: ['classId', 'date'],
          properties: {
            classId: { type: 'string' },
            sectionId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            records: {
              type: 'array',
              items: {
                type: 'object',
                required: ['studentId'],
                properties: {
                  studentId: { type: 'string' },
                  status: { type: 'string', enum: ['present', 'absent', 'late'] },
                },
              },
            },
          },
        },

        // ===== FEE TYPE =====
        FeeType: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number', minimum: 0 },
            frequency: { type: 'string', enum: ['Annual', 'Semester', 'Quarterly', 'Monthly', 'One-time'], default: 'Annual' },
            classId: { type: 'string' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FeeTypeInput: {
          type: 'object',
          required: ['name', 'amount'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number', minimum: 0 },
            frequency: { type: 'string', enum: ['Annual', 'Semester', 'Quarterly', 'Monthly', 'One-time'] },
            classId: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },

        // ===== STUDENT FEE =====
        StudentFee: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            studentId: { type: 'string' },
            feeTypeId: { type: 'string' },
            academicYearId: { type: 'string' },
            totalAmount: { type: 'number', minimum: 0 },
            paidAmount: { type: 'number', minimum: 0, default: 0 },
            dueDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Paid', 'Partially Paid', 'Unpaid', 'Overdue'], default: 'Unpaid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        StudentFeeInput: {
          type: 'object',
          required: ['studentId', 'feeTypeId', 'totalAmount'],
          properties: {
            studentId: { type: 'string' },
            feeTypeId: { type: 'string' },
            academicYearId: { type: 'string' },
            totalAmount: { type: 'number', minimum: 0 },
            dueDate: { type: 'string', format: 'date' },
          },
        },

        // ===== PAYMENT =====
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            studentFeeId: { type: 'string' },
            studentId: { type: 'string' },
            amount: { type: 'number', minimum: 1 },
            paymentMethod: { type: 'string', enum: ['Cash', 'Bank Transfer', 'Mobile Money', 'Check', 'Card'], default: 'Cash' },
            paymentDate: { type: 'string', format: 'date-time' },
            receiptNumber: { type: 'string', example: 'RCP260201001' },
            receivedBy: { type: 'string' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PaymentInput: {
          type: 'object',
          required: ['studentFeeId', 'studentId', 'amount'],
          properties: {
            studentFeeId: { type: 'string' },
            studentId: { type: 'string' },
            amount: { type: 'number', minimum: 1 },
            paymentMethod: { type: 'string', enum: ['Cash', 'Bank Transfer', 'Mobile Money', 'Check', 'Card'] },
            receivedBy: { type: 'string' },
            notes: { type: 'string' },
          },
        },

        // ===== NOTICE =====
        Notice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            target: { type: 'string', enum: ['All', 'Students', 'Teachers', 'Parents'], default: 'All' },
            priority: { type: 'string', enum: ['High', 'Normal', 'Low'], default: 'Normal' },
            author: { type: 'string' },
            authorId: { type: 'string' },
            publishDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Published', 'Draft'], default: 'Draft' },
            views: { type: 'integer', default: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        NoticeInput: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            target: { type: 'string', enum: ['All', 'Students', 'Teachers', 'Parents'] },
            priority: { type: 'string', enum: ['High', 'Normal', 'Low'] },
            publishDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Published', 'Draft'] },
          },
        },

        // ===== ACADEMIC YEAR =====
        AcademicYear: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: '2025-2026' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Active', 'Upcoming', 'Completed'], default: 'Upcoming' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AcademicYearInput: {
          type: 'object',
          required: ['name', 'startDate', 'endDate'],
          properties: {
            name: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Active', 'Upcoming', 'Completed'] },
          },
        },

        // ===== SEMESTER =====
        Semester: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            academicYearId: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Active', 'Upcoming', 'Completed'], default: 'Upcoming' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SemesterInput: {
          type: 'object',
          required: ['name', 'academicYearId', 'startDate', 'endDate'],
          properties: {
            name: { type: 'string' },
            academicYearId: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Active', 'Upcoming', 'Completed'] },
          },
        },

        // ===== GRADE SCALE =====
        GradeScale: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            grade: { type: 'string', example: 'A' },
            minScore: { type: 'number', minimum: 0, maximum: 100 },
            maxScore: { type: 'number', minimum: 0, maximum: 100 },
            gpaPoints: { type: 'number', minimum: 0, maximum: 4 },
            description: { type: 'string', example: 'Excellent' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        GradeScaleInput: {
          type: 'object',
          required: ['grade', 'minScore', 'maxScore', 'gpaPoints'],
          properties: {
            grade: { type: 'string' },
            minScore: { type: 'number', minimum: 0, maximum: 100 },
            maxScore: { type: 'number', minimum: 0, maximum: 100 },
            gpaPoints: { type: 'number', minimum: 0, maximum: 4 },
            description: { type: 'string' },
          },
        },

        // ===== COURSE MATERIAL =====
        CourseMaterial: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['Course', 'Assignment', 'Worksheet', 'Solution', 'Other'], default: 'Course' },
            subjectId: { type: 'string' },
            classId: { type: 'string' },
            fileUrl: { type: 'string' },
            fileName: { type: 'string' },
            fileSize: { type: 'integer' },
            fileType: { type: 'string' },
            uploadedBy: { type: 'string' },
            downloads: { type: 'integer', default: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CourseMaterialInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['Course', 'Assignment', 'Worksheet', 'Solution', 'Other'] },
            subjectId: { type: 'string' },
            classId: { type: 'string' },
            fileUrl: { type: 'string' },
            fileName: { type: 'string' },
            fileSize: { type: 'integer' },
            fileType: { type: 'string' },
          },
        },

        // ===== COMMON RESPONSES =====
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                pages: { type: 'integer' },
                limit: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Students', description: 'Student management' },
      { name: 'Teachers', description: 'Teacher management' },
      { name: 'Parents', description: 'Parent management' },
      { name: 'Admins', description: 'Admin management' },
      { name: 'Classes', description: 'Class management' },
      { name: 'Sections', description: 'Section management' },
      { name: 'Subjects', description: 'Subject management' },
      { name: 'Exams', description: 'Exam management' },
      { name: 'Attendance', description: 'Attendance tracking' },
      { name: 'Fee Types', description: 'Fee type configuration' },
      { name: 'Student Fees', description: 'Student fee assignments' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Notices', description: 'School notices & announcements' },
      { name: 'Academic Years', description: 'Academic year management' },
      { name: 'Semesters', description: 'Semester management' },
      { name: 'Grade Scale', description: 'Grade scale configuration' },
      { name: 'Course Materials', description: 'Course materials & resources' },
      { name: 'Health', description: 'API health check' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
