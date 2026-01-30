import easyocr
import re

reader = easyocr.Reader(['en'])

def extract_cnic_data(image_path):
    try:
        results = reader.readtext(image_path, detail=0)
        # Join text and remove spaces to handle cases like "12345 - 6789012 - 3"
        full_text = "".join(results).replace(" ", "").upper()
        
        # Pattern for Pakistani CNIC: 5 digits, dash, 7 digits, dash, 1 digit
        cnic_pattern = r'\d{5}-\d{7}-\d{1}'
        match = re.search(cnic_pattern, full_text)
        
        if match:
            return {
                "cnic_number": match.group(0),
                "status": "Verified",
                "all_text": results
            }
        else:
            # If dash version fails, look for 13 digits in a row
            fallback_pattern = r'\d{13}'
            fallback_match = re.search(fallback_pattern, full_text)
            if fallback_match:
                num = fallback_match.group(0)
                # Format it manually: 12345-1234567-1
                formatted = f"{num[:5]}-{num[5:12]}-{num[12]}"
                return {"cnic_number": formatted, "status": "Verified (Manual Format)", "all_text": results}
            
            return {"cnic_number": "Not Found", "status": "Failed", "all_text": results}

    except Exception as e:
        return {"error": str(e)}