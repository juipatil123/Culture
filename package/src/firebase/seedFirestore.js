import { db } from './firebaseConfig';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { adminData } from '../data/mockData';

const BASE_COLLECTION = 'CULTUREDB';

/**
 * Utility to seed Firestore with initial mock data
 */
export const seedFirestore = async () => {
    console.log('🌱 Starting Firestore Seeding...');
    const batch = writeBatch(db);

    try {
        // 1. Seed Project Managers
        const pmCol = collection(db, BASE_COLLECTION, 'PROJECTMANAGERS', 'items');
        adminData.projectManagers.forEach(pm => {
            const pmRef = doc(pmCol, pm.id);
            batch.set(pmRef, {
                name: pm.name,
                email: pm.email,
                phone: pm.phone,
                department: pm.department,
                joinDate: pm.joinDate,
                role: 'project-manager',
                createdAt: new Date().toISOString()
            });

            // 2. Seed Team Members (under each PM)
            const memberCol = collection(db, BASE_COLLECTION, 'TEAMMEMBERS', 'items');
            pm.teamMembers.forEach(member => {
                const memberRef = doc(memberCol, member.id);
                batch.set(memberRef, {
                    ...member,
                    pmId: pm.id,
                    pmName: pm.name,
                    role: 'employee',
                    createdAt: new Date().toISOString()
                });
            });
        });

        // 3. Seed some dummy Projects
        const projectCol = collection(db, BASE_COLLECTION, 'PROJECTS', 'items');
        const projects = [
            { id: 'p1', name: 'E-commerce Platform', clientName: 'Global Shop', projectCost: 50000, progress: 45, status: 'On Track' },
            { id: 'p2', name: 'Mobile App Redesign', clientName: 'TechCorp', projectCost: 35000, progress: 90, status: 'On Track' },
            { id: 'p3', name: 'Cloud Infrastructure', clientName: 'DataSafe', projectCost: 75000, progress: 15, status: 'At Risk' }
        ];

        projects.forEach(proj => {
            const projRef = doc(projectCol, proj.id);
            batch.set(projRef, {
                ...proj,
                createdAt: new Date().toISOString()
            });
        });

        await batch.commit();
        console.log('✅ Firestore Seeding Completed!');
        return { success: true, message: 'Seeding completed successfully' };
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        return { success: false, message: error.message };
    }
};
