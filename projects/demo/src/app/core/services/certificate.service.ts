import { Injectable, signal } from '@angular/core';
import { Certificate, MOCK_CERTIFICATES } from '../models/certificate.model';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  private readonly _certificates = signal<Certificate[]>(MOCK_CERTIFICATES);
  private readonly _activeCertificate = signal<Certificate | null>(null);

  readonly certificates = this._certificates.asReadonly();
  readonly activeCertificate = this._activeCertificate.asReadonly();

  getCertificateByCourseId(courseId: string): Certificate | undefined {
    return this._certificates().find((c) => c.courseId === courseId);
  }

  getCertificateById(id: string): Certificate | undefined {
    return this._certificates().find((c) => c.id === id);
  }

  openCertificate(cert: Certificate): void {
    this._activeCertificate.set(cert);
  }

  closeCertificate(): void {
    this._activeCertificate.set(null);
  }

  generateCertificateForCourse(
    course: Course,
    recipientName: string = 'Aingkharat Srithong',
    recipientRole: string = 'Senior Frontend & Mobile Engineer',
    recipientDepartment: string = 'Software Engineering & AI'
  ): Certificate {
    const existing = this.getCertificateByCourseId(course.id);
    if (existing) {
      return existing;
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const dateStr = new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const newCert: Certificate = {
      id: `cert-${course.id}-${Date.now()}`,
      certificateNumber: `SICR-CERT-2026-${randomSuffix}`,
      courseId: course.id,
      courseTitle: course.title,
      courseThaiTitle: course.thaiTitle,
      recipientName,
      recipientRole,
      recipientDepartment,
      issueDate: dateStr,
      completionScorePercent: 95,
      xpEarned: course.xpAward || 1000,
      duration: course.duration,
      instructorName: course.instructor?.thaiName || course.instructor?.name || 'Instructor Team',
      instructorTitle: course.instructor?.title || 'Senior Instructor',
      ceoName: 'Surapong Kittisrisakul',
      ceoTitle: 'Chief Executive Officer, Soft Inter Chiangrai Co., Ltd.',
      skillsCovered: course.tags.slice(0, 4),
      verificationUrl: `https://verify.softinter.co.th/cert/SICR-CERT-2026-${randomSuffix}`,
    };

    this._certificates.update((list) => [newCert, ...list]);
    return newCert;
  }
}
