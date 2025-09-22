import Faculty from './Faculty';
import Department from './Department';
import User from './User';
import Courses from './Courses';
import Shifts from './Shifts';
import Class from './Class';

// Faculty - Department associations
Faculty.hasMany(Department, {
  foreignKey: 'facultyId',
  as: 'departments'
});

Department.belongsTo(Faculty, {
  foreignKey: 'facultyId',
  as: 'faculty'
});

// You can add more associations here as needed
// For example, if you have other relationships:
// Faculty.hasMany(User, { foreignKey: 'facultyId', as: 'users' });
// Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });

export {
  Faculty,
  Department,
  User,
  Courses,
  Shifts,
  Class
};