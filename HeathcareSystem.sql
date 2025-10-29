USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'HealthCareSystem')
BEGIN
    ALTER DATABASE HealthCareSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HealthCareSystem;
END
GO

CREATE DATABASE HealthCareSystem;
GO

USE HealthCareSystem;
GO


-- USERS
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(256) NOT NULL,
    Role NVARCHAR(20) CHECK (Role IN ('Patient', 'Doctor', 'Admin')),
    FullName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20),
    AvatarUrl VARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- PATIENTS (1:1 với Users)
CREATE TABLE Patients (
    UserId INT PRIMARY KEY,
    DateOfBirth DATE,
    Gender NVARCHAR(10) CHECK (Gender IN ('Male', 'Female', 'Other')),
    BloodType NVARCHAR(10),
    Allergies NVARCHAR(MAX),
	Weight INT,
	Height INT,
    BMI DECIMAL(5,2),
    Address NVARCHAR(200),
	EmergencyPhoneNumber NVARCHAR(20),
	CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE MedicalHistories (
    HistoryId INT PRIMARY KEY IDENTITY(1,1),
    PatientUserId INT NOT NULL,
    ConditionName NVARCHAR(200) NOT NULL,
    FOREIGN KEY (PatientUserId) REFERENCES Patients(UserId)
);

-- SPECIALTIES
CREATE TABLE Specialties (
    SpecialtyId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
	CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
);

-- DOCTORS (1:1 với Users)
CREATE TABLE Doctors (
    UserId INT PRIMARY KEY,
    SpecialtyId INT,
    Qualifications NVARCHAR(MAX),
    Experience NVARCHAR(MAX),
    Bio NVARCHAR(MAX),
    Rating DECIMAL(3,1),
	CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (SpecialtyId) REFERENCES Specialties(SpecialtyId)
);

-- APPOINTMENTS
CREATE TABLE Appointments (
    AppointmentId INT PRIMARY KEY IDENTITY(1,1),
    PatientUserId INT NOT NULL,
    DoctorUserId INT NOT NULL,
    AppointmentDateTime DATETIME NOT NULL,
    Status NVARCHAR(20) CHECK (Status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    Notes NVARCHAR(MAX),
    FOREIGN KEY (DoctorUserId) REFERENCES Doctors(UserId),
    FOREIGN KEY (PatientUserId) REFERENCES Patients(UserId)
);

-- MEDICAL RECORDS
CREATE TABLE MedicalRecords (
    RecordId INT PRIMARY KEY IDENTITY(1,1),
    PatientUserId INT NOT NULL,
    DoctorUserId INT NOT NULL,
    AppointmentId INT,
    Diagnosis NVARCHAR(MAX),
    Treatment NVARCHAR(MAX),
    TestResults NVARCHAR(MAX),
    MedicalImages NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (PatientUserId) REFERENCES Users(UserId),
    FOREIGN KEY (DoctorUserId) REFERENCES Users(UserId),
    FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId)
);

-- PRESCRIPTIONS
CREATE TABLE Prescriptions (
    PrescriptionId INT PRIMARY KEY IDENTITY(1,1),
    RecordId INT NOT NULL,
    PatientUserId INT NOT NULL,
    DoctorUserId INT NOT NULL,
    Medication NVARCHAR(MAX),
    Instructions NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RecordId) REFERENCES MedicalRecords(RecordId),
    FOREIGN KEY (PatientUserId) REFERENCES Users(UserId),
    FOREIGN KEY (DoctorUserId) REFERENCES Users(UserId)
);

-- PAYMENTS
CREATE TABLE Payments (
    PaymentId INT PRIMARY KEY IDENTITY(1,1),
    PatientUserId INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (PatientUserId) REFERENCES Users(UserId)
);

-- ARTICLES
CREATE TABLE Articles (
    ArticleId INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200),
    Content NVARCHAR(MAX),
    PublishedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    ArticleImg VARCHAR(MAX)
);

-- REVIEWS
CREATE TABLE Reviews (
    ReviewId INT PRIMARY KEY IDENTITY(1,1),
    PatientUserId INT NOT NULL,
    DoctorUserId INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (PatientUserId) REFERENCES Users(UserId),
    FOREIGN KEY (DoctorUserId) REFERENCES Users(UserId)
);

-- AUDIT LOGS
CREATE TABLE AuditLogs (
    LogId INT PRIMARY KEY IDENTITY,
    TableName NVARCHAR(50),
    RecordId INT,
    Action NVARCHAR(20), -- INSERT, UPDATE, DELETE
    ChangedBy INT, -- UserId
    ChangedAt DATETIME DEFAULT GETDATE(),
    Changes NVARCHAR(MAX)
);

-- CONVERSATIONS (chỉ giữa bệnh nhân và bác sĩ)
CREATE TABLE Conversations (
    ConversationId INT PRIMARY KEY IDENTITY(1,1),
    PatientUserId INT NOT NULL,
    DoctorUserId INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT UC_Patient_Doctor UNIQUE (PatientUserId, DoctorUserId),
    FOREIGN KEY (PatientUserId) REFERENCES Users(UserId),
    FOREIGN KEY (DoctorUserId) REFERENCES Users(UserId)
);

-- MESSAGES
CREATE TABLE Messages (
    MessageId INT PRIMARY KEY IDENTITY(1,1),
    ConversationId INT NOT NULL,
    SenderId INT NOT NULL,
    MessageType NVARCHAR(20) CHECK (MessageType IN ('text', 'image', 'file', 'video', 'audio')),
    Content NVARCHAR(MAX) NOT NULL,
    SentAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE(),
    IsRead BIT DEFAULT 0,
    FOREIGN KEY (ConversationId) REFERENCES Conversations(ConversationId),
    FOREIGN KEY (SenderId) REFERENCES Users(UserId)
);

--AI CONVERSATIONS
CREATE TABLE AIConversations (
    UserId INT PRIMARY KEY,  -- mỗi user chỉ có 1 cuộc
    StartedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

--AI MESSAGES
CREATE TABLE AIMessages (
    AIMessageId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Sender NVARCHAR(10) CHECK (Sender IN ('User', 'AI')) NOT NULL,
    MessageType NVARCHAR(20) CHECK (MessageType IN ('text', 'image', 'file', 'video', 'audio')) DEFAULT 'text',
    Content NVARCHAR(MAX) NOT NULL,
    SentAt DATETIME DEFAULT GETDATE(),
    IsRead BIT DEFAULT 1,
    FOREIGN KEY (UserId) REFERENCES AIConversations(UserId)
);


-- Tạo bảng WorkingHours
CREATE TABLE WorkingHours (
    WorkingHoursId INT PRIMARY KEY IDENTITY(1,1),
    DoctorUserId INT NOT NULL,
    DayOfWeek NVARCHAR(20) NOT NULL,
    IsWorking BIT DEFAULT 1,
    StartTime TIME,
    EndTime TIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (DoctorUserId) REFERENCES Doctors(UserId)
);

-- Tạo bảng TimeOff
CREATE TABLE TimeOff (
    TimeOffId INT PRIMARY KEY IDENTITY(1,1),
    DoctorUserId INT NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- vacation, sick, conference, personal, holiday
    Title NVARCHAR(200) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsAllDay BIT DEFAULT 1,
    Reason NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (DoctorUserId) REFERENCES Doctors(UserId)
);


-- Insert data

-- Admin
INSERT INTO Users (Email, Password, Role, FullName, PhoneNumber, AvatarUrl)
VALUES ('admin@healthcare.com', 'admin123', 'Admin', N'System Admin', '0123456789', 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'),
('doctor.hoa@clinic.com', 'doc123', 'Doctor', N'Bác sĩ Nguyễn Văn Hoa', '0905123456', 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'),
('doctor.lan@hospital.com', 'doc456', 'Doctor', N'Bác sĩ Trần Thị Lan', '0905876543', 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'),
('patient.binh@gmail.com', 'pat123', 'Patient', N'Lê Hoàng Bình', '0987654321', 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'),
('patient.ha@gmail.com', 'pat456', 'Patient', N'Nguyễn Thu Hà', '0977321456', 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg');
GO

-- Insert table Patients
INSERT INTO Patients (UserId, DateOfBirth, Gender, BloodType, Allergies,Weight, Height, BMI, Address, EmergencyPhoneNumber)
VALUES 
(4, '1990-05-20', 'Male', 'O+', N'None',70, 170, 24.2, N'123 Trần Phú, Hà Nội', '0905123456'),
(5, '1995-08-12', 'Female', 'A-', N'Penicillin',58, 170, 20.1, N'45 Lê Lợi, Đà Nẵng', '0905654321');
GO

INSERT INTO MedicalHistories (PatientUserId, ConditionName)
VALUES 
(4, N'Tiểu đường'),
(4, N'Tăng huyết áp'),
(5, N'Hen suyễn'),
(5, N'Viêm dạ dày');

-- Insert table Specialties
INSERT INTO Specialties (Name, Description)
VALUES 
(N'Cardiology', N'Diều trị bệnh tim mạch'),
(N'Dermatology', N'Chuyên khoa da liễu'),
(N'Pediatrics', N'Nhi khoa');
GO

-- Insert table Doctors
INSERT INTO Doctors (UserId, SpecialtyId, Qualifications, Experience, Bio, Rating)
VALUES 
(2, 1, N'MD, PhD in Cardiology', N'10 năm kinh nghiệm', N'Chuyên gia tim mạch với sự tận tâm cao.', 4.8),
(3, 2, N'MD in Dermatology', N'7 năm kinh nghiệm', N'Tận tình trong điều trị các bệnh ngoài da.', 4.6);
GO

-- Insert table Appointments
INSERT INTO Appointments (PatientUserId, DoctorUserId, AppointmentDateTime, Status, Notes)
VALUES 
(4, 2, '2025-07-10 09:00', 'Confirmed', N'Khám tim lần đầu'),
(5, 3, '2025-07-11 15:30', 'Pending', N'Khám dị ứng da');

-- Insert table MedicalRecords
INSERT INTO MedicalRecords (PatientUserId, DoctorUserId, AppointmentId, Diagnosis, Treatment, TestResults, MedicalImages)
VALUES 
(4, 2, 1, N'Tăng huyết áp', N'Uống thuốc Amlodipine', N'BP: 150/95', NULL),
(5, 3, 2, N'Dị ứng nhẹ', N'Uống thuốc dị ứng', N'Đỏ da tay', NULL);

-- Insert table Prescriptions
INSERT INTO Prescriptions (RecordId, PatientUserId, DoctorUserId, Medication, Instructions)
VALUES 
(1, 4, 2, N'Amlodipine 5mg', N'Uống 1 viên mỗi sáng sau ăn'),
(2, 5, 3, N'Cetirizine 10mg', N'Uống 1 viên trước khi ngủ');

-- Insert table Payments
INSERT INTO Payments (PatientUserId, Amount, PaymentMethod)
VALUES 
(4, 250000, N'Credit Card'),
(5, 200000, N'Cash');

-- Insert table Articles
INSERT INTO Articles (Title, Content, ArticleImg)
VALUES 
(N'5 cách kiểm soát huyết áp', N'Hãy ăn nhạt, tập thể dục, tránh stress...', NULL),
(N'Nhận biết dị ứng da', N'Nổi mẩn, ngứa, đỏ là dấu hiệu thường gặp...', NULL);

-- Insert table Reviews
INSERT INTO Reviews (PatientUserId, DoctorUserId, Rating, Comment)
VALUES 
(4, 2, 5, N'Bác sĩ rất giỏi và tư vấn tận tình.'),
(5, 3, 4, N'Khám nhanh, chu đáo.');

-- Insert table Conversations
INSERT INTO Conversations (PatientUserId, DoctorUserId)
VALUES 
(4, 2),
(5, 3);

-- Insert table Messages
INSERT INTO Messages (ConversationId, SenderId, MessageType, Content)
VALUES 
(1, 4, 'text', N'Chào bác sĩ, tôi cần tư vấn thêm.'),
(1, 2, 'text', N'Anh có thể nói rõ triệu chứng hơn không?'),
(2, 5, 'text', N'Em bị ngứa sau khi dùng thuốc.'),
(2, 3, 'text', N'Có thể do dị ứng, em ngưng thuốc và đến khám lại.');

INSERT INTO WorkingHours (DoctorUserId, DayOfWeek, IsWorking, StartTime, EndTime)
VALUES 
(2, 'Monday', 1, '8:00:00', '17:30:00'),
(2, 'Tuesday', 1, '8:00:00', '17:30:00'),
(2, 'Wednesday', 1, '8:00:00', '17:30:00'),
(2, 'Thursday', 1, '8:00:00', '17:30:00'),
(2, 'Friday', 1, '8:00:00', '17:30:00'),
(2, 'Saturday', 1, '8:00:00', '17:30:00'),
(2, 'Sunday', 1, '8:00:00', '17:30:00');

INSERT INTO TimeOff (DoctorUserId, Type, Title, StartDate, EndDate, IsAllDay, Reason)
VALUES 
(2, 'vacation', N'Nghỉ hè gia đình', '2024-07-15', '2024-07-22', 1, N'Du lịch gia đình tại Đà Nẵng'),
(2, 'conference', N'Hội nghị Tim mạch', '2024-03-10', '2024-03-12', 1, N'Hội nghị Tim mạch toàn quốc tại TP.HCM'),
(2, 'holiday', N'Nghỉ Tết', '2024-02-08', '2024-02-12', 1, N'Nghỉ Tết Nguyên đán'),
(2, 'sick', N'Nghỉ ốm', '2024-01-15', '2024-01-16', 1, N'Cảm cúm, sốt cao'),
(2, 'personal', N'Việc riêng', '2024-04-20', '2024-04-20', 1, N'Họp phụ huynh con');


SELECT * FROM Users
SELECT * FROM AIConversations
SELECT * FROM AIMessages
SELECT * FROM Doctors