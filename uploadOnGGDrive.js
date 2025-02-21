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

  // Set file permission to public (anyone with the link can view)
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
async function handleFolderUpload() {
  const folderInput = document.getElementById("folderInput");
  if (!folderInput.files || folderInput.files.length === 0) {
    alert("Please select a folder.");
    return;
  }

  // Create a root folder on Google Drive.
  const rootFolderName = "web3 course " + new Date().toISOString();
  let rootFolderId;
  try {
    rootFolderId = await createDriveFolder(rootFolderName, null);
    console.log("Created root folder with ID:", rootFolderId);
    
    document.getElementById("folderUploadStatus").innerHTML = `
  <p>Created root folder with ID: 
  <a href="https://drive.google.com/drive/folders/${rootFolderId}" target="_blank">
    ${rootFolderId}
  </a></p>
`;

  } catch (error) {
    console.error("Error creating root folder:", error);
    return;
  }

  // This mapping will store folder paths (relative to the selected folder) to their Drive folder IDs.
  const folderMap = {};
  // Map the empty path ("") to the root folder.
  folderMap[""] = rootFolderId;

  // Iterate over all files selected via the folder input.
  for (let i = 0; i < folderInput.files.length; i++) {
    const file = folderInput.files[i];
    // file.webkitRelativePath returns something like "section 1/video.mp4" or "section 1/section 2/image.jpg"
    const relativePath = file.webkitRelativePath;
    // Split into parts. The last part is the file name.
    const parts = relativePath.split("/");
    const fileName = parts.pop();
    // The remaining parts represent the folder path (could be empty if file is directly in the root folder).
    const folderPath = parts.join("/"); // e.g., "section 1" or "section 1/section 2"

    // Determine the parent folder ID where this file should be uploaded.
    let parentFolderId = rootFolderId;
    if (folderPath) {
      // If we haven't already created the folder for this relative path, create it.
      if (!folderMap[folderPath]) {
        // Split the folderPath and create each folder level if needed.
        let currentPath = "";
        let currentParentId = rootFolderId;
        for (const folderName of folderPath.split("/")) {
          currentPath = currentPath
            ? currentPath + "/" + folderName
            : folderName;
          // If this level doesn't exist in our mapping, create it.
          if (!folderMap[currentPath]) {
            try {
              const newFolderId = await createDriveFolder(
                folderName,
                currentParentId
              );
              folderMap[currentPath] = newFolderId;
              currentParentId = newFolderId;
            } catch (err) {
              console.error("Error creating folder", folderName, err);
            }
          } else {
            currentParentId = folderMap[currentPath];
          }
        }
        parentFolderId = currentParentId;
      } else {
        parentFolderId = folderMap[folderPath];
      }
    }

    // Upload the file into its designated parent folder.
    try {
      const fileData = await uploadFileToFolder(file, parentFolderId);
      console.log(
        "Uploaded file:",
        file.name,
        "with ID:",
        fileData.id,
        "under folder:",
        folderPath
      );
    } catch (err) {
      console.error("Error uploading file", file.name, err);
    }
  }

  alert("Folder upload complete!");
}

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
