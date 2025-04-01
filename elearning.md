## Tài liệu: Smart Contract cho ELearning DApp

### Phân tích yêu cầu
Yêu cầu xây dựng một hợp đồng thông minh để quản lý mua bán khóa học cho ELearning DApp, với các đặc điểm sau:  
- **Thông tin khóa học (Course)**: Lưu trữ `id` (uint256), tiêu đề (`title`), mô tả (`courseDetail`), giá (`price`), link Google Drive mã hóa (`metadataURI`), thời lượng (`duration`), và số học viên (`students`).  
- **Thông tin series (Series)**: Bao gồm `seriesId` (uint256), tiêu đề (`seriesTitle`), và mô tả (`seriesDescription`).  
- **Thông tin lesson (Lesson)**: Gồm `seriesId` (uint256), tiêu đề (`lessonTitle`), và URL Google Drive (`fileUrl`).  
- **Thông tin tag (Tag)**: Gồm `courseId` (uint256) và tên tag (`tagName`).  
- **Thông tin giao dịch (Transaction)**: Gồm `buyer` (address), `courseId` (uint256), và thời gian (`timestamp`).  
- **Yêu cầu chức năng**:  
  - Một hàm để giảng viên tạo khóa học với series, lesson, và tag.  
  - Một hàm để học viên mua khóa học và lưu giao dịch.  
  - Các hàm view để lấy thông tin khóa học, giao dịch, và học viên.  

**[Chỗ trống: Blockchain cụ thể (Ethereum hay BSC?) và token thanh toán (ETH/BNB hay token riêng?)]**

### Thiết kế cấu trúc dữ liệu
- **Course**: Lưu trữ thông tin chi tiết của khóa học.  
- **Series**: Đại diện cho chuỗi bài học trong khóa học.  
- **Lesson**: Quản lý bài học cụ thể với link Google Drive.  
- **Tag**: Phân loại khóa học theo danh mục.  
- **Transaction**: Ghi lại lịch sử giao dịch mua khóa học.  
- **Mappings**:  
  - `mapping(uint256 => Course) public courses`: Lưu trữ khóa học theo `id`.  
  - `mapping(uint256 => Series[]) public seriesByCourse`: Lưu chuỗi bài học theo `courseId`.  
  - `mapping(uint256 => Lesson[]) public lessonsBySeries`: Lưu bài học theo `seriesId`.  
  - `mapping(uint256 => Tag[]) public tagsByCourse`: Lưu tag theo `courseId`.  
  - `mapping(uint256 => Transaction[]) public transactionsByCourse`: Lưu giao dịch theo `courseId`.  
  - `mapping(address => uint256[]) public purchasedCourses`: Theo dõi khóa học đã mua của học viên.  
  - `mapping(address => Transaction[]) public transactionsByUser`: Lưu giao dịch theo địa chỉ học viên.

### Cấu trúc dữ liệu
```solidity
struct Course {
    uint256 id;              // ID khóa học
    string title;            // Tiêu đề khóa học
    string courseDetail;     // Mô tả khóa học
    string metadataURI;      // Link Google Drive mã hóa
    uint256 price;           // Giá khóa học (wei)
    string duration;         // Thời lượng khóa học
    uint256 students;        // Số học viên tham gia
}

struct Series {
    uint256 seriesId;        // ID chuỗi bài học
    string seriesTitle;      // Tiêu đề chuỗi
    string seriesDescription;// Mô tả chuỗi
}

struct Lesson {
    uint256 seriesId;        // ID chuỗi bài học liên kết
    string lessonTitle;      // Tiêu đề bài học
    string fileUrl;          // URL Google Drive của bài học
}

struct Tag {
    uint256 courseId;        // ID khóa học liên kết
    string tagName;          // Tên tag
}
struct Transaction {
address buyer;           // Địa chỉ ví học viên
uint256 courseId;        // ID khóa học
uint256 timestamp;       // Thời gian giao dịch
}
```

### Các hàm chính
1. **`createCourse(string memory title, string memory courseDetails, string memory metadataURI, string memory duration, uint256 price, string[] memory tagNames, string[] memory seriesTitles, string[] memory seriesDescriptions, string[][] memory lessonTitles, string[][] memory lessonFiles)`**  
   - Tạo khóa học mới với series, lesson, và tag.  
2. **`purchaseCourse(uint256 courseId)`**  
   - Mua khóa học bằng token, lưu giao dịch và cấp quyền truy cập.  
3. **`getPurchasedCourses(address user)`**  
   - Trả về danh sách khóa học đã mua của học viên.  
4. **`getTransactionsByCourseId(uint256 courseId)`**  
   - Trả về danh sách giao dịch của một khóa học.  
5. **`getTotalCourses()`**  
   - Trả về tổng số khóa học đã tạo.  
6. **`getAllTransactions()`**  
   - Trả về tất cả giao dịch trên hệ thống.  
7. **`getAllStudents()`**  
   - Trả về danh sách tất cả học viên duy nhất.  
8. **`getCourseBasicInfo(uint256 courseId)`**  
   - Trả về thông tin cơ bản của khóa học.  
9. **`getCourseTags(uint256 courseId)`**  
   - Trả về danh sách tag của khóa học.  
10. **`getCourseSeries(uint256 courseId)`**  
    - Trả về danh sách tiêu đề và mô tả series của khóa học.  
11. **`getCourseLessons(uint256 courseId)`**  
    - Trả về danh sách tiêu đề và URL lesson của khóa học.

### Sự kiện tương tác
- **`CourseCreated(uint256 courseId, string title, uint256 price)`**  
  - Phát khi khóa học được tạo.  
- **`SeriesAdded(uint256 courseId, uint256 seriesId, string seriesTitle)`**  
  - Phát khi series được thêm vào khóa học.  
- **`LessonAdded(uint256 seriesId, uint256 lessonId, string lessonTitle, string fileUrl)`**  
  - Phát khi lesson được thêm vào series.  
- **`TagAdded(uint256 courseId, string tagName)`**  
  - Phát khi tag được thêm vào khóa học.  
- **`CoursePurchased(uint256 courseId, address indexed buyer)`**  
  - Phát khi học viên mua khóa học.

### Thiết kế chức năng
1. **`createCourse(string memory title, string memory courseDetails, string memory metadataURI, string memory duration, uint256 price, string[] memory tagNames, string[] memory seriesTitles, string[] memory seriesDescriptions, string[][] memory lessonTitles, string[][] memory lessonFiles)`**  
   - **Điều kiện**: `price > 0`, chỉ owner được gọi.  
   - **Hành động**:  
     - Tạo `Course` với `id` tự tăng.  
     - Lưu danh sách tag, series, và lesson tương ứng.  
     - Phát sự kiện `CourseCreated`, `TagAdded`, `SeriesAdded`, `LessonAdded`.  

2. **`purchaseCourse(uint256 courseId)`**  
   - **Điều kiện**: Khóa học tồn tại, `msg.value` khớp với `price`, học viên chưa mua trước đó.  
   - **Hành động**:  
     - Chuyển token vào `platformWallet`.  
     - Cập nhật `purchasedCourses`, `transactionsByCourse`, `transactionsByUser`, tăng `students`.  
     - Phát sự kiện `CoursePurchased`.  

3. **`getPurchasedCourses(address user)`**  
   - **Điều kiện**: Không có.  
   - **Hành động**:  
     - Trả về mảng `courseId` từ `purchasedCourses[user]`.  

4. **`getTransactionsByCourseId(uint256 courseId)`**  
   - **Điều kiện**: Không có.  
   - **Hành động**:  
     - Trả về mảng `Transaction` từ `transactionsByCourse[courseId]`.  

5. **`getTotalCourses()`**  
   - **Điều kiện**: Không có.  
   - **Hành động**:  
     - Trả về `nextCourseId - 1`.  

6. **`getAllTransactions()`**  
   - **Điều kiện**: Không có.  
   - **Hành động**:  
     - Tính tổng số giao dịch, trả về mảng tất cả `Transaction` từ `transactionsByCourse`.  

7. **`getAllStudents()`**  
   - **Điều kiện**: Không có.  
   - **Hành động**:  
     - Lọc danh sách học viên duy nhất từ `transactionsByCourse`, trả về mảng `address`.  

8. **`getCourseBasicInfo(uint256 courseId)`**  
   - **Điều kiện**: Không có.  
   - **Hành động**:  
     - Trả về `(title, courseDetail, metadataURI, price, duration, students)` từ `courses[courseId]`.  

9. **`getCourseTags(uint256 courseId)`**  
   - **Điều kiện**: Không có.  
   - **Hành động**:  
     - Trả về mảng `tagName` từ `tagsByCourse[courseId]`.  

10. **`getCourseSeries(uint256 courseId)`**  
    - **Điều kiện**: Không có.  
    - **Hành động**:  
      - Trả về mảng `(seriesTitles, seriesDescriptions)` từ `seriesByCourse[courseId]`.  

11. **`getCourseLessons(uint256 courseId)`**  
    - **Điều kiện**: Không có.  
    - **Hành động**:  
      - Trả về mảng `(lessonTitles, lessonFiles)` từ `lessonsBySeries` dựa trên `seriesId` của khóa học.

### Quản lý sự kiện tương tác
- **Giảng viên → Hợp đồng**:  
  - Gọi `createCourse` → Phát `CourseCreated`, `TagAdded`, `SeriesAdded`, `LessonAdded` → Frontend hiển thị khóa học mới.  
- **Học viên → Hợp đồng**:  
  - Gọi `purchaseCourse` → Phát `CoursePurchased` → Frontend cập nhật danh sách đã mua.

### Ví dụ triển khai
1. **Giảng viên tạo khóa học**:  
   - Gọi `createCourse("Solidity Basics", "Learn Solidity", "base64_encoded_url", "10 hours", 0.1 ether, ["Blockchain"], ["Intro"], ["Basics"], [["Lesson 1"]], [["url1"]])`.  
   - Phát `CourseCreated(1, "Solidity Basics", 0.1 ether)`, `TagAdded(1, "Blockchain")`, `SeriesAdded(1, 1, "Intro")`, `LessonAdded(1, 1, "Lesson 1", "url1")`.  
   - Frontend hiển thị khóa học trong danh sách.  

2. **Học viên mua khóa học**:  
   - Gọi `purchaseCourse(1)` với 0.1 ether.  
   - Phát `CoursePurchased(1, 0x123...)`.  
   - Frontend thêm khóa học vào danh sách đã mua.  

3. **Lấy thông tin khóa học**:  
   - Gọi `getCourseBasicInfo(1)`.  
   - Trả về `("Solidity Basics", "Learn Solidity", "base64_encoded_url", 0.1 ether, "10 hours", 1)`.  

4. **Lấy danh sách học viên**:  
   - Gọi `getAllStudents()`.  
   - Trả về `[0x123...]`.  

### Bảng tổng hợp
| Hàm                     | Mô tả                          | Ai gọi       | Phát sự kiện                       | Kết quả chính                     |
|-------------------------|-------------------------------|--------------|------------------------------------|-----------------------------------|
| `createCourse`          | Tạo khóa học mới             | Owner        | `CourseCreated`, `TagAdded`, `SeriesAdded`, `LessonAdded` | Khóa học, tag, series, lesson được lưu |
| `purchaseCourse`        | Mua khóa học                 | Học viên     | `CoursePurchased`                  | Quyền truy cập được cấp, giao dịch lưu |
| `getPurchasedCourses`   | Lấy khóa học đã mua          | Bất kỳ       | Không                              | Trả về danh sách khóa học         |
| `getTransactionsByCourseId` | Lấy giao dịch theo khóa học | Bất kỳ    | Không                              | Trả về danh sách giao dịch        |
| `getTotalCourses`       | Lấy tổng số khóa học         | Bất kỳ       | Không                              | Trả về số lượng khóa học          |
| `getAllTransactions`    | Lấy tất cả giao dịch         | Bất kỳ       | Không                              | Trả về danh sách tất cả giao dịch |
| `getAllStudents`        | Lấy tất cả học viên          | Bất kỳ       | Không                              | Trả về danh sách học viên         |
| `getCourseBasicInfo`    | Lấy thông tin khóa học       | Bất kỳ       | Không                              | Trả về thông tin cơ bản           |
| `getCourseTags`         | Lấy tag của khóa học         | Bất kỳ       | Không                              | Trả về danh sách ta               |
| `getCourseSeries`	      | Lấy series của khóa học	     |Bất kỳ	    |Không	                             | Trả về tiêu đề và mô tả series    |
| `getCourseLessons`	  |Lấy lesson của khóa học	     |Bất kỳ	    |Không	                             |Trả về tiêu đề và URL lesson       |