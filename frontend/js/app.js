
const API_URL = "http://192.168.10.22:8000";
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
        const response = await fetch(`${API_URL}/auth/login`, {
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
        alert("Check if your FastAPI server is running.");
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

        window.localStream.getTracks().forEach(track => track.stop());
        video.style.display = "none";
        icon.style.display = "block";
        icon.className = "fas fa-check-circle";
        icon.style.color = "#00ff88";
        btn.innerText = "Retake Photo";
        document.getElementById('selfieStatus').innerText = "Selfie Captured!";
    }
}
async function uploadKYCData() {
    const front = document.getElementById('cnicFront').files[0];
    const back = document.getElementById('cnicBack').files[0];

    if (!front || !back || !selfieBlob) {
        alert("Please provide all documents and the selfie.");
        return;
    }

    const formData = new FormData();
    formData.append("cnic_front", front);
    formData.append("cnic_back", back);
    formData.append("selfie", selfieBlob, "selfie.jpg");

    const submitBtn = document.querySelector('.primary-btn');
    submitBtn.innerText = "🤖 AI Processing...";
    submitBtn.disabled = true;

    // USE XHR INSTEAD OF FETCH TO BYPASS BROWSER BLOCKS
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/kyc/submit", true);

    xhr.onload = function () {
        submitBtn.innerText = "Submit Verification";
        submitBtn.disabled = false;
        
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            alert(`✅ SUCCESS!\nAI found CNIC: ${result.extracted_data.cnic_number}`);
        } else {
            alert("Server Error: " + xhr.statusText);
        }
    };

    xhr.onerror = function () {
        submitBtn.innerText = "Submit Verification";
        submitBtn.disabled = false;
        alert("The browser is STILL blocking the connection. This is likely a Windows Firewall or Chrome Security setting.");
    };

    xhr.send(formData);
}

// UI Feedback
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const box = this.parentElement;
            box.style.borderColor = "#00ff88";
            box.querySelector('i').className = "fas fa-check-circle";
            box.querySelector('span').innerText = "Document Loaded";
        }
    });
});