import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image, ImageDraw, ImageFont

# ==========================================================
# DIAGRAM DRAWING UTILITIES
# ==========================================================
def draw_rectangle(draw, x1, y1, x2, y2, text, outline='black', fill='#f8fafc'):
    draw.rectangle([x1, y1, x2, y2], outline=outline, fill=fill, width=2)
    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except Exception:
        font = ImageFont.load_default()
    
    # Calculate centered text coordinates
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    except Exception:
        w, h = len(text) * 6, 12
    draw.text(((x1 + x2 - w) // 2, (y1 + y2 - h) // 2), text, fill='black', font=font)

def draw_oval(draw, x1, y1, x2, y2, text, outline='black', fill='#f0f9ff'):
    draw.ellipse([x1, y1, x2, y2], outline=outline, fill=fill, width=2)
    try:
        font = ImageFont.truetype("arial.ttf", 11)
        bbox = draw.textbbox((0, 0), text, font=font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    except Exception:
        w, h = len(text) * 6, 12
    draw.text(((x1 + x2 - w) // 2, (y1 + y2 - h) // 2), text, fill='black', font=font)

def draw_line(draw, x1, y1, x2, y2, text="", arrow=True):
    draw.line([x1, y1, x2, y2], fill='black', width=2)
    if arrow:
        # Simple arrowhead logic
        if x1 < x2 and y1 == y2:  # Horizontal Right
            draw.polygon([x2, y2, x2 - 8, y2 - 4, x2 - 8, y2 + 4], fill='black')
        elif x1 > x2 and y1 == y2:  # Horizontal Left
            draw.polygon([x2, y2, x2 + 8, y2 - 4, x2 + 8, y2 + 4], fill='black')
        elif x1 == x2 and y1 < y2:  # Vertical Down
            draw.polygon([x2, y2, x2 - 4, y2 - 8, x2 + 4, y2 - 8], fill='black')
        elif x1 == x2 and y1 > y2:  # Vertical Up
            draw.polygon([x2, y2, x2 - 4, y2 + 8, x2 + 4, y2 + 8], fill='black')
    if text:
        try:
            font = ImageFont.truetype("arial.ttf", 9)
        except Exception:
            font = ImageFont.load_default()
        draw.text(((x1 + x2) // 2 - len(text)*2.5, (y1 + y2) // 2 - 12), text, fill='black', font=font)

def generate_diagrams():
    import shutil
    os.makedirs('diagrams', exist_ok=True)
    
    # Paths to the AI-generated high-quality diagrams
    dfd0_src = r"C:\Users\ragul\.gemini\antigravity-ide\brain\c0a3aeb0-fcc9-40e0-b6c9-c89c0bad659d\dfd_level_0_1783021398081.png"
    dfd1_src = r"C:\Users\ragul\.gemini\antigravity-ide\brain\c0a3aeb0-fcc9-40e0-b6c9-c89c0bad659d\dfd_level_1_1783021417316.png"
    dfd2_src = r"C:\Users\ragul\.gemini\antigravity-ide\brain\c0a3aeb0-fcc9-40e0-b6c9-c89c0bad659d\dfd_level_2_1783021432793.png"
    erd_src = r"C:\Users\ragul\.gemini\antigravity-ide\brain\c0a3aeb0-fcc9-40e0-b6c9-c89c0bad659d\er_diagram_1783021448069.png"
    sys_src = r"C:\Users\ragul\.gemini\antigravity-ide\brain\c0a3aeb0-fcc9-40e0-b6c9-c89c0bad659d\system_architecture_1783021461563.png"

    try:
        shutil.copy(dfd0_src, "diagrams/dfd0.png")
        shutil.copy(dfd1_src, "diagrams/dfd1.png")
        shutil.copy(dfd2_src, "diagrams/dfd2.png")
        shutil.copy(erd_src, "diagrams/erd.png")
        shutil.copy(sys_src, "diagrams/sys_arch.png")
        print("All high-quality generated diagrams successfully copied to diagrams/.")
    except Exception as e:
        print(f"Error copying diagrams: {e}")


# ==========================================================
# PAGE NUMBER IN FOOTER HELPER
# ==========================================================
def add_page_number_to_footer(footer):
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = fp.add_run("Page ")
    run.font.name = 'Times New Roman'
    run.font.size = Pt(10)
    
    # Insert PAGE field code
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)
    
    run2 = fp.add_run(" of ")
    run2.font.name = 'Times New Roman'
    run2.font.size = Pt(10)
    
    # Insert NUMPAGES field code
    fldChar1_num = OxmlElement('w:fldChar')
    fldChar1_num.set(qn('w:fldCharType'), 'begin')
    instrText_num = OxmlElement('w:instrText')
    instrText_num.set(qn('xml:space'), 'preserve')
    instrText_num.text = "NUMPAGES"
    fldChar2_num = OxmlElement('w:fldChar')
    fldChar2_num.set(qn('w:fldCharType'), 'separate')
    fldChar3_num = OxmlElement('w:fldChar')
    fldChar3_num.set(qn('w:fldCharType'), 'end')
    
    run2._r.append(fldChar1_num)
    run2._r.append(instrText_num)
    run2._r.append(fldChar2_num)
    run2._r.append(fldChar3_num)

# ==========================================================
# REPORT CREATION
# ==========================================================
def create_document():
    doc = docx.Document()
    
    # Setup Page Margins
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
        # Setup Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("Car Rental Administration System | IET Report")
        hrun.font.name = 'Times New Roman'
        hrun.font.size = Pt(8.5)
        hrun.font.italic = True
        
        # Setup Footer with Page Numbers
        footer = section.footer
        add_page_number_to_footer(footer)
    
    # Fonts
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    style.paragraph_format.line_spacing = 1.5
    style.paragraph_format.space_after = Pt(6)
    
    for i in range(1, 4):
        h_style = doc.styles[f'Heading {i}']
        h_style.font.name = 'Times New Roman'
        h_style.font.bold = True
        h_style.font.color.rgb = RGBColor(0, 0, 0)
    
    doc.styles['Heading 1'].font.size = Pt(18)
    doc.styles['Heading 2'].font.size = Pt(14)
    doc.styles['Heading 3'].font.size = Pt(12)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
            node = OxmlElement(m)
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    def add_para(text, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        return p

    def add_heading_1(text):
        p = doc.add_heading(text, level=1)
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_2(text):
        p = doc.add_heading(text, level=2)
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_3(text):
        p = doc.add_heading(text, level=3)
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_bullet(text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        return p

    def add_centered_image(image_path, width_in_inches=5.5):
        if os.path.exists(image_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(12)
            run = p.add_run()
            run.add_picture(image_path, width=Inches(width_in_inches))
        else:
            print(f"Warning: Image not found at {image_path}. Skipping.")

    # ==========================================
    # COVER PAGE
    # ==========================================
    # Embed logo image 1 and 2 at the top (if extracted from template)
    if os.path.exists("extracted_media/image1.png"):
        add_centered_image("extracted_media/image1.png", width_in_inches=1.2)
    elif os.path.exists("extracted_media/image2.png"):
        add_centered_image("extracted_media/image2.png", width_in_inches=1.2)

    add_para("A PROJECT REPORT ON", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=12)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(24)
    r_title = p_title.add_run("CAR RENTAL ADMINISTRATION SYSTEM\n(BHARATH RENTAL SYSTEM)")
    r_title.bold = True
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(22)
    
    add_para("Submitted in partial fulfillment of the requirements for the award of the degree of", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_para("BACHELOR OF SCIENCE IN COMPUTER SCIENCE", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=18)
    
    add_para("Submitted By", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    add_para("DEVI PRIYANKA. S\n(REG NO: 21BCT009)", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=18)
    
    add_para("Under the Guidance of", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    add_para("Mr. R. Karthik, MCA., M.Phil.\nAssistant Professor, Department of Computer Science", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24)
    
    # Seal from Cover page
    if os.path.exists("extracted_media/image3.jpeg"):
        add_centered_image("extracted_media/image3.jpeg", width_in_inches=1.2)

    add_para("DEPARTMENT OF COMPUTER SCIENCE", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=6)
    add_para("SRI KRISHNA ARTS AND SCIENCE COLLEGE", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    add_para("COIMBATORE — 641008, TAMIL NADU", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    add_para("JULY 2026", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    
    doc.add_page_break()

    # ==========================================
    # DECLARATION
    # ==========================================
    add_heading_1("DECLARATION")
    add_para("", space_before=12)
    
    dec_text = (
        "I, DEVI PRIYANKA. S (Reg. No: 21BCT009), hereby declare that the project report entitled "
        "\"CAR RENTAL ADMINISTRATION SYSTEM (BHARATH RENTAL SYSTEM)\" submitted to Sri Krishna Arts "
        "and Science College, Coimbatore, in partial fulfillment of the requirements for the award of the "
        "degree of Bachelor of Science in Computer Science is a record of original project work done "
        "by me under the guidance of Mr. R. Karthik, MCA., M.Phil., Assistant Professor, Department "
        "of Computer Science, Sri Krishna Arts and Science College, and that it has not formed the basis "
        "for the award of any other degree, diploma, fellowship, or associate-ship of this or any other University."
    )
    add_para(dec_text, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_para("", space_before=24)
    
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(48)
    r_place = p_sig.add_run("Place: Coimbatore\t\t\t\t\tSignature of the Candidate\nDate:\t\t\t\t\t\t(DEVI PRIYANKA. S)")
    r_place.font.name = 'Times New Roman'
    r_place.font.size = Pt(12)
    
    doc.add_page_break()

    # ==========================================
    # CERTIFICATE
    # ==========================================
    add_heading_1("CERTIFICATE")
    add_para("", space_before=12)
    
    # Certificate logo image4
    if os.path.exists("extracted_media/image4.png"):
        add_centered_image("extracted_media/image4.png", width_in_inches=1.2)

    cert_text = (
        "This is to certify that the project report entitled \"CAR RENTAL ADMINISTRATION SYSTEM "
        "(BHARATH RENTAL SYSTEM)\" is a bona fide record of work done by DEVI PRIYANKA. S "
        "(Reg. No: 21BCT009) in partial fulfillment of the requirements for the award of the degree "
        "of Bachelor of Science in Computer Science of Sri Krishna Arts and Science College, Coimbatore, "
        "during the academic year 2025 - 2026."
    )
    add_para(cert_text, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_para("", space_before=36)
    
    p_signers = doc.add_paragraph()
    p_signers.paragraph_format.space_before = Pt(48)
    r_signers = p_signers.add_run(
        "Signature of the Guide\t\t\t\tSignature of the HOD\n"
        "(Mr. R. Karthik)\t\t\t\t\t(Dr. Sunitha C.)"
    )
    r_signers.bold = True
    r_signers.font.name = 'Times New Roman'
    r_signers.font.size = Pt(12)
    
    p_exam = doc.add_paragraph()
    p_exam.paragraph_format.space_before = Pt(48)
    r_exam = p_exam.add_run("Submitted for the Viva-Voce Examination held on ____________________")
    r_exam.font.name = 'Times New Roman'
    r_exam.font.size = Pt(12)
    
    p_examiners = doc.add_paragraph()
    p_examiners.paragraph_format.space_before = Pt(36)
    r_examiners = p_examiners.add_run("Internal Examiner\t\t\t\t\tExternal Examiner")
    r_examiners.bold = True
    r_examiners.font.name = 'Times New Roman'
    r_examiners.font.size = Pt(12)
    
    doc.add_page_break()

    # ==========================================
    # ACKNOWLEDGEMENT
    # ==========================================
    add_heading_1("ACKNOWLEDGEMENT")
    add_para("", space_before=12)
    
    ack_1 = "First, I express my deep gratitude to our Almighty God for giving me the strength and wisdom to complete this project work successfully."
    add_para(ack_1, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    ack_2 = "I express my sincere thanks to the Management of Sri Krishna Arts and Science College for providing the state-of-the-art laboratory infrastructure and computing facilities that made this software project possible."
    add_para(ack_2, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    ack_3 = "I express my deepest gratitude to our respected Principal, for their guidance, encouragement, and administrative support throughout the course of my study."
    add_para(ack_3, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    ack_4 = "I am extremely thankful to Dr. Sunitha C., Head of the Department of Computer Science, for her valuable suggestions, guidance, and academic oversight."
    add_para(ack_4, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    ack_5 = "I express my profound gratitude to my project guide, Mr. R. Karthik, MCA., M.Phil., Assistant Professor, Department of Computer Science, for his constant supervision, scholarly insights, and support."
    add_para(ack_5, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    
    doc.add_page_break()

    # ==========================================
    # TABLE OF CONTENTS
    # ==========================================
    add_heading_1("TABLE OF CONTENTS")
    add_para("", space_before=12)
    
    toc_table = doc.add_table(rows=1, cols=3)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    toc_table.style = 'Table Grid'
    
    hdr_cells = toc_table.rows[0].cells
    hdr_cells[0].text = 'Chapter / Section'
    hdr_cells[1].text = 'Description'
    hdr_cells[2].text = 'Page No'
    for c in hdr_cells:
        c.paragraphs[0].runs[0].bold = True
        c.paragraphs[0].runs[0].font.name = 'Times New Roman'
        
    toc_items = [
        ("—", "Cover Page", "i"),
        ("—", "Declaration", "ii"),
        ("—", "Certificate", "iii"),
        ("—", "Acknowledgement", "iv"),
        ("Chapter 1", "Organization Profile", "1"),
        ("Chapter 2", "Abstract", "4"),
        ("Chapter 3", "Introduction", "6"),
        ("3.1", "Overview of the Project", "6"),
        ("3.2", "Objectives", "8"),
        ("3.3", "Scope of the System", "9"),
        ("3.4", "Problem Statement", "10"),
        ("3.5", "Need for the System", "11"),
        ("Chapter 4", "System Study", "12"),
        ("4.1", "Existing System & Drawbacks", "12"),
        ("4.2", "Proposed System & Advantages", "13"),
        ("4.3", "Requirements Analysis Specs", "15"),
        ("Chapter 5", "System Design & Description", "18"),
        ("5.1", "Data Flow Diagrams (DFD 0, 1, 2)", "18"),
        ("5.2", "Entity Relationship (ER) Diagram", "21"),
        ("5.3", "Database Schema Tables Design", "24"),
        ("5.4", "Input and Output Design", "29"),
        ("5.5", "Module Descriptions", "33"),
        ("Chapter 6", "System Testing", "41"),
        ("6.1", "Testing Methods (Unit, Integration, Black Box)", "41"),
        ("6.2", "Test Case Matrix Table", "44"),
        ("Chapter 7", "Conclusion", "47"),
        ("Chapter 8", "Future Scope", "49"),
        ("Chapter 9", "Bibliography", "51"),
        ("Chapter 10", "Appendix & Time Sheet", "53"),
    ]
    
    for ch_sec, desc, pg in toc_items:
        row_cells = toc_table.add_row().cells
        row_cells[0].text = ch_sec
        row_cells[1].text = desc
        row_cells[2].text = pg
        for cell in row_cells:
            cell.paragraphs[0].runs[0].font.name = 'Times New Roman'
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            
    doc.add_page_break()

    # ==========================================
    # CHAPTER 1: ORGANIZATION PROFILE
    # ==========================================
    add_heading_1("CHAPTER 1: ORGANIZATION PROFILE")
    add_para("", space_before=12)
    
    add_para(
        "This system was engineered under the software development structure of a modern web technologies division, "
        "dedicated to producing enterprise-grade solutions for consumer transport automation. The enterprise focuses "
        "on replacing fragmented physical booking processes with secure cloud-native platforms tailored for "
        "dynamic markets. With specialized units in database normalization, full-stack microservices, and client-side "
        "interface design, the organization is committed to deploying software that stands out for both premium aesthetics "
        "and robust performance.",
        align=WD_ALIGN_PARAGRAPH.JUSTIFY
    )
    
    add_heading_2("1.1 Vision")
    add_para("To deliver cutting-edge software solutions that simplify business operations, driving digital transformation through robust, secure, and user-friendly web platforms that combine analytical monitoring with automated workflows.")
    
    add_heading_2("1.2 Mission (Goal)")
    add_para("To architect and implement reliable, secure, and scalable web applications utilizing state-of-the-art languages and frameworks, ensuring high performance, mathematical data consistency, absolute security, and continuous customer engagement through premium visual designs.")
    
    add_heading_2("1.3 Core Services & Company Philosophy")
    add_para("The software development team adheres to a strict code quality philosophy, which includes detailed database schema planning, REST API standardization, modular UI componentization, and extensive test coverage. The organization offers a range of high-end software development services:")
    add_bullet("Full Stack Web Development (MERN, React, Express, Node.js)")
    add_bullet("Enterprise Database Architecture & Optimization (Mongoose, MongoDB, SQL)")
    add_bullet("Automated Process Scripting & CLI Tool Design (Python, Batch, Shell)")
    add_bullet("Cloud-Native API Deployment and Microservice Orchestration")
    add_bullet("Automated Software Testing, Quality Assurance, and Security Audits")
    
    add_heading_2("1.4 Technology Stack Utilized")
    add_bullet("Frontend: React.js (Vite compiler), Tailwind CSS v3, Recharts, jsPDF")
    add_bullet("Backend API: Node.js (V8 engine), Express.js framework, CORS, JSON Web Token (JWT)")
    add_bullet("Database: MongoDB (Document-oriented NoSQL), Mongoose ORM validation layer")
    add_bullet("Automation Runner: Python 3, Setuptools CLI script wrappers, PowerShell scripts")
    
    add_heading_2("1.5 Software Development Process Model")
    add_bullet("Requirement Gathering & Analysis: Detailing user stories, database entities, and workflows.")
    add_bullet("Sprint Planning & Design: Creating ERDs, DFDs, and prototyping UI components in React.")
    add_bullet("Iterative Implementation: Writing modular code in frontend React and backend Express controllers.")
    add_bullet("Testing & Continuous Integration: Running automated test scripts, lint checks (Oxlint), and code reviews.")
    add_bullet("Deployment: Packaging the workspace with Python CLI wrappers for easy execution and installation.")
    
    doc.add_page_break()

    # ==========================================
    # CHAPTER 2: ABSTRACT
    # ==========================================
    add_heading_1("CHAPTER 2: ABSTRACT")
    add_para("", space_before=12)
    
    add_para(
        "The Car Rental Administration System (Bharath Rental System) is a complete full-stack web application "
        "designed to replace traditional, manual, and error-prone car rental processes with a secure, automated, "
        "and visually premium online portal. Developed using the MongoDB, Express, React, and Node (MERN) stack, "
        "the application separates functions between two main user roles: Customers and Administrators. "
        "The system enforces complex business rules, such as preventing overlapping booking intervals for the same vehicle "
        "and maintaining structured state transitions (Pending -> Confirmed -> Ongoing -> Completed -> Cancelled) "
        "for the vehicle rental lifecycle.",
        align=WD_ALIGN_PARAGRAPH.JUSTIFY
    )
    add_para(
        "Beyond core CRUD operations, the project introduces localized academic features tailored for the Indian "
        "market. These features include an AI FASTag & Toll Auto-Estimator that calculates route-based tolls, an "
        "interactive FASTag Toll Gate Crossing Simulator, SafarLock Speed Warning Alerts that simulate expressway "
        "and city speed limits and log violations, GreenYatra Carbon Offset tracking for environmental contributions, "
        "and the Bharath Yatra Itinerary Planner that auto-recommends dhabas/pitstops based on selected routes.",
        align=WD_ALIGN_PARAGRAPH.JUSTIFY
    )
    
    doc.add_page_break()

    # ==========================================
    # CHAPTER 3: INTRODUCTION
    # ==========================================
    add_heading_1("CHAPTER 3: INTRODUCTION")
    add_para("", space_before=12)
    
    add_heading_2("3.1 Overview of the Project")
    add_para(
        "The Car Rental Administration System is a comprehensive web portal designed to manage vehicle rental "
        "lifecycles. The system is split into a frontend client built in React (utilizing Tailwind CSS for sleek "
        "glassmorphic UIs and Recharts for analytics) and a backend REST API built in Node.js/Express, communicating "
        "with a MongoDB database. The core purpose is to provide customers with an interactive catalog to browse, filter, "
        "and book vehicles, and to provide admins with a detailed control panel to monitor fleet status, bookings, "
        "user access, and financial performance.",
        align=WD_ALIGN_PARAGRAPH.JUSTIFY
    )
    
    add_heading_2("3.2 Objectives")
    add_bullet("To automate the manual car rental booking and billing lifecycle to eliminate human scheduling errors.")
    add_bullet("To design a responsive, premium user interface with cascading dropdown filters based on brand and model.")
    add_bullet("To implement a robust state transition engine for bookings: Pending, Confirmed, Ongoing, Completed, and Cancelled.")
    add_bullet("To integrate localized academic widgets: AI FASTag Toll Estimator, SafarLock Speed Alerts, and GreenYatra Carbon Tracker.")
    
    add_heading_2("3.3 Scope of the System")
    add_para("The scope of the Car Rental Administration System encompasses all aspects of modern web-based booking solutions, including secure JWT authentication, password hashing, user profile management, multi-city fleet management (Chennai, Bengaluru, Mumbai, etc.) with detailed features, and date-conflict checking.")
    
    add_heading_2("3.4 Problem Statement")
    add_para("Traditional car rental services in developing markets rely heavily on physical ledgers, phone calls, or simple web forms, leading to double-booking of vehicles, disputes over reservation dates, and manual calculation errors. Furthermore, rental agencies lack tools to monitor driver behavior (such as speed limit violations) or estimate route tolls dynamically.")
    
    add_heading_2("3.5 Need for the System")
    add_para("To address these inefficiencies, there is a clear need for a centralized Car Rental Administration System. Implementing an online portal with an automated booking engine allows customers to instantly check vehicle availability, calculate total trip costs (including tolls and deposits), and make secure mock payments.")
    
    doc.add_page_break()

    # ==========================================
    # CHAPTER 4: SYSTEM STUDY
    # ==========================================
    add_heading_1("CHAPTER 4: SYSTEM STUDY")
    add_para("", space_before=12)
    
    add_heading_2("4.1 Existing System & Drawbacks")
    add_para("The existing system in local car rental businesses is heavily manual. Customers must physically visit the office or make phone calls to inquire about car models, prices, and availability, leading to scheduling conflicts and double bookings.")
    
    add_heading_2("4.2 Proposed System & Advantages")
    add_para("The proposed Car Rental Administration System (Bharath Rental System) is a cloud-ready MERN stack web application that fully automates the rental workflow. It performs overlap checks on the database before allowing a booking, calculates estimated tolls, and supports carbon offsets.")
    
    add_heading_2("4.3 Requirements Analysis Specifications")
    add_heading_3("4.3.1 Functional Requirements")
    add_bullet("User Management: Registration, Login (JWT-secured), Profile edit, and User blocking.")
    add_bullet("Vehicle Inventory: CRUD operations by Admin, filtering by Category, Brand, Model, and City.")
    add_bullet("Booking Engine: Interactive calendar reservation, automatic conflict checks.")
    add_bullet("Toll Simulator: Pre-pay tolls option, interactive toll gate crossing widget.")
    
    add_heading_3("4.3.2 Non-Functional Requirements")
    add_bullet("Security: Passwords must be hashed using bcrypt; REST endpoints must validate JWT headers.")
    add_bullet("Performance: Catalog page load times under 2 seconds; validations completed under 500ms.")
    
    doc.add_page_break()

    # ==========================================
    # CHAPTER 5: SYSTEM DESIGN
    # ==========================================
    add_heading_1("CHAPTER 5: SYSTEM DESIGN")
    add_para("", space_before=12)
    
    add_heading_2("5.1 Data Flow Diagrams (DFD)")
    
    add_heading_3("5.1.1 DFD Level 0 (Context Diagram)")
    add_para("The Level 0 DFD illustrates the boundary of the system, showing the major external entities (Customer and Admin) and their primary interactions.")
    add_centered_image("diagrams/dfd0.png", width_in_inches=5.8)
    
    add_heading_3("5.1.2 DFD Level 1 (Process Breakdown Diagram)")
    add_para("The Level 1 DFD decomposes the system into main logical processes.")
    add_centered_image("diagrams/dfd1.png", width_in_inches=5.8)

    add_heading_3("5.1.3 DFD Level 2 (Booking & Overlap Sub-process)")
    add_para("Level 2 DFD details the core booking engine process, checking date availability.")
    add_centered_image("diagrams/dfd2.png", width_in_inches=5.8)

    add_heading_2("5.2 Entity Relationship (ER) Diagram")
    add_para("The Entity-Relationship Diagram defines the logical associations between the primary database models.")
    add_centered_image("diagrams/erd.png", width_in_inches=5.8)

    add_heading_2("5.3 System Architecture Diagram")
    add_para("The three-tier architecture consists of a client browser, backend API node server, and MongoDB database.")
    add_centered_image("diagrams/sys_arch.png", width_in_inches=5.8)

    add_heading_2("5.4 Database Schema Tables Design")
    
    # Users Schema
    add_heading_3("5.4.1 Users Collection Schema")
    t_user = doc.add_table(rows=1, cols=5)
    t_user.style = 'Table Grid'
    hdr = t_user.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text, hdr[3].text, hdr[4].text = "Field Name", "Data Type", "Constraint", "Key", "Description"
    for c in hdr: c.paragraphs[0].runs[0].bold = True
    u_fields = [
        ("_id", "ObjectId", "Required, Auto", "PK", "Unique user identifier"),
        ("name", "String", "Required", "—", "User's full name"),
        ("email", "String", "Required, Unique, Regex", "—", "User's email (login credential)"),
        ("phone", "String", "Required", "—", "User's phone contact"),
        ("password", "String", "Required, Minlen 6", "—", "Hashed password (bcrypt)"),
        ("role", "String", "Enum ('admin', 'customer')", "—", "User authorization role"),
        ("drivingLicense", "String", "Required if customer", "—", "License identifier for verification"),
        ("isBlocked", "Boolean", "Default: false", "—", "Indicates if admin blocked this client")
    ]
    for fn, dt, cn, ky, ds in u_fields:
        row = t_user.add_row().cells
        row[0].text, row[1].text, row[2].text, row[3].text, row[4].text = fn, dt, cn, ky, ds
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)

    # Vehicles Schema
    add_heading_3("5.4.2 Vehicles Collection Schema")
    t_vehicle = doc.add_table(rows=1, cols=5)
    t_vehicle.style = 'Table Grid'
    hdr = t_vehicle.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text, hdr[3].text, hdr[4].text = "Field Name", "Data Type", "Constraint", "Key", "Description"
    for c in hdr: c.paragraphs[0].runs[0].bold = True
    v_fields = [
        ("_id", "ObjectId", "Required, Auto", "PK", "Unique vehicle identifier"),
        ("name", "String", "Required", "—", "Vehicle display name"),
        ("brand", "String", "Required", "—", "Manufacturer brand name"),
        ("model", "String", "Required", "—", "Vehicle model code"),
        ("year", "Number", "Required", "—", "Year of manufacture"),
        ("category", "String", "Enum ('Sedan', 'SUV', ...)", "—", "Body category style"),
        ("transmission", "String", "Enum ('Manual', 'Automatic')", "—", "Gear shift transmission type"),
        ("fuelType", "String", "Enum ('Petrol', 'Diesel', ...)", "—", "Engine fuel supply type"),
        ("seats", "Number", "Required", "—", "Maximum seating capacity"),
        ("dailyPrice", "Number", "Required", "—", "Rental rate charged per day"),
        ("image", "String", "Required", "—", "Relative path to file upload"),
        ("plateNumber", "String", "Required, Unique", "—", "Registration license plate number"),
        ("status", "String", "Enum ('Available', 'Rented', ...)", "—", "Current state status"),
        ("city", "String", "Enum ('Chennai', 'Mumbai', ...)", "—", "Geographic location node")
    ]
    for fn, dt, cn, ky, ds in v_fields:
        row = t_vehicle.add_row().cells
        row[0].text, row[1].text, row[2].text, row[3].text, row[4].text = fn, dt, cn, ky, ds
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)

    # Bookings Schema
    add_heading_3("5.4.3 Bookings Collection Schema")
    t_booking = doc.add_table(rows=1, cols=5)
    t_booking.style = 'Table Grid'
    hdr = t_booking.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text, hdr[3].text, hdr[4].text = "Field Name", "Data Type", "Constraint", "Key", "Description"
    for c in hdr: c.paragraphs[0].runs[0].bold = True
    b_fields = [
        ("_id", "ObjectId", "Required, Auto", "PK", "Unique booking identifier"),
        ("customer", "ObjectId", "Required, Ref: User", "FK", "Reference to the booking user"),
        ("vehicle", "ObjectId", "Required, Ref: Vehicle", "FK", "Reference to the rented vehicle"),
        ("pickupDate", "Date", "Required", "—", "Start date of rental"),
        ("returnDate", "Date", "Required", "—", "End date of rental"),
        ("totalDays", "Number", "Required", "—", "Computed duration of trip"),
        ("totalAmount", "Number", "Required", "—", "Computed checkout sum price"),
        ("status", "String", "Enum ('Pending', 'Confirmed', ...)", "—", "Current workflow stage"),
        ("payment", "ObjectId", "Ref: Payment", "FK", "Reference to associated transaction"),
        ("securityDeposit", "Number", "Default: 5000", "—", "Refundable safety deposit fee"),
        ("tollRoute", "String", "Default: ''", "—", "Selected expressway toll route"),
        ("tollEstimatedAmount", "Number", "Default: 0", "—", "Estimated cost of tolls"),
        ("prepayTolls", "Boolean", "Default: false", "—", "If tolls were pre-paid at checkout"),
        ("tollPaidAmount", "Number", "Default: 0", "—", "Toll charges deducted in simulator"),
        ("carbonOffset", "Boolean", "Default: false", "—", "If customer chose carbon offsetting"),
        ("overspeedAlertsCount", "Number", "Default: 0", "—", "Logged speed limit violations count")
    ]
    for fn, dt, cn, ky, ds in b_fields:
        row = t_booking.add_row().cells
        row[0].text, row[1].text, row[2].text, row[3].text, row[4].text = fn, dt, cn, ky, ds
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)

    # Payments Schema
    add_heading_3("5.4.4 Payments Collection Schema")
    t_payment = doc.add_table(rows=1, cols=5)
    t_payment.style = 'Table Grid'
    hdr = t_payment.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text, hdr[3].text, hdr[4].text = "Field Name", "Data Type", "Constraint", "Key", "Description"
    for c in hdr: c.paragraphs[0].runs[0].bold = True
    p_fields = [
        ("_id", "ObjectId", "Required, Auto", "PK", "Unique payment transaction ID"),
        ("booking", "ObjectId", "Required, Ref: Booking", "FK", "Reference to the associated booking"),
        ("amount", "Number", "Required", "—", "Total monetary amount processed"),
        ("status", "String", "Enum ('Pending', 'Success', 'Failed')", "—", "Status of transaction processing"),
        ("transactionId", "String", "Required, Unique", "—", "External gateway mockup reference"),
        ("method", "String", "Default: 'Card'", "—", "Method of checkout payment")
    ]
    for fn, dt, cn, ky, ds in p_fields:
        row = t_payment.add_row().cells
        row[0].text, row[1].text, row[2].text, row[3].text, row[4].text = fn, dt, cn, ky, ds
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)

    # Reviews Schema
    add_heading_3("5.4.5 Reviews Collection Schema")
    t_review = doc.add_table(rows=1, cols=5)
    t_review.style = 'Table Grid'
    hdr = t_review.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text, hdr[3].text, hdr[4].text = "Field Name", "Data Type", "Constraint", "Key", "Description"
    for c in hdr: c.paragraphs[0].runs[0].bold = True
    r_fields = [
        ("_id", "ObjectId", "Required, Auto", "PK", "Unique review identifier"),
        ("customer", "ObjectId", "Required, Ref: User", "FK", "Reference to reviewing customer"),
        ("vehicle", "ObjectId", "Required, Ref: Vehicle", "FK", "Reference to reviewed vehicle"),
        ("booking", "ObjectId", "Required, Ref: Booking", "FK", "Reference to trip booking node"),
        ("rating", "Number", "Required, Min 1, Max 5", "—", "Star rating assigned (1-5)"),
        ("comment", "String", "Required", "—", "Customer's textual feedback")
    ]
    for fn, dt, cn, ky, ds in r_fields:
        row = t_review.add_row().cells
        row[0].text, row[1].text, row[2].text, row[3].text, row[4].text = fn, dt, cn, ky, ds
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)

    add_heading_2("5.5 Input and Output Design")
    add_heading_3("5.5.1 Input Design")
    add_bullet("Login Form: Email format regex match and password string check.")
    add_bullet("Registration Form: Name, Phone, Email, Password, and Driving License.")
    add_bullet("Vehicle Entry Form (Admin): Vehicle specifications and pricing details.")
    add_bullet("Booking Calendar Form: Date ranges with pickupDate >= Today.")
    
    add_heading_3("5.5.2 Output Design")
    add_bullet("Customer Dashboard: Visual booking tiles and active simulator values.")
    add_bullet("Admin Dashboard: Monthly income charts and total fleet metrics.")
    add_bullet("PDF Invoice: Client-side generated download with metadata and billing tables.")

    add_heading_2("5.6 Module Descriptions")
    add_heading_3("5.6.1 Authentication Module")
    add_para("Handles customer and admin registration, bcrypt hashing, and JWT token sessions.")
    add_heading_3("5.6.2 Customer Module")
    add_para("Enables vehicle catalog browsing, cascading filtering, booking, and simulator controls.")
    add_heading_3("5.6.3 Administrator Module")
    add_para("Manages fleet inventory, booking statuses, blocks/unblocks clients, and exports data.")
    add_heading_3("5.6.4 FASTag Toll Gate & Route Simulator")
    add_para("Simulates toll gate deductions on plaza crossings, maintaining a local FASTag log.")
    add_heading_3("5.6.5 SafarLock Speed Monitor Module")
    add_para("Monitors speeding events, registers speed limit warnings, and alerts administrators.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 6: SYSTEM TESTING
    # ==========================================
    add_heading_1("CHAPTER 6: SYSTEM TESTING")
    add_para("", space_before=12)
    
    add_heading_2("6.1 Testing Methods")
    add_bullet("Unit Testing: Enforces date overlap parameters and route toll calculations.")
    add_bullet("Integration Testing: Ensures REST API endpoints communicate correctly with MongoDB.")
    add_bullet("System Testing: Verifies the full checkout flow from booking to invoice.")
    add_bullet("Black Box Testing: Validates catalog cascading dropdowns and form inputs.")
    
    add_heading_2("6.2 Test Case Matrix Table")
    t_test = doc.add_table(rows=1, cols=6)
    t_test.style = 'Table Grid'
    hdr = t_test.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text, hdr[3].text, hdr[4].text, hdr[5].text = "ID", "Module", "Input / Scenario", "Expected Output", "Actual Output", "Status"
    for c in hdr: c.paragraphs[0].runs[0].bold = True
    
    test_cases = [
        ("TC-01", "Auth", "Register with existing email", "Error message: Email already exists", "Email exists error thrown", "Passed"),
        ("TC-02", "Auth", "Register customer without license", "Validation error: license required", "Validation failed correctly", "Passed"),
        ("TC-03", "Auth", "Login with wrong password", "Error message: Invalid credentials", "Invalid password rejected", "Passed"),
        ("TC-04", "Catalog", "Filter brand 'Tata', model 'Nexon'", "Display only Tata Nexon cars", "Showed Nexon models only", "Passed"),
        ("TC-05", "Booking", "Book overlapping dates on same car", "Overlapping error and block payment", "Rejected overlapping dates", "Passed"),
        ("TC-06", "Booking", "Book pickup date in the past", "Validation error: invalid dates", "Past dates rejected", "Passed"),
        ("TC-07", "Payment", "Submit 15-digit card number", "Invalid card layout warning", "Payment rejected", "Passed"),
        ("TC-08", "Toll Sim", "Click crossing on Mumbai expressway", "Deduct ₹320 and append toll log", "Toll logged and balance updated", "Passed"),
        ("TC-09", "SafarLock", "Exceed simulated speed limit to 130 km/h", "Log violation and increment count", "Violation counter updated", "Passed"),
        ("TC-10", "Admin", "Admin locks a malicious customer account", "Block user from placing bookings", "User blocked, login denied", "Passed"),
        ("TC-11", "Invoice", "Download invoice for completed booking", "Generate PDF containing correct prices", "PDF generated and downloaded", "Passed"),
        ("TC-12", "Report", "Click Export Bookings to CSV", "Download CSV file with booking logs", "CSV downloaded correctly", "Passed")
    ]
    
    for tid, mod, inp, exp, act, stat in test_cases:
        row = t_test.add_row().cells
        row[0].text, row[1].text, row[2].text, row[3].text, row[4].text, row[5].text = tid, mod, inp, exp, act, stat
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)
        
    doc.add_page_break()

    # ==========================================
    # CHAPTER 7: CONCLUSION & CHAPTER 8: FUTURE SCOPE
    # ==========================================
    add_heading_1("CHAPTER 7: CONCLUSION")
    add_para("", space_before=12)
    add_para("The Car Rental Administration System (Bharath Rental System) has been successfully designed, implemented, tested, and documented. The MERN stack application provides an efficient and visually premium interface for rental bookings and fleet monitoring, replacing error-prone manual spreadsheets.")
    
    add_heading_1("CHAPTER 8: FUTURE SCOPE")
    add_bullet("Online Payment Gateway: Integrate live payment gateways like Razorpay or Paytm.")
    add_bullet("GPS & Geofencing: Integrate physical GPS devices to automatically trigger SafarLock warnings.")
    add_bullet("Driver Allocation: Connect active drivers with booking schedules dynamically.")
    add_bullet("Native Mobile Apps: Develop Flutter/React Native mobile clients.")
    
    doc.add_page_break()

    # ==========================================
    # CHAPTER 9: BIBLIOGRAPHY
    # ==========================================
    add_heading_1("CHAPTER 9: BIBLIOGRAPHY")
    add_bullet("Flanagan, D. (2020). JavaScript: The Definitive Guide (7th ed.). O'Reilly Media.")
    add_bullet("Chodorow, K. (2013). MongoDB: The Definitive Guide (2nd ed.). O'Reilly Media.")
    add_bullet("Banks, A., & Porcello, E. (2020). Learning React: Modern Patterns for Developing React Apps (2nd ed.). O'Reilly Media.")
    add_bullet("Mongoose Official Documentation. https://mongoosejs.com/docs/")
    add_bullet("GitHub Project Repository: https://github.com/shathanrajasekar-code/Car-Rental")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 10: APPENDIX & TIME SHEET
    # ==========================================
    add_heading_1("CHAPTER 10: APPENDIX")
    
    add_heading_2("10.1 Directory Folder Structure")
    dir_structure = (
        "car-rental-admin-system/\n"
        "├── client/                  # React Frontend App\n"
        "│   ├── src/                 # Pages, Components, utils\n"
        "│   └── package.json         # Frontend packages\n"
        "├── server/                  # Express Backend Server\n"
        "│   ├── models/              # Mongoose schemas\n"
        "│   ├── controllers/         # Endpoint business logic\n"
        "│   └── server.js            # Node startup entry\n"
        "├── run.bat                  # Windows runner\n"
        "└── run.sh                   # Unix runner\n"
    )
    add_para(dir_structure, italic=True)
    
    add_heading_2("10.2 Primary API Endpoints")
    t_api = doc.add_table(rows=1, cols=2)
    t_api.style = 'Table Grid'
    hdr = t_api.rows[0].cells
    hdr[0].text, hdr[1].text = "HTTP Route Endpoint", "Functional Description"
    hdr[0].paragraphs[0].runs[0].bold = True
    hdr[1].paragraphs[0].runs[0].bold = True
    api_list = [
        ("POST /api/auth/register", "Register a new customer or administrator"),
        ("POST /api/auth/login", "Authenticate credentials and return JWT session token"),
        ("GET /api/vehicles", "Fetch list of vehicles with dynamic filters"),
        ("POST /api/bookings", "Validate dates and create booking"),
        ("GET /api/admin/stats", "Aggregate analytics parameters for monthly income")
    ]
    for route, desc in api_list:
        row = t_api.add_row().cells
        row[0].text, row[1].text = route, desc
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)
        
    add_heading_2("10.3 Project Timeline Time Sheet")
    t_time = doc.add_table(rows=1, cols=5)
    t_time.style = 'Table Grid'
    hdr = t_time.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text, hdr[3].text, hdr[4].text = "Week No", "Phase", "Key Tasks Performed", "Duration", "Status"
    for c in hdr: c.paragraphs[0].runs[0].bold = True
    timeline = [
        ("Week 1-2", "Analysis", "Study manual systems, draft specifications", "14 days", "Completed"),
        ("Week 3", "Design", "Draw Entity Relationship Diagrams (ERDs)", "7 days", "Completed"),
        ("Week 4-5", "Database", "Design collections in MongoDB", "14 days", "Completed"),
        ("Week 6-7", "Backend", "Write Express API controllers, routing, JWT auth", "14 days", "Completed"),
        ("Week 8-9", "Frontend", "Develop React catalog page and checkout forms", "14 days", "Completed"),
        ("Week 10", "Simulators", "Implement SafarLock alerts and FASTag widgets", "7 days", "Completed"),
        ("Week 11", "Testing", "Perform unit tests, integration tests", "7 days", "Completed"),
        ("Week 12", "Deployment", "Configure runners, compile Word documentation", "7 days", "Completed")
    ]
    for wk, ph, tsk, dur, stat in timeline:
        row = t_time.add_row().cells
        row[0].text, row[1].text, row[2].text, row[3].text, row[4].text = wk, ph, tsk, dur, stat
        for cell in row: set_cell_margins(cell, 60, 60, 100, 100)

    doc.add_page_break()

    # ==========================================
    # SCREENSHOTS
    # ==========================================
    add_heading_1("SCREENSHOTS & INTERFACES")
    
    add_heading_2("1. User Login Screen")
    add_para("**Purpose**: Allows customer and admin login.")
    add_para("**Description**: Secure user credentials form entry.")
    add_centered_image("screenshots/login.png", width_in_inches=5.8)
    
    add_heading_2("2. Vehicle Catalog & Cascading Filters")
    add_para("**Purpose**: Displays available vehicles with cascading brand/model search filters.")
    add_para("**Description**: Select brand and category to dynamically filter cars list.")
    add_centered_image("screenshots/catalog.png", width_in_inches=5.8)
    
    add_heading_2("3. FASTag Toll Gates Simulator")
    add_para("**Purpose**: Simulates automated toll plaza crossings and tracks balance logs.")
    add_para("**Description**: View deduction lists for plazas crossed on the active trip route.")
    add_centered_image("screenshots/fastag.png", width_in_inches=5.8)
    
    add_heading_2("4. SafarLock Speed Warning Dashboard")
    add_para("**Purpose**: Simulates driving speed and displays RTO overspeed warning banners.")
    add_para("**Description**: Live speedometer widgets triggering alerts above 120 km/h.")
    add_centered_image("screenshots/speedometer.png", width_in_inches=5.8)
    
    add_heading_2("5. Administrator Dashboard Charts")
    add_para("**Purpose**: Displays monthly booking revenues and system statistics.")
    add_para("**Description**: Charts showing revenue growth and user statistics.")
    add_centered_image("screenshots/admin_dashboard.png", width_in_inches=5.8)

    doc_path = r"c:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system\Car_Rental_IET_Report_Compiled.docx"
    doc.save(doc_path)
    print(f"IET Report successfully compiled and saved to: {doc_path}")

if __name__ == "__main__":
    generate_diagrams()
    create_document()
