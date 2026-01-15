// Mock data for admin panel
export const adminData = {
  projectManagers: [
    {
      id: 'pm1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      joinDate: '2020-01-15',
      teamMembers: [
        {
          id: 'emp1',
          name: 'Michael Chen',
          role: 'Senior Developer',
          email: 'michael.chen@company.com',
          attendance: {
            present: 22,
            absent: 2,
            late: 1,
            percentage: 88
          },
          meetingAttendance: {
            attended: 18,
            missed: 2,
            percentage: 90
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:00 AM', checkOut: '06:15 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '09:05 AM', checkOut: '06:00 PM' },
            { date: '2024-10-26', status: 'late', checkIn: '09:45 AM', checkOut: '06:30 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '08:55 AM', checkOut: '06:10 PM' },
            { date: '2024-10-24', status: 'absent', checkIn: '-', checkOut: '-' }
          ],
          dailyPerformance: {
            overallRating: 4.2,
            tasksCompleted: 85,
            codeQuality: 4.5,
            collaboration: 4.0,
            innovation: 4.3,
            recentScores: [
              { date: '2024-10-28', score: 4.5, tasksCompleted: 8, feedback: 'Excellent work on API optimization' },
              { date: '2024-10-27', score: 4.0, tasksCompleted: 6, feedback: 'Good progress on frontend components' },
              { date: '2024-10-26', score: 3.8, tasksCompleted: 5, feedback: 'Late arrival affected morning productivity' },
              { date: '2024-10-25', score: 4.2, tasksCompleted: 7, feedback: 'Strong debugging skills demonstrated' },
              { date: '2024-10-24', score: 0, tasksCompleted: 0, feedback: 'Absent - sick leave' }
            ]
          },
          projectUpdates: [
            { 
              date: '2024-10-28', 
              project: 'E-commerce Platform', 
              status: 'In Progress', 
              progress: 75, 
              update: 'Completed payment gateway integration, working on order management system',
              priority: 'high'
            },
            { 
              date: '2024-10-26', 
              project: 'Mobile App Redesign', 
              status: 'Completed', 
              progress: 100, 
              update: 'Successfully delivered new UI components with improved user experience',
              priority: 'medium'
            },
            { 
              date: '2024-10-24', 
              project: 'API Documentation', 
              status: 'On Hold', 
              progress: 60, 
              update: 'Waiting for backend team to finalize endpoint specifications',
              priority: 'low'
            },
            { 
              date: '2024-10-23', 
              project: 'New Feature Planning', 
              status: 'Not Started', 
              progress: 0, 
              update: 'Project assigned but not yet started - waiting for requirements',
              priority: 'medium'
            }
          ]
        },
        {
          id: 'emp2',
          name: 'Emily Rodriguez',
          role: 'UI/UX Designer',
          email: 'emily.rodriguez@company.com',
          attendance: {
            present: 24,
            absent: 1,
            late: 0,
            percentage: 96
          },
          meetingAttendance: {
            attended: 19,
            missed: 1,
            percentage: 95
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '08:50 AM', checkOut: '06:00 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '09:00 AM', checkOut: '06:05 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '08:55 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '08:58 AM', checkOut: '06:10 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.6,
            tasksCompleted: 92,
            codeQuality: 4.8,
            collaboration: 4.7,
            innovation: 4.4,
            recentScores: [
              { date: '2024-10-28', score: 4.8, tasksCompleted: 9, feedback: 'Outstanding UI designs for new dashboard' },
              { date: '2024-10-27', score: 4.5, tasksCompleted: 8, feedback: 'Great user research insights provided' },
              { date: '2024-10-26', score: 4.6, tasksCompleted: 7, feedback: 'Excellent wireframes delivered on time' },
              { date: '2024-10-25', score: 4.4, tasksCompleted: 8, feedback: 'Good collaboration with development team' },
              { date: '2024-10-24', score: 4.7, tasksCompleted: 9, feedback: 'Innovative design solutions implemented' }
            ]
          },
          projectUpdates: [
            { 
              date: '2024-10-28', 
              project: 'Dashboard Redesign', 
              status: 'In Progress', 
              progress: 85, 
              update: 'Completed user interface mockups, working on interactive prototypes',
              priority: 'high'
            },
            { 
              date: '2024-10-27', 
              project: 'User Experience Audit', 
              status: 'Completed', 
              progress: 100, 
              update: 'Delivered comprehensive UX audit report with actionable recommendations',
              priority: 'medium'
            },
            { 
              date: '2024-10-25', 
              project: 'Design System Update', 
              status: 'In Progress', 
              progress: 70, 
              update: 'Updated component library with new design tokens and guidelines',
              priority: 'medium'
            }
          ]
        },
        {
          id: 'emp3',
          name: 'David Kim',
          role: 'Backend Developer',
          email: 'david.kim@company.com',
          attendance: {
            present: 21,
            absent: 3,
            late: 1,
            percentage: 84
          },
          meetingAttendance: {
            attended: 17,
            missed: 3,
            percentage: 85
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:10 AM', checkOut: '06:20 PM' },
            { date: '2024-10-27', status: 'absent', checkIn: '-', checkOut: '-' },
            { date: '2024-10-26', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'late', checkIn: '10:15 AM', checkOut: '06:45 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '09:05 AM', checkOut: '06:00 PM' }
          ],
          dailyPerformance: {
            overallRating: 3.9,
            tasksCompleted: 78,
            codeQuality: 4.2,
            collaboration: 3.5,
            innovation: 4.0,
            recentScores: [
              { date: '2024-10-28', score: 4.1, tasksCompleted: 7, feedback: 'Good database optimization work' },
              { date: '2024-10-27', score: 0, tasksCompleted: 0, feedback: 'Absent - personal emergency' },
              { date: '2024-10-26', score: 4.0, tasksCompleted: 6, feedback: 'Solid API development progress' },
              { date: '2024-10-25', score: 3.5, tasksCompleted: 4, feedback: 'Late arrival impacted team standup' },
              { date: '2024-10-24', score: 4.2, tasksCompleted: 8, feedback: 'Excellent server-side implementation' }
            ]
          },
          projectUpdates: [
            { 
              date: '2024-10-28', 
              project: 'Database Migration', 
              status: 'In Progress', 
              progress: 60, 
              update: 'Completed schema updates, working on data migration scripts',
              priority: 'high'
            },
            { 
              date: '2024-10-26', 
              project: 'API Performance Optimization', 
              status: 'In Progress', 
              progress: 80, 
              update: 'Implemented caching layer, reduced response time by 40%',
              priority: 'medium'
            },
            { 
              date: '2024-10-24', 
              project: 'Security Audit Implementation', 
              status: 'Completed', 
              progress: 100, 
              update: 'Successfully implemented all security recommendations',
              priority: 'high'
            }
          ]
        },
        {
          id: 'emp4',
          name: 'Jessica Martinez',
          role: 'QA Engineer',
          email: 'jessica.martinez@company.com',
          attendance: {
            present: 23,
            absent: 1,
            late: 1,
            percentage: 92
          },
          meetingAttendance: {
            attended: 20,
            missed: 0,
            percentage: 100
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '08:55 AM', checkOut: '06:05 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '09:02 AM', checkOut: '06:10 PM' },
            { date: '2024-10-25', status: 'late', checkIn: '09:30 AM', checkOut: '06:30 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '08:58 AM', checkOut: '06:00 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.4,
            tasksCompleted: 88,
            codeQuality: 4.6,
            collaboration: 4.5,
            innovation: 4.1,
            recentScores: [
              { date: '2024-10-28', score: 4.6, tasksCompleted: 9, feedback: 'Thorough testing coverage on new features' },
              { date: '2024-10-27', score: 4.4, tasksCompleted: 8, feedback: 'Excellent bug detection and reporting' },
              { date: '2024-10-26', score: 4.3, tasksCompleted: 7, feedback: 'Good automation script development' },
              { date: '2024-10-25', score: 4.0, tasksCompleted: 6, feedback: 'Late arrival but caught up quickly' },
              { date: '2024-10-24', score: 4.5, tasksCompleted: 9, feedback: 'Outstanding regression testing work' }
            ]
          },
          projectUpdates: [
            { 
              date: '2024-10-28', 
              project: 'Automated Testing Suite', 
              status: 'In Progress', 
              progress: 90, 
              update: 'Completed integration tests, working on performance test scenarios',
              priority: 'high'
            },
            { 
              date: '2024-10-27', 
              project: 'Bug Tracking System', 
              status: 'Completed', 
              progress: 100, 
              update: 'Successfully implemented new bug tracking workflow with team',
              priority: 'medium'
            },
            { 
              date: '2024-10-25', 
              project: 'Quality Assurance Documentation', 
              status: 'In Progress', 
              progress: 75, 
              update: 'Updated testing procedures and created new QA guidelines',
              priority: 'medium'
            }
          ]
        },
        {
          id: 'emp5',
          name: 'Ryan Thompson',
          role: 'DevOps Engineer',
          email: 'ryan.thompson@company.com',
          attendance: {
            present: 25,
            absent: 0,
            late: 0,
            percentage: 100
          },
          meetingAttendance: {
            attended: 19,
            missed: 1,
            percentage: 95
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '08:45 AM', checkOut: '06:15 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '08:50 AM', checkOut: '06:00 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '08:55 AM', checkOut: '06:05 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '08:48 AM', checkOut: '06:10 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '08:52 AM', checkOut: '06:00 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.7,
            tasksCompleted: 95,
            codeQuality: 4.8,
            collaboration: 4.6,
            innovation: 4.7,
            recentScores: [
              { date: '2024-10-28', score: 4.8, tasksCompleted: 10, feedback: 'Excellent infrastructure optimization and monitoring setup' },
              { date: '2024-10-27', score: 4.7, tasksCompleted: 9, feedback: 'Great CI/CD pipeline improvements' },
              { date: '2024-10-26', score: 4.6, tasksCompleted: 8, feedback: 'Solid deployment automation work' },
              { date: '2024-10-25', score: 4.7, tasksCompleted: 9, feedback: 'Outstanding server performance tuning' },
              { date: '2024-10-24', score: 4.8, tasksCompleted: 10, feedback: 'Innovative monitoring solution implemented' }
            ]
          },
          projectUpdates: [
            { 
              date: '2024-10-28', 
              project: 'Cloud Infrastructure Migration', 
              status: 'In Progress', 
              progress: 85, 
              update: 'Completed production environment setup, working on monitoring integration',
              priority: 'high'
            },
            { 
              date: '2024-10-27', 
              project: 'CI/CD Pipeline Enhancement', 
              status: 'Completed', 
              progress: 100, 
              update: 'Successfully deployed new automated testing and deployment pipeline',
              priority: 'high'
            },
            { 
              date: '2024-10-25', 
              project: 'Security Compliance Audit', 
              status: 'In Progress', 
              progress: 70, 
              update: 'Implemented security scanning tools and updated compliance documentation',
              priority: 'medium'
            }
          ]
        }
      ]
    },
    {
      id: 'pm2',
      name: 'James Anderson',
      email: 'james.anderson@company.com',
      phone: '+1 (555) 234-5678',
      department: 'Engineering',
      joinDate: '2019-06-20',
      teamMembers: [
        {
          id: 'emp6',
          name: 'Sophia Williams',
          role: 'Content Strategist',
          email: 'sophia.williams@company.com',
          attendance: {
            present: 23,
            absent: 2,
            late: 0,
            percentage: 92
          },
          meetingAttendance: {
            attended: 18,
            missed: 2,
            percentage: 90
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '09:05 AM', checkOut: '06:10 PM' },
            { date: '2024-10-26', status: 'absent', checkIn: '-', checkOut: '-' },
            { date: '2024-10-25', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '08:55 AM', checkOut: '06:05 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.3,
            tasksCompleted: 88,
            codeQuality: 4.4,
            collaboration: 4.2,
            innovation: 4.1,
            recentScores: [
              { date: '2024-10-28', score: 4.4, tasksCompleted: 8, feedback: 'Great cross-team coordination' },
              { date: '2024-10-27', score: 4.2, tasksCompleted: 7, feedback: 'Solid progress on sprint items' },
              { date: '2024-10-26', score: 0, tasksCompleted: 0, feedback: 'Absent' },
              { date: '2024-10-25', score: 4.1, tasksCompleted: 6, feedback: 'Dependable delivery' },
              { date: '2024-10-24', score: 4.3, tasksCompleted: 7, feedback: 'Strong execution' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'Knowledge Base System', status: 'In Progress', progress: 70, update: 'Built article tagging logic and search filters', priority: 'medium' },
            { date: '2024-10-26', project: 'Docs Revamp', status: 'In Progress', progress: 55, update: 'Refactoring content architecture and components', priority: 'low' },
            { date: '2024-10-24', project: 'Internal Tools', status: 'Completed', progress: 100, update: 'Rolled out form builder enhancements', priority: 'medium' }
          ]
        },
        {
          id: 'emp7',
          name: 'Daniel Brown',
          role: 'Social Media Manager',
          email: 'daniel.brown@company.com',
          attendance: {
            present: 22,
            absent: 2,
            late: 1,
            percentage: 88
          },
          meetingAttendance: {
            attended: 17,
            missed: 3,
            percentage: 85
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:10 AM', checkOut: '06:20 PM' },
            { date: '2024-10-27', status: 'late', checkIn: '09:35 AM', checkOut: '06:35 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '09:05 AM', checkOut: '06:10 PM' },
            { date: '2024-10-24', status: 'absent', checkIn: '-', checkOut: '-' }
          ],
          dailyPerformance: {
            overallRating: 3.9,
            tasksCompleted: 76,
            codeQuality: 3.8,
            collaboration: 4.1,
            innovation: 3.7,
            recentScores: [
              { date: '2024-10-28', score: 4.0, tasksCompleted: 6, feedback: 'Recovered well after late start' },
              { date: '2024-10-27', score: 3.2, tasksCompleted: 4, feedback: 'Late impacted throughput' },
              { date: '2024-10-26', score: 4.1, tasksCompleted: 7, feedback: 'Consistent delivery' },
              { date: '2024-10-25', score: 4.0, tasksCompleted: 6, feedback: 'Good collaboration' },
              { date: '2024-10-24', score: 0, tasksCompleted: 0, feedback: 'Absent' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'Notification Service', status: 'In Progress', progress: 65, update: 'Built email adapter and retry policy', priority: 'medium' },
            { date: '2024-10-25', project: 'Event Bus Monitoring', status: 'In Progress', progress: 40, update: 'Added DLQ metrics and alerts', priority: 'high' },
            { date: '2024-10-23', project: 'Rate Limiter', status: 'Halfway', progress: 50, update: 'Implemented token bucket prototype', priority: 'medium' }
          ]
        },
        {
          id: 'emp8',
          name: 'Olivia Davis',
          role: 'Graphic Designer',
          email: 'olivia.davis@company.com',
          attendance: {
            present: 24,
            absent: 1,
            late: 0,
            percentage: 96
          },
          meetingAttendance: {
            attended: 19,
            missed: 1,
            percentage: 95
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '08:55 AM', checkOut: '06:00 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '09:00 AM', checkOut: '06:05 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '08:58 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '09:00 AM', checkOut: '06:10 PM' },
            { date: '2024-10-24', status: 'absent', checkIn: '-', checkOut: '-' }
          ],
          dailyPerformance: {
            overallRating: 4.5,
            tasksCompleted: 91,
            codeQuality: 4.7,
            collaboration: 4.6,
            innovation: 4.2,
            recentScores: [
              { date: '2024-10-28', score: 4.7, tasksCompleted: 9, feedback: 'Excellent component polish' },
              { date: '2024-10-27', score: 4.6, tasksCompleted: 8, feedback: 'Great prototype delivery' },
              { date: '2024-10-26', score: 4.4, tasksCompleted: 7, feedback: 'Reliable and fast execution' },
              { date: '2024-10-25', score: 4.5, tasksCompleted: 8, feedback: 'Partnered effectively with devs' },
              { date: '2024-10-24', score: 0, tasksCompleted: 0, feedback: 'Absent' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'Design System', status: 'In Progress', progress: 72, update: 'Added tokens and theme variants', priority: 'medium' },
            { date: '2024-10-26', project: 'Dashboard Widgets', status: 'In Progress', progress: 60, update: 'Implemented charts and legends', priority: 'low' },
            { date: '2024-10-24', project: 'Accessibility Audit', status: 'Completed', progress: 100, update: 'Fixed color contrast and focus states', priority: 'medium' }
          ]
        },
        {
          id: 'emp9',
          name: 'Ethan Wilson',
          role: 'SEO Specialist',
          email: 'ethan.wilson@company.com',
          attendance: {
            present: 21,
            absent: 3,
            late: 1,
            percentage: 84
          },
          meetingAttendance: {
            attended: 16,
            missed: 4,
            percentage: 80
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:15 AM', checkOut: '06:15 PM' },
            { date: '2024-10-27', status: 'absent', checkIn: '-', checkOut: '-' },
            { date: '2024-10-26', status: 'late', checkIn: '09:40 AM', checkOut: '06:40 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '09:05 AM', checkOut: '06:10 PM' }
          ],
          dailyPerformance: {
            overallRating: 3.8,
            tasksCompleted: 74,
            codeQuality: 3.9,
            collaboration: 3.6,
            innovation: 3.5,
            recentScores: [
              { date: '2024-10-28', score: 4.0, tasksCompleted: 6, feedback: 'Improved throughput' },
              { date: '2024-10-27', score: 0, tasksCompleted: 0, feedback: 'Absent' },
              { date: '2024-10-26', score: 3.6, tasksCompleted: 5, feedback: 'Late but completed priorities' },
              { date: '2024-10-25', score: 4.1, tasksCompleted: 6, feedback: 'Good sprint contribution' },
              { date: '2024-10-24', score: 4.0, tasksCompleted: 6, feedback: 'Consistent effort' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'Search Relevance', status: 'In Progress', progress: 58, update: 'Tuned ranking and added synonyms', priority: 'medium' },
            { date: '2024-10-25', project: 'Crawler Optimization', status: 'Almost Done', progress: 85, update: 'Reduced crawl time and improved dedupe', priority: 'high' },
            { date: '2024-10-23', project: 'Index Cleanup', status: 'In Progress', progress: 45, update: 'Archived stale documents and rebuilt shards', priority: 'medium' }
          ]
        },
        {
          id: 'emp10',
          name: 'Ava Garcia',
          role: 'Marketing Analyst',
          email: 'ava.garcia@company.com',
          attendance: {
            present: 25,
            absent: 0,
            late: 0,
            percentage: 100
          },
          meetingAttendance: {
            attended: 20,
            missed: 0,
            percentage: 100
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '08:50 AM', checkOut: '06:00 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '08:55 AM', checkOut: '06:05 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '08:52 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '08:58 AM', checkOut: '06:10 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '08:48 AM', checkOut: '06:00 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.6,
            tasksCompleted: 93,
            codeQuality: 4.7,
            collaboration: 4.5,
            innovation: 4.6,
            recentScores: [
              { date: '2024-10-28', score: 4.8, tasksCompleted: 9, feedback: 'Outstanding cycle completion' },
              { date: '2024-10-27', score: 4.6, tasksCompleted: 8, feedback: 'Reliable and proactive' },
              { date: '2024-10-26', score: 4.5, tasksCompleted: 8, feedback: 'Great execution' },
              { date: '2024-10-25', score: 4.6, tasksCompleted: 8, feedback: 'Excellent collaboration' },
              { date: '2024-10-24', score: 4.7, tasksCompleted: 9, feedback: 'Exceptional delivery' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'Reporting Platform', status: 'In Progress', progress: 80, update: 'Completed cohort and retention charts', priority: 'high' },
            { date: '2024-10-26', project: 'ETL Jobs', status: 'In Progress', progress: 66, update: 'Refined transformations and data quality checks', priority: 'medium' },
            { date: '2024-10-24', project: 'Data Catalog', status: 'Completed', progress: 100, update: 'Published lineage and glossary', priority: 'medium' }
          ]
        }
      ]
    },
    {
      id: 'pm3',
      name: 'Lisa Taylor',
      email: 'lisa.taylor@company.com',
      phone: '+1 (555) 345-6789',
      department: 'Engineering',
      joinDate: '2021-03-10',
      teamMembers: [
        {
          id: 'emp11',
          name: 'Noah Martinez',
          role: 'Product Designer',
          email: 'noah.martinez@company.com',
          attendance: {
            present: 23,
            absent: 1,
            late: 1,
            percentage: 92
          },
          meetingAttendance: {
            attended: 19,
            missed: 1,
            percentage: 95
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:00 AM', checkOut: '06:10 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '09:05 AM', checkOut: '06:00 PM' },
            { date: '2024-10-26', status: 'late', checkIn: '09:25 AM', checkOut: '06:25 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '08:55 AM', checkOut: '06:05 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.2,
            tasksCompleted: 86,
            codeQuality: 4.4,
            collaboration: 4.3,
            innovation: 4.0,
            recentScores: [
              { date: '2024-10-28', score: 4.3, tasksCompleted: 7, feedback: 'Handled late day well' },
              { date: '2024-10-27', score: 4.4, tasksCompleted: 8, feedback: 'Consistent delivery' },
              { date: '2024-10-26', score: 3.6, tasksCompleted: 5, feedback: 'Late arrival reduced output' },
              { date: '2024-10-25', score: 4.2, tasksCompleted: 7, feedback: 'Good collaboration' },
              { date: '2024-10-24', score: 4.4, tasksCompleted: 8, feedback: 'Strong contribution' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'UI Components', status: 'In Progress', progress: 68, update: 'Built skeleton states and a11y roles', priority: 'medium' },
            { date: '2024-10-26', project: 'Design Tokens', status: 'In Progress', progress: 55, update: 'Synced typography and spacing scales', priority: 'low' },
            { date: '2024-10-24', project: 'Prototype Kit', status: 'Completed', progress: 100, update: 'Shipped Figma/Storybook parity', priority: 'medium' }
          ]
        },
        {
          id: 'emp12',
          name: 'Isabella Lee',
          role: 'Product Manager',
          email: 'isabella.lee@company.com',
          attendance: {
            present: 24,
            absent: 1,
            late: 0,
            percentage: 96
          },
          meetingAttendance: {
            attended: 20,
            missed: 0,
            percentage: 100
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '08:55 AM', checkOut: '06:15 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '08:58 AM', checkOut: '06:10 PM' },
            { date: '2024-10-25', status: 'absent', checkIn: '-', checkOut: '-' },
            { date: '2024-10-24', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.5,
            tasksCompleted: 92,
            codeQuality: 4.6,
            collaboration: 4.7,
            innovation: 4.4,
            recentScores: [
              { date: '2024-10-28', score: 4.7, tasksCompleted: 9, feedback: 'Excellent planning and execution' },
              { date: '2024-10-27', score: 4.5, tasksCompleted: 8, feedback: 'Great coordination' },
              { date: '2024-10-26', score: 4.4, tasksCompleted: 7, feedback: 'On-time delivery' },
              { date: '2024-10-25', score: 0, tasksCompleted: 0, feedback: 'Absent' },
              { date: '2024-10-24', score: 4.6, tasksCompleted: 8, feedback: 'Strong leadership' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'Roadmap Execution', status: 'In Progress', progress: 76, update: 'Completed Q4 planning and kickoff', priority: 'high' },
            { date: '2024-10-26', project: 'Stakeholder Portal', status: 'In Progress', progress: 60, update: 'Delivered milestone status views', priority: 'medium' },
            { date: '2024-10-24', project: 'Release Management', status: 'Completed', progress: 100, update: 'Automated changelog and approvals', priority: 'medium' }
          ]
        },
        {
          id: 'emp13',
          name: 'Liam White',
          role: 'Business Analyst',
          email: 'liam.white@company.com',
          attendance: {
            present: 22,
            absent: 2,
            late: 1,
            percentage: 88
          },
          meetingAttendance: {
            attended: 18,
            missed: 2,
            percentage: 90
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:05 AM', checkOut: '06:05 PM' },
            { date: '2024-10-27', status: 'late', checkIn: '09:30 AM', checkOut: '06:30 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'absent', checkIn: '-', checkOut: '-' },
            { date: '2024-10-24', status: 'present', checkIn: '09:00 AM', checkOut: '06:10 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.0,
            tasksCompleted: 82,
            codeQuality: 4.1,
            collaboration: 4.0,
            innovation: 3.9,
            recentScores: [
              { date: '2024-10-28', score: 4.2, tasksCompleted: 6, feedback: 'Good data insights' },
              { date: '2024-10-27', score: 3.2, tasksCompleted: 4, feedback: 'Late day impact' },
              { date: '2024-10-26', score: 4.0, tasksCompleted: 6, feedback: 'Solid analysis' },
              { date: '2024-10-25', score: 0, tasksCompleted: 0, feedback: 'Absent' },
              { date: '2024-10-24', score: 4.1, tasksCompleted: 6, feedback: 'Strong follow-ups' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'KPI Dashboard', status: 'In Progress', progress: 62, update: 'Added trend analyses and filters', priority: 'medium' },
            { date: '2024-10-25', project: 'Requirements Hub', status: 'Almost Done', progress: 90, update: 'Linked epics to acceptance criteria', priority: 'high' },
            { date: '2024-10-23', project: 'Backlog Grooming', status: 'In Progress', progress: 55, update: 'Refined subtasks and estimates', priority: 'low' }
          ]
        },
        {
          id: 'emp14',
          name: 'Mia Harris',
          role: 'UX Researcher',
          email: 'mia.harris@company.com',
          attendance: {
            present: 25,
            absent: 0,
            late: 0,
            percentage: 100
          },
          meetingAttendance: {
            attended: 19,
            missed: 1,
            percentage: 95
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '08:50 AM', checkOut: '06:00 PM' },
            { date: '2024-10-27', status: 'present', checkIn: '08:55 AM', checkOut: '06:05 PM' },
            { date: '2024-10-26', status: 'present', checkIn: '08:52 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'present', checkIn: '08:58 AM', checkOut: '06:10 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '08:48 AM', checkOut: '06:00 PM' }
          ],
          dailyPerformance: {
            overallRating: 4.6,
            tasksCompleted: 93,
            codeQuality: 4.7,
            collaboration: 4.6,
            innovation: 4.5,
            recentScores: [
              { date: '2024-10-28', score: 4.7, tasksCompleted: 9, feedback: 'Excellent field study work' },
              { date: '2024-10-27', score: 4.6, tasksCompleted: 8, feedback: 'Great synthesis' },
              { date: '2024-10-26', score: 4.5, tasksCompleted: 8, feedback: 'In-depth interviews' },
              { date: '2024-10-25', score: 4.6, tasksCompleted: 8, feedback: 'Strong collaboration' },
              { date: '2024-10-24', score: 4.7, tasksCompleted: 9, feedback: 'Insightful findings' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'User Research Program', status: 'In Progress', progress: 78, update: 'Completed 15 sessions and analysis', priority: 'high' },
            { date: '2024-10-26', project: 'Persona Refresh', status: 'In Progress', progress: 65, update: 'Merged new segments and journeys', priority: 'medium' },
            { date: '2024-10-24', project: 'Usability Benchmarks', status: 'Completed', progress: 100, update: 'Published baseline SUS metrics', priority: 'medium' }
          ]
        },
        {
          id: 'emp15',
          name: 'William Clark',
          role: 'Product Analyst',
          email: 'william.clark@company.com',
          attendance: {
            present: 21,
            absent: 3,
            late: 1,
            percentage: 84
          },
          meetingAttendance: {
            attended: 17,
            missed: 3,
            percentage: 85
          },
          recentActivity: [
            { date: '2024-10-28', status: 'present', checkIn: '09:10 AM', checkOut: '06:20 PM' },
            { date: '2024-10-27', status: 'absent', checkIn: '-', checkOut: '-' },
            { date: '2024-10-26', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
            { date: '2024-10-25', status: 'late', checkIn: '09:45 AM', checkOut: '06:45 PM' },
            { date: '2024-10-24', status: 'present', checkIn: '09:05 AM', checkOut: '06:00 PM' }
          ],
          dailyPerformance: {
            overallRating: 3.9,
            tasksCompleted: 77,
            codeQuality: 4.0,
            collaboration: 3.8,
            innovation: 3.7,
            recentScores: [
              { date: '2024-10-28', score: 4.0, tasksCompleted: 6, feedback: 'Delivered key reports' },
              { date: '2024-10-27', score: 0, tasksCompleted: 0, feedback: 'Absent' },
              { date: '2024-10-26', score: 4.1, tasksCompleted: 6, feedback: 'Kept momentum' },
              { date: '2024-10-25', score: 3.4, tasksCompleted: 4, feedback: 'Late day impact' },
              { date: '2024-10-24', score: 4.2, tasksCompleted: 7, feedback: 'Good collaboration' }
            ]
          },
          projectUpdates: [
            { date: '2024-10-28', project: 'Product Analytics', status: 'In Progress', progress: 64, update: 'Added funnel and retention breakdowns', priority: 'medium' },
            { date: '2024-10-26', project: 'Cohort Builder', status: 'Almost Done', progress: 80, update: 'Shipped advanced filters and exports', priority: 'high' },
            { date: '2024-10-24', project: 'Attribution Model', status: 'In Progress', progress: 52, update: 'Prototyped data-driven U-shaped model', priority: 'medium' }
          ]
        }
      ]
    }
  ]
};
