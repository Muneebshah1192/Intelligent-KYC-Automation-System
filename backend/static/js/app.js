const API_URL = ""; // Empty string uses the current server (Port 8000)
let selfieBlob = null;

// --- 1. SIGNUP / REGISTER LOGIC ---
async function handleRegister() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registration Successful! Redirecting to Login...");
            window.location.href = "login.html";
        } else {
            alert("Error: " + (data.detail || "Something went wrong"));
        }
    } catch (error) {
        alert("Backend server is not responding.");
    }
}

// --- 2. LOGIN LOGIC ---
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.access_token);
            alert("Login Successful!");
            window.location.href = "kyc.html"; 
        } else {
            alert("Login Failed: " + data.detail);
        }
    } catch (error) {
        alert("Server connection error. Check if FastAPI is running.");
    }
}

// --- 3. CAMERA LOGIC ---
async function startCamera() {
    const video = document.getElementById('webcam');
    const btn = document.getElementById('cameraBtn');
    const icon = document.getElementById('selfieIcon');

    if (btn.innerText === "Open Camera" || btn.innerText === "Retake Photo") {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = "block";
            icon.style.display = "none";
            btn.innerText = "Capture Photo";
            window.localStream = stream;
        } catch (err) {
            alert("Camera access denied.");
        }
    } else if (btn.innerText === "Capture Photo") {
        const canvas = document.getElementById('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
            selfieBlob = blob;
        }, 'image/jpeg');

        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
        }
        
        video.style.display = "none";
        icon.style.display = "block";
        icon.className = "fas fa-check-circle";
        icon.style.color = "#00ff88";
        btn.innerText = "Retake Photo";
        document.getElementById('selfieStatus').innerText = "Selfie Captured!";
    }
}

// --- 4. KYC SUBMISSION WITH AUTOMATIC REPORT DOWNLOAD ---
async function uploadKYCData() {
    const front = document.getElementById('cnicFront').files[0];
    const back = document.getElementById('cnicBack').files[0];

    if (!front || !back || !selfieBlob) {
        alert("Muneeb, please ensure CNIC Front, Back, and Selfie are all ready!");
        return;
    }

    const formData = new FormData();
    formData.append("cnic_front", front);
    formData.append("cnic_back", back);
    formData.append("selfie", selfieBlob, "selfie.jpg");

    const submitBtn = document.querySelector('.primary-btn');
    submitBtn.innerText = "🤖 AI Processing & Generating Report...";
    submitBtn.disabled = true;

    try {
        // Since we are unified on Port 8000, we use a relative path
        const response = await fetch("/kyc/submit", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ SUCCESS!\nAI found CNIC: ${result.extracted_data.cnic_number}\n\nYour Verification Report is downloading now!`);
            
            // Automatically open the PDF report in a new tab
            if (result.report_url) {
                window.open(result.report_url, "_blank");
            }
        } else {
            alert("Server Error: " + (result.detail || "Upload failed"));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Connection lost. Make sure your FastAPI backend is still running!");
    } finally {
        submitBtn.innerText = "Submit Verification";
        submitBtn.disabled = false;
    }
}

// UI Feedback for File Uploads
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const box = this.parentElement;
            box.style.borderColor = "#00ff88";
            const icon = box.querySelector('i');
            if (icon) icon.className = "fas fa-check-circle";
            const span = box.querySelector('span');
            if (span) span.innerText = "Document Loaded";
        }
    });
});