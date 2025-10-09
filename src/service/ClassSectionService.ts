import ClassSection from '../models/ClassSection';
import Class from '../models/Class';
import { Op } from 'sequelize';

class ClassSectionService {
    // Create a new class section
    async createSection(class_id: number, sectionName: string, createdBy: string) {
        try {
            // Validate that the class exists and is active
            const classInstance = await Class.findByPk(class_id);
            if (!classInstance) {
                throw new Error('Class not found');
            }
            if (!classInstance.isActive) {
                throw new Error('Cannot create section under inactive class');
            }

            // Check if section name already exists under this class
            const existingSection = await ClassSection.findOne({
                where: {
                    class_id: class_id,
                    sectionName: sectionName.trim(),
                    isActive: true
                }
            });
            if (existingSection) {
                throw new Error('Section name already exists under this class');
            }

            const newSection = await ClassSection.create({
                class_id: class_id,
                sectionName: sectionName.trim(),
                createdBy: createdBy,
                isActive: true
            });

            return newSection;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating section: ${error.message}`);
            } else {
                throw new Error('Error creating section: Unknown error');
            }
        }
    }

    // Get all active sections for a specific class
    async getSectionsByClassId(class_id: number) {
        try {
            const sections = await ClassSection.findAll({
                where: {
                    class_id: class_id,
                    isActive: true
                },
                include: [
                    {
                        model: Class,
                        as: 'class',
                        attributes: ['id', 'className']
                    }
                ]
            });
            return sections;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching sections: ${error.message}`);
            } else {
                throw new Error('Error fetching sections: Unknown error');
            }
        }
    }

    // Get all active sections
    async getAllActiveSections() {
        try {
            const sections = await ClassSection.findAll({
                where: { isActive: true },
                include: [
                    {
                        model: Class,
                        as: 'class',
                        attributes: ['id', 'className']
                    }
                ]
            });
            return sections;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching sections: ${error.message}`);
            } else {
                throw new Error('Error fetching sections: Unknown error');
            }
        }
    }

    // Get section by ID
    async getSectionById(id: number) {
        try {
            const section = await ClassSection.findByPk(id, {
                include: [
                    {
                        model: Class,
                        as: 'class',
                        attributes: ['id', 'className']
                    }
                ]
            });
            if (!section) {
                throw new Error('Section not found');
            }
            return section;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching section: ${error.message}`);
            } else {
                throw new Error('Error fetching section: Unknown error');
            }
        }
    }

    // Update section name
    async updateSectionName(id: number, sectionName: string, updatedBy: string) {
        try {
            const section = await ClassSection.findByPk(id);
            if (!section) {
                throw new Error('Section not found');
            }

            // Check if new section name already exists under the same class
            const existingSection = await ClassSection.findOne({
                where: {
                    class_id: section.class_id,
                    sectionName: sectionName.trim(),
                    isActive: true,
                    id: { [Op.ne]: id } // Exclude current section
                }
            });
            if (existingSection) {
                throw new Error('Section name already exists under this class');
            }

            section.sectionName = sectionName.trim();
            section.updatedBy = updatedBy;
            section.updatedAt = new Date();
            await section.save();

            return section;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating section name: ${error.message}`);
            } else {
                throw new Error('Error updating section name: Unknown error');
            }
        }
    }

    // Update section status (activate/deactivate)
    async updateSectionStatus(id: number, isActive: boolean, updatedBy: string) {
        try {
            const section = await ClassSection.findByPk(id);
            if (!section) {
                throw new Error('Section not found');
            }

            section.isActive = isActive;
            section.updatedBy = updatedBy;
            section.updatedAt = new Date();
            await section.save();

            return section;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating section status: ${error.message}`);
            } else {
                throw new Error('Error updating section status: Unknown error');
            }
        }
    }

    // Soft delete section (set isActive to false)
    async deleteSection(id: number, updatedBy: string) {
        try {
            const section = await ClassSection.findByPk(id);
            if (!section) {
                throw new Error('Section not found');
            }

            section.isActive = false;
            section.updatedBy = updatedBy;
            section.updatedAt = new Date();
            await section.save();

            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error deleting section: ${error.message}`);
            } else {
                throw new Error('Error deleting section: Unknown error');
            }
        }
    }
}

export default new ClassSectionService();