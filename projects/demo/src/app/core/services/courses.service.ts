import { Injectable, computed, signal } from '@angular/core';
import {
  Course,
  CourseCategory,
  CourseLevel,
  EnrollmentStatus,
  MOCK_COURSES,
} from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private readonly _courses = signal<Course[]>(MOCK_COURSES);
  private readonly _searchQuery = signal<string>('');
  private readonly _selectedCategory = signal<CourseCategory | 'All'>('All');
  private readonly _selectedLevel = signal<CourseLevel | 'All'>('All');
  private readonly _selectedStatus = signal<EnrollmentStatus | 'All'>('All');
  private readonly _sortBy = signal<'popular' | 'newest' | 'rating' | 'duration'>('popular');
  private readonly _viewMode = signal<'grid' | 'list'>('grid');

  // Readonly state getters
  readonly courses = this._courses.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly selectedLevel = this._selectedLevel.asReadonly();
  readonly selectedStatus = this._selectedStatus.asReadonly();
  readonly sortBy = this._sortBy.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();

  // Filtered courses calculation
  readonly filteredCourses = computed<Course[]>(() => {
    let result = [...this._courses()];
    const query = this._searchQuery().trim().toLowerCase();
    const cat = this._selectedCategory();
    const lvl = this._selectedLevel();
    const status = this._selectedStatus();
    const sort = this._sortBy();

    // 1. Search Query
    if (query) {
      result = result.filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(query);
        const thaiTitleMatch = c.thaiTitle?.toLowerCase().includes(query) ?? false;
        const descMatch = c.description.toLowerCase().includes(query);
        const instructorMatch =
          c.instructor.name.toLowerCase().includes(query) ||
          c.instructor.thaiName.toLowerCase().includes(query);
        const tagMatch = c.tags.some((t) => t.toLowerCase().includes(query));
        return titleMatch || thaiTitleMatch || descMatch || instructorMatch || tagMatch;
      });
    }

    // 2. Category
    if (cat !== 'All') {
      result = result.filter((c) => c.category === cat);
    }

    // 3. Level
    if (lvl !== 'All') {
      result = result.filter((c) => c.level === lvl);
    }

    // 4. Status
    if (status !== 'All') {
      result = result.filter((c) => c.enrolledStatus === status);
    }

    // 5. Sorting
    switch (sort) {
      case 'popular':
        result.sort((a, b) => b.totalEnrolled - a.totalEnrolled);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration':
        result.sort((a, b) => a.totalLessons - b.totalLessons);
        break;
      case 'newest':
      default:
        // Keep order or sort by id desc
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  });

  // Overall Metrics
  readonly totalCoursesCount = computed(() => this._courses().length);
  readonly enrolledCount = computed(
    () => this._courses().filter((c) => c.enrolledStatus !== 'not_enrolled').length
  );
  readonly mandatoryCount = computed(() => this._courses().filter((c) => c.isMandatory).length);
  readonly totalXpSum = computed(() =>
    this._courses().reduce((sum, c) => sum + (c.xpAward || 0), 0)
  );

  // Category counts
  readonly categoryOptions = computed(() => {
    const list: Array<{ id: CourseCategory | 'All'; label: string; count: number; icon: string }> = [
      { id: 'All', label: 'ทั้งหมด', count: this._courses().length, icon: '🌟' },
      {
        id: 'Software Engineering',
        label: 'Software Engineering',
        count: this._courses().filter((c) => c.category === 'Software Engineering').length,
        icon: '💻',
      },
      {
        id: 'AI & Data',
        label: 'AI & Data Intelligence',
        count: this._courses().filter((c) => c.category === 'AI & Data').length,
        icon: '🧠',
      },
      {
        id: 'DevOps & Cloud',
        label: 'DevOps & Cloud',
        count: this._courses().filter((c) => c.category === 'DevOps & Cloud').length,
        icon: '☁️',
      },
      {
        id: 'QA & Testing',
        label: 'QA & Testing',
        count: this._courses().filter((c) => c.category === 'QA & Testing').length,
        icon: '🧪',
      },
      {
        id: 'HR & Onboarding',
        label: 'HR & Onboarding',
        count: this._courses().filter((c) => c.category === 'HR & Onboarding').length,
        icon: '🏢',
      },
      {
        id: 'Management',
        label: 'Management & Leadership',
        count: this._courses().filter((c) => c.category === 'Management').length,
        icon: '💼',
      },
    ];
    return list;
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this._searchQuery().trim().length > 0 ||
      this._selectedCategory() !== 'All' ||
      this._selectedLevel() !== 'All' ||
      this._selectedStatus() !== 'All' ||
      this._sortBy() !== 'popular'
    );
  });

  // State Mutators
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setCategory(category: CourseCategory | 'All'): void {
    this._selectedCategory.set(category);
  }

  setLevel(level: CourseLevel | 'All'): void {
    this._selectedLevel.set(level);
  }

  setStatus(status: EnrollmentStatus | 'All'): void {
    this._selectedStatus.set(status);
  }

  setSortBy(sortBy: 'popular' | 'newest' | 'rating' | 'duration'): void {
    this._sortBy.set(sortBy);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this._viewMode.set(mode);
  }

  resetFilters(): void {
    this._searchQuery.set('');
    this._selectedCategory.set('All');
    this._selectedLevel.set('All');
    this._selectedStatus.set('All');
    this._sortBy.set('popular');
  }

  getCourseById(id: string): Course | undefined {
    return this._courses().find((c) => c.id === id);
  }

  enrollCourse(courseId: string): boolean {
    const list = this._courses();
    const target = list.find((c) => c.id === courseId);
    if (!target) return false;

    if (target.enrolledStatus === 'not_enrolled') {
      const updated = list.map((c) =>
        c.id === courseId
          ? {
              ...c,
              enrolledStatus: 'in_progress' as const,
              userProgressPercent: 5,
              totalEnrolled: c.totalEnrolled + 1,
            }
          : c
      );
      this._courses.set(updated);
      return true;
    }
    return false;
  }

  unenrollCourse(courseId: string): boolean {
    const list = this._courses();
    const target = list.find((c) => c.id === courseId);
    if (!target) return false;

    const updated = list.map((c) =>
      c.id === courseId
        ? {
            ...c,
            enrolledStatus: 'not_enrolled' as const,
            userProgressPercent: 0,
            totalEnrolled: Math.max(0, c.totalEnrolled - 1),
          }
        : c
    );
    this._courses.set(updated);
    return true;
  }
}
