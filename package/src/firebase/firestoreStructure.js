/**
 * Firestore Database Structure Definition for CULTUREDB
 * 
 * Main Collection: CULTUREDB
 * 
 * This file defines the logical structure of each sub-collection based on the 
 * application's current data requirements and modal structures.
 */

export const FIRESTORE_STRUCTURE = {
    // 1. ADMINS: System administrators with full access
    ADMINS: {
        uid: "string",           // Firebase Auth UID
        name: "string",
        email: "string",
        phone: "string",
        role: "admin",
        department: "Management",
        createdAt: "timestamp",
        lastLogin: "timestamp",
        status: "active"         // active, inactive
    },

    // 2. CUSTOMERROLES: Custom permission sets/roles
    CUSTOMERROLES: {
        name: "string",          // e.g., "Full Stack Developer"
        description: "string",
        color: "string",         // primary, success, danger, etc.
        icon: "string",          // FontAwesome class
        permissions: ["string"], // Array of permission IDs
        createdAt: "timestamp"
    },

    // 3. DAILYWORKS: Daily logs and trackings for employees/interns
    DAILYWORKS: {
        userId: "string",        // Reference to TEAMMEMBERS/TL id
        userName: "string",
        date: "string",          // YYYY-MM-DD
        tasks: [{
            taskId: "string",
            taskTitle: "string",
            description: "string",
            hoursSpent: "number",
            status: "string",      // in-progress, completed
            progress: "number"
        }],
        overallRating: "number", // Assigned by TL/PM
        feedback: "string",
        createdAt: "timestamp"
    },

    // 4. POINTSSCHEMES: Gamification rules
    POINTSSCHEMES: {
        name: "string",
        points: "number",
        description: "string",
        category: "string",      // Performance, Attendance, Business, etc.
        createdAt: "timestamp"
    },

    // 5. PROJECTMANAGERS: Users with Project Manager role
    PROJECTMANAGERS: {
        uid: "string",
        name: "string",
        email: "string",
        phone: "string",
        role: "project-manager",
        department: "string",
        assignedProjects: ["string"], // Array of project IDs
        performance: "number",
        createdAt: "timestamp",
        status: "active"
    },

    // 6. TEAMLEADERS: Users with Team Leader role
    TEAMLEADERS: {
        uid: "string",
        name: "string",
        email: "string",
        phone: "string",
        role: "team-leader",
        department: "string",
        assignedProject: "string",    // Project name/ID
        projectManagerId: "string",   // Reporting PM
        teamMembersCount: "number",
        createdAt: "timestamp",
        status: "active"
    },

    // 7. PROJECTS: Main project entities
    PROJECTS: {
        name: "string",
        clientName: "string",
        projectManager: "string",     // PM Name
        projectManagerId: "string",   // PM UID
        projectCost: "number",
        advancePayment: "number",
        startDate: "timestamp",
        endDate: "timestamp",
        description: "string",
        projectStatus: "string",      // assigned, on-track, at-risk, delayed, completed
        progress: "number",           // 0-100
        assignedMembers: ["string"],  // Array of Member Names/IDs
        createdAt: "timestamp"
    },

    // 8. TASK: Task entities assigned within projects
    TASK: {
        title: "string",
        description: "string",
        projectId: "string",
        projectName: "string",
        status: "string",             // assigned, pending, in-progress, on-hold, completed
        priority: "string",           // low, medium, high, urgent
        dueDate: "timestamp",
        assignedBy: "string",         // Name/ID of PM/TL
        assignedByRole: "string",
        assignedTo: "string",         // For legacy/quick view
        assignedMembers: ["string"],  // Array of member names/IDs
        notes: [{                     // Comments/Updates
            text: "string",
            author: "string",
            timestamp: "timestamp"
        }],
        completedAt: "timestamp",
        createdAt: "timestamp"
    },

    // 9. TEAMMEMBERS: Employees and Interns
    TEAMMEMBERS: {
        uid: "string",
        name: "string",
        email: "string",
        phone: "string",
        role: "string",               // employee, intern
        department: "string",
        teamLeaderId: "string",       // Reporting TL
        teamLeaderName: "string",
        assignedProject: "string",
        pointsBalance: "number",
        performance: "number",
        createdAt: "timestamp",
        status: "active"
    }
};
