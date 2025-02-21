// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ELearning is Ownable {
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
        address student;
        uint256 courseId;
        uint256 timestamp;
    }

    address public platformWallet;
    uint256 public nextCourseId = 1;
    mapping(uint256 => Course) public courses;
    mapping(uint256 => Transaction[]) public transactionsByCourse;
    mapping(address => uint256[]) public purchasedCourses;
    mapping(address => Transaction[]) public transactionsByUser;
    

    event CourseCreated(uint256 courseId, string title,string courseDetails, string metadataURI, uint256 price, string duration);
    event CoursePurchased(uint256 courseId, address student);
    event FundsWithdrawn(uint256 amount);

    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        platformWallet = _platformWallet;
    }

    function createCourse(string memory title, string memory courseDetails, string memory metadataURI,string memory duration, uint256 price) external onlyOwner {
        require(price > 0, "Price must be greater than zero");
        courses[nextCourseId] = Course( nextCourseId,title, courseDetails, metadataURI, price, duration, 0);
        emit CourseCreated(nextCourseId,title, courseDetails, metadataURI, price, duration);
        nextCourseId++;
    }

    function purchaseCourse(uint256 courseId) external payable {
        require(courses[courseId].id > 0, "Course does not exist");
        require(msg.value == courses[courseId].price, "Incorrect price");
        
        payable(platformWallet).transfer(msg.value);
        purchasedCourses[msg.sender].push(courseId);
        transactionsByCourse[courseId].push(Transaction(msg.sender, courseId, block.timestamp));
        transactionsByUser[msg.sender].push(Transaction(msg.sender, courseId, block.timestamp));
        courses[courseId].students++;

        emit CoursePurchased(courseId, msg.sender);
    }

    function getTransactionsByUser(address user) external view returns (Transaction[] memory) {
        return transactionsByUser[user];
    }


    function getTransactionsByCourse(uint256 courseId) external view returns (Transaction[] memory) {
        return transactionsByCourse[courseId];
    }

    function getPurchasedCourses(address user) external view returns (uint256[] memory) {
        return purchasedCourses[user];
    }

    function getTotalStudents(uint256 courseId) external view returns (uint256) {
        return courses[courseId].students;
    }

    function unlockCourseContent(uint256 courseId, address user) external view returns (bool) {
        uint256[] memory userCourses = purchasedCourses[user];
        for (uint256 i = 0; i < userCourses.length; i++) {
            if (userCourses[i] == courseId) {
                return true;
            }
        }
        return false;
    }
}
