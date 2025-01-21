ALTER TABLE tasks
ADD COLUMN user_id INT NOT NULL AFTER id;


INSERT INTO tasks (name, category, due_date, user_id) VALUES
('Submit Project', 'Career', '2024-12-31', 1),
('Buy Groceries', 'Personal', '2024-12-25', 1);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    due_date DATE,
    attachment VARCHAR(255)
);
UPDATE tasks SET attachment = REPLACE(attachment, 'uploads/uploads/', 'uploads/');
