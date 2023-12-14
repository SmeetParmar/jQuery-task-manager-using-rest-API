"use strict";

$(document).ready(() => {
  let tasks = [];
  let editingIndex = null; // Variable to keep track of the task being edited

  const displayTask = (newTaskList) => {
    const taskList = $("#taskList");
    taskList.html("");

    newTaskList.forEach((task, index) => {
      const li = $("<li>").html(`
                <strong>Description:</strong> ${task.description}<br>
                <strong>Assigned to:</strong> ${task.assignedTo}<br>
                <strong>Estimated Time:</strong> ${task.estimatedTime}<br>
                <strong>Priority:</strong> ${task.priority}<br>
                <strong>Status:</strong> ${task.status}
                <button class="editBtn" data-index="${index}">Edit</button>
                <button class="deleteBtn" data-index="${index}">Delete</button>
            `);

      switch (task.priority) {
        case "High":
          li.addClass("high-priority");
          break;
        case "Medium":
          li.addClass("medium-priority");
          break;
        case "Low":
          li.addClass("low-priority");
          break;
        default:
          break;
      }

      taskList.append(li);
    });
  };

  const editTask = function () {
    const index = $(this).data("index");

    // Set the form fields with the values of the task being edited
    $("#taskDescriptionInput").val(tasks[index].description);
    $("#assignedToInput").val(tasks[index].assignedTo);
    $("#estimatedTime").val(tasks[index].estimatedTime);
    $("#priorityInput").val(tasks[index].priority);
    $("#statusInput").val(tasks[index].status);

    // Set the editingIndex for tracking the edited task
    editingIndex = index;
  };

  const deleteTask = function () {
    const permission = confirm("Are you sure you want to delete this task?");

    if (permission) {
      const index = $(this).data("index");

      const taskId = tasks[index].id;

      fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            tasks.splice(index, 1);

            displayTask(tasks);

            return response.json();
          } else {
            throw new Error("Failed to delete task");
          }
        })
        .then(() => {
          //
        })
        .catch((error) => console.error("Error deleting task:", error));
    }
  };

  const filterTasks = () => {
    console.log("searchInput", $("#searchInput").val());
    const searchText = $("#searchInput").val().toLowerCase();

    console.log("search in searchText", searchText);

    const filteredTasks = tasks.filter(
      (task) =>
        task.description.toLowerCase().includes(searchText) ||
        task.assignedTo.toLowerCase().includes(searchText) ||
        task.estimatedTime.toLowerCase().includes(searchText) ||
        task.priority.toLowerCase().includes(searchText) ||
        task.status.toLowerCase().includes(searchText)
    );
    displayTask(filteredTasks);
  };

  $("#addTaskBtn").click(() => {
    const description = $("#taskDescriptionInput").val();
    const assignedTo = $("#assignedToInput").val();
    const estimatedTime = $("#estimatedTime").val();
    const priority = $("#priorityInput").val();
    const status = $("#statusInput").val();

    const newTask = {
      description,
      assignedTo,
      estimatedTime,
      priority,
      status,
    };

    if (editingIndex !== null) {
      // If editingIndex is not null, update the task
      const taskId = tasks[editingIndex].id;

      fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to update task");
          }
        })
        .then(() => {
          tasks[editingIndex] = { ...newTask, id: taskId };
          displayTask(tasks);
          clearForm();
          editingIndex = null; // Reset editingIndex after update
        })
        .catch((error) => console.error("Error updating task:", error));
    } else {
      // If editingIndex is null, add a new task
      fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to add task");
          }
        })
        .then((data) => {
          tasks.push(data);
          displayTask(tasks);
          clearForm();
        })
        .catch((error) => console.error("Error adding task:", error));
    }
  });

  $("#taskList").on("click", ".editBtn", editTask);
  $("#taskList").on("click", ".deleteBtn", deleteTask);
  $("#searchInput").on("input", filterTasks);

  fetch("http://localhost:3000/tasks")
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to load tasks");
      }
    })
    .then((data) => {
      tasks = data;
      displayTask(tasks);
    })
    .catch((error) => console.error("Error loading tasks:", error));

  const clearForm = () => {
    $("#taskDescriptionInput").val("");
    $("#assignedToInput").val("");
    $("#estimatedTime").val("");
    $("#priorityInput").val("");
    $("#statusInput").val("");
  };
});
