---
name: sicr-elearning-tracker
description: >-
  บันทึกความคืบหน้า ประวัติการพัฒนา และระเบียบปฏิบัติสำหรับโปรเจกต์ SICR E-LEARNING & Knowledge Management System
---

# 📘 SICR E-LEARNING Development Tracker & Skill

ทักษะและบันทึกข้อกำหนดการพัฒนาสำหรับโปรเจกต์ **SICR E-LEARNING & KM Platform** ของ **Soft Inter Chiangrai Co., Ltd.**

---

## 🛑 กฎเหล็กในการพัฒนา (Core Workflow Rules)
1. **พัฒนาทีละชิ้น/โมดูลเท่านั้น (One piece at a time):**
   - ห้ามทำหลายฟีเจอร์พร้อมกันในคราวเดียว
   - เมื่อสร้างหรือแก้ไขแต่ละตัวเสร็จ **ต้องหยุดรอให้ผู้ใช้ตรวจหน้าจอ (Check Preview) ก่อนเสมอ**
2. **Responsive Design ระดับพรีเมียมทุกขนาดหน้าจอ (High Priority):**
   - รองรับขนาดจอทุกระดับตั้งแต่ Large Screen (**1920x1200**, 1920x1080), Desktop, Laptop (1366-1440px), Tablet (768-1024px) ไปจนถึง Mobile (<640px)
   - ป้องกันปุ่มล้น, ตัวหนังสือหักบรรทัดผิดธรรมชาติ (ใช้ `white-space: nowrap`, `flex-shrink: 0`, `gap` ที่พอดี)
   - มี Breakpoints ที่สมูทสวยงามทุกความกว้างหน้าจอ
3. **รักษาความสมบูรณ์ของ Brand Identity:**
   - Primary Brand: `#00a887` / `#009688` (Teal Emerald Green)
   - Secondary Accent: `#10b981` / `#34d399`
   - Dark Slate: `#0f172a` / `#1e293b`
   - รองรับ Dark / Light Mode เสมอ
4. **ใช้คอมโพเนนต์จาก `sic-ng` อย่างมีประสิทธิภาพ:**
   - ใช้ Tokens `--sic-*` ในการจัดสไตล์
   - รักษา Standalone Components และ Zoneless Angular 22 Signals architecture
5. **ระเบียบการเขียน Git Commit (เมื่อได้รับคำสั่งให้ Commit):**
   - เขียนข้อความ Commit เป็น **ภาษาไทย** เสมอ
   - มี **Description (คำอธิบายรายละเอียด)** เป็นภาษาไทยแจกแจงสิ่งที่แก้ไข/สร้างใหม่ชัดเจน
   - ห้าม Commit หรือ Push อัตโนมัติเด็ดขาด ต้องรอคำสั่งจากผู้ใช้เท่านั้น

---

## 📝 บันทึกประวัติการดำเนินการ (Changelog & Completed Steps)

### ✅ Setup & GitHub Repository Initialization (2026-08-20)
- **เปลี่ยนชื่อโปรเจกต์:** เปลี่ยนชื่อ package เป็น `sicr-e-learning` ใน [package.json](file:///c:/Project/sicr-framework-ng/package.json)
- **ปรับปรุงเอกสารหลัก:** อัปเดต [README.MD](file:///c:/Project/sicr-framework-ng/README.MD), [HANDOFF.md](file:///c:/Project/sicr-framework-ng/HANDOFF.md), [project.md](file:///c:/Project/sicr-framework-ng/project.md)
- **สร้าง Clean Repository:** ล้างประวัติ commit เก่าที่ไม่เกี่ยวข้องออกทั้งหมด และ Push เริ่มต้นใหม่ไปยัง `https://github.com/Aingkharat26/sicr-e-learning.git` บน branch `main`

### ✅ Step 1: Main Application Shell & Navigation Layout (2026-08-20)
- **Header Component (`NavHeaderComponent`):**
  - โลโก้แบรนด์ Soft Inter Chiangrai + SICR E-LEARNING
  - เมนูนำทางหลัก: `หลักสูตรทั้งหมด`, `การเรียนของฉัน`, `คลังความรู้ KM`, `ระบบจัดการ/แอดมิน`
  - สวิตช์สลับ Dark/Light Mode
  - Widget โปรไฟล์ผู้ใช้พร้อมแสดงคะแนน XP และสังกัดฝ่าย
- **ตัวสลับสิทธิ์จำลอง (Role Switcher):**
  - สลับระหว่าง `🎒 ผู้เรียน (Learner)`, `👨‍🏫 ผู้สอน (Instructor)`, `🛡️ แอดมิน (Admin)`
  - แถบแจ้งเตือนสถานะและเนื้อหาในหน้า Dashboard ปรับเปลี่ยนตาม Role แบบเรียลไทม์ผ่าน Angular Signals
- **Layout & Routing Shell (`AppLayoutComponent`):**
  - วางโครงสร้าง Container รองรับ Responsive Mobile/Tablet/Desktop
  - Routing: `/`, `/courses`, `/my-learning`, `/km`, `/admin`, `/tutorial`
- **Dashboard Overview (`DashboardComponent`):**
  - ป้ายต้อนรับ Hero Banner พร้อมสถิติด่วน
  - การ์ดแนะนำโมดูลหลัก (LMS, KM, Management)
- **ผลการทดสอบ:** ตรวจสอบผ่าน Browser Subagent บันทึกผลไว้ใน [walkthrough.md](file:///C:/Users/engka/.gemini/antigravity-ide/brain/6a696e89-7e2d-4111-b4c5-8c585b7cb85d/walkthrough.md)

---

### ✅ Step 2: Course Catalog & Multi-Filter System (2026-08-20)
- **Course Models & Dataset (`course.model.ts`):**
  - กำหนด Interface สำหรับ `Course`, `CourseModule`, `CourseLesson`, `CourseCategory`, `CourseLevel`, `EnrollmentStatus`
  - บรรจุ Mock Courses 8 หลักสูตรหลักครอบคลุม Frontend, Backend, AI, QA, DevOps, Mobile, Onboarding, Agile
- **State Management Service (`courses.service.ts`):**
  - Signals-based Reactive Filtering: Instant Search, Category Filter Chips, Level Filter, Enrollment Status, Sorting (Popular, Rating, Duration, Newest)
  - คำนวณ KPI สถิติอัตโนมัติ (จำนวนหลักสูตร, คอร์สบังคับ, คอร์สที่ลงทะเบียนแล้ว, XP รวม)
  - ระบบบันทึกการลงทะเบียน `enrollCourse()` อัปเดตสถานะแบบ In-Memory Real-time
- **Course Card Component (`CourseCardComponent`):**
  - รองรับทั้ง Grid View และ List View
  - ภาพปก 16:9, Category Badge, Level Badge, Mandatory Tag, ข้อมูลผู้สอน, Rating Star, แต้ม XP
  - แสดงแถบ Progress Bar เมื่อกำลังเรียนอยู่ และปุ่ม Action (ลงทะเบียนเรียนฟรี / ▶ เรียนต่อ / 🔄 ทบทวน)
- **Course Catalog Page (`CoursesCatalogComponent`):**
  - Hero Header พร้อม KPI Metric Cards 4 ช่อง
  - Category Filter Chips แนวนอนเลื่อนได้พร้อมป้ายนับจำนวน
  - Search Box + Toolbar ตัวกรอง + ตัวสลับมุมมอง Grid/List
  - การแจ้งเตือน Toast แบบลอยด้านบนเมื่อกดลงทะเบียนเรียน
- **Responsive & Theme Verification:**
  - ผ่านการทดสอบบนความละเอียด 1920x1200, 1440x900, 768x1024, และ 375x812 อย่างสมบูรณ์แบบ
  - ผลการทดสอบบันทึกไว้ใน [walkthrough.md](file:///C:/Users/engka/.gemini/antigravity-ide/brain/9c9a1d96-3528-446d-a7f8-a8e1e560dd4e/walkthrough.md)

---

## 🧩 บันทึกการตรวจสอบคอมโพเนนต์ `@sic-ng` (Component Usage & Audit Matrix)

### 1. ✅ คอมโพเนนต์ที่นำมาใช้งานในโปรเจกต์นี้ (In-Use Components)
| คอมโพเนนต์ | หมวดหมู่ | หน้าจอ / ฟังก์ชันที่นำไปใช้ในระบบ |
| :--- | :--- | :--- |
| `sic-navbar` | Navigation | เมนูแถบบนสุด (Header), นำทางหน้าต่างๆ, สลับ Theme |
| `sic-sidebar` | Navigation | เมนูข้างสำหรับหน้า Admin Dashboard & Instructor Studio |
| `sic-avatar` | Display | รูปโปรไฟล์ผู้ใช้, ผู้สอน (Instructor), และเจ้าของบทความ (Page Owner) |
| `sic-badge` | Display | ป้ายสถานะ (Passed, In Progress, Mandatory, Admin/Learner) |
| `sic-tag` | Display | ป้ายคีย์เวิร์ดและหมวดหมู่ (Frontend, Backend, AI, Dev, QA) |
| `sic-card` | General | การ์ดคอนเทนต์, การ์ดแสดงผลบทเรียน, สถิติ KPI |
| `sic-button` | General | ปุ่ม Action หลัก (ลงทะเบียน, เริ่มเรียน, ส่งข้อสอบ, บันทึก) |
| `sic-tabs` | Navigation | แท็บสลับหมวดหมู่, แท็บรายละเอียดคอร์ส / เนื้อหา / รีวิว |
| `sic-accordion` | Display | โครงสร้างบทเรียน (Curriculum Outline: Modules & Lessons) |
| `sic-video-player` | Media | เครื่องเล่นวิดีโอบทเรียนในห้องเรียนออนไลน์ (Classroom Player) |
| `sic-progress-bar` | Indicator | แถบ % ความคืบหน้าการเรียน (Course Progress & Completion) |
| `sic-search` | Feedback | กล่องค้นหาคำสำคัญความเร็วสูง (Instant Search) ใน LMS และ KM |
| `sic-code` | Media | ตัวแสดง Code Block พร้อม Syntax Highlighting ในคลังความรู้ KM |
| `sic-timeline` | Display | ไทม์ไลน์ประวัติการแก้ไขบทความ Wiki (Version History & Audit) |
| `sic-stepper` | Navigation | ตัวนำทางขั้นตอนการทำแบบทดสอบ (Quiz Stepper) และสร้างคอร์ส |
| `sic-radio` / `sic-checkbox` | Data Entry | ตัวเลือกคำตอบในข้อสอบ (Multiple Choice & Multi-select) |
| `sic-input` / `sic-input-area` | Data Entry | ฟอร์มสร้างบทเรียน, ฟอร์มเขียนเอกสาร Wiki Markdown |
| `sic-upload` | Data Entry | อัปโหลดสไลด์ PDF, วิดีโอ, และไฟล์เอกสารประกอบการเรียน |
| `sic-datepicker` | Data Entry | กำหนดวันหมดอายุคอร์ส, วันที่ทบทวนเอกสาร KM |
| `sic-gridpanel` | Display | ตารางสรุปรายงานสถิติผู้เรียนของ HR และ Admin |
| `sic-toast` / `sic-dialog` | Feedback | ป๊อปอัปแจ้งเตือน (Toast Notification) และหน้าต่างยืนยันส่งข้อสอบ |
| `sic-rating` | Data Entry | ระบบให้คะแนนดาวรีวิวหลักสูตร (1 - 5 ดาว) |

---

### 2. ⏸️ คอมโพเนนต์ใน `sic-ng` ที่ไม่ได้นำมาใช้ในโปรเจกต์นี้ (Unused / Out of Scope)
| คอมโพเนนต์ที่ไม่ได้ใช้ | เหตุผลที่ไม่นำมาใช้งานในระบบ E-Learning & KM |
| :--- | :--- |
| `sic-colorpicker` | ไม่มีความจำเป็นต้องให้ผู้เรียนหรือผู้สอนเลือกพาเลตต์สีอิสระ เนื่องจากระบบใช้ Brand Theme Token แบบคงที่ |
| `sic-input-phone` | ระบบใช้ข้อมูลพนักงานจากองค์กร (SSO/Internal ID) ไม่มีการกรอกเบอร์โทรศัพท์ในหน้าจอเรียน |
| `sic-calendar-timeline` | มีขนาดใหญ่เกินความจำเป็น (ระบบใช้ `sic-timeline` และ `sic-gridpanel` ทดแทน) |
| `sic-sound-player` | เนื้อหาการเรียนในระบบ Soft Inter Chiangrai เน้นวิดีโอและเอกสาร จึงใช้ `sic-video-player` เป็นหลัก |
| `sic-masonry` | ระบบแคตตาล็อกและบทความจัดวางแบบ Structured Grid ที่แน่นอน เพื่อความสมมาตรของ UI |
| `sic-card-stack` | รูปแบบ Card Stack ไม่เหมาะกับรายการหลักสูตรที่ต้องการสแกนข้อมูลอย่างรวดเร็ว |
| `sic-space-bg` | เอฟเฟกต์ตกแต่ง Canvas อวกาศ ไม่สอดคล้องกับ Corporate Enterprise Clean Theme ของบริษัท |
| `sic-timepicker` | ระบบนับระยะเวลาเป็นชั่วโมง/นาทีจากวิดีโอ ไม่ต้องมีตัวเลือกเวลาแบบนาฬิกา Timepicker |

---

### 3. ✨ ฟังก์ชัน / Custom Feature เฉพาะทางที่สร้างเสริมเพิ่มเติม (Custom Features)
| สิ่งที่สร้างเสริม | รายละเอียดและประโยชน์การใช้งาน |
| :--- | :--- |
| **Dynamic Role Switcher Widget** | ตัวสลับสิทธิ์จำลองทันที (Learner 🎒 / Instructor 👨‍🏫 / Admin 🛡️) ใน Header เพื่อทดสอบมุมมองผู้ใช้แต่ละระดับโดยไม่ต้อง Re-login |
| **Instant Category Filter Chips Bar** | แถบชิปตัวกรองหมวดหมู่แนวนอนแบบมีตัวเลขนับ (Count Badges) เลื่อนได้สมูทและคลิกกรองได้ทันที |
| **Automated Certificate Canvas Frame** | กรอบใบประกาศนียบัตรระดับพรีเมียมพร้อมระบบ Auto-generate ชื่อ, รหัสใบรับรอง และปุ่ม Export PDF |
| **Department KM Space Hub** | ตัวสลับพื้นที่ความรู้ตามฝ่าย (Dev, QA, HR, Sales, Support) พร้อมแสดงสถิติบทความและเจ้าของฝ่าย |

---

### ✅ Step 3: Course Detail & Curriculum Outline (2026-08-20)
- **Course Models Expansion (`course.model.ts`):**
  - เพิ่มฟิลด์: `whatYouWillLearn`, `requirements`, `targetAudience`, `language`, `lastUpdated`, `certificateAvailable`, `reviews`, `faqs`, `isPreviewable`, `bio`, `totalCourses`, `totalStudents`
- **Course Detail Component (`CourseDetailComponent`):**
  - Breadcrumb Bar นำทาง
  - Hero Banner พร้อม Key Badges, Rating, Duration, Total Lessons, Instructor Info
  - Action Sidebar Card: ปุ่ม Enroll / Resume, Progress Bar, What's included checklist
  - Tabs: ภาพรวมหลักสูตร, วัตถุประสงค์การเรียนรู้, คุณสมบัติผู้เรียน
  - Curriculum Outline Accordion: รายการ Modules & Lessons พร้อมระยะเวลา, ป้ายพรีวิว และปุ่ม Checkbox ทำเครื่องหมายเรียนจบแบบ Real-time
  - Instructor Profile Card: แสดง Bio, จำนวนหลักสูตรที่สอน, จำนวนผู้เรียน, Rating
  - Reviews Section: ความคิดเห็นและดาวจากเพื่อนร่วมงาน
  - FAQ Accordion: คำถามที่พบบ่อยพร้อมคำตอบ
- **Navigation & Routing Integration:**
  - Route `/courses/:id` เชื่อมโยงเข้าสู่ `CourseDetailComponent`
  - การ์ดใน Course Catalog รองรับคลิกภาพปกหรือชื่อคอร์สเพื่อเปิดหน้ารายละเอียด

---

## 🎯 แผนการพัฒนาในขั้นตอนถัดไป (Upcoming Steps Roadmap)

- **Step 4: Classroom Player & Video Lesson (ห้องเรียนออนไลน์)**
  - เครื่องเล่นวิดีโอ `sic-video-player`
  - Playlist ด้านข้างแสดงบทเรียน พร้อม Checkmark สถานะเรียนจบ
  - ปุ่ม Next Lesson / Mark as Completed และแท็บเอกสารประกอบ
- **Step 5: Quiz & Assessment Engine (ระบบทำแบบทดสอบ)**
  - ข้อสอบ Multiple Choice / True-False พร้อมตัวจับเวลา
  - ระบบตรวจคะแนนและตัดเกรดอัตโนมัติ (เกณฑ์ 80%)
- **Step 6: Automated Certificate Generator (ใบประกาศนียบัตร)**
  - หน้าดูใบ Certificate สวยงามพร้อมปุ่มพิมพ์ PDF
- **Step 7: Knowledge Base KM Spaces (คลังความรู้ฝ่ายต่างๆ)**
  - แยก Space ตามแผนก (Dev, QA, HR, Sales, Support)
  - Instant Search และหน้าอ่าน Wiki พร้อม Markdown/Code Viewer
- **Step 8: Instructor Course Builder & Admin Reporting**
  - หน้ารายงานสถิติภาพรวม Completion Rate ของพนักงาน
