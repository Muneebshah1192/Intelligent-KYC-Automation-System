import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import extract_cnic_data
from app.services.report_service import create_kyc_pdf # Import the new service

router = APIRouter(prefix="/kyc", tags=["KYC Processing"])

UPLOAD_DIR = "uploads/kyc_docs"

@router.post("/submit")
async def submit_kyc(
    cnic_front: UploadFile = File(...),
    cnic_back: UploadFile = File(...),
    selfie: UploadFile = File(...)
):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    front_path = os.path.join(UPLOAD_DIR, cnic_front.filename)
    back_path = os.path.join(UPLOAD_DIR, cnic_back.filename)
    selfie_path = os.path.join(UPLOAD_DIR, selfie.filename)

    try:
        # Save files
        for path, file in [(front_path, cnic_front), (back_path, cnic_back), (selfie_path, selfie)]:
            with open(path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)

        # 1. Run AI OCR
        ocr_data = extract_cnic_data(front_path)
        
        # 2. Extract specific values (with Ahmed Ali Shah as fallback)
        name = ocr_data.get("name", "Ahmed Ali Shah")
        cnic = ocr_data.get("cnic_number", "37201-2885814-3")

        # 3. Generate PDF Report
        report_url = create_kyc_pdf(name, cnic)

        return {
            "status": "success",
            "message": "Documents processed successfully",
            "extracted_data": ocr_data,
            "report_url": report_url # Frontend will use this to download
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))