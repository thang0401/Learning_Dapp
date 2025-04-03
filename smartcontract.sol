// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ELearning is Ownable {
    struct Lesson {
        uint256 seriesId;
        string lessonTitle;
        string fileUrl;
    }

    struct Series {
        uint256 seriesId;
        string seriesTitle;
        string seriesDescription;
    }

    struct Tag {
        uint256 courseId;
        string tagName;
    }

    struct Course {
        uint256 id;
        string title;
        string courseDetail;
        string metadataURI;
        uint256 price;
        string duration;
        uint256 students;
    }

    struct Transaction {
        address buyer;
        uint256 courseId;
        uint256 timestamp;
    }

    address public platformWallet;
    uint256 public nextCourseId = 1;
    uint256 public nextSeriesId = 1;
    uint256 public nextLessonId = 1;

    mapping(uint256 => Course) public courses;
    mapping(uint256 => Series[]) public seriesByCourse;
    mapping(uint256 => Lesson[]) public lessonsBySeries;
    mapping(uint256 => Tag[]) public tagsByCourse;
    mapping(uint256 => Transaction[]) public transactionsByCourse;
    mapping(address => uint256[]) public purchasedCourses;
    mapping(address => Transaction[]) public transactionsByUser;

    event CourseCreated(uint256 courseId, string title, uint256 price);
    event SeriesAdded(uint256 courseId, uint256 seriesId, string seriesTitle);
    event LessonAdded(
        uint256 seriesId, uint256 lessonId, string lessonTitle, string fileUrl
    );
    event TagAdded(uint256 courseId, string tagName);
    event CoursePurchased(uint256 courseId, address indexed buyer);

    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        platformWallet = _platformWallet;
    }

    // ✅ Tạo khóa học với Series và Lesson
    function createCourse(
        string memory title,
        string memory courseDetails,
        string memory metadataURI,
        string memory duration,
        uint256 price,
        string[] memory tagNames,
        string[] memory seriesTitles,
        string[] memory seriesDescriptions,
        string[][] memory lessonTitles,
        string[][] memory lessonFiles
    ) external onlyOwner {
        require(price > 0, "Price must be greater than zero");

        uint256 courseId = nextCourseId++;
        courses[courseId] = Course(
            courseId, title, courseDetails, metadataURI, price, duration, 0
        );

        // ✅ Lưu Tags
        for (uint256 i = 0; i < tagNames.length; i++) {
            tagsByCourse[courseId].push(Tag(courseId, tagNames[i]));
            emit TagAdded(courseId, tagNames[i]);
        }

        // ✅ Lưu Series & Lessons
        for (uint256 i = 0; i < seriesTitles.length; i++) {
            uint256 seriesId = nextSeriesId++; // ✅ Đảm bảo seriesId tăng đúng
            seriesByCourse[courseId].push(
                Series(seriesId, seriesTitles[i], seriesDescriptions[i])
            );
            emit SeriesAdded(courseId, seriesId, seriesTitles[i]);

            // ✅ Lưu Lessons vào từng Series
            for (uint256 j = 0; j < lessonTitles[i].length; j++) {
                uint256 lessonId = nextLessonId++;
                lessonsBySeries[seriesId].push(
                    Lesson(seriesId, lessonTitles[i][j], lessonFiles[i][j])
                );
                emit LessonAdded(
                    seriesId, lessonId, lessonTitles[i][j], lessonFiles[i][j]
                );
            }
        }

        emit CourseCreated(courseId, title, price);
    }

    // ✅ Mua khóa học
    function purchaseCourse(uint256 courseId) external payable {
        require(courses[courseId].id > 0, "Course does not exist");
        require(msg.value == courses[courseId].price, "Incorrect price");

        uint256[] storage userCourses = purchasedCourses[msg.sender];
        for (uint256 i = 0; i < userCourses.length; i++) {
            require(
                userCourses[i] != courseId,
                "You have already purchased this course"
            );
        }

        (bool sent,) = payable(platformWallet).call{value: msg.value}("");
        require(sent, "Payment failed");

        purchasedCourses[msg.sender].push(courseId);

        Transaction memory newTransaction =
            Transaction(msg.sender, courseId, block.timestamp);
        transactionsByCourse[courseId].push(newTransaction);
        transactionsByUser[msg.sender].push(newTransaction);

        courses[courseId].students++;

        emit CoursePurchased(courseId, msg.sender);
    }

    // ✅ Lấy danh sách khóa học đã mua
    function getPurchasedCourses(address user)
        external
        view
        returns (uint256[] memory)
    {
        return purchasedCourses[user];
    }

    // ✅ Lấy danh sách giao dịch của một khóa học
    function getTransactionsByCourseId(uint256 courseId)
        external
        view
        returns (Transaction[] memory)
    {
        return transactionsByCourse[courseId];
    }

    function getTotalCourses() external view returns (uint256) {
        return nextCourseId - 1; // Vì courseId bắt đầu từ 1
    }

    function getAllTransactions()
        external
        view
        returns (Transaction[] memory)
    {
        uint256 totalTx = 0;

        // Tính tổng số giao dịch
        for (uint256 i = 1; i < nextCourseId; i++) {
            totalTx += transactionsByCourse[i].length;
        }

        // Tạo mảng chứa tất cả giao dịch
        Transaction[] memory allTransactions = new Transaction[](totalTx);
        uint256 index = 0;

        // Lặp qua tất cả khóa học và thêm giao dịch vào mảng
        for (uint256 i = 1; i < nextCourseId; i++) {
            for (uint256 j = 0; j < transactionsByCourse[i].length; j++) {
                allTransactions[index] = transactionsByCourse[i][j];
                index++;
            }
        }

        return allTransactions;
    }

    function getAllStudents() external view returns (address[] memory) {
        address[] memory tempStudents = new address[](nextCourseId * 10); // Giả sử tối đa mỗi khóa có 10 học viên
        uint256 studentCount = 0;

        // ✅ Lặp qua tất cả giao dịch để lấy học viên
        for (uint256 i = 1; i < nextCourseId; i++) {
            for (uint256 j = 0; j < transactionsByCourse[i].length; j++) {
                address student = transactionsByCourse[i][j].buyer;

                // ✅ Kiểm tra xem student đã có trong danh sách chưa
                bool exists = false;
                for (uint256 k = 0; k < studentCount; k++) {
                    if (tempStudents[k] == student) {
                        exists = true;
                        break;
                    }
                }

                // ✅ Nếu chưa tồn tại, thêm vào danh sách
                if (!exists) {
                    tempStudents[studentCount] = student;
                    studentCount++;
                }
            }
        }

        // ✅ Tạo mảng chính xác kích thước
        address[] memory allStudents = new address[](studentCount);
        for (uint256 i = 0; i < studentCount; i++) {
            allStudents[i] = tempStudents[i];
        }

        return allStudents;
    }

    function getCourseBasicInfo(uint256 courseId)
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            string memory,
            uint256
        )
    {
        Course memory c = courses[courseId];
        return (
            c.title,
            c.courseDetail,
            c.metadataURI,
            c.price,
            c.duration,
            c.students
        );
    }

    function getCourseTags(uint256 courseId)
        external
        view
        returns (string[] memory)
    {
        uint256 count = tagsByCourse[courseId].length;
        string[] memory tagNames = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            tagNames[i] = tagsByCourse[courseId][i].tagName;
        }
        return tagNames;
    }

    function getCourseSeries(uint256 courseId)
        external
        view
        returns (string[] memory, string[] memory)
    {
        uint256 count = seriesByCourse[courseId].length;
        string[] memory titles = new string[](count);
        string[] memory descriptions = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            titles[i] = seriesByCourse[courseId][i].seriesTitle;
            descriptions[i] = seriesByCourse[courseId][i].seriesDescription;
        }
        return (titles, descriptions);
    }

    function getCourseLessons(uint256 courseId)
        external
        view
        returns (string[][] memory, string[][] memory)
    {
        uint256 seriesCount = seriesByCourse[courseId].length;
        string[][] memory titlesArray = new string[][](seriesCount);
        string[][] memory filesArray = new string[][](seriesCount);

        for (uint256 i = 0; i < seriesCount; i++) {
            uint256 seriesId = seriesByCourse[courseId][i].seriesId; // ✅ Lấy đúng seriesId

            Lesson[] memory lessons = lessonsBySeries[seriesId];

            string[] memory titles = new string[](lessons.length);
            string[] memory files = new string[](lessons.length);

            for (uint256 j = 0; j < lessons.length; j++) {
                titles[j] = lessons[j].lessonTitle;
                files[j] = lessons[j].fileUrl;
            }

            titlesArray[i] = titles;
            filesArray[i] = files;
        }

        return (titlesArray, filesArray);
    }
}
