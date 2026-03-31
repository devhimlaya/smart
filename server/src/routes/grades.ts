import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthRequest, authorizeRoles } from "../middleware/auth";

const router = Router();

// Types for enrolled student with relations
interface EnrollmentWithStudent {
  student: {
    id: string;
    lrn: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    suffix?: string | null;
    gender?: string | null;
  };
  studentId: string;
}

interface GradeRecord {
  id: string;
  studentId: string;
  classAssignmentId: string;
  quarter: string;
}

interface ClassAssignmentWithRelations {
  subject: { name: string };
  section: { _count: { enrollments: number } };
}

// Get all class assignments for the logged-in teacher
router.get(
  "/my-classes",
  authenticateToken,
  authorizeRoles("TEACHER"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user?.id },
      });

      if (!teacher) {
        res.status(404).json({ message: "Teacher profile not found" });
        return;
      }

      const classes = await prisma.classAssignment.findMany({
        where: { teacherId: teacher.id },
        include: {
          subject: true,
          section: {
            include: {
              enrollments: {
                include: {
                  student: true,
                },
                orderBy: {
                  student: {
                    lastName: "asc",
                  },
                },
              },
            },
          },
        },
        orderBy: [
          { section: { gradeLevel: "asc" } },
          { subject: { name: "asc" } },
        ],
      });

      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get class record (all students with grades) for a specific class assignment
router.get(
  "/class-record/:classAssignmentId",
  authenticateToken,
  authorizeRoles("TEACHER"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const classAssignmentId = req.params.classAssignmentId as string;
      const { quarter } = req.query;

      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user?.id },
      });

      if (!teacher) {
        res.status(404).json({ message: "Teacher profile not found" });
        return;
      }

      const classAssignment = await prisma.classAssignment.findFirst({
        where: {
          id: classAssignmentId,
          teacherId: teacher.id,
        },
        include: {
          subject: true,
          section: true,
        },
      });

      if (!classAssignment) {
        res.status(404).json({ message: "Class assignment not found" });
        return;
      }

      // Get all enrolled students with their grades
      const enrollments = await prisma.enrollment.findMany({
        where: {
          sectionId: classAssignment.sectionId,
          schoolYear: classAssignment.schoolYear,
        },
        include: {
          student: true,
        },
        orderBy: {
          student: {
            lastName: "asc",
          },
        },
      });

      // Get grades for these students
      const grades = await prisma.grade.findMany({
        where: {
          classAssignmentId,
          ...(quarter ? { quarter: quarter as any } : {}),
        },
      });

      // Map grades to students
      const classRecord = enrollments.map((enrollment: EnrollmentWithStudent) => {
        const studentGrades = grades.filter(
          (g: GradeRecord) => g.studentId === enrollment.studentId
        );
        return {
          student: enrollment.student,
          grades: studentGrades,
        };
      });

      res.json({
        classAssignment,
        classRecord,
      });
    } catch (error) {
      console.error("Error fetching class record:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create or update grade for a student
router.post(
  "/grade",
  authenticateToken,
  authorizeRoles("TEACHER"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        studentId,
        classAssignmentId,
        quarter,
        writtenWorkScores,
        perfTaskScores,
        quarterlyAssessScore,
        quarterlyAssessMax,
      } = req.body;

      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user?.id },
      });

      if (!teacher) {
        res.status(404).json({ message: "Teacher profile not found" });
        return;
      }

      // Verify teacher owns this class assignment
      const classAssignment = await prisma.classAssignment.findFirst({
        where: {
          id: classAssignmentId,
          teacherId: teacher.id,
        },
        include: {
          subject: true,
        },
      });

      if (!classAssignment) {
        res.status(403).json({ message: "Not authorized for this class" });
        return;
      }

      // Calculate percentage scores and grades
      const { writtenWorkPS, perfTaskPS, quarterlyAssessPS, initialGrade, quarterlyGrade } =
        calculateGrades(
          writtenWorkScores,
          perfTaskScores,
          quarterlyAssessScore,
          quarterlyAssessMax || 100,
          classAssignment.subject.writtenWorkWeight,
          classAssignment.subject.perfTaskWeight,
          classAssignment.subject.quarterlyAssessWeight
        );

      // Upsert grade
      const grade = await prisma.grade.upsert({
        where: {
          studentId_classAssignmentId_quarter: {
            studentId,
            classAssignmentId,
            quarter,
          },
        },
        update: {
          writtenWorkScores,
          perfTaskScores,
          quarterlyAssessScore,
          quarterlyAssessMax,
          writtenWorkPS,
          perfTaskPS,
          quarterlyAssessPS,
          initialGrade,
          quarterlyGrade,
        },
        create: {
          studentId,
          classAssignmentId,
          quarter,
          writtenWorkScores,
          perfTaskScores,
          quarterlyAssessScore,
          quarterlyAssessMax,
          writtenWorkPS,
          perfTaskPS,
          quarterlyAssessPS,
          initialGrade,
          quarterlyGrade,
        },
      });

      res.json(grade);
    } catch (error) {
      console.error("Error saving grade:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete a grade
router.delete(
  "/grade/:gradeId",
  authenticateToken,
  authorizeRoles("TEACHER"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const gradeId = req.params.gradeId as string;

      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user?.id },
      });

      if (!teacher) {
        res.status(404).json({ message: "Teacher profile not found" });
        return;
      }

      // Verify ownership through class assignment
      const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
        include: {
          classAssignment: true,
        },
      }) as { id: string; classAssignment: { teacherId: string } } | null;

      if (!grade || grade.classAssignment.teacherId !== teacher.id) {
        res.status(403).json({ message: "Not authorized" });
        return;
      }

      await prisma.grade.delete({
        where: { id: gradeId },
      });

      res.json({ message: "Grade deleted successfully" });
    } catch (error) {
      console.error("Error deleting grade:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get summary/dashboard data for teacher
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("TEACHER"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user?.id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!teacher) {
        res.status(404).json({ message: "Teacher profile not found" });
        return;
      }

      const classAssignments = await prisma.classAssignment.findMany({
        where: { teacherId: teacher.id },
        include: {
          subject: true,
          section: {
            include: {
              _count: {
                select: {
                  enrollments: true,
                },
              },
            },
          },
        },
      });

      const totalStudents = classAssignments.reduce(
        (sum: number, ca: ClassAssignmentWithRelations) => sum + ca.section._count.enrollments,
        0
      );

      res.json({
        teacher: {
          ...teacher,
          name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        },
        stats: {
          totalClasses: classAssignments.length,
          totalStudents,
          subjects: [...new Set(classAssignments.map((ca: ClassAssignmentWithRelations) => ca.subject.name))],
        },
        classAssignments,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get detailed dashboard statistics with real grade data
router.get(
  "/dashboard-stats",
  authenticateToken,
  authorizeRoles("TEACHER"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user?.id },
      });

      if (!teacher) {
        res.status(404).json({ message: "Teacher profile not found" });
        return;
      }

      const classAssignments = await prisma.classAssignment.findMany({
        where: { teacherId: teacher.id },
        include: {
          subject: true,
          section: {
            include: {
              enrollments: {
                include: {
                  student: true,
                },
              },
            },
          },
          grades: {
            where: { quarter: "Q1" },
          },
        },
      });

      // Calculate stats for each class
      const classStats = classAssignments.map((ca: any) => {
        const totalStudents = ca.section.enrollments.length;
        const gradesWithScore = ca.grades.filter((g: any) => g.quarterlyGrade !== null);
        const gradedCount = gradesWithScore.length;
        
        // Calculate average grade
        const avgGrade = gradedCount > 0 
          ? Math.round(gradesWithScore.reduce((sum: number, g: any) => sum + g.quarterlyGrade, 0) / gradedCount)
          : null;
        
        // Calculate passing rate
        const passingCount = gradesWithScore.filter((g: any) => g.quarterlyGrade >= 75).length;
        const passingRate = gradedCount > 0 ? Math.round((passingCount / gradedCount) * 100) : 0;
        
        // Find students needing attention (below 75)
        const studentsAtRisk = ca.grades
          .filter((g: any) => g.quarterlyGrade !== null && g.quarterlyGrade < 75)
          .map((g: any) => {
            const enrollment = ca.section.enrollments.find((e: any) => e.student.id === g.studentId);
            return enrollment ? {
              id: g.studentId,
              name: `${enrollment.student.lastName}, ${enrollment.student.firstName}`,
              grade: g.quarterlyGrade,
              class: `${ca.subject.name} - ${ca.section.name}`,
            } : null;
          })
          .filter(Boolean);
        
        // Find honors students (90+) and with honors (85-89)
        const honorsStudents = ca.grades
          .filter((g: any) => g.quarterlyGrade !== null && g.quarterlyGrade >= 90)
          .map((g: any) => {
            const enrollment = ca.section.enrollments.find((e: any) => e.student.id === g.studentId);
            return enrollment ? {
              id: g.studentId,
              name: `${enrollment.student.lastName}, ${enrollment.student.firstName}`,
              grade: g.quarterlyGrade,
              honor: g.quarterlyGrade >= 98 ? "Highest Honors" : g.quarterlyGrade >= 95 ? "High Honors" : "Honors",
            } : null;
          })
          .filter(Boolean);
        
        const withHonorsStudents = ca.grades
          .filter((g: any) => g.quarterlyGrade !== null && g.quarterlyGrade >= 85 && g.quarterlyGrade < 90)
          .map((g: any) => {
            const enrollment = ca.section.enrollments.find((e: any) => e.student.id === g.studentId);
            return enrollment ? {
              id: g.studentId,
              name: `${enrollment.student.lastName}, ${enrollment.student.firstName}`,
              grade: g.quarterlyGrade,
              honor: "With Honors",
            } : null;
          })
          .filter(Boolean);

        return {
          id: ca.id,
          subjectName: ca.subject.name,
          sectionName: ca.section.name,
          gradeLevel: ca.section.gradeLevel,
          totalStudents,
          gradedCount,
          avgGrade,
          passingRate,
          studentsAtRisk,
          honorsStudents,
          withHonorsStudents,
        };
      });

      // Aggregate stats
      const allStudentsAtRisk = classStats.flatMap((cs: any) => cs.studentsAtRisk);
      const totalGraded = classStats.reduce((sum: number, cs: any) => sum + cs.gradedCount, 0);
      const totalStudents = classStats.reduce((sum: number, cs: any) => sum + cs.totalStudents, 0);
      const overallPassingRate = totalGraded > 0 
        ? Math.round(classStats.reduce((sum: number, cs: any) => sum + (cs.passingRate * cs.gradedCount), 0) / totalGraded)
        : 0;
      const gradeSubmissionRate = totalStudents > 0 ? Math.round((totalGraded / totalStudents) * 100) : 0;

      res.json({
        classStats,
        summary: {
          totalClasses: classStats.length,
          totalStudents,
          totalGraded,
          gradeSubmissionRate,
          overallPassingRate,
          studentsAtRisk: allStudentsAtRisk,
          studentsAtRiskCount: allStudentsAtRisk.length,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Helper function to calculate grades based on DepEd formula
function calculateGrades(
  writtenWorkScores: Array<{ name: string; score: number; maxScore: number }> | null,
  perfTaskScores: Array<{ name: string; score: number; maxScore: number }> | null,
  quarterlyAssessScore: number | null,
  quarterlyAssessMax: number,
  wwWeight: number,
  ptWeight: number,
  qaWeight: number
) {
  // Calculate Written Work PS
  let writtenWorkPS: number | null = null;
  if (writtenWorkScores && writtenWorkScores.length > 0) {
    const totalScore = writtenWorkScores.reduce((sum, item) => sum + item.score, 0);
    const totalMax = writtenWorkScores.reduce((sum, item) => sum + item.maxScore, 0);
    writtenWorkPS = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
  }

  // Calculate Performance Task PS
  let perfTaskPS: number | null = null;
  if (perfTaskScores && perfTaskScores.length > 0) {
    const totalScore = perfTaskScores.reduce((sum, item) => sum + item.score, 0);
    const totalMax = perfTaskScores.reduce((sum, item) => sum + item.maxScore, 0);
    perfTaskPS = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
  }

  // Calculate Quarterly Assessment PS
  let quarterlyAssessPS: number | null = null;
  if (quarterlyAssessScore !== null && quarterlyAssessMax > 0) {
    quarterlyAssessPS = (quarterlyAssessScore / quarterlyAssessMax) * 100;
  }

  // Calculate Initial Grade (sum of weighted scores)
  let initialGrade: number | null = null;
  if (writtenWorkPS !== null && perfTaskPS !== null && quarterlyAssessPS !== null) {
    initialGrade =
      (writtenWorkPS * wwWeight) / 100 +
      (perfTaskPS * ptWeight) / 100 +
      (quarterlyAssessPS * qaWeight) / 100;
  }

  // Transmute to Quarterly Grade
  let quarterlyGrade: number | null = null;
  if (initialGrade !== null) {
    quarterlyGrade = transmute(initialGrade);
  }

  return {
    writtenWorkPS,
    perfTaskPS,
    quarterlyAssessPS,
    initialGrade,
    quarterlyGrade,
  };
}

// DepEd Transmutation Table
function transmute(initialGrade: number): number {
  const transmutationTable: [number, number, number][] = [
    [100, 100, 100],
    [98.4, 99.99, 99],
    [96.8, 98.39, 98],
    [95.2, 96.79, 97],
    [93.6, 95.19, 96],
    [92, 93.59, 95],
    [90.4, 91.99, 94],
    [88.8, 90.39, 93],
    [87.2, 88.79, 92],
    [85.6, 87.19, 91],
    [84, 85.59, 90],
    [82.4, 83.99, 89],
    [80.8, 82.39, 88],
    [79.2, 80.79, 87],
    [77.6, 79.19, 86],
    [76, 77.59, 85],
    [74.4, 75.99, 84],
    [72.8, 74.39, 83],
    [71.2, 72.79, 82],
    [69.6, 71.19, 81],
    [68, 69.59, 80],
    [66.4, 67.99, 79],
    [64.8, 66.39, 78],
    [63.2, 64.79, 77],
    [61.6, 63.19, 76],
    [60, 61.59, 75],
    [56, 59.99, 74],
    [52, 55.99, 73],
    [48, 51.99, 72],
    [44, 47.99, 71],
    [40, 43.99, 70],
    [36, 39.99, 69],
    [32, 35.99, 68],
    [28, 31.99, 67],
    [24, 27.99, 66],
    [20, 23.99, 65],
    [16, 19.99, 64],
    [12, 15.99, 63],
    [8, 11.99, 62],
    [4, 7.99, 61],
    [0, 3.99, 60],
  ];

  for (const [min, max, grade] of transmutationTable) {
    if (initialGrade >= min && initialGrade <= max) {
      return grade;
    }
  }

  return 60; // Minimum grade
}

// Get mastery level distribution for DepEd bar graph
router.get(
  "/mastery-distribution",
  authenticateToken,
  authorizeRoles("TEACHER"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { gradeLevel, sectionId } = req.query;

      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user?.id },
      });

      if (!teacher) {
        res.status(404).json({ message: "Teacher profile not found" });
        return;
      }

      // Build filter for class assignments
      const classAssignmentFilter: any = {
        teacherId: teacher.id,
      };

      if (sectionId) {
        classAssignmentFilter.sectionId = sectionId as string;
      }

      const classAssignments = await prisma.classAssignment.findMany({
        where: classAssignmentFilter,
        include: {
          section: true,
          grades: {
            where: { quarter: "Q1" },
          },
        },
      });

      // Filter by grade level if specified
      const filteredAssignments = gradeLevel 
        ? classAssignments.filter((ca: any) => ca.section.gradeLevel === gradeLevel)
        : classAssignments;

      // Collect all quarterly grades
      const allGrades = filteredAssignments.flatMap((ca: any) => 
        ca.grades.filter((g: any) => g.quarterlyGrade !== null).map((g: any) => g.quarterlyGrade)
      );

      // Calculate mastery level distribution (DepEd categories)
      const distribution = {
        outstanding: allGrades.filter((g: number) => g >= 90 && g <= 100).length,
        verySatisfactory: allGrades.filter((g: number) => g >= 85 && g <= 89).length,
        satisfactory: allGrades.filter((g: number) => g >= 80 && g <= 84).length,
        fairlySatisfactory: allGrades.filter((g: number) => g >= 75 && g <= 79).length,
        didNotMeet: allGrades.filter((g: number) => g < 75).length,
      };

      // Get available filters (grade levels and sections for this teacher)
      const allSections = await prisma.classAssignment.findMany({
        where: { teacherId: teacher.id },
        include: { section: true },
        distinct: ['sectionId'],
      });

      const gradeLevels = [...new Set(allSections.map((ca: any) => ca.section.gradeLevel))];
      const sections = allSections.map((ca: any) => ({
        id: ca.section.id,
        name: ca.section.name,
        gradeLevel: ca.section.gradeLevel,
      }));

      res.json({
        distribution,
        totalStudents: allGrades.length,
        filters: {
          gradeLevels,
          sections,
        },
      });
    } catch (error) {
      console.error("Error fetching mastery distribution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
