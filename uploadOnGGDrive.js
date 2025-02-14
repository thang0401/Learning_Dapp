// --- Configuration for Google API ---
const CLIENT_ID = "752606603363-vjm8ml0q0756lt9656t956e5nlbt93n8.apps.googleusercontent.com";
const API_KEY = "AIzaSyCNNeuyRg8HA5j1LqmLsfCYpdgTSkodNzM";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

// --- Global variables for OAuth2 token and encryption ---
let tokenClient;
let accessToken = null;  // Will hold the OAuth2 access token
let encryptionKey, iv;   // To store the encryption key and initialization vector

// --- Load and Initialize Google Identity Services OAuth2 Client ---
function loadGoogleAPI() {
  // The new GIS client script (https://accounts.google.com/gsi/client) should already be loaded via HTML.
  initTokenClient();
}

function initTokenClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        console.error("Token Client Error:", response);
      } else {
        accessToken = response.access_token;
        console.log("Access token obtained:", accessToken);
      }
    }
  });
  // Enable the upload button once the token client is initialized.
  const uploadButton = document.getElementById("uploadButton");
  if (uploadButton) {
    uploadButton.disabled = false;
  }
}

// --- Request an Access Token (wrapped in a Promise) ---
function requestAccessToken() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        console.error("Error obtaining token:", response);
        reject(response);
      } else {
        accessToken = response.access_token;
        console.log("Access token obtained:", accessToken);
        resolve(accessToken);
      }
    };
    tokenClient.requestAccessToken();
  });
}

// --- Encrypt a File Using AES-GCM ---
async function encryptFile(file) {
  // Generate a new AES-GCM key (256-bit)
  const cryptoKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  // Export and store the key (if you need to save it for later decryption)
  encryptionKey = await window.crypto.subtle.exportKey("raw", cryptoKey);
  // Generate a random 12-byte IV (recommended for AES-GCM)
  iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Read the file as an ArrayBuffer
  const fileBuffer = await file.arrayBuffer();
  // Encrypt the file buffer
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    cryptoKey,
    fileBuffer
  );
  
  // Combine the IV and the encrypted data so you can use the IV later during decryption.
  const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.byteLength);
  
  // Return a Blob of the combined data.
  return new Blob([combined], { type: "application/octet-stream" });
}

// --- Upload the Encrypted File to Google Drive ---
async function uploadToGoogleDrive(encryptedFile, fileName) {
  if (!accessToken) {
    alert("Access token is not available. Please try again later.");
    return;
  }
  // Prepare file metadata (replace with your actual Google Drive folder ID)
  const metadata = {
    name: fileName,
    mimeType: "application/octet-stream",
    parents: ["1oDRm2-uDrAHukn8jivdNU9G-uxKIqp8X"] // <-- Replace with your folder ID
  };
  
  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", encryptedFile);
  
  // Upload via Drive API endpoint
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error("Upload failed with status " + response.status);
  }
  
  const fileData = await response.json();
  
  // Set file permission to public (anyone with the link can view)
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role: "reader", type: "anyone" })
  });
  
  // Display the file link in the page
  document.getElementById("fileLink").innerHTML =
    `<a href="https://drive.google.com/file/d/${fileData.id}/view" target="_blank">View File</a>
    <p>File Link: <a href="https://drive.google.com/file/d/${fileData.id}/view" target="_blank">
    https://drive.google.com/file/d/${fileData.id}/view</a></p>
    <iframe src="https://drive.google.com/file/d/${fileData.id}/preview" 
            width="640" height="480" frameborder="0" allowfullscreen></iframe>`;
   


}

// --- Handle the Upload Process ---
async function handleUpload() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select a file.");
    return;
  }
  const file = fileInput.files[0];
  
  try {
    // Ensure we have an access token; if not, request one.
    if (!accessToken) {
      await requestAccessToken();
    }
    
    // Encrypt the file before uploading.
    const encryptedFile = await encryptFile(file);
    // Upload the encrypted file to Google Drive.
    await uploadToGoogleDrive(encryptedFile, `Encrypted_${file.name}`);
    alert("File uploaded and encrypted successfully!");
  } catch (error) {
    console.error("Error during file upload:", error);
    alert("File upload failed!");
  }
}


// --- Attach Event Listeners on Window Load ---
window.addEventListener("load", () => {
  // Initialize Google Identity Services.
  loadGoogleAPI();
  
  // Attach the upload handler to the upload button.
  const uploadButton = document.getElementById("uploadButton");
  if (uploadButton) {
    uploadButton.addEventListener("click", handleUpload);
  } else {
    console.warn("Upload button not found. Ensure an element with id 'uploadButton' exists.");
  }
});
