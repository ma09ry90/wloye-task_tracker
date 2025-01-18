document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();

    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const response = await fetch('../backend/backend.php', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            fetchTasks();
            e.target.reset();
        } else {
            alert('Failed to add task.');
        }
    });
});

const fetchTasks = async () => {
    try {
        const response = await fetch('../backend/backend.php?action=getTasks');
        const tasks = await response.json();

        const taskTableBody = document.getElementById('task-table-body');
        taskTableBody.innerHTML = tasks.length
            ? tasks.map(task => `
                <tr data-task-id="${task.id}">
                    <td>${task.name}</td>
                    <td>${task.category}</td>
                    <td>${task.due_date}</td>
                    <td>        
                    ${
                        task.attachment
                            ? /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(task.attachment)
                            ? `<img src="../backend/${task.attachment}" alt="Task Attachment" style="width: 100px; height: auto;">`
                            : `<a href="../backend/${task.attachment}" target="_blank">View File</a>`
                            : 'No Attachment'
                    }</td>
                    <td>
                        <button onclick="showUpdateForm(${task.id}, '${task.name}', '${task.category}', '${task.due_date}')">Update</button>
                        <button onclick="deleteTask(${task.id})">Delete</button>
                    </td>
                </tr>
            `).join('')
            : '<tr><td colspan="5">No tasks added.</td></tr>';
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
};

const showUpdateForm = (id, name, category, dueDate) => {
    const updateFormContainer = document.getElementById('update-form-container');
    updateFormContainer.innerHTML = `
        <form id="update-form">
            <input type="hidden" name="id" value="${id}">
            <label for="update-task-name">Task Name:</label>
            <input type="text" name="task_name" value="${name}" required>
            <label for="update-category">Category:</label>
            <select name="category" required>
                <option value="Personal" ${category === 'Personal' ? 'selected' : ''}>Personal</option>
                <option value="Career" ${category === 'Career' ? 'selected' : ''}>Career</option>
                <option value="Special" ${category === 'Special' ? 'selected' : ''}>Special</option>
            </select>
            <label for="update-due-date">Due Date:</label>
            <input type="date" name="due_date" value="${dueDate}" required>
            <button type="submit">Update</button>
            <button type="button" onclick="hideUpdateForm()">Cancel</button>
        </form>
    `;

    document.getElementById('update-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const response = await fetch('../backend/backend.php?action=updateTask', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            hideUpdateForm();
            fetchTasks();
        } else {
            alert('Failed to update task.');
        }
    });
};

const hideUpdateForm = () => {
    document.getElementById('update-form-container').innerHTML = '';
};

const deleteTask = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
        const response = await fetch(`../backend/backend.php?action=deleteTask&id=${id}`);
        if (response.ok) fetchTasks();
        else alert('Failed to delete task.');
    }
};
// ask user to allow notification access
if("Notification" in window) {
    Notification.requestPermission().then(function (permission) {
    if(Notification.permission !== "granted") {
        alert("Please allow notification access!");
        location.reload();
    }
});
}

var timeoutIds = [];

function scheduleReminder() {
    var task_name= document.getElementById("task_name").value;
    var category= document.getElementById("category").value;
    var due_date= document.getElementById("due-date").value;
    var time= document.getElementById("time").value;

    var dateTimeString = date + " " + time;
    var scheduleTime = new Date(dateTimeString);
    var currentTime = new Date();
    var timeDifference = scheduleTime - currentTime;

    if (timeDifference > 0) {
        addReminder(task_name, category, dateTimeString);

        var timeoutId = setTimeout(function (){
            document.getElementById("notificationSound").play();

            var notification = new Notification(task_name, {
                body: category,
                requireInteraction: true,
            });
        }, timeDifference);

      timeoutIds.push(timeoutId);  
    } else{
        alert("The schedule time is in the past!");
    }
  }
  function addReminder(task_name, category, dateTimeString){
    var tablebody = document.getElementById("task-table-body");

    var row= tablebody.insertRow();

    var task_namecell = row.insertcell(0);
    var categorycell = row.insertcell(1);
    var due_datecell = row.insertcell(2);
    var actioncell = row.insertcell(3);

    task_namecell.innerHTML = task_name;
    categorycell.innerHTML = category;
    due_datecell.innerHTML = dateTimeString;
    actioncell.innerHTML = '<button onclick = "deletReminder(this);">Delete</button>';
  }

  function deletReminder(button){
    var row = button.closest("tr");
    var index = row.rowIndex;

    clearTimeoust(timeoutIds[index - 1]);
    timeoutIds.splice(index -1, 1);

    row.remove();
  }
