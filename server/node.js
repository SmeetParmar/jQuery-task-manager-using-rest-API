const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;

const app = express();
const port = 3000; // You can choose any available port

app.use(bodyParser.json());
app.use(cors());

const dataFilePath = "tasks.json";

// Read all tasks
app.get("/tasks", async (req, res) => {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");

    // Handle empty file
    if (!data.trim()) {
      return res.json([]); // Return an empty array if the file is empty
    }

    const tasks = JSON.parse(data);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Read a single task
app.get("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    const tasks = JSON.parse(data);
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      res.json(task);
    } else {
      res.status(404).send("Task not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Create a new task
app.post("/tasks", async (req, res) => {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    const tasks = JSON.parse(data);

    const newTask = {
      id: tasks.length + 1, // You can use a more sophisticated ID generation method
      ...req.body,
    };

    tasks.push(newTask);

    await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2), "utf8");

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update a task
app.put("/tasks/:taskId", async (req, res) => {
  const taskId = Number(req.params.taskId);

  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    let tasks = JSON.parse(data);

    const taskIndex = tasks.findIndex(
      (task) => Number(task.id) === Number(taskId)
    );

    console.log("taskIndex", taskIndex);

    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...req.body,
      };

      await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2), "utf8");

      res.json(tasks[taskIndex]);
    } else {
      res.status(404).send("Task not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a task
app.delete("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    let tasks = JSON.parse(data);

    console.log("tasks", tasks);

    const filteredTasks = tasks.filter(
      (task) => Number(task.id) !== Number(taskId)
    );

    if (filteredTasks.length < tasks.length) {
      await fs.writeFile(
        dataFilePath,
        JSON.stringify(filteredTasks, null, 2),
        "utf8"
      );
      res.send("Task deleted successfully");
    } else {
      res.status(404).send("Task not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
