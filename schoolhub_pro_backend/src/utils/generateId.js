// Generate unique IDs for different entities
// Format: PREFIX + 3-digit number (e.g., STU001, TCH001)

const generateId = async (Model, prefix) => {
  const count = await Model.countDocuments();
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
};

// Specific generators for each entity type
const generateStudentId = async (Model) => generateId(Model, 'STU');
const generateTeacherId = async (Model) => generateId(Model, 'TCH');
const generateParentId = async (Model) => generateId(Model, 'PAR');
const generateAdminId = async (Model) => generateId(Model, 'ADM');

module.exports = {
  generateId,
  generateStudentId,
  generateTeacherId,
  generateParentId,
  generateAdminId
};
