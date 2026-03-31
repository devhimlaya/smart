import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles,
  Award,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Target,
  FileCheck,
  Star,
  Medal,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gradesApi, type ClassAssignment } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardData {
  teacher: {
    name: string;
    employeeId: string;
    specialization?: string;
  };
  stats: {
    totalClasses: number;
    totalStudents: number;
    subjects: string[];
  };
  classAssignments: ClassAssignment[];
}

interface ClassStats {
  id: string;
  subjectName: string;
  sectionName: string;
  gradeLevel: string;
  totalStudents: number;
  gradedCount: number;
  avgGrade: number | null;
  passingRate: number;
  studentsAtRisk: { id: string; name: string; grade: number; class: string }[];
  honorsStudents: { id: string; name: string; grade: number; honor: string }[];
  withHonorsStudents: { id: string; name: string; grade: number; honor: string }[];
}

interface DashboardStats {
  classStats: ClassStats[];
  summary: {
    totalClasses: number;
    totalStudents: number;
    totalGraded: number;
    gradeSubmissionRate: number;
    overallPassingRate: number;
    studentsAtRisk: { id: string; name: string; grade: number; class: string }[];
    studentsAtRiskCount: number;
  };
}

const gradeLevelLabels: Record<string, string> = {
  GRADE_7: "Grade 7",
  GRADE_8: "Grade 8",
  GRADE_9: "Grade 9",
  GRADE_10: "Grade 10",
};

const gradeLevelColors: Record<string, string> = {
  GRADE_7: "bg-blue-100 text-blue-700 border-blue-200",
  GRADE_8: "bg-purple-100 text-purple-700 border-purple-200",
  GRADE_9: "bg-amber-100 text-amber-700 border-amber-200",
  GRADE_10: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHonorsClass, setSelectedHonorsClass] = useState<string>("all");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, statsRes] = await Promise.all([
          gradesApi.getDashboard(),
          gradesApi.getDashboardStats(),
        ]);
        setData(dashboardRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-lg shadow-emerald-100 animate-pulse">
            <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-lg">
            <span className="text-4xl">😕</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-lg mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error || "Failed to load dashboard data"}</p>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header - Premium Glass Design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-8 lg:p-10 text-white shadow-2xl shadow-emerald-500/20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-float" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 animate-float" style={{ animationDelay: '2s' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="text-sm text-emerald-100 font-semibold tracking-wide uppercase">Welcome back</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight !text-white">
              Good morning, {data.teacher.name}!
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 font-semibold px-3 py-1 backdrop-blur-sm">
                <GraduationCap className="w-4 h-4 mr-1.5" />
                {data.teacher.employeeId}
              </Badge>
              {data.teacher.specialization && (
                <span className="text-emerald-100 text-sm">
                  {data.teacher.specialization} Department
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-emerald-100" />
            </div>
            <div>
              <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Academic Year</p>
              <p className="text-2xl font-bold mt-0.5">2025-2026</p>
              <p className="text-sm text-emerald-100 mt-0.5">1st Semester</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Modern Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: "Total Classes", value: data.stats.totalClasses, icon: BookOpen, color: "blue", gradient: "from-blue-500 to-indigo-600" },
          { label: "Students", value: data.stats.totalStudents, icon: Users, color: "emerald", gradient: "from-emerald-500 to-teal-600" },
          { label: "Subjects", value: data.stats.subjects.length, icon: GraduationCap, color: "purple", gradient: "from-purple-500 to-violet-600" },
          { label: "Current\nQuarter", value: "Q1", icon: Award, color: "amber", gradient: "from-amber-500 to-orange-600" },
        ].map((stat, index) => (
          <Card 
            key={stat.label} 
            className="group border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 bg-white overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-start justify-between flex-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider whitespace-pre-line leading-tight h-10 flex items-center">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 flex-shrink-0`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`flex items-center gap-1 text-${stat.color}-600 font-medium`}>
                    <TrendingUp className="w-4 h-4" />
                    Active
                  </span>
                  <span className="text-gray-400">this semester</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grading Progress & Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grading Progress */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Grading Progress</CardTitle>
                <CardDescription className="text-gray-500 text-sm">Q1 grade submission status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats?.classStats.slice(0, 4).map((classStat) => {
                const percentage = classStat.totalStudents > 0 
                  ? Math.round((classStat.gradedCount / classStat.totalStudents) * 100)
                  : 0;
                const isComplete = percentage === 100;
                
                return (
                  <div key={classStat.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{classStat.subjectName}</span>
                        <span className="text-gray-400 text-xs">• {classStat.sectionName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500">{classStat.gradedCount}/{classStat.totalStudents}</span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/teacher/classes" className="block mt-5">
              <Button variant="outline" size="sm" className="w-full rounded-xl font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
                View All Classes
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Class Performance */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Class Performance</CardTitle>
                <CardDescription className="text-gray-500 text-sm">Average grades by class</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats?.classStats.slice(0, 4).map((classStat) => {
                const avgGrade = classStat.avgGrade ?? 0;
                
                return (
                  <div key={classStat.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                        avgGrade >= 90 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                        avgGrade >= 85 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        avgGrade >= 80 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                        avgGrade >= 75 ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                        'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {avgGrade > 0 ? avgGrade : '-'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{classStat.subjectName}</p>
                        <p className="text-xs text-gray-500">{classStat.sectionName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">{classStat.passingRate}%</p>
                      <p className="text-xs text-gray-400">passing</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Honors Section with Dropdown & Students Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Honors / With Honors Students */}
        <Card className="lg:col-span-2 border-0 shadow-xl shadow-gray-200/50 bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg">
                  <Medal className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Honor Students</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">Students with outstanding performance (85+)</CardDescription>
                </div>
              </div>
              <Select value={selectedHonorsClass} onValueChange={(val) => val && setSelectedHonorsClass(val)}>
                <SelectTrigger className="w-48 bg-white border-gray-200 rounded-xl">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">All Classes</SelectItem>
                  {stats?.classStats.map((cs) => (
                    <SelectItem key={cs.id} value={cs.id} className="rounded-lg">
                      {cs.subjectName} - {cs.sectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {(() => {
              const filteredStats = selectedHonorsClass === "all" 
                ? stats?.classStats 
                : stats?.classStats.filter(cs => cs.id === selectedHonorsClass);
              
              const allHonors = filteredStats?.flatMap(cs => 
                [...cs.honorsStudents, ...cs.withHonorsStudents].map(s => ({
                  ...s,
                  class: `${cs.subjectName} - ${cs.sectionName}`
                }))
              ) || [];
              
              const sortedHonors = allHonors.sort((a, b) => b.grade - a.grade);
              
              if (sortedHonors.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No honor students in this selection yet.</p>
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {sortedHonors.slice(0, 10).map((student, index) => (
                    <div key={`${student.id}-${index}`} className={`flex items-center justify-between p-3 rounded-xl border ${
                      student.honor === "Highest Honors" ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200' :
                      student.honor === "High Honors" ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200' :
                      student.honor === "Honors" ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' :
                      'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          student.honor === "Highest Honors" ? 'bg-yellow-100' :
                          student.honor === "High Honors" ? 'bg-amber-100' :
                          student.honor === "Honors" ? 'bg-blue-100' :
                          'bg-emerald-100'
                        }`}>
                          <Star className={`w-4 h-4 ${
                            student.honor === "Highest Honors" ? 'text-yellow-600' :
                            student.honor === "High Honors" ? 'text-amber-600' :
                            student.honor === "Honors" ? 'text-blue-600' :
                            'text-emerald-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.class}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          student.honor === "Highest Honors" ? 'text-yellow-600' :
                          student.honor === "High Honors" ? 'text-amber-600' :
                          student.honor === "Honors" ? 'text-blue-600' :
                          'text-emerald-600'
                        }`}>{student.grade}</p>
                        <Badge className={`text-xs ${
                          student.honor === "Highest Honors" ? 'bg-yellow-100 text-yellow-700' :
                          student.honor === "High Honors" ? 'bg-amber-100 text-amber-700' :
                          student.honor === "Honors" ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>{student.honor}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {(() => {
              const filteredStats = selectedHonorsClass === "all" 
                ? stats?.classStats 
                : stats?.classStats.filter(cs => cs.id === selectedHonorsClass);
              const totalHonors = filteredStats?.reduce((sum, cs) => 
                sum + cs.honorsStudents.length + cs.withHonorsStudents.length, 0) || 0;
              
              if (totalHonors > 10) {
                return (
                  <p className="text-center text-sm text-gray-400 mt-4">
                    Showing top 10 of {totalHonors} honor students
                  </p>
                );
              }
              return null;
            })()}
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 overflow-hidden rounded-2xl text-white">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Quick Summary</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-emerald-100 text-sm mb-1">Overall Passing Rate</p>
                <p className="text-3xl font-bold">{stats?.summary.overallPassingRate ?? 0}%</p>
              </div>
              
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-emerald-100 text-sm mb-1">Grade Submissions</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{stats?.summary.gradeSubmissionRate ?? 0}%</p>
                  <Badge className="bg-white/20 text-white text-xs">Q1</Badge>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-emerald-100 text-sm mb-1">Students At Risk</p>
                <p className="text-3xl font-bold">{stats?.summary.studentsAtRiskCount ?? 0}</p>
              </div>
            </div>

            <Link to="/teacher/classes" className="block mt-4">
              <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-semibold rounded-xl">
                Enter Grades
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Students At Risk Section */}
      {stats && stats.summary.studentsAtRisk.length > 0 && (
        <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Students Needing Attention</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">Students at risk of failing (below 75)</CardDescription>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-700 font-semibold">
                {stats.summary.studentsAtRiskCount} students
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.summary.studentsAtRisk.slice(0, 6).map((student, index) => (
                <div key={`${student.id}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">{student.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{student.grade}</p>
                  </div>
                </div>
              ))}
            </div>
            {stats.summary.studentsAtRiskCount > 6 && (
              <p className="text-center text-sm text-gray-400 mt-4">
                Showing 6 of {stats.summary.studentsAtRiskCount} students at risk
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Classes - Compact View */}
      <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">My Classes</CardTitle>
                <CardDescription className="text-gray-500 text-sm">Quick access to your assigned classes</CardDescription>
              </div>
            </div>
            <Link to="/teacher/classes">
              <Button variant="outline" size="sm" className="rounded-xl font-medium hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200">
                View All
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.classAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                to={`/teacher/records/${assignment.id}`}
                className="block group"
              >
                <div className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className={`${gradeLevelColors[assignment.section.gradeLevel]} border font-medium text-xs px-2 py-0.5`}
                    >
                      {gradeLevelLabels[assignment.section.gradeLevel]}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{assignment.subject.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">Section {assignment.section.name}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{assignment.section._count?.enrollments ?? assignment.section.enrollments?.length ?? 0} students</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
