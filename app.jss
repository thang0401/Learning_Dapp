const contractAddress = "0xf5a403cf9111cac28b23362b3ea0ff2d718b8362"; 
let contract;

async function init() {
    if (typeof window.ethereum !== "undefined") {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contract Loaded:", contract);

        await loadCourses();
    } else {
        alert("MetaMask is required!");
    }
}
async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await window.ethereum.request({ 
                method: "wallet_requestPermissions", 
                params: [{ eth_accounts: {} }] 
            });

            const selectedAccounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            currentAccount = selectedAccounts[0];
            document.getElementById("accountAddress").innerText = currentAccount;
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    } else {
        alert("Please install MetaMask!");
    }
}
async function checkUserBalance() {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const userAddress = accounts[0];

    const balanceWei = await web3.eth.getBalance(userAddress);
    const balanceBNB = web3.utils.fromWei(balanceWei, "ether");

    console.log(`Your Balance: ${balanceWei} Wei (${balanceBNB} BNB)`);
    return balanceWei;
}

async function checkCoursePrice(courseId) {
    try {
        const course = await contract.methods.courses(courseId).call();
        const priceInWei = course.price;
        const priceInBNB = web3.utils.fromWei(priceInWei, "ether");

        console.log(`Course Price: ${priceInWei} Wei (${priceInBNB} BNB)`);
        return priceInWei;
    } catch (error) {
        console.error("Error fetching course price:", error);
    }
}


// Base64 Encode/Decode
function encodeBase64(input) {
    return btoa(unescape(encodeURIComponent(input)));
}

function decodeBase64(input) {
    return decodeURIComponent(escape(atob(input)));
}

// Create Course
document.getElementById("createCourseForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = encodeBase64(document.getElementById("title").value);
    const details = encodeBase64(document.getElementById("details").value);
    const metadataURI = encodeBase64(document.getElementById("metadata").value);
    const duration = encodeBase64(document.getElementById("duration").value);
    const price = web3.utils.toWei(document.getElementById("price").value, "ether");

    const accounts = await web3.eth.getAccounts();

    try {
        await contract.methods.createCourse(title, details, metadataURI, duration, price).send({ from: accounts[0] });
        alert("Course Created Successfully!");
        loadCourses();
    } catch (error) {
        console.error("Error creating course:", error);
    }
});

// Load Courses
async function loadCourses() {
    const coursesList = document.getElementById("coursesList");
    coursesList.innerHTML = "";

    const courseCount = await contract.methods.nextCourseId().call();

    for (let i = 1; i < courseCount; i++) {
        const course = await contract.methods.courses(i).call();

        const courseHTML = `
            <div>
                <h3>${decodeBase64(course.title)}</h3>
                <p>Details: ${decodeBase64(course.courseDetail)}</p>
                <p>Price: ${web3.utils.fromWei(course.price, "ether")} BNB</p>
                <p>Duration: ${decodeBase64(course.duration)}</p>
                <button onclick="purchaseCourse(${course.id}, '${course.price}')">Purchase</button>
            </div>
        `;
        coursesList.innerHTML += courseHTML;
    }
}

// Purchase Course
async function purchaseCourse(courseId) {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const userAddress = accounts[0];

    try {
        const priceInWei = await checkCoursePrice(courseId);
        const userBalanceWei = await checkUserBalance();

        // Convert to BigInt to compare properly
        if (BigInt(userBalanceWei) < BigInt(priceInWei)) {
            alert("Insufficient funds! Please add more tBNB.");
            return;
        }

        await contract.methods.purchaseCourse(courseId).send({
            from: userAddress,
            value: priceInWei
        });

        alert("Course purchased successfully!");
    } catch (error) {
        console.error("Purchase failed:", error);
        alert("Transaction failed!");
    }
}

// Event Listener for Connect Button

/// getTransactionsByUser
async function getTransactionsByUser() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const userAddress = accounts[0];

    try {
        const transactions = await contract.methods.getTransactionsByUser(userAddress).call();
        console.log("User Transactions:", transactions);

        let output = "<h3>My Transactions</h3>";
        transactions.forEach(tx => {
            output += `<p>Course ID: ${tx.courseId}, Timestamp: ${new Date(tx.timestamp * 1000).toLocaleString()}</p>`;
        });

        // FIX: Use the correct id
        document.getElementById("userTransactions").innerHTML = output;
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
}

async function fetchCourse() {
    const courseId = document.getElementById("fetchCourseIdInput").value;
    if (!courseId) {
        alert("Please enter a Course ID!");
        return;
    }

    try {
        const course = await contract.methods.courses(courseId).call();
        document.getElementById("fetchCourseDetails").innerText = `
            ID: ${course.id}
            Title: ${course.title}
            Details: ${course.courseDetail}
            Price: ${web3.utils.fromWei(course.price, "ether")} BNB
            Duration: ${course.duration}
            Students: ${course.students}
        `;
    } catch (error) {
        console.error("Error fetching course:", error);
        alert("Failed to fetch course details.");
    }
}

async function fetchDecodeCourse() {
    const courseId = document.getElementById("decodeCourseIdInput").value;
    if (!courseId) {
        alert("Please enter a Course ID!");
        return;
    }

    try {
        const course = await contract.methods.courses(courseId).call();
        document.getElementById("decodeCourseDetails").innerText = `
            ID: ${course.id}
            Title: ${decodeBase64(course.title)}
            Details: ${decodeBase64(course.courseDetail)}
            Price: ${web3.utils.fromWei(course.price, "ether")} BNB
            Duration: ${decodeBase64(course.duration)}
            Students: ${course.students}
        `;
    } catch (error) {
        console.error("Error fetching decoded course:", error);
        alert("Failed to fetch course details.");
    }
}

async function getTransactionsByCourse() {
    const courseId = document.getElementById("transactionCourseId").value;
    if (!courseId) {
        alert("Please enter a Course ID!");
        return;
    }

    try {
        const transactions = await contract.methods.getTransactionsByCourse(courseId).call();
        let output = `<h3>Transactions for Course ${courseId}</h3>`;
        transactions.forEach(tx => {
            output += `<p>Student: ${tx.student}, Timestamp: ${new Date(tx.timestamp * 1000).toLocaleString()}</p>`;
        });
        document.getElementById("courseTransactionsList").innerHTML = output;
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
}


    //Get Purchased Courses for a User 
    async function getPurchasedCourses() {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }
    
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];
    
        try {
            const purchasedCourses = await contract.methods.getPurchasedCourses(userAddress).call();
            console.log("Purchased Courses:", purchasedCourses);
    
            let output = "<h3>My Purchased Courses</h3>";
            purchasedCourses.forEach(courseId => {
                output += `<p>Course ID: ${courseId}</p>`;
            });
    
            // FIX: Use the correct id
            document.getElementById("purchasedCoursesList").innerHTML = output;
        } catch (error) {
            console.error("Failed to fetch purchased courses:", error);
        }
    }

    async function unlockCourseContent(courseId) {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }
    
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];
    
        try {
            const hasAccess = await contract.methods.unlockCourseContent(courseId, userAddress).call();
    
            if (hasAccess) {
                alert("Course Unlocked! You have access.");
            } else {
                alert("You haven't purchased this course.");
            }
        } catch (error) {
            console.error("Failed to unlock course content:", error);
        }
    }
    
    



document.getElementById("connectWallet").addEventListener("click", connectWallet);
window.onload = init;