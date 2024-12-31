document.addEventListener("DOMContentLoaded", () => {
  const taskTableBody = document.getElementById("task-table-body");

  function fetchTasks() {
      fetch("../backend/backend.php?action=getTasks")
          .then((response) => response.json())
          .then((tasks) => {
              taskTableBody.innerHTML = "";
              tasks.forEach((task) => {
                  const row = document.createElement("tr");
                  row.innerHTML = `
                      <td>${task.name}</td>
                      <td>${task.category}</td>
                      <td>${task.due_date}</td>
                      <td>
                          <button onclick="deleteTask(${task.id})">Delete</button>
                      </td>
                  `;
                  taskTableBody.appendChild(row);
              });
          });
  }

  window.deleteTask = (id) => {
      fetch(`../backend/backend.php?action=deleteTask&id=${id}`)
          .then(() => fetchTasks());
  };

  fetchTasks();
});
