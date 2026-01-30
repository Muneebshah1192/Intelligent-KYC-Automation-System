from fpdf import FPDF
import os

def create_kyc_pdf(name, cnic, status="VERIFIED"):
    pdf = FPDF()
    pdf.add_page()
    
    # Add a border
    pdf.rect(5, 5, 200, 287)
    
    # Header
    pdf.set_font("Arial", 'B', 20)
    pdf.set_text_color(0, 189, 110) # Modern Green
    pdf.cell(200, 20, txt="KYC VERIFICATION REPORT", ln=True, align='C')
    
    # Line break
    pdf.ln(10)
    
    # Body Content
    pdf.set_text_color(0, 0, 0) # Black
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(50, 10, txt="Verified Name:", ln=0)
    pdf.set_font("Arial", size=12)
    pdf.cell(100, 10, txt=name, ln=1)
    
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(50, 10, txt="ID Number (CNIC):", ln=0)
    pdf.set_font("Arial", size=12)
    pdf.cell(100, 10, txt=cnic, ln=1)
    
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(50, 10, txt="Verification Date:", ln=0)
    pdf.set_font("Arial", size=12)
    import datetime
    pdf.cell(100, 10, txt=str(datetime.date.today()), ln=1)

    # The "Verified" Stamp
    pdf.ln(20)
    pdf.set_font("Arial", 'B', 24)
    pdf.set_text_color(0, 189, 110)
    pdf.cell(200, 20, txt=f"STATUS: {status}", ln=True, align='C')
    
    # Footer
    pdf.set_font("Arial", 'I', 8)
    pdf.set_text_color(128, 128, 128)
    pdf.set_y(-25)
    pdf.cell(0, 10, txt="This is an AI-generated document. Verification is based on processed image data.", align='C')

    # Save to static folder so user can download it
    if not os.path.exists("static/reports"):
        os.makedirs("static/reports")
        
    file_path = f"static/reports/KYC_{cnic}.pdf"
    pdf.output(file_path)
    return f"/static/reports/KYC_{cnic}.pdf"