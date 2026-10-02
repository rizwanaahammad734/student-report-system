// ===============================
// STUDENT REPORT SYSTEM
// HTML + CSS + JavaScript only
// Local Storage based project
// ===============================

const USERS_KEY = "studentReportUsers";
const CURRENT_USER_KEY = "currentStudentReportUser";
const REPORT_KEY = "studentReportData";

// ---------- Local Storage Helpers ----------

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

function setCurrentUser(user) {
    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({
            name: user.name,
            username: user.username,
            role: user.role
        })
    );
}

function getReport() {
    return JSON.parse(localStorage.getItem(REPORT_KEY)) || {
        python: 85,
        java: 78,
        dbms: 90,
        attendance: 92,
        remarks: "Good academic performance. Keep improving practical skills."
    };
}

function saveReport(report) {
    localStorage.setItem(REPORT_KEY, JSON.stringify(report));
}

// ---------- Demo Data ----------

function createDemoAccounts() {
    const users = getUsers();

    const demoUsers = [
        { name: "System Admin", username: "admin", password: "admin123", role: "admin" },
        { name: "Demo Teacher", username: "teacher1", password: "123", role: "teacher" },
        { name: "Amrutha", username: "student1", password: "123", role: "student" },
        { name: "Demo Parent", username: "parent1", password: "123", role: "parent" }
    ];

    demoUsers.forEach(demo => {
        if (!users.some(user => user.username === demo.username)) {
            users.push(demo);
        }
    });

    saveUsers(users);

    if (!localStorage.getItem(REPORT_KEY)) {
        saveReport({
            python: 85,
            java: 78,
            dbms: 90,
            attendance: 92,
            remarks: "Good academic performance. Keep improving practical skills."
        });
    }
}

// ---------- Signup ----------

function setupSignup() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;
        const message = document.getElementById("signupMessage");

        const users = getUsers();

        if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            message.textContent = "Username already exists.";
            message.style.color = "#dc2626";
            return;
        }

        users.push({
            name: name,
            username: username,
            password: password,
            role: role
        });

        saveUsers(users);

        message.textContent = "Account created successfully! Redirecting to login...";
        message.style.color = "#059669";

        form.reset();

        setTimeout(function() {
            window.location.href = "login.html";
        }, 1000);
    });
}

// ---------- Login + Module Redirection ----------

function getDashboard(role) {
    if (role === "admin") return "admin-dashboard.html";
    if (role === "teacher") return "teacher-dashboard.html";
    if (role === "student") return "student-dashboard.html";
    if (role === "parent") return "parent-dashboard.html";
    return "login.html";
}

function setupLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const role = document.getElementById("loginRole").value;
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        const users = getUsers();

        const user = users.find(function(item) {
            return (
                item.role === role &&
                item.username === username &&
                item.password === password
            );
        });

        if (!user) {
            message.textContent = "Invalid role, username or password.";
            message.style.color = "#dc2626";
            return;
        }

        setCurrentUser(user);

        message.textContent = "Login successful. Redirecting...";
        message.style.color = "#059669";

        setTimeout(function() {
            window.location.href = getDashboard(user.role);
        }, 400);
    });
}

// ---------- Authentication Protection ----------

function protectPage() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return null;
    }

    return currentUser;
}

function checkRolePage() {
    const pageRole = document.body.dataset.rolePage;

    if (!pageRole) return;

    const user = protectPage();
    if (!user) return;

    if (user.role !== pageRole) {
        window.location.href = getDashboard(user.role);
        return;
    }

    const welcome = document.getElementById(pageRole + "Welcome");

    if (welcome) {
        welcome.textContent =
            "Welcome, " + user.name + " | Username: " + user.username;
    }
}

// ---------- Logout ----------

function setupLogout() {
    const logoutButton = document.getElementById("logoutBtn");
    if (!logoutButton) return;

    logoutButton.addEventListener("click", function(event) {
        event.preventDefault();

        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = "login.html";
    });
}

// ---------- Dashboard Link ----------

function setupDashboardLink() {
    const link = document.getElementById("dashboardLink");
    if (!link) return;

    const user = protectPage();
    if (!user) return;

    link.href = getDashboard(user.role);
}

// ---------- Admin Module ----------

function setupAdmin() {
    if (document.body.dataset.rolePage !== "admin") return;

    const users = getUsers();

    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("studentUsers").textContent =
        users.filter(user => user.role === "student").length;
    document.getElementById("teacherUsers").textContent =
        users.filter(user => user.role === "teacher").length;
    document.getElementById("parentUsers").textContent =
        users.filter(user => user.role === "parent").length;

    const tableBody = document.querySelector("#usersTable tbody");

    tableBody.innerHTML = "";

    users.forEach(function(user, index) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                ${
                    user.role === "admin"
                    ? "<span>Admin</span>"
                    : `<button class="btn orange small delete-user" data-index="${index}">Delete</button>`
                }
            </td>
        `;

        tableBody.appendChild(row);
    });

    document.querySelectorAll(".delete-user").forEach(function(button) {
        button.addEventListener("click", function() {
            const index = Number(this.dataset.index);
            const updatedUsers = getUsers();

            if (confirm("Are you sure you want to delete this user?")) {
                updatedUsers.splice(index, 1);
                saveUsers(updatedUsers);
                location.reload();
            }
        });
    });
}

// ---------- Report Module ----------

function gradeFromMarks(mark) {
    if (mark >= 90) return "A+";
    if (mark >= 80) return "A";
    if (mark >= 70) return "B";
    if (mark >= 60) return "C";
    if (mark >= 50) return "D";
    return "F";
}

function calculateAverage(report) {
    return ((report.python + report.java + report.dbms) / 3).toFixed(1);
}

function calculateOverallGrade(average) {
    const value = Number(average);

    if (value >= 90) return "A+";
    if (value >= 80) return "A";
    if (value >= 70) return "B";
    if (value >= 60) return "C";
    if (value >= 50) return "D";
    return "F";
}

function displayReport() {
    const report = getReport();

    const python = document.getElementById("pythonMarks");
    const java = document.getElementById("javaMarks");
    const dbms = document.getElementById("dbmsMarks");

    if (!python || !java || !dbms) return;

    python.value = report.python;
    java.value = report.java;
    dbms.value = report.dbms;

    document.getElementById("pythonGrade").textContent =
        gradeFromMarks(report.python);

    document.getElementById("javaGrade").textContent =
        gradeFromMarks(report.java);

    document.getElementById("dbmsGrade").textContent =
        gradeFromMarks(report.dbms);

    document.getElementById("attendanceValue").textContent =
        report.attendance + "%";

    document.getElementById("remarksValue").textContent =
        report.remarks;

    const average = calculateAverage(report);

    document.getElementById("averageValue").textContent =
        average + "%";

    document.getElementById("overallGrade").textContent =
        calculateOverallGrade(average);

    document.getElementById("attendanceInput").value =
        report.attendance;

    document.getElementById("remarksInput").value =
        report.remarks;
}

function setupReport() {
    if (!document.body.dataset.protected) return;

    const user = protectPage();
    if (!user) return;

    displayReport();

    const editButton = document.getElementById("editReportBtn");
    const controls = document.getElementById("teacherControls");

    if (user.role !== "teacher") {
        editButton.style.display = "none";
        return;
    }

    editButton.addEventListener("click", function() {
        document.querySelectorAll(".mark-input").forEach(function(input) {
            input.disabled = false;
        });

        controls.classList.remove("hidden");
        editButton.textContent = "Editing...";
        editButton.disabled = true;
    });

    document.getElementById("saveReportBtn").addEventListener("click", function() {
        const report = {
            python: Number(document.getElementById("pythonMarks").value),
            java: Number(document.getElementById("javaMarks").value),
            dbms: Number(document.getElementById("dbmsMarks").value),
            attendance: Number(document.getElementById("attendanceInput").value),
            remarks: document.getElementById("remarksInput").value.trim()
        };

        if (
            report.python < 0 || report.python > 100 ||
            report.java < 0 || report.java > 100 ||
            report.dbms < 0 || report.dbms > 100 ||
            report.attendance < 0 || report.attendance > 100
        ) {
            alert("Marks and attendance must be between 0 and 100.");
            return;
        }

        saveReport(report);
        displayReport();

        document.querySelectorAll(".mark-input").forEach(function(input) {
            input.disabled = true;
        });

        controls.classList.add("hidden");
        editButton.textContent = "Edit Report";
        editButton.disabled = false;

        alert("Student report updated successfully.");
    });
}

// ---------- Analytics Module ----------

function setupAnalytics() {
    if (!document.body.dataset.protected) return;

    const user = protectPage();
    if (!user) return;

    const report = getReport();

    const average = calculateAverage(report);
    const grade = calculateOverallGrade(average);

    document.getElementById("avgStat").textContent = average + "%";
    document.getElementById("attendanceStat").textContent =
        report.attendance + "%";
    document.getElementById("gradeStat").textContent = grade;

    document.getElementById("pythonValue").textContent = report.python;
    document.getElementById("javaValue").textContent = report.java;
    document.getElementById("dbmsValue").textContent = report.dbms;

    document.getElementById("pythonBar").style.width = report.python + "%";
    document.getElementById("javaBar").style.width = report.java + "%";
    document.getElementById("dbmsBar").style.width = report.dbms + "%";

    document.getElementById("analyticsText").textContent =
        "The current average is " + average +
        "%. Attendance is " + report.attendance +
        "%. Overall grade is " + grade +
        ". The highest subject mark is " +
        Math.max(report.python, report.java, report.dbms) + ".";
}

// ---------- Start Application ----------

createDemoAccounts();
setupSignup();
setupLogin();
checkRolePage();
setupLogout();
setupDashboardLink();
setupAdmin();
setupReport();
setupAnalytics();
