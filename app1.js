const contractAddress = "0xf480ddc6048c7554c30ba2d411d822c9dd101218";
let contract;
let currentAccount;

document.getElementById("connectWallet").addEventListener("click", async () => {
  const accounts = await web3.eth.requestAccounts();
  currentAccount = accounts[0];
  document.getElementById("accountAddress").textContent = currentAccount;
});

// ✅ Function để tạo khóa học
async function createCourse(event) {
  console.log("🛠 createCourse() has been triggered!");
  event.preventDefault();

  if (!currentAccount) {
    alert("❌ Please connect your wallet first!");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const details = document.getElementById("details").value.trim();
  const duration = document.getElementById("duration").value.trim();
  const priceInput = document.getElementById("price").value.trim();

  let price;
  try {
    price = web3.utils.toWei(priceInput, "ether");
  } catch (error) {
    console.error("❌ Error converting price:", error);
    alert("Invalid price value. Please enter a valid number.");
    return;
  }

  console.log(`💰 Converted Price: ${price} Wei`);

  // ✅ Lấy metadataURI từ Google Drive Folder
  const metadataURI = createdFolderId
    ? `https://drive.google.com/drive/folders/${createdFolderId}`
    : "";

  console.log("🔗 metadataURI:", metadataURI);

  // ✅ Get Tags
  const tags = Array.from(document.querySelectorAll("#tagList li")).map(
    (li) => li.firstChild.textContent
  );

  // ✅ Get Series and Lessons
  const seriesTitles = [];
  const seriesDescriptions = [];
  const lessonTitles = [];
  const lessonFiles = [];

  document.querySelectorAll(".series").forEach((seriesDiv, seriesIndex) => {
    const titleInput = seriesDiv.querySelector(".series-title");
    const descInput = seriesDiv.querySelector(".series-description");

    const title = titleInput ? titleInput.value.trim() : "";
    const desc = descInput ? descInput.value.trim() : "";

    seriesTitles.push(title);
    seriesDescriptions.push(desc);

    const lessonTitleList = [];
    const lessonFileList = [];

    seriesDiv.querySelectorAll(".lesson").forEach((lesson) => {
      const lessonTitleInput = lesson.querySelector("input[type='text']");
      const lessonTitle = lessonTitleInput ? lessonTitleInput.value.trim() : "";

      const lessonDriveUrl = lesson.dataset.driveUrl || ""; // 📌 Kiểm tra giá trị URL

      console.log(`🔗 Lesson "${lessonTitle}" - Drive URL:`, lessonDriveUrl);

      if (lessonTitle) {
        lessonTitleList.push(lessonTitle);
        lessonFileList.push(lessonDriveUrl);
      }
    });

    lessonTitles.push(lessonTitleList);
    lessonFiles.push(lessonFileList);
  });

  console.log("📚 Prepared Course Data:");
  console.log("Title:", title);
  console.log("Details:", details);
  console.log("Metadata URI:", metadataURI);
  console.log("Duration:", duration);
  console.log("Price:", price);
  console.log("Tags:", tags);
  console.log("Series Titles:", seriesTitles);
  console.log("Series Descriptions:", seriesDescriptions);
  console.log("Lesson Titles:", lessonTitles);
  console.log("Lesson Files:", lessonFiles);

  try {
    const tx = await contract.methods
      .createCourse(
        title,
        details,
        metadataURI, // ✅ Truyền Google Drive Folder URL vào đây
        duration,
        price,
        tags,
        seriesTitles,
        seriesDescriptions,
        lessonTitles,
        lessonFiles
      )
      .send({ from: currentAccount });

    alert("🎉 Course Created Successfully!");
  } catch (error) {
    console.error("❌ Error creating course:", error);
  }
}

// ✅ Function để thêm Tags vào danh sách
function addTag() {
  const tagInput = document.getElementById("tagInput");
  const tagValue = tagInput.value.trim();
  if (tagValue === "") return;

  const tagList = document.getElementById("tagList");
  const li = document.createElement("li");
  li.textContent = tagValue;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.style.marginLeft = "10px";
  removeBtn.onclick = () => tagList.removeChild(li);

  li.appendChild(removeBtn);
  tagList.appendChild(li);
  tagInput.value = "";
}

// ✅ Function để thêm Series vào danh sách
let seriesCount = 0; // Đếm số series

function addSeries() {
  seriesCount++;
  const seriesContainer = document.getElementById("seriesContainer");

  // ✅ Create the Series Div
  const seriesDiv = document.createElement("div");
  seriesDiv.classList.add("series");
  seriesDiv.setAttribute("id", `series-${seriesCount}`);

  // ✅ Series Title & Description Inputs
  const seriesTitleInput = document.createElement("input");
  seriesTitleInput.type = "text";
  seriesTitleInput.classList.add("series-title");
  seriesTitleInput.placeholder = "Enter Series Title";

  const seriesDescInput = document.createElement("input");
  seriesDescInput.type = "text";
  seriesDescInput.classList.add("series-description");
  seriesDescInput.placeholder = "Enter Series Description";

  // ✅ Lesson Container
  const lessonContainer = document.createElement("div");
  lessonContainer.classList.add("lesson-container");
  lessonContainer.setAttribute("id", `lessonContainer-${seriesCount}`);

  // ✅ Add Default Lesson
  const defaultLesson = createLessonComponent(seriesCount);
  lessonContainer.appendChild(defaultLesson);

  // ✅ Add Buttons
  const addLessonBtn = document.createElement("button");
  addLessonBtn.textContent = "➕ Add Lesson";
  addLessonBtn.type = "button"; // 🛑 Quan trọng! Ngăn chặn việc form bị submit.
  addLessonBtn.onclick = (event) => {
    event.preventDefault(); // 🛑 Ngăn chặn sự kiện mặc định của form.
    addLesson(seriesCount);
  };

  const removeSeriesBtn = document.createElement("button");
  removeSeriesBtn.textContent = "❌ Remove Series";
  removeSeriesBtn.onclick = () => seriesDiv.remove();

  // ✅ Append Everything
  seriesDiv.appendChild(seriesTitleInput);
  seriesDiv.appendChild(seriesDescInput);
  seriesDiv.appendChild(lessonContainer);
  seriesDiv.appendChild(addLessonBtn);
  seriesDiv.appendChild(removeSeriesBtn);

  seriesContainer.appendChild(seriesDiv);
}

function createLessonComponent() {
  const lessonDiv = document.createElement("div");
  lessonDiv.classList.add("lesson");

  const lessonTitleInput = document.createElement("input");
  lessonTitleInput.type = "text";
  lessonTitleInput.classList.add("lesson-title");
  lessonTitleInput.placeholder = "Enter lesson title";

  const lessonFileInput = document.createElement("input");
  lessonFileInput.type = "file";
  lessonFileInput.classList.add("lesson-file");

  let driveFileUrl = "";

  lessonFileInput.onchange = async (event) => {
    const file = event.target.files[0]; // ✅ Chỉ lấy file đầu tiên
    if (!file) return;

    if (!accessToken) {
      await requestAccessToken();
    }

    if (!createdFolderId) {
      alert("❌ Please create a Course Folder first!");
      return;
    }

    try {
      const uploadedFile = await uploadFileToDrive(file);
      driveFileUrl = `https://drive.google.com/uc?id=${uploadedFile.id}`;

      // ✅ Lưu URL file vào dataset
      lessonDiv.dataset.driveUrl = driveFileUrl;
      console.log("📌 Updated lessonDiv.dataset.driveUrl:", driveFileUrl);

      // 🔗 Hiển thị link file
      const fileLink = document.createElement("a");
      fileLink.href = driveFileUrl;
      fileLink.target = "_blank";
      fileLink.textContent = "📄 View Uploaded File";
      lessonDiv.appendChild(fileLink);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert("❌ File upload failed!");
    }
  };

  // ✅ Nút xóa Lesson
  const removeLessonBtn = document.createElement("button");
  removeLessonBtn.textContent = "❌ Remove";
  removeLessonBtn.onclick = () => lessonDiv.remove();

  lessonDiv.appendChild(lessonTitleInput);
  lessonDiv.appendChild(lessonFileInput);
  lessonDiv.appendChild(removeLessonBtn);

  return lessonDiv;
}


// ✅ Xóa Series
function removeSeries(seriesId) {
  const seriesDiv = document.getElementById(`series-${seriesId}`);
  if (seriesDiv) {
    seriesDiv.remove();
  }
}

// ✅ Xóa Lesson
function removeLesson(button) {
  button.parentElement.remove();
}

function addLesson(seriesId) {
  console.log(`🛠 Adding lesson for Series ID: ${seriesId}`);
  const lessonContainer = document.getElementById(
    `lessonContainer-${seriesId}`
  );
  if (!lessonContainer) {
    console.error(`❌ Lesson container for Series ID ${seriesId} not found!`);
    return;
  }

  const newLesson = createLessonComponent(seriesId);
  lessonContainer.appendChild(newLesson);

  console.log("✅ Lesson added to UI successfully.");
}

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.ethereum !== "undefined") {
    window.web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(contractABI1, contractAddress);
    console.log("Contract Loaded:", contract);
    // await loadCourses();
    // await getPurchasedCourses();
  } else {
    alert("MetaMask is required!");
  }

  const form = document.getElementById("createCourseForm");
  if (form) form.addEventListener("submit", createCourse);
});

async function getFullCourseDetails(courseId) {
  try {
    console.log(`🔍 Fetching details for Course ID: ${courseId}`);

    // ✅ Fetch Basic Info
    const courseInfo = await contract.methods
      .getCourseBasicInfo(courseId)
      .call();
    console.log(`📚 Course ${courseId} Basic Info:`, courseInfo);

    const title = courseInfo[0];
    const details = courseInfo[1];
    const metadataURI = courseInfo[2]; // ✅ Link Google Drive của khóa học

    const rawPrice = courseInfo[3];
    const duration = courseInfo[4];
    const students = courseInfo[5];

    let price = "0";
    if (rawPrice && rawPrice !== "" && rawPrice !== "0") {
      price = web3.utils.fromWei(rawPrice, "ether");
    }

    // ✅ Fetch Tags
    const tags = await contract.methods.getCourseTags(courseId).call();
    console.log(`🏷️ Tags:`, tags);

    // ✅ Fetch Series
    const seriesData = await contract.methods.getCourseSeries(courseId).call();
    console.log(`📚 Series Titles:`, seriesData[0]);
    console.log(`📖 Series Descriptions:`, seriesData[1]);

    const seriesTitles = seriesData[0] || [];
    const seriesDescriptions = seriesData[1] || [];

    // ✅ Fetch Lessons
    const lessonsData = await contract.methods
      .getCourseLessons(courseId)
      .call();
    console.log(`📘 Lessons Titles:`, lessonsData[0]);
    console.log(`📂 Lesson Files:`, lessonsData[1]);

    const lessonTitles = lessonsData[0] || [];
    const lessonFiles = lessonsData[1] || [];

    // ✅ Construct Series & Lessons HTML
    let seriesHTML = "<h3>Series</h3><ul>";
    for (let i = 0; i < seriesTitles.length; i++) {
      seriesHTML += `<li><strong>${seriesTitles[i]}</strong>: ${
        seriesDescriptions[i] || "No description"
      }</li>`;

      if (lessonTitles[i] && lessonTitles[i].length > 0) {
        seriesHTML += "<ul>";
        for (let j = 0; j < lessonTitles[i].length; j++) {
          const lessonDriveUrl = lessonFiles[i][j] || "";
          const lessonLink = lessonDriveUrl
            ? `<a href="${lessonDriveUrl}" target="_blank">📂 View Google Drive Folder</a>`
            : "<span style='color:red;'>❌ No file available</span>";
          seriesHTML += `<li>Lesson: ${lessonTitles[i][j]} - ${lessonLink}</li>`;
        }
        seriesHTML += "</ul>";
      } else {
        seriesHTML += "<p>No lessons available.</p>";
      }
    }
    seriesHTML += "</ul>";

    // ✅ Construct Tags HTML
    let tagsHTML = "<h3>Skills</h3><p>";
    tagsHTML += tags.length > 0 ? tags.join(", ") : "No skills added.";
    tagsHTML += "</p>";

    // ✅ Display All Course Information
    document.getElementById("courseDetails").innerHTML = `
            <h2>${title}</h2>
            <p><strong>Details:</strong> ${details}</p>
            <p><strong>Price:</strong> ${price} BNB</p>
            <p><strong>Duration:</strong> ${duration}</p>
            <p><strong>Students Enrolled:</strong> ${students}</p>
            ${tagsHTML}
            ${seriesHTML}
            <p><strong>Course Drive Folder:</strong> <a href="${metadataURI}" target="_blank">📂 View Course Folder</a></p>
        `;
  } catch (error) {
    console.error("❌ Error fetching course details:", error);
    alert(
      "Failed to fetch course details. Check the console for more information."
    );
  }
}


// --- Configuration for Google API ---
const CLIENT_ID =
  "752606603363-vjm8ml0q0756lt9656t956e5nlbt93n8.apps.googleusercontent.com";
const API_KEY = "AIzaSyCNNeuyRg8HA5j1LqmLsfCYpdgTSkodNzM";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

let tokenClient;
let accessToken = null;
let createdFolderId = null; // Lưu trữ Folder ID mới

// --- Load Google OAuth2 ---
function loadGoogleAPI() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        console.error("Token error:", response);
      } else {
        accessToken = response.access_token;
        console.log("Access token obtained:", accessToken);
      }
    },
  });
}

// --- Yêu cầu quyền truy cập Google Drive ---
function requestAccessToken() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        console.error("Error getting token:", response);
        reject(response);
      } else {
        accessToken = response.access_token;
        resolve(accessToken);
      }
    };
    tokenClient.requestAccessToken();
  });
}

// --- Tạo thư mục trên Google Drive ---
async function createDriveFolder(folderName) {
  if (!accessToken) {
    console.log("Requesting new token...");
    await requestAccessToken();
  }

  const metadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  const response = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    console.error("Failed to create folder:", await response.json());
    throw new Error("Folder creation failed");
  }

  const folderData = await response.json();
  console.log("Folder created:", folderData);
  return folderData.id;
}

// --- Xử lý khi bấm nút "Create Folder" ---
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("createFolderButton").addEventListener("click", async () => {
    try {
      const folderName = "Course Folder " + new Date().toISOString();
      createdFolderId = await createDriveFolder(folderName); // ✅ Tạo thư mục gốc

      // ✅ Lưu link vào metadataURI
      metadataURI = `https://drive.google.com/drive/folders/${createdFolderId}`;

      // ✅ Hiển thị link thư mục gốc trên UI
      document.getElementById("createdFolderLink").innerHTML = `
        <a href="${metadataURI}" target="_blank">📂 View Course Folder</a>
      `;

      console.log("✅ Created Course Folder ID:", createdFolderId);
    } catch (error) {
      console.error("❌ Error creating folder:", error);
      alert("Failed to create folder!");
    }
  });
});


async function uploadFileToDrive(file) {
  if (!createdFolderId) {
    alert("❌ Please create a Course Folder first!");
    return;
  }

  const metadata = {
    name: file.name,
    mimeType: file.type,
    parents: [createdFolderId], // ✅ Upload vào thư mục gốc
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
    throw new Error("❌ File upload failed: " + response.status);
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

  console.log(`✅ Uploaded file: ${file.name} to folder: ${createdFolderId}`);
  return fileData;
}

// --- Khởi động Google API khi trang load ---
window.addEventListener("load", loadGoogleAPI);
