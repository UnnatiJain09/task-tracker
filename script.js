/* =========================================
   TASKFLOW — TASK MANAGEMENT SYSTEM
========================================= */

const taskForm =
    document.querySelector("#task-form");

const taskModal =
    document.querySelector("#task-modal");

const modalTitle =
    document.querySelector("#modal-title");

const modalClose =
    document.querySelector("#modal-close");

const cancelTaskButton =
    document.querySelector("#cancel-task");

const addTaskTop =
    document.querySelector("#add-task-top");

const emptyAddTask =
    document.querySelector("#empty-add-task");

const taskList =
    document.querySelector("#task-list");

const emptyState =
    document.querySelector("#empty-state");

const emptyMessage =
    document.querySelector("#empty-message");

const taskSearch =
    document.querySelector("#task-search");

const priorityFilter =
    document.querySelector("#priority-filter");

const taskTitleInput =
    document.querySelector("#task-title");

const taskDescriptionInput =
    document.querySelector("#task-description");

const descriptionCount =
    document.querySelector("#description-count");

const taskCategoryInput =
    document.querySelector("#task-category");

const taskPriorityInput =
    document.querySelector("#task-priority");

const taskDueDateInput =
    document.querySelector("#task-due-date");

const taskTimeInput =
    document.querySelector("#task-time");

const editingTaskIdInput =
    document.querySelector("#editing-task-id");

const taskTitleError =
    document.querySelector("#task-title-error");

const totalTasksElement =
    document.querySelector("#total-tasks");

const pendingTasksElement =
    document.querySelector("#pending-tasks");

const completedTasksElement =
    document.querySelector("#completed-tasks");

const highPriorityTasksElement =
    document.querySelector("#high-priority-tasks");

const allCountElement =
    document.querySelector("#all-count");

const todayCountElement =
    document.querySelector("#today-count");

const completedCountElement =
    document.querySelector("#completed-count");

const progressPercentElement =
    document.querySelector("#progress-percent");

const progressBarElement =
    document.querySelector("#progress-bar");

const progressTextElement =
    document.querySelector("#progress-text");

const pageTitle =
    document.querySelector("#page-title");

const taskSectionTitle =
    document.querySelector("#task-section-title");

const currentGreeting =
    document.querySelector("#current-greeting");

const navItems =
    document.querySelectorAll(".nav-item");

const categoryItems =
    document.querySelectorAll(".category-item");

const themeToggle =
    document.querySelector("#theme-toggle");

const menuToggle =
    document.querySelector("#menu-toggle");

const sidebar =
    document.querySelector(".sidebar");

const sidebarClose =
    document.querySelector("#sidebar-close");

const toast =
    document.querySelector("#toast");

const toastMessage =
    document.querySelector("#toast-message");

const toastIcon =
    document.querySelector("#toast-icon");


/* =========================================
   APPLICATION STATE
========================================= */

let tasks = [];

let currentView = "all";

let currentCategory = null;


/* =========================================
   LOCAL STORAGE
========================================= */

const STORAGE_KEY =
    "taskFlowTasks";

const THEME_KEY =
    "taskFlowTheme";


function loadTasks() {

    const savedTasks =
        localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
        tasks = [];
        return;
    }

    try {

        tasks =
            JSON.parse(savedTasks);

        if (!Array.isArray(tasks)) {
            tasks = [];
        }

    } catch (error) {

        tasks = [];

        console.error(
            "Unable to load tasks:",
            error
        );
    }
}


function saveTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


/* =========================================
   DATE HELPERS
========================================= */

function getTodayDate() {

    const today =
        new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}


function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDisplayDate(dateString) {

    if (!dateString) {
        return "No due date";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function isToday(dateString) {

    if (!dateString) {
        return false;
    }

    return (
        dateString ===
        formatDateForInput(
            getTodayDate()
        )
    );
}


function isUpcoming(dateString) {

    if (!dateString) {
        return false;
    }

    const today =
        getTodayDate();

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    return date > today;
}


/* =========================================
   GREETING
========================================= */

function updateGreeting() {

    const hour =
        new Date().getHours();

    if (hour < 12) {

        currentGreeting.textContent =
            "GOOD MORNING";

    } else if (hour < 18) {

        currentGreeting.textContent =
            "GOOD AFTERNOON";

    } else {

        currentGreeting.textContent =
            "GOOD EVENING";
    }
}


/* =========================================
   TASK ID
========================================= */

function generateTaskId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================
   OPEN MODAL
========================================= */

function openTaskModal(task = null) {

    taskModal.hidden = false;

    document.body.style.overflow =
        "hidden";

    taskTitleInput.focus();

    if (task) {

        modalTitle.textContent =
            "Edit task";

        editingTaskIdInput.value =
            task.id;

        taskTitleInput.value =
            task.title;

        taskDescriptionInput.value =
            task.description || "";

        taskCategoryInput.value =
            task.category;

        taskPriorityInput.value =
            task.priority;

        taskDueDateInput.value =
            task.dueDate;

        taskTimeInput.value =
            task.time || "";

        updateDescriptionCount();

    } else {

        modalTitle.textContent =
            "Create a new task";

        editingTaskIdInput.value =
            "";

        taskForm.reset();

        taskPriorityInput.value =
            "medium";

        taskDueDateInput.value =
            formatDateForInput(
                getTodayDate()
            );

        updateDescriptionCount();
    }

    clearFormError();
}


/* =========================================
   CLOSE MODAL
========================================= */

function closeTaskModal() {

    taskModal.hidden = true;

    document.body.style.overflow =
        "";

    taskForm.reset();

    editingTaskIdInput.value =
        "";

    taskPriorityInput.value =
        "medium";

    updateDescriptionCount();

    clearFormError();
}


/* =========================================
   FORM VALIDATION
========================================= */

function validateTaskForm() {

    const title =
        taskTitleInput.value.trim();

    if (title === "") {

        taskTitleError.textContent =
            "Please enter a task title.";

        taskTitleInput.setAttribute(
            "aria-invalid",
            "true"
        );

        taskTitleInput.focus();

        return false;
    }

    if (title.length < 2) {

        taskTitleError.textContent =
            "Task title must contain at least 2 characters.";

        taskTitleInput.setAttribute(
            "aria-invalid",
            "true"
        );

        taskTitleInput.focus();

        return false;
    }

    if (
        taskCategoryInput.value === ""
    ) {

        showToast(
            "Please select a category.",
            "!"
        );

        taskCategoryInput.focus();

        return false;
    }

    if (
        taskDueDateInput.value === ""
    ) {

        showToast(
            "Please select a due date.",
            "!"
        );

        taskDueDateInput.focus();

        return false;
    }

    clearFormError();

    return true;
}


function clearFormError() {

    taskTitleError.textContent =
        "";

    taskTitleInput.removeAttribute(
        "aria-invalid"
    );
}


/* =========================================
   CREATE / UPDATE TASK
========================================= */

function handleTaskSubmit(event) {

    event.preventDefault();

    if (!validateTaskForm()) {
        return;
    }

    const title =
        taskTitleInput.value.trim();

    const description =
        taskDescriptionInput.value.trim();

    const category =
        taskCategoryInput.value;

    const priority =
        taskPriorityInput.value;

    const dueDate =
        taskDueDateInput.value;

    const time =
        taskTimeInput.value;

    const editingId =
        editingTaskIdInput.value;


    if (editingId) {

        const task =
            tasks.find(
                item =>
                    item.id === editingId
            );

        if (task) {

            task.title =
                title;

            task.description =
                description;

            task.category =
                category;

            task.priority =
                priority;

            task.dueDate =
                dueDate;

            task.time =
                time;
        }

        saveTasks();

        closeTaskModal();

        renderTasks();

        showToast(
            "Task updated successfully."
        );

    } else {

        const newTask = {

            id: generateTaskId(),

            title,

            description,

            category,

            priority,

            dueDate,

            time,

            completed: false,

            createdAt:
                new Date().toISOString()
        };

        tasks.unshift(
            newTask
        );

        saveTasks();

        closeTaskModal();

        renderTasks();

        showToast(
            "Task created successfully."
        );
    }
}


/* =========================================
   GET FILTERED TASKS
========================================= */

function getFilteredTasks() {

    let filtered =
        [...tasks];


    /* VIEW FILTER */

    if (currentView === "today") {

        filtered =
            filtered.filter(
                task =>
                    isToday(
                        task.dueDate
                    )
            );
    }


    if (currentView === "upcoming") {

        filtered =
            filtered.filter(
                task =>
                    isUpcoming(
                        task.dueDate
                    )
            );
    }


    if (currentView === "completed") {

        filtered =
            filtered.filter(
                task =>
                    task.completed
            );
    }


    /* CATEGORY FILTER */

    if (currentCategory) {

        filtered =
            filtered.filter(
                task =>
                    task.category ===
                    currentCategory
            );
    }


    /* SEARCH */

    const searchValue =
        taskSearch.value
            .trim()
            .toLowerCase();

    if (searchValue) {

        filtered =
            filtered.filter(
                task =>
                    task.title
                        .toLowerCase()
                        .includes(searchValue) ||

                    task.description
                        .toLowerCase()
                        .includes(searchValue) ||

                    task.category
                        .toLowerCase()
                        .includes(searchValue)
            );
    }


    /* PRIORITY */

    const priority =
        priorityFilter.value;

    if (priority !== "all") {

        filtered =
            filtered.filter(
                task =>
                    task.priority ===
                    priority
            );
    }


    return filtered;
}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    const filteredTasks =
        getFilteredTasks();

    taskList.innerHTML =
        "";


    if (
        filteredTasks.length === 0
    ) {

        taskList.hidden =
            true;

        emptyState.hidden =
            false;

        updateEmptyMessage();

    } else {

        taskList.hidden =
            false;

        emptyState.hidden =
            true;

        filteredTasks.forEach(
            task => {

                const taskElement =
                    createTaskElement(
                        task
                    );

                taskList.appendChild(
                    taskElement
                );
            }
        );
    }

    updateStatistics();

    updateNavigationCounts();

    updateProgress();

    updatePageHeading();
}


/* =========================================
   CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "task-item";

    if (task.completed) {

        article.classList.add(
            "completed"
        );
    }


    /* CHECK BUTTON */

    const checkButton =
        document.createElement(
            "button"
        );

    checkButton.type =
        "button";

    checkButton.className =
        "task-check";

    checkButton.setAttribute(
        "aria-label",
        task.completed
            ? "Mark task as incomplete"
            : "Mark task as complete"
    );

    checkButton.textContent =
        task.completed
            ? "✓"
            : "";

    checkButton.addEventListener(
        "click",
        () => {

            toggleTask(
                task.id
            );
        }
    );


    /* TASK INFO */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "task-info";


    const title =
        document.createElement(
            "h3"
        );

    title.className =
        "task-title";

    title.textContent =
        task.title;


    const description =
        document.createElement(
            "p"
        );

    description.className =
        "task-description";

    description.textContent =
        task.description ||
        "No description added.";


    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "task-meta";


    const priorityBadge =
        document.createElement(
            "span"
        );

    priorityBadge.className =
        `priority-badge ${task.priority}`;

    priorityBadge.textContent =
        capitalize(
            task.priority
        );


    const categoryBadge =
        document.createElement(
            "span"
        );

    categoryBadge.className =
        "category-badge";

    categoryBadge.textContent =
        task.category;


    const dueDate =
        document.createElement(
            "span"
        );

    dueDate.className =
        "due-date";

    dueDate.textContent =
        `Due ${formatDisplayDate(
            task.dueDate
        )}`;

    if (isToday(task.dueDate)) {

        dueDate.textContent =
            "Due Today";
    }


    meta.appendChild(
        priorityBadge
    );

    meta.appendChild(
        categoryBadge
    );

    meta.appendChild(
        dueDate
    );


    info.appendChild(
        title
    );

    info.appendChild(
        description
    );

    info.appendChild(
        meta
    );


    /* ACTIONS */

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "task-actions";


    const editButton =
        document.createElement(
            "button"
        );

    editButton.type =
        "button";

    editButton.className =
        "task-action";

    editButton.textContent =
        "✎";

    editButton.setAttribute(
        "aria-label",
        `Edit ${task.title}`
    );

    editButton.addEventListener(
        "click",
        () => {

            openTaskModal(
                task
            );
        }
    );


    const deleteButton =
        document.createElement(
            "button"
        );

    deleteButton.type =
        "button";

    deleteButton.className =
        "task-action delete";

    deleteButton.textContent =
        "⌫";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${task.title}`
    );

    deleteButton.addEventListener(
        "click",
        () => {

            deleteTask(
                task.id
            );
        }
    );


    actions.appendChild(
        editButton
    );

    actions.appendChild(
        deleteButton
    );


    article.appendChild(
        checkButton
    );

    article.appendChild(
        info
    );

    article.appendChild(
        actions
    );


    return article;
}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(taskId) {

    const task =
        tasks.find(
            item =>
                item.id === taskId
        );

    if (!task) {
        return;
    }

    task.completed =
        !task.completed;

    saveTasks();

    renderTasks();

    if (task.completed) {

        showToast(
            "Task completed! Great work."
        );

    } else {

        showToast(
            "Task marked as pending."
        );
    }
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(taskId) {

    const task =
        tasks.find(
            item =>
                item.id === taskId
        );

    if (!task) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete "${task.title}"?`
        );

    if (!confirmed) {
        return;
    }

    tasks =
        tasks.filter(
            item =>
                item.id !== taskId
        );

    saveTasks();

    renderTasks();

    showToast(
        "Task deleted."
    );
}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;

    const pending =
        total - completed;

    const highPriority =
        tasks.filter(
            task =>
                task.priority ===
                "high" &&
                !task.completed
        ).length;


    totalTasksElement.textContent =
        total;

    pendingTasksElement.textContent =
        pending;

    completedTasksElement.textContent =
        completed;

    highPriorityTasksElement.textContent =
        highPriority;
}


/* =========================================
   NAVIGATION COUNTS
========================================= */

function updateNavigationCounts() {

    const total =
        tasks.length;

    const todayTasks =
        tasks.filter(
            task =>
                isToday(
                    task.dueDate
                ) &&
                !task.completed
        ).length;

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    allCountElement.textContent =
        total;

    todayCountElement.textContent =
        todayTasks;

    completedCountElement.textContent =
        completed;
}


/* =========================================
   PRODUCTIVITY PROGRESS
========================================= */

function updateProgress() {

    if (tasks.length === 0) {

        progressPercentElement.textContent =
            "0%";

        progressBarElement.style.width =
            "0%";

        progressTextElement.textContent =
            "No tasks added yet";

        return;
    }

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;

    const percentage =
        Math.round(
            (completed / tasks.length) *
            100
        );

    progressPercentElement.textContent =
        `${percentage}%`;

    progressBarElement.style.width =
        `${percentage}%`;


    if (percentage === 0) {

        progressTextElement.textContent =
            "No completed tasks yet";

    } else if (percentage === 100) {

        progressTextElement.textContent =
            "All tasks completed! 🎉";

    } else {

        progressTextElement.textContent =
            `${completed} of ${tasks.length} tasks completed`;
    }
}


/* =========================================
   EMPTY STATE
========================================= */

function updateEmptyMessage() {

    if (taskSearch.value.trim()) {

        emptyMessage.textContent =
            "No tasks match your search.";

        return;
    }

    if (priorityFilter.value !== "all") {

        emptyMessage.textContent =
            "No tasks match this priority.";

        return;
    }

    if (currentCategory) {

        emptyMessage.textContent =
            `No ${currentCategory.toLowerCase()} tasks yet.`;

        return;
    }

    if (currentView === "today") {

        emptyMessage.textContent =
            "You have no tasks scheduled for today.";

        return;
    }

    if (currentView === "upcoming") {

        emptyMessage.textContent =
            "You have no upcoming tasks.";

        return;
    }

    if (currentView === "completed") {

        emptyMessage.textContent =
            "You haven't completed any tasks yet.";

        return;
    }

    emptyMessage.textContent =
        "Create your first task and start getting things done.";
}


/* =========================================
   PAGE HEADING
========================================= */

function updatePageHeading() {

    if (currentCategory) {

        pageTitle.textContent =
            currentCategory;

        taskSectionTitle.textContent =
            `${currentCategory} Tasks`;

        return;
    }

    if (currentView === "today") {

        pageTitle.textContent =
            "Today";

        taskSectionTitle.textContent =
            "Today's Tasks";

        return;
    }

    if (currentView === "upcoming") {

        pageTitle.textContent =
            "Upcoming";

        taskSectionTitle.textContent =
            "Upcoming Tasks";

        return;
    }

    if (currentView === "completed") {

        pageTitle.textContent =
            "Completed";

        taskSectionTitle.textContent =
            "Completed Tasks";

        return;
    }

    pageTitle.textContent =
        "All Tasks";

    taskSectionTitle.textContent =
        "Tasks";
}


/* =========================================
   SEARCH
========================================= */

taskSearch.addEventListener(
    "input",
    renderTasks
);


/* =========================================
   PRIORITY FILTER
========================================= */

priorityFilter.addEventListener(
    "change",
    renderTasks
);


/* =========================================
   NAVIGATION
========================================= */

navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                navItems.forEach(
                    nav =>
                        nav.classList.remove(
                            "active"
                        )
                );

                categoryItems.forEach(
                    category =>
                        category.classList.remove(
                            "active"
                        )
                );

                item.classList.add(
                    "active"
                );

                currentView =
                    item.dataset.view;

                currentCategory =
                    null;

                renderTasks();

                closeSidebarOnMobile();
            }
        );
    }
);


/* =========================================
   CATEGORY FILTER
========================================= */

categoryItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                navItems.forEach(
                    nav =>
                        nav.classList.remove(
                            "active"
                        )
                );

                categoryItems.forEach(
                    category =>
                        category.classList.remove(
                            "active"
                        )
                );

                item.classList.add(
                    "active"
                );

                currentCategory =
                    item.dataset.category;

                currentView =
                    "all";

                renderTasks();

                closeSidebarOnMobile();
            }
        );
    }
);


/* =========================================
   ADD TASK BUTTONS
========================================= */

addTaskTop.addEventListener(
    "click",
    () => {

        openTaskModal();
    }
);


emptyAddTask.addEventListener(
    "click",
    () => {

        openTaskModal();
    }
);


/* =========================================
   MODAL CONTROLS
========================================= */

modalClose.addEventListener(
    "click",
    closeTaskModal
);


cancelTaskButton.addEventListener(
    "click",
    closeTaskModal
);


taskModal
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeTaskModal
    );


taskForm.addEventListener(
    "submit",
    handleTaskSubmit
);


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !taskModal.hidden
        ) {

            closeTaskModal();
        }
    }
);


/* =========================================
   DESCRIPTION CHARACTER COUNT
========================================= */

function updateDescriptionCount() {

    const length =
        taskDescriptionInput.value.length;

    descriptionCount.textContent =
        `${length} / 300`;
}


taskDescriptionInput.addEventListener(
    "input",
    updateDescriptionCount
);


/* =========================================
   TOAST
========================================= */

let toastTimeout;


function showToast(
    message,
    icon = "✓"
) {

    toastMessage.textContent =
        message;

    toastIcon.textContent =
        icon;

    toast.hidden =
        false;

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(
            () => {

                toast.hidden =
                    true;

            },
            3000
        );
}


/* =========================================
   MOBILE SIDEBAR
========================================= */

menuToggle.addEventListener(
    "click",
    () => {

        sidebar.classList.add(
            "open"
        );
    }
);


sidebarClose.addEventListener(
    "click",
    () => {

        sidebar.classList.remove(
            "open"
        );
    }
);


function closeSidebarOnMobile() {

    if (
        window.innerWidth <= 800
    ) {

        sidebar.classList.remove(
            "open"
        );
    }
}


/* =========================================
   THEME
========================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );

    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        themeToggle.textContent =
            "☀";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );

    } else {

        themeToggle.textContent =
            "☾";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );
    }
}


themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );

        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );

        if (isDark) {

            themeToggle.textContent =
                "☀";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            localStorage.setItem(
                THEME_KEY,
                "dark"
            );

        } else {

            themeToggle.textContent =
                "☾";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            localStorage.setItem(
                THEME_KEY,
                "light"
            );
        }
    }
);


/* =========================================
   CAPITALIZE HELPER
========================================= */

function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


/* =========================================
   INITIALIZE APPLICATION
========================================= */

loadTasks();

loadTheme();

updateGreeting();

renderTasks();