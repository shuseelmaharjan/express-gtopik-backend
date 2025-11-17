import Faculty from './Faculty';
import Department from './Department';
import User from './User';
import Courses from './Courses';
import Shifts from './Shifts';
import Class from './Class';
import UserSession from './UserSession';
import Document from './Documents';
import ClassSection from './ClassSection';
import CourseCost from './CourseCost';
import StudentEnrollment from './StudentEnrollment';
import Gallery from './Gallery';
import GalleryGroup from './GalleryGroup';
import FeeRule from './FeeCategory';

// Faculty - Department associations
Faculty.hasMany(Department, {
  foreignKey: 'facultyId',
  as: 'departments'
});

Department.belongsTo(Faculty, {
  foreignKey: 'facultyId',
  as: 'faculty'
});

// User - UserSession associations
User.hasMany(UserSession, {
  foreignKey: 'userId',
  as: 'sessions'
});

UserSession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User - Document associations
User.hasMany(Document, {
  foreignKey: 'user_id',
  as: 'documents'
});

Document.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Class - Faculty associations
Class.belongsTo(Faculty, {
  foreignKey: 'faculty_id',
  as: 'faculty'
});

Faculty.hasMany(Class, {
  foreignKey: 'faculty_id',
  as: 'classes'
});

// Class - Department associations
Class.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

Department.hasMany(Class, {
  foreignKey: 'department_id',
  as: 'classes'
});

// Class - ClassSection associations
Class.hasMany(ClassSection, {
  foreignKey: 'class_id',
  as: 'sections'
});

ClassSection.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'class'
});

// Course - Department associations
Courses.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

Department.hasMany(Courses, {
  foreignKey: 'department_id',
  as: 'courses'
});

// Course - CourseCost associations
Courses.hasMany(CourseCost, {
  foreignKey: 'course_id',
  as: 'costs'
});

CourseCost.belongsTo(Courses, {
  foreignKey: 'course_id',
  as: 'course'
});

// StudentEnrollment associations
StudentEnrollment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

StudentEnrollment.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

StudentEnrollment.belongsTo(Courses, {
  foreignKey: 'course_id',
  as: 'course'
});

StudentEnrollment.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'class'
});

StudentEnrollment.belongsTo(ClassSection, {
  foreignKey: 'section_id',
  as: 'section'
});

User.hasMany(StudentEnrollment, {
  foreignKey: 'user_id',
  as: 'enrollments'
});

Department.hasMany(StudentEnrollment, {
  foreignKey: 'department_id',
  as: 'enrollments'
});

Courses.hasMany(StudentEnrollment, {
  foreignKey: 'course_id',
  as: 'enrollments'
});

Class.hasMany(StudentEnrollment, {
  foreignKey: 'class_id',
  as: 'enrollments'
});

ClassSection.hasMany(StudentEnrollment, {
  foreignKey: 'section_id',
  as: 'enrollments'
});

// Gallery - GalleryGroup associations
GalleryGroup.hasMany(Gallery, {
  foreignKey: 'imageGroup',
  as: 'galleries'
});

Gallery.belongsTo(GalleryGroup, {
  foreignKey: 'imageGroup',
  as: 'galleryGroup'
});

// FeeRule associations - only section_id needed due to hierarchy
FeeRule.belongsTo(ClassSection, {
  foreignKey: 'section_id',
  as: 'section'
});

ClassSection.hasMany(FeeRule, {
  foreignKey: 'section_id',
  as: 'feeRules'
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
  Class,
  UserSession,
  Document,
  ClassSection,
  CourseCost,
  StudentEnrollment,
  Gallery,
  GalleryGroup,
  FeeRule
};