# 🎓 SICR E-LEARNING & KM Platform — Project Instructions

## 🛑 กฎสำคัญที่สุดในการทำงาน (Strict Operational Rules)
1. **ทำทีละชิ้น/โมดูลเท่านั้น (One step at a time)**
2. **เมื่อทำเสร็จ 1 ตัว ต้องหยุดส่งงานและรอให้ผู้ใช้ตรวจหน้าจอ (Check Preview) ก่อนเสมอ ห้ามทำข้ามหรือทำล่วงหน้าหลายตัวพร้อมกันเด็ดขาด**
3. **Responsive Design ต้องสมบูรณ์แบบทุกขนาดจอ (Crucial):**
   - รองรับตั้งแต่จอใหญ่ **1920x1200**, 1920x1080, Laptop 1366-1440px, Tablet, จนถึง Mobile
   - ห้ามมีปุ่มล้นกล่อง, ห้ามมีข้อความเมนูตัดคำขึ้นบรรทัดใหม่แปลกๆ (ต้องใส่ `white-space: nowrap` และ Flex Layout ที่ยืดหยุ่นสวยงาม)
4. **Branching Strategy (Strict):**
   - **`dev`**: สำหรับพัฒนาและทดสอบฟีเจอร์ทั้งหมด (Active Working Branch)
   - **`main`**: สงวนไว้สำหรับ Production Deployment เท่านั้น
   - ห้าม Commit หรือ Push ขึ้น Git โดยพลการ ต้องรอคำสั่งจากผู้ใช้เสมอ
5. **รูปแบบการเขียน Git Commit (เมื่อได้รับคำสั่งให้ Commit):**
   - ต้องเขียนหัวข้อ Commit เป็น **ภาษาไทย** เสมอ
   - ต้องมี **Description (คำอธิบายเพิ่มเติม)** เป็นภาษาไทยแจกแจงรายละเอียดว่าแก้ไขหรือสร้างอะไรไปบ้างอย่างชัดเจน
6. **การตรวจสอบ Build Error ทุกรอบการทำงานอย่างรอบคอบสูงสุด (Mandatory Thorough Build Validation):**
   - ต้องรัน `cmd /c npm run build` และ `cmd /c npx ng build demo` ตรวจสอบทุกครั้งหลังเสร็จแต่ละรอบ/โมดูล
   - ตรวจสอบ Path การอ้างอิง Assets/CSS (เช่น ใน `angular.json`) ต้องชี้ไปยัง Source paths เสมอ ไม่ให้เกิดปัญหา Resolve path เมื่อโฟลเดอร์ `dist/` ยังไม่ถูกสร้าง
   - หากมี Error หรือ Warning ต้องแก้ไขให้สมบูรณ์ (Build ผ่าน 100% Zero Errors/Zero Warnings) ก่อนส่งมอบงานเสมอ ห้ามละเลยโดยเด็ดขาด

## 📌 ข้อมูลและเอกสารอ้างอิง
- เอกสารสเปกระบบฉบับสมบูรณ์: [HANDOFF.md](file:///c:/Project/sicr-framework-ng/HANDOFF.md)
- บันทึกความคืบหน้าระบบและ Skill Tracker: [.agents/skills/sicr-elearning-tracker/SKILL.md](file:///c:/Project/sicr-framework-ng/.agents/skills/sicr-elearning-tracker/SKILL.md)
- แหล่งอ้างอิงและลิงก์ Docmost: [project.md](file:///c:/Project/sicr-framework-ng/project.md)

## 🎨 Design System & Theme
- **Brand Primary:** `#00a887` (Soft Inter Chiangrai Teal Green)
- **Framework:** Angular 22 Standalone + `@sic-ng` Component Library
- **Active Dev Server:** `http://localhost:4200`
