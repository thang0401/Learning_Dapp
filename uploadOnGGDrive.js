// --- Configuration for Google API ---
const CLIENT_ID =
  "752606603363-vjm8ml0q0756lt9656t956e5nlbt93n8.apps.googleusercontent.com";
const API_KEY = "AIzaSyCNNeuyRg8HA5j1LqmLsfCYpdgTSkodNzM";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

// --- Global variables for OAuth2 token ---
let tokenClient;
let accessToken = null;

// --- Load and Initialize Google Identity Services OAuth2 Client ---
function loadGoogleAPI() {
  // Assumes the new GIS client script is loaded via HTML.
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
    },
  });
  // Enable the upload folder button once the token client is initialized.
  const uploadFolderButton = document.getElementById("uploadFolderButton");
  if (uploadFolderButton) {
    uploadFolderButton.disabled = false;
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

// --- Create a Folder in Google Drive ---
// If parentFolderId is provided, the new folder is created within it.
async function createDriveFolder(folderName, parentFolderId) {
  const metadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder"
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    throw new Error("Folder creation failed: " + response.status);
  }

  const folderData = await response.json();

  // Set folder permission to public (anyone with the link can view)
  await fetch(`https://www.googleapis.com/drive/v3/files/${folderData.id}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role: "reader", type: "anyone" })
  });

  return folderData.id;
}


// --- Upload a Single File to a Specified Folder ---
async function uploadFileToFolder(file, parentFolderId) {
  const metadata = {
    name: file.name,
    mimeType: file.type,
    parents: [parentFolderId],
  };

  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  formData.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("File upload failed: " + response.status);
  }

  const fileData = await response.json();

  // ✅ Gán quyền public để ai cũng có thể xem file
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  return fileData;
}


// --- Handle the Folder Upload Process ---
// This function creates a root folder on Drive, then iterates through each file (using file.webkitRelativePath)
// to rebuild the folder hierarchy and upload each file to its corresponding folder.
let createdFolderId = null; // Lưu Folder ID mới tạo

// 🔹 Hàm tạo thư mục mới trên Google Drive
async function createNewRootFolder() {
  try {
    const folderName = "New Upload Folder " + new Date().toISOString();
    createdFolderId = await createDriveFolder(folderName, null);
    
    // Hiển thị Folder ID vừa tạo
    const folderIdElement = document.getElementById("createdFolderId");
    folderIdElement.innerHTML = `
      <p>Created folder: 
        <a href="https://drive.google.com/drive/folders/${createdFolderId}" target="_blank">
          ${createdFolderId}
        </a>
      </p>
    `;

    console.log("New root folder created:", createdFolderId);
  } catch (error) {
    console.error("Error creating new root folder:", error);
    alert("Failed to create new folder!");
  }
}

// 🔹 Cập nhật `handleFolderUpload()` để dùng Folder ID mới
async function handleFolderUpload() {
  const folderInput = document.getElementById("folderInput");

  if (!folderInput.files || folderInput.files.length === 0) {
    alert("Please select a folder.");
    return;
  }
  if (!createdFolderId) {
    alert("Please create a folder first.");
    return;
  }

  console.log("Uploading files to folder:", createdFolderId);
  const folderMap = {};
  folderMap[""] = createdFolderId;

  for (let i = 0; i < folderInput.files.length; i++) {
    const file = folderInput.files[i];
    const relativePath = file.webkitRelativePath;
    const parts = relativePath.split("/");
    const fileName = parts.pop();
    const folderPath = parts.join("/");

    let parentId = createdFolderId;
    if (folderPath) {
      if (!folderMap[folderPath]) {
        let currentPath = "";
        let currentParentId = createdFolderId;
        for (const folderName of folderPath.split("/")) {
          currentPath = currentPath ? currentPath + "/" + folderName : folderName;
          if (!folderMap[currentPath]) {
            try {
              const newFolderId = await createDriveFolder(folderName, currentParentId);
              folderMap[currentPath] = newFolderId;
              currentParentId = newFolderId;
            } catch (err) {
              console.error("Error creating folder", folderName, err);
            }
          } else {
            currentParentId = folderMap[currentPath];
          }
        }
        parentId = currentParentId;
      } else {
        parentId = folderMap[folderPath];
      }
    }

    try {
      const fileData = await uploadFileToFolder(file, parentId);
      console.log("Uploaded file:", file.name, "ID:", fileData.id, "Folder:", folderPath);
    } catch (err) {
      console.error("Error uploading file", file.name, err);
    }
  }

  alert("Folder upload complete!");
}

// 🔹 Thêm sự kiện cho nút "Create New Folder"
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("createFolderButton").addEventListener("click", createNewRootFolder);
});




// --- Attach Event Listeners on Window Load ---
window.addEventListener("load", () => {
  loadGoogleAPI();

  const uploadFolderButton = document.getElementById("uploadFolderButton");
  if (uploadFolderButton) {
    uploadFolderButton.addEventListener("click", async () => {
      // Request access token if not available.
      if (!accessToken) {
        await requestAccessToken();
      }
      handleFolderUpload();
    });
  } else {
    console.warn(
      "Upload folder button not found. Ensure an element with id 'uploadFolderButton' exists."
    );
  }
});
