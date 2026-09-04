import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AdminKpiMetrics,
  CourseGovernanceRecord,
  CoursePublishStatus,
  DepartmentComplianceSummary,
  EmployeeComplianceRecord,
  MOCK_DEPARTMENT_COMPLIANCE,
  MOCK_EMPLOYEES,
} from '../models/admin.model';
import { CoursesService } from './courses.service';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly coursesService = inject(CoursesService);

  // State signals
  private readonly _employees = signal<EmployeeComplianceRecord[]>(MOCK_EMPLOYEES);
  private readonly _departments = signal<DepartmentComplianceSummary[]>(MOCK_DEPARTMENT_COMPLIANCE);
  private readonly _employeeSearchQuery = signal<string>('');
  private readonly _selectedDepartment = signal<string>('All');
  private readonly _selectedComplianceStatus = signal<string>('All');
  private readonly _governanceStatusFilter = signal<CoursePublishStatus | 'All'>('All');
  private readonly _governanceSearchQuery = signal<string>('');

  // Course governance records derived and tracked
  private readonly _customGovernanceStatuses = signal<Record<string, CoursePublishStatus>>({
    'crs-001': 'published',
    'crs-002': 'published',
    'crs-003': 'published',
    'crs-004': 'published',
    'crs-005': 'published',
    'crs-006': 'published',
    'crs-007': 'published',
    'crs-008': 'published',
  });

  // Readonly Getters
  readonly employees = this._employees.asReadonly();
  readonly departments = this._departments.asReadonly();
  readonly employeeSearchQuery = this._employeeSearchQuery.asReadonly();
  readonly selectedDepartment = this._selectedDepartment.asReadonly();
  readonly selectedComplianceStatus = this._selectedComplianceStatus.asReadonly();
  readonly governanceStatusFilter = this._governanceStatusFilter.asReadonly();
  readonly governanceSearchQuery = this._governanceSearchQuery.asReadonly();

  // Filtered Employees
  readonly filteredEmployees = computed<EmployeeComplianceRecord[]>(() => {
    let list = [...this._employees()];
    const query = this._employeeSearchQuery().trim().toLowerCase();
    const dept = this._selectedDepartment();
    const status = this._selectedComplianceStatus();

    if (query) {
      list = list.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.thaiName.toLowerCase().includes(query) ||
          emp.id.toLowerCase().includes(query) ||
          emp.role.toLowerCase().includes(query)
      );
    }

    if (dept !== 'All') {
      list = list.filter((emp) => emp.department === dept);
    }

    if (status !== 'All') {
      list = list.filter((emp) => emp.status === status);
    }

    return list;
  });

  // All Course Governance Records combined with CoursesService
  readonly courseGovernanceList = computed<CourseGovernanceRecord[]>(() => {
    const allCourses = this.coursesService.courses();
    const statuses = this._customGovernanceStatuses();

    return allCourses.map((c) => ({
      id: c.id,
      title: c.title,
      thaiTitle: c.thaiTitle,
      category: c.category,
      instructorName: c.instructor.thaiName || c.instructor.name,
      instructorAvatar: c.instructor.avatar,
      status: statuses[c.id] || 'published',
      totalEnrolled: c.totalEnrolled,
      completionRate: Math.round(75 + (c.rating * 4)), // Simulated completion percentage
      rating: c.rating,
      lastUpdated: c.lastUpdated || 'สิงหาคม 2026',
      isMandatory: c.isMandatory || false,
      xpAward: c.xpAward || 1000,
    }));
  });

  // Filtered Course Governance
  readonly filteredCourseGovernance = computed<CourseGovernanceRecord[]>(() => {
    let list = [...this.courseGovernanceList()];
    const query = this._governanceSearchQuery().trim().toLowerCase();
    const status = this._governanceStatusFilter();

    if (query) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          (c.thaiTitle && c.thaiTitle.toLowerCase().includes(query)) ||
          c.instructorName.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    if (status !== 'All') {
      list = list.filter((c) => c.status === status);
    }

    return list;
  });

  // Admin Overall KPI Metrics
  readonly kpiMetrics = computed<AdminKpiMetrics>(() => {
    const emps = this._employees();
    const compliantCount = emps.filter((e) => e.status === 'compliant').length;
    const totalXp = emps.reduce((acc, e) => acc + e.totalXp, 0);
    const pendingCount = Object.values(this._customGovernanceStatuses()).filter(
      (s) => s === 'pending_approval'
    ).length;

    return {
      totalLearners: emps.length,
      activeLearnersThisMonth: emps.filter((e) => e.status !== 'not_started').length,
      overallCompletionRate: 84, // Average company completion %
      mandatoryComplianceRate: Math.round((compliantCount / emps.length) * 100),
      totalCertificatesIssued: 18,
      totalLearningHours: 420,
      totalXpDistributed: totalXp,
      pendingCourseApprovals: pendingCount,
    };
  });

  // Filter Setters
  setEmployeeSearchQuery(query: string): void {
    this._employeeSearchQuery.set(query);
  }

  setSelectedDepartment(dept: string): void {
    this._selectedDepartment.set(dept);
  }

  setSelectedComplianceStatus(status: string): void {
    this._selectedComplianceStatus.set(status);
  }

  setGovernanceStatusFilter(status: CoursePublishStatus | 'All'): void {
    this._governanceStatusFilter.set(status);
  }

  setGovernanceSearchQuery(query: string): void {
    this._governanceSearchQuery.set(query);
  }

  // Course Governance Mutations
  updateCourseStatus(courseId: string, status: CoursePublishStatus): void {
    this._customGovernanceStatuses.update((prev) => ({
      ...prev,
      [courseId]: status,
    }));
  }

  approveCourse(courseId: string): void {
    this.updateCourseStatus(courseId, 'published');
  }

  // Create course from Instructor Course Studio
  createNewCourse(courseData: Course, submitStatus: CoursePublishStatus = 'published'): void {
    this.coursesService.addCourse(courseData);
    this._customGovernanceStatuses.update((prev) => ({
      ...prev,
      [courseData.id]: submitStatus,
    }));
  }

  // Export report generator (CSV download)
  exportComplianceReportCsv(): void {
    const list = this.filteredEmployees();
    const headers = ['Employee ID', 'Name', 'Department', 'Role', 'Status', 'Mandatory Passed', 'Total XP', 'Last Active'];
    const rows = list.map((e) => [
      e.id,
      `"${e.thaiName} (${e.name})"`,
      `"${e.department}"`,
      `"${e.role}"`,
      e.status,
      `${e.mandatoryCompleted}/${e.mandatoryTotal}`,
      e.totalXp,
      `"${e.lastActive}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SICR_Learning_Compliance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
