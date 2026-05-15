const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const message = document.querySelector("#form-message");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const storageKey = "codex-tasks";
const hashPrefix = "#tasks=";

const defaultTasks = [
  { text: "Aprender a explorar archivos con Codex", completed: true },
  { text: "Pedir una edición pequeña", completed: false },
  { text: "Ejecutar una prueba manual", completed: false }
];

let tasks = loadTasks();

function parseTasks(value) {
  try {
    const parsedTasks = JSON.parse(value);
    if (Array.isArray(parsedTasks)) {
      return parsedTasks;
    }
  } catch (error) {
    console.warn("No se pudieron cargar las tareas guardadas.", error);
  }

  return null;
}

function loadTasksFromHash() {
  if (!window.location.hash.startsWith(hashPrefix)) {
    return null;
  }

  const hashTasks = decodeURIComponent(window.location.hash.slice(hashPrefix.length));
  return parseTasks(hashTasks);
}

function loadTasks() {
  let savedTasks = null;
  const tasksFromHash = loadTasksFromHash();

  if (tasksFromHash) {
    return tasksFromHash;
  }

  try {
    savedTasks = localStorage.getItem(storageKey);
  } catch (error) {
    console.warn("El navegador no permitio leer las tareas guardadas.", error);
  }

  if (!savedTasks) {
    return [...defaultTasks];
  }

  const parsedTasks = parseTasks(savedTasks);

  return parsedTasks || [...defaultTasks];
}

function saveTasks() {
  const serializedTasks = JSON.stringify(tasks);

  try {
    localStorage.setItem(storageKey, serializedTasks);
  } catch (error) {
    console.warn("El navegador no permitio guardar las tareas.", error);
  }

  window.location.hash = `${hashPrefix}${encodeURIComponent(serializedTasks)}`;
}

function updateCount() {
  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.length - pendingTasks;
  const label = pendingTasks === 1 ? "pendiente" : "pendientes";
  taskCount.textContent = `${pendingTasks} ${label}`;
  clearCompletedButton.disabled = completedTasks === 0;
}

function renderTasks() {
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  updateCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    message.textContent = "Escribe una tarea antes de agregarla.";
    return;
  }

  tasks.push({ text, completed: false });
  saveTasks();
  input.value = "";
  message.textContent = "";
  renderTasks();
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
