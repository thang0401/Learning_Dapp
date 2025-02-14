const CLIENT_ID = "752606603363-vjm8ml0q0756lt9656t956e5nlbt93n8.apps.googleusercontent.com";
const API_KEY = "AIzaSyCNNeuyRg8HA5j1LqmLsfCYpdgTSkodNzM";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

let authInstance;
let key, iv; // Lưu khóa giải mã

// Load Google API
function loadGoogleAPI() {
    gapi.load('client:auth2', initGoogleAPI);
}

// Initialize Google API
function initGoogleAPI() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    }).then(() => {
        authInstance = gapi.auth2.getAuthInstance();
    }).catch(error => {
        console.error("Error initializing Google API:", error);
    });
}

// Mã hóa tệp bằng AES
async function encryptFile(file) {
    const cryptoKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    key = await window.crypto.subtle.exportKey("raw", cryptoKey);
    iv = window.crypto.getRandomValues(new Uint8Array(12));

    const fileBuffer = await file.arrayBuffer();
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        fileBuffer
    );

    return new Blob([iv, new Uint8Array(encryptedBuffer)], { type: "application/octet-stream" });
}

// Upload tệp lên Google Drive
async function uploadToGoogleDrive(encryptedFile, fileName) {
    const accessToken = authInstance.currentUser.get().getAuthResponse().access_token;

    const metadata = {
        name: fileName,
        mimeType: "application/octet-stream",
        parents: ["1oDRm2-uDrAHukn8jivdNU9G-uxKIqp8X"]
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", encryptedFile);

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
    });

    const fileData = await response.json();

    // Đặt file ở chế độ public
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: "reader", type: "anyone" })
    });

    document.getElementById("fileLink").innerHTML = `<a href="https://drive.google.com/file/d/${fileData.id}/view" target="_blank">View File</a>`;
}

// Xử lý khi người dùng nhấn "Upload & Encrypt"
async function handleUpload() {
    const fileInput = document.getElementById("fileInput").files[0];
    if (!fileInput) {
        alert("Please select a file.");
        return;
    }

    const encryptedFile = await encryptFile(fileInput);
    await uploadToGoogleDrive(encryptedFile, `Encrypted_${fileInput.name}`);
}

window.onload = loadGoogleAPI;
