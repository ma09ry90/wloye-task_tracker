<?php
session_start();
$conn = new mysqli("localhost", "root", "", "wloye_task_tracker");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : null);
error_log("Action received: " . $action);


// Handle Signup
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'signup') {
    $username = $_POST['new_username'];
    $password = password_hash($_POST['new_password'], PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $password);

    if ($stmt->execute()) {
        echo "Signup successful. You can now log in.";
    } else {
        echo "Error: " . $conn->error;
    }

    $stmt->close();
    exit;
}

// Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'login') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($userId, $hashedPassword);
        $stmt->fetch();

        if (password_verify($password, $hashedPassword)) {
            $_SESSION['user_id'] = $userId;
            $_SESSION['username'] = $username;
            header("Location: ../frontend/index.html");
            exit;
        } else {
            echo "Invalid credentials. Please try again.";
        }
    } else {
        echo "No account found with that username.";
    }

    $stmt->close();
    exit;
}

// Ensure User is Logged In
if (!isset($_SESSION['user_id']) && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../frontend/login.html");
    exit;
}

// Handle Task Operations
if ($action === 'getTasks') {
    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT id, name, category, due_date, attachment FROM tasks WHERE user_id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    echo json_encode($tasks);
    exit;
}

// Update Task
if ($action === 'updateTask') {
    $id = $_POST['id'];
    $name = $_POST['task_name'];
    $category = $_POST['category'];
    $dueDate = $_POST['due_date'];
    $stmt = $conn->prepare("UPDATE tasks SET name=?, category=?, due_date=? WHERE id=? AND user_id=?");
    $stmt->bind_param('sssii', $name, $category, $dueDate, $id, $_SESSION['user_id']);
    echo $stmt->execute() ? json_encode(['success' => true]) : json_encode(['success' => false]);
    exit;
}

// Delete Task
if ($action === 'deleteTask') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM tasks WHERE id=? AND user_id=?");
    $stmt->bind_param('ii', $id, $_SESSION['user_id']);
    echo $stmt->execute() ? json_encode(['success' => true]) : json_encode(['success' => false]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['task_name'])) {
    $name = $_POST['task_name'];
    $category = $_POST['category'];
    $due_date = $_POST['due_date'];
    $attachment = "";

    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . "/uploads/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $filename = basename($_FILES['attachment']['name']);
        $filePath = $uploadDir . $filename;
        
        if (move_uploaded_file($_FILES['attachment']['tmp_name'], $filePath)) {
            $attachment = "uploads/" . $filename;
        } else {
            error_log("Failed to upload file.");
        }
    }        

    $stmt = $conn->prepare("INSERT INTO tasks (name, category, due_date, attachment, user_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $name, $category, $due_date, $attachment, $_SESSION['user_id']);
    
    if (!$stmt->execute()) {
        error_log("SQL error: " . $stmt->error);
    }

    header("Location: ../frontend/index.html");
    exit;
}

// If action is not recognized, respond with an error
if (!$action) {
    echo json_encode(['error' => 'No action specified']);
    exit;
}
?>