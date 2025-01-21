CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    due_date DATE,
    attachment VARCHAR(255)
);
UPDATE tasks SET attachment = REPLACE(attachment, 'uploads/uploads/', 'uploads/');
