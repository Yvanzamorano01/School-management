import api from './api';

const L = { params: { limit: 1000 } };

const dashboardService = {
  async getStats(options = {}) {
    const [students, teachers, classes, parents, payments, attendance, studentFees, feeTypes] = await Promise.allSettled([
      api.get('/students', L),
      api.get('/teachers', L),
      api.get('/classes', L),
      api.get('/parents', L),
      api.get('/payments', L),
      api.get('/attendance', L),
      api.get('/student-fees', L),
      api.get('/fee-types', L)
    ]);

    const extract = (r) => {
      const d = r.status === 'fulfilled' ? r.value.data : [];
      return Array.isArray(d) ? d : [];
    };

    const studentsData = extract(students);
    const teachersData = extract(teachers);
    const classesData = extract(classes);
    const parentsData = extract(parents);
    const paymentsData = extract(payments);
    const attendanceData = extract(attendance);
    const studentFeesData = extract(studentFees);
    const feeTypesData = extract(feeTypes);

    // Apply optional date range filter to payments
    let filteredPayments = paymentsData;
    if (options.dateRange) {
      const { from, to } = options.dateRange;
      filteredPayments = paymentsData.filter(p => {
        const d = new Date(p.paymentDate || p.createdAt);
        return d >= from && d <= to;
      });
    }

    const totalStudents = studentsData.length;
    const totalTeachers = teachersData.length;
    const totalClasses = classesData.length;
    const totalParents = parentsData.length;

    // Revenue from payments (filtered if dateRange provided)
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Today's revenue
    const today = new Date().toDateString();
    const dailyRevenue = filteredPayments
      .filter(p => new Date(p.paymentDate || p.createdAt).toDateString() === today)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Attendance rate
    let attendanceRate = 0;
    if (attendanceData.length > 0) {
      attendanceRate = Math.round(attendanceData.reduce((sum, a) => {
        const records = a.records || [];
        const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
        return sum + (records.length > 0 ? (present / records.length) * 100 : 0);
      }, 0) / attendanceData.length);
    }

    // Outstanding fees from student-fees
    const totalAssigned = studentFeesData.reduce((sum, sf) => sum + (sf.totalAmount || 0), 0);
    const totalPaid = studentFeesData.reduce((sum, sf) => sum + (sf.paidAmount || 0), 0);
    const outstandingFees = totalAssigned - totalPaid;
    const collectionRate = totalAssigned > 0 ? Math.round((totalPaid / totalAssigned) * 100) : 0;

    // Fee type breakdown - map fee type IDs to names
    const feeTypeMap = {};
    feeTypesData.forEach(ft => {
      feeTypeMap[ft._id] = (ft.name || '').toLowerCase();
    });

    // Categories mapping
    const categories = {
      tuition: ['scolarit', 'tuition', 'inscription'],
      exam: ['examen', 'exam'],
      transport: ['transport'],
      library: ['biblioth', 'library'],
      lab: ['laboratoire', 'lab'],
      sport: ['sport'],
      insurance: ['assurance', 'insurance']
    };

    const categorize = (feeName) => {
      const name = feeName.toLowerCase();
      for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(k => name.includes(k))) return cat;
      }
      return 'other';
    };

    // For fee category stats: if dateRange, use filtered payments to compute collected per category
    const catStats = {};
    if (options.dateRange) {
      // Build studentFee → feeType category map
      const sfCatMap = {};
      studentFeesData.forEach(sf => {
        const ftName = feeTypeMap[sf.feeTypeId?._id || sf.feeTypeId] || '';
        sfCatMap[sf._id] = categorize(ftName);
      });
      // Sum filtered payments by category
      filteredPayments.forEach(p => {
        const sfId = p.studentFeeId?._id || p.studentFeeId;
        const cat = sfCatMap[sfId] || 'other';
        if (!catStats[cat]) catStats[cat] = { collected: 0, pending: 0, total: 0 };
        catStats[cat].collected += (p.amount || 0);
      });
      // Add totals from student fees for pending/total
      studentFeesData.forEach(sf => {
        const ftName = feeTypeMap[sf.feeTypeId?._id || sf.feeTypeId] || '';
        const cat = categorize(ftName);
        if (!catStats[cat]) catStats[cat] = { collected: 0, pending: 0, total: 0 };
        catStats[cat].total += (sf.totalAmount || 0);
        catStats[cat].pending += (sf.balance || 0);
      });
    } else {
      studentFeesData.forEach(sf => {
        const ftName = feeTypeMap[sf.feeTypeId?._id || sf.feeTypeId] || '';
        const cat = categorize(ftName);
        if (!catStats[cat]) catStats[cat] = { collected: 0, pending: 0, total: 0 };
        catStats[cat].collected += (sf.paidAmount || 0);
        catStats[cat].pending += (sf.balance || 0);
        catStats[cat].total += (sf.totalAmount || 0);
      });
    }

    const catRate = (cat) => {
      const s = catStats[cat];
      return s && s.total > 0 ? Math.round((s.collected / s.total) * 100) : 0;
    };

    // Build student-fee → fee-type name lookup
    const sfFeeTypeMap = {};
    studentFeesData.forEach(sf => {
      const ftName = feeTypeMap[sf.feeTypeId?._id || sf.feeTypeId] || '';
      // Capitalize first letter
      sfFeeTypeMap[sf._id] = feeTypesData.find(ft => ft._id === (sf.feeTypeId?._id || sf.feeTypeId))?.name || 'Fee';
    });

    // Recent transactions from payments (filtered)
    const recentTransactions = filteredPayments
      .sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt))
      .slice(0, 10)
      .map(p => ({
        id: p._id || p.id,
        receiptNumber: p.receiptNumber || '',
        studentName: p.studentId?.firstName
          ? `${p.studentId.firstName} ${p.studentId.lastName || ''}`
          : (p.studentId?.name || 'Unknown'),
        amount: p.amount || 0,
        paymentMethod: p.paymentMethod || 'Cash',
        feeType: sfFeeTypeMap[p.studentFeeId?._id || p.studentFeeId] || 'Fee',
        date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '',
        status: 'Completed'
      }));

    // Payment methods breakdown (filtered)
    const methodTotals = {};
    filteredPayments.forEach(p => {
      const method = p.paymentMethod || 'Cash';
      methodTotals[method] = (methodTotals[method] || 0) + (p.amount || 0);
    });
    const methodColors = { Cash: '#22c55e', 'Bank Transfer': '#3b82f6', 'Mobile Money': '#f59e0b', Check: '#8b5cf6', Card: '#ec4899' };
    const paymentMethods = Object.entries(methodTotals).map(([name, value]) => ({
      name, value, color: methodColors[name] || '#6b7280'
    }));

    // ---- Month-over-month change calculations ----
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const isThisMonth = (d) => { const dt = new Date(d); return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear; };
    const isLastMonth = (d) => { const dt = new Date(d); return dt.getMonth() === lastMonth && dt.getFullYear() === lastMonthYear; };

    // Revenue change (this month vs last month) — always use full paymentsData for change calculation
    const thisMonthRevenue = paymentsData.filter(p => isThisMonth(p.paymentDate || p.createdAt)).reduce((s, p) => s + (p.amount || 0), 0);
    const lastMonthRevenue = paymentsData.filter(p => isLastMonth(p.paymentDate || p.createdAt)).reduce((s, p) => s + (p.amount || 0), 0);
    const revenueChangePct = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : (thisMonthRevenue > 0 ? 100 : 0);

    // New students this month
    const newStudentsThisMonth = studentsData.filter(s => isThisMonth(s.admissionDate || s.createdAt)).length;
    const newStudentsLastMonth = studentsData.filter(s => isLastMonth(s.admissionDate || s.createdAt)).length;
    const studentsChangePct = newStudentsLastMonth > 0 ? Math.round(((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth) * 100) : (newStudentsThisMonth > 0 ? 100 : 0);

    // New teachers this month
    const newTeachersThisMonth = teachersData.filter(t => isThisMonth(t.joinDate || t.createdAt)).length;

    // Collection rate change (this month collections vs last month)
    const collectionRateChangePct = revenueChangePct;

    const fmtChange = (val) => val >= 0 ? `+${val}%` : `${val}%`;
    const fmtCount = (val) => val >= 0 ? `+${val}` : `${val}`;

    return {
      // Admin dashboard
      totalStudents,
      totalTeachers,
      totalClasses,
      totalParents,
      totalRevenue,
      attendanceRate,
      studentsChange: fmtChange(studentsChangePct),
      revenueChange: fmtChange(revenueChangePct),
      attendanceChange: fmtChange(attendanceRate > 0 ? Math.round((attendanceRate - 85) / 85 * 100) : 0),
      teachersChange: fmtCount(newTeachersThisMonth),

      // Finance dashboard
      totalCollections: totalRevenue,
      outstandingFees,
      pendingFees: outstandingFees,
      dailyRevenue,
      collectionRate,
      collectionsChange: fmtChange(revenueChangePct),
      outstandingChange: fmtChange(outstandingFees > 0 ? -Math.round((thisMonthRevenue / outstandingFees) * 100) : 0),
      dailyRevenueChange: fmtChange(revenueChangePct),
      collectionRateChange: fmtChange(collectionRateChangePct),

      // Finance overview
      pendingFeesChange: fmtChange(outstandingFees > 0 ? -Math.round((thisMonthRevenue / outstandingFees) * 100) : 0),
      newStudents: newStudentsThisMonth,

      // Fee type breakdown (finance-overview)
      tuitionCollected: catStats.tuition?.collected || 0,
      tuitionPending: catStats.tuition?.pending || 0,
      tuitionRate: catRate('tuition'),
      examCollected: catStats.exam?.collected || 0,
      examPending: catStats.exam?.pending || 0,
      examRate: catRate('exam'),
      transportCollected: catStats.transport?.collected || 0,
      transportPending: catStats.transport?.pending || 0,
      transportRate: catRate('transport'),
      libraryCollected: catStats.library?.collected || 0,
      libraryPending: catStats.library?.pending || 0,
      libraryRate: catRate('library'),

      // Embedded data for finance-overview
      recentTransactions,
      paymentMethods
    };
  },

  async getRevenue(year) {
    const response = await api.get('/payments', L);
    const payments = Array.isArray(response.data) ? response.data : [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Auto-detect year if no payments match the requested year
    let targetYear = year;
    const yearPayments = payments.filter(p => new Date(p.paymentDate || p.createdAt).getFullYear() === targetYear);
    if (yearPayments.length === 0 && payments.length > 0) {
      const yearCounts = {};
      payments.forEach(p => {
        const y = new Date(p.paymentDate || p.createdAt).getFullYear();
        yearCounts[y] = (yearCounts[y] || 0) + 1;
      });
      targetYear = parseInt(Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0]?.[0]) || year;
    }

    return months.map((month, index) => {
      const monthPayments = payments.filter(p => {
        const date = new Date(p.paymentDate || p.createdAt);
        return date.getFullYear() === targetYear && date.getMonth() === index;
      });
      const revenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return { month, revenue };
    });
  },

  async getRevenueByCategory(year) {
    const [paymentsRes, studentFeesRes, feeTypesRes] = await Promise.allSettled([
      api.get('/payments', L),
      api.get('/student-fees', L),
      api.get('/fee-types', L)
    ]);

    const payments = paymentsRes.status === 'fulfilled' ? (Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : []) : [];
    const studentFees = studentFeesRes.status === 'fulfilled' ? (Array.isArray(studentFeesRes.value.data) ? studentFeesRes.value.data : []) : [];
    const feeTypesData = feeTypesRes.status === 'fulfilled' ? (Array.isArray(feeTypesRes.value.data) ? feeTypesRes.value.data : []) : [];

    // Build fee type category map
    const feeTypeMap = {};
    feeTypesData.forEach(ft => { feeTypeMap[ft._id] = (ft.name || '').toLowerCase(); });

    const categories = {
      tuition: ['scolarit', 'tuition', 'inscription'],
      exam: ['examen', 'exam'],
      transport: ['transport']
    };
    const categorize = (name) => {
      const n = name.toLowerCase();
      for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(k => n.includes(k))) return cat;
      }
      return 'other';
    };

    // Map studentFeeId → fee type category
    const sfCategoryMap = {};
    studentFees.forEach(sf => {
      const ftName = feeTypeMap[sf.feeTypeId?._id || sf.feeTypeId] || '';
      sfCategoryMap[sf._id] = categorize(ftName);
    });

    // Auto-detect year
    let targetYear = year;
    const yearPayments = payments.filter(p => new Date(p.paymentDate || p.createdAt).getFullYear() === targetYear);
    if (yearPayments.length === 0 && payments.length > 0) {
      const yearCounts = {};
      payments.forEach(p => {
        const y = new Date(p.paymentDate || p.createdAt).getFullYear();
        yearCounts[y] = (yearCounts[y] || 0) + 1;
      });
      targetYear = parseInt(Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0]?.[0]) || year;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const monthPayments = payments.filter(p => {
        const date = new Date(p.paymentDate || p.createdAt);
        return date.getFullYear() === targetYear && date.getMonth() === index;
      });
      const result = { month, tuition: 0, exam: 0, transport: 0 };
      monthPayments.forEach(p => {
        const cat = sfCategoryMap[p.studentFeeId?._id || p.studentFeeId] || 'other';
        if (result[cat] !== undefined) result[cat] += (p.amount || 0);
        else result.tuition += (p.amount || 0); // fallback to tuition
      });
      return result;
    });
  },

  async getRevenueCollectedVsPending(year) {
    const [paymentsRes, studentFeesRes] = await Promise.allSettled([
      api.get('/payments', L),
      api.get('/student-fees', L)
    ]);

    const payments = paymentsRes.status === 'fulfilled' ? (Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : []) : [];
    const studentFees = studentFeesRes.status === 'fulfilled' ? (Array.isArray(studentFeesRes.value.data) ? studentFeesRes.value.data : []) : [];

    const totalExpected = studentFees.reduce((sum, sf) => sum + (sf.totalAmount || 0), 0);
    const totalPaid = studentFees.reduce((sum, sf) => sum + (sf.paidAmount || 0), 0);
    const totalOutstanding = totalExpected - totalPaid;

    // Auto-detect year
    let targetYear = year;
    const yearPayments = payments.filter(p => new Date(p.paymentDate || p.createdAt).getFullYear() === targetYear);
    if (yearPayments.length === 0 && payments.length > 0) {
      const yearCounts = {};
      payments.forEach(p => {
        const y = new Date(p.paymentDate || p.createdAt).getFullYear();
        yearCounts[y] = (yearCounts[y] || 0) + 1;
      });
      targetYear = parseInt(Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0]?.[0]) || year;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Count how many months have payment activity to distribute pending logically
    const activeMonths = new Set();
    payments.forEach(p => {
      const d = new Date(p.paymentDate || p.createdAt);
      if (d.getFullYear() === targetYear) activeMonths.add(d.getMonth());
    });
    const numActiveMonths = Math.max(activeMonths.size, 1);
    const monthlyTarget = totalExpected / numActiveMonths;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      // Only show data for months up to current month (no future months)
      const isFutureMonth = targetYear === currentYear && index > currentMonth;
      const hadActivity = activeMonths.has(index);

      const monthPayments = payments.filter(p => {
        const date = new Date(p.paymentDate || p.createdAt);
        return date.getFullYear() === targetYear && date.getMonth() === index;
      });
      const collected = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Pending: only for active months, represents gap between target and collected
      let pending = 0;
      if (!isFutureMonth && hadActivity) {
        pending = Math.max(0, Math.round(monthlyTarget - collected));
      }

      return { month, collected, pending };
    });
  },

  async getDemographics() {
    const response = await api.get('/students', L);
    const students = Array.isArray(response.data) ? response.data : [];
    const male = students.filter(s => s.gender === 'Male').length;
    const female = students.filter(s => s.gender === 'Female').length;
    const other = students.filter(s => s.gender === 'Other').length;

    return [
      { name: 'Male', value: male, color: '#3b82f6' },
      { name: 'Female', value: female, color: '#ec4899' },
      { name: 'Other', value: other, color: '#8b5cf6' }
    ];
  },

  async getAttendance(period = 'week') {
    const response = await api.get('/attendance', L);
    const attendanceData = Array.isArray(response.data) ? response.data : [];
    const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    // Get last week's attendance grouped by day of week
    const dayStats = {};
    days.forEach(d => { dayStats[d] = { present: 0, absent: 0, total: 0 }; });

    // Sort by date desc, take recent records
    const sorted = attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 50); // Last 50 records

    recent.forEach(record => {
      const dt = new Date(record.date);
      const dayName = dayMap[dt.getDay()];
      if (!dayStats[dayName]) return;

      const records = record.records || [];
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const absent = records.filter(r => r.status === 'absent').length;
      dayStats[dayName].present += present;
      dayStats[dayName].absent += absent;
      dayStats[dayName].total += records.length;
    });

    return days.map(day => {
      const s = dayStats[day];
      const total = s.total || 1;
      return {
        day,
        present: Math.round((s.present / total) * 100),
        absent: Math.round((s.absent / total) * 100)
      };
    });
  },

  async getRecentActivities(limit = 10) {
    const response = await api.get('/notices', L);
    const notices = Array.isArray(response.data) ? response.data : [];

    const typeMap = { 'High': 'notice', 'Normal': 'system', 'Low': 'info' };

    return notices.slice(0, limit).map(notice => ({
      id: notice._id || notice.id,
      type: typeMap[notice.priority] || 'info',
      title: notice.title || 'Notification',
      description: notice.content ? notice.content.substring(0, 100) + '...' : (notice.target ? `Target: ${notice.target}` : ''),
      timestamp: notice.createdAt || notice.publishDate || new Date().toISOString()
    }));
  },

  async getPaymentMethods(options = {}) {
    const response = await api.get('/payments', L);
    let payments = Array.isArray(response.data) ? response.data : [];

    // Filter by date range if provided
    if (options.dateRange) {
      const { from, to } = options.dateRange;
      payments = payments.filter(p => {
        const d = new Date(p.paymentDate || p.createdAt);
        return d >= from && d <= to;
      });
    }

    const methods = {};
    payments.forEach(p => {
      const method = p.paymentMethod || 'Cash';
      methods[method] = (methods[method] || 0) + (p.amount || 0);
    });

    const colors = { Cash: '#22c55e', 'Bank Transfer': '#3b82f6', 'Mobile Money': '#f59e0b', Check: '#8b5cf6', Card: '#ec4899' };

    return Object.entries(methods).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#6b7280'
    }));
  },

  async getRecentTransactions(limit = 5, options = {}) {
    const [paymentsRes, studentFeesRes, feeTypesRes] = await Promise.allSettled([
      api.get('/payments', L),
      api.get('/student-fees', L),
      api.get('/fee-types', L)
    ]);

    let payments = paymentsRes.status === 'fulfilled' ? (Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : []) : [];
    const studentFees = studentFeesRes.status === 'fulfilled' ? (Array.isArray(studentFeesRes.value.data) ? studentFeesRes.value.data : []) : [];
    const feeTypesData = feeTypesRes.status === 'fulfilled' ? (Array.isArray(feeTypesRes.value.data) ? feeTypesRes.value.data : []) : [];

    // Filter by date range if provided
    if (options.dateRange) {
      const { from, to } = options.dateRange;
      payments = payments.filter(p => {
        const d = new Date(p.paymentDate || p.createdAt);
        return d >= from && d <= to;
      });
    }

    // Build lookup maps
    const feeTypeNameMap = {};
    feeTypesData.forEach(ft => { feeTypeNameMap[ft._id] = ft.name || 'Fee'; });

    const sfFeeTypeMap = {};
    studentFees.forEach(sf => {
      sfFeeTypeMap[sf._id] = feeTypeNameMap[sf.feeTypeId?._id || sf.feeTypeId] || 'Fee';
    });

    return payments
      .sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt))
      .slice(0, limit)
      .map(payment => ({
        id: payment._id || payment.id,
        receiptNumber: payment.receiptNumber || '',
        studentName: payment.studentId?.firstName
          ? `${payment.studentId.firstName} ${payment.studentId.lastName || ''}`
          : (payment.studentId?.name || 'Unknown'),
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || 'Cash',
        feeType: sfFeeTypeMap[payment.studentFeeId?._id || payment.studentFeeId] || 'Fee',
        date: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '',
        status: 'Completed'
      }));
  },

  async getFeeTypes() {
    const response = await api.get('/fee-types', L);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getClassRevenue(options = {}) {
    const [classesRes, studentFeesRes, paymentsRes] = await Promise.allSettled([
      api.get('/classes', L),
      api.get('/student-fees', L),
      api.get('/payments', L)
    ]);

    const classes = classesRes.status === 'fulfilled' ? classesRes.value.data : [];
    const studentFees = studentFeesRes.status === 'fulfilled' ? studentFeesRes.value.data : [];
    let payments = paymentsRes.status === 'fulfilled' ? (Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : []) : [];

    if (!Array.isArray(classes)) return [];

    // Filter payments by date range if provided
    if (options.dateRange) {
      const { from, to } = options.dateRange;
      payments = payments.filter(p => {
        const d = new Date(p.paymentDate || p.createdAt);
        return d >= from && d <= to;
      });
    }

    // Build studentFee → classId lookup
    const sfClassMap = {};
    if (Array.isArray(studentFees)) {
      studentFees.forEach(sf => {
        sfClassMap[sf._id] = sf.studentId?.classId?._id || sf.studentId?.classId || null;
      });
    }

    return classes.map(cls => {
      const classFees = Array.isArray(studentFees)
        ? studentFees.filter(sf => {
          return sf.studentId?.classId === cls._id || sf.studentId?.classId?._id === cls._id;
        })
        : [];

      let collected;
      if (options.dateRange) {
        // Sum payments that belong to this class's student fees
        const classFeeIds = new Set(classFees.map(sf => sf._id?.toString()));
        collected = payments
          .filter(p => classFeeIds.has((p.studentFeeId?._id || p.studentFeeId)?.toString()))
          .reduce((sum, p) => sum + (p.amount || 0), 0);
      } else {
        // No date filter: use cumulative paidAmount
        collected = classFees.reduce((sum, sf) => sum + (sf.paidAmount || 0), 0);
      }

      const totalExpected = classFees.reduce((sum, sf) => sum + (sf.totalAmount || 0), 0);
      const outstanding = Math.max(0, totalExpected - collected);
      const collectionRate = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0;

      return {
        className: cls.name || 'Unknown',
        name: cls.name || 'Unknown',
        students: cls.totalStudents || 0,
        collected,
        outstanding,
        collectionRate,
        revenue: collected
      };
    });
  },

  async getParentDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const parentId = user.profileId;

    const [childrenRes, noticesRes] = await Promise.allSettled([
      // Fetch students that have this parent ID
      parentId ? api.get('/students', { params: { parentId, limit: 50 } }) : Promise.resolve({ data: [] }),
      api.get('/notices', { params: { limit: 20 } })
    ]);

    let childrenData = [];
    if (childrenRes.status === 'fulfilled') {
      const response = childrenRes.value.data;
      // Handle both direct array and paginated response {data: [...]} or {students: [...]}
      childrenData = Array.isArray(response) ? response
        : (response?.data || response?.students || []);
    }

    const notices = noticesRes.status === 'fulfilled' ? noticesRes.value.data : [];

    // Transform children for dashboard display
    const children = childrenData.map(child => ({
      id: child._id,
      name: child.name || 'Unknown',
      class: child.classId?.name || 'N/A',
      section: child.sectionId?.name || '',
      rollNumber: child.rollNumber || '-',
      attendanceRate: 88,
      overallGrade: 'B+',
      photo: child.photo || null
    }));

    // Transform notifications
    const notifications = Array.isArray(notices) ? notices.slice(0, 5).map(n => ({
      id: n._id,
      title: n.title,
      message: n.content ? n.content.substring(0, 100) + '...' : '',
      type: n.priority === 'High' ? 'urgent' : 'info',
      time: n.publishDate || n.createdAt
    })) : [];

    return {
      children,
      notifications,
      activities: [],
      events: []
    };
  },

  async getStudentDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user.profileId;

    const [resultsRes, noticesRes, attendanceRes] = await Promise.allSettled([
      studentId ? api.get(`/students/${studentId}/results`) : Promise.resolve({ data: [] }),
      api.get('/notices', { params: { target: 'Students', limit: 1000 } }),
      studentId ? api.get(`/students/${studentId}/attendance`) : Promise.resolve({ data: [] })
    ]);

    const results = resultsRes.status === 'fulfilled' ? resultsRes.value.data : [];
    const notices = noticesRes.status === 'fulfilled' ? noticesRes.value.data : [];
    const attendance = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data : [];

    return {
      results: Array.isArray(results) ? results : [],
      notices: Array.isArray(notices) ? notices.slice(0, 5) : [],
      attendance: Array.isArray(attendance) ? attendance : [],
      stats: {
        totalSubjects: Array.isArray(results) ? new Set(results.map(r => r.subjectId)).size : 0,
        averageScore: Array.isArray(results) && results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length)
          : 0,
        attendanceRate: 0
      }
    };
  },

  async getTeacherDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const teacherId = user.profileId;

    const [classesRes, noticesRes, examsRes] = await Promise.allSettled([
      api.get('/classes', L),
      api.get('/notices', { params: { target: 'Teachers', limit: 1000 } }),
      api.get('/exams', L)
    ]);

    const classes = classesRes.status === 'fulfilled' ? classesRes.value.data : [];
    const notices = noticesRes.status === 'fulfilled' ? noticesRes.value.data : [];
    const exams = examsRes.status === 'fulfilled' ? examsRes.value.data : [];

    return {
      classes: Array.isArray(classes) ? classes : [],
      notices: Array.isArray(notices) ? notices.slice(0, 5) : [],
      exams: Array.isArray(exams) ? exams : [],
      stats: {
        totalClasses: Array.isArray(classes) ? classes.length : 0,
        totalExams: Array.isArray(exams) ? exams.length : 0,
        upcomingExams: Array.isArray(exams) ? exams.filter(e => e.status === 'upcoming').length : 0
      }
    };
  }
};

export default dashboardService;
