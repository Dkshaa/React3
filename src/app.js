const STORAGE_KEY = "react3.todos";

const priorities = {
  high: { label: "High", color: "danger" },
  medium: { label: "Medium", color: "warning" },
  low: { label: "Low", color: "calm" },
};

const starterTodos = [
  {
    id: crypto.randomUUID(),
    title: "Plan today's study goals",
    priority: "high",
    dueDate: today(),
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Practice React state and props",
    priority: "medium",
    dueDate: "",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Review completed tasks",
    priority: "low",
    dueDate: today(),
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(todo) {
  return Boolean(todo.dueDate && !todo.completed && todo.dueDate < today());
}

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterTodos;
  } catch {
    return starterTodos;
  }
}

function App() {
  const [todos, setTodos] = React.useState(loadTodos);
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState("medium");
  const [dueDate, setDueDate] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [editingId, setEditingId] = React.useState(null);
  const [editDraft, setEditDraft] = React.useState({ title: "", priority: "medium", dueDate: "" });

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const stats = React.useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const overdue = todos.filter(isOverdue).length;
    return {
      total: todos.length,
      active: todos.length - completed,
      completed,
      overdue,
    };
  }, [todos]);

  const filteredTodos = React.useMemo(() => {
    return todos
      .filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        if (filter === "overdue") return isOverdue(todo);
        return true;
      })
      .filter((todo) => todo.title.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => {
        if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
        const rank = { high: 0, medium: 1, low: 2 };
        return rank[a.priority] - rank[b.priority];
      });
  }, [todos, filter, query]);

  function addTodo(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setTodos((currentTodos) => [
      {
        id: crypto.randomUUID(),
        title: cleanTitle,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...currentTodos,
    ]);
    setTitle("");
    setPriority("medium");
    setDueDate("");
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  function beginEdit(todo) {
    setEditingId(todo.id);
    setEditDraft({ title: todo.title, priority: todo.priority, dueDate: todo.dueDate });
  }

  function saveEdit(id) {
    const cleanTitle = editDraft.title.trim();
    if (!cleanTitle) return;

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, ...editDraft, title: cleanTitle } : todo
      )
    );
    setEditingId(null);
  }

  function clearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">React3 practice app</p>
          <h1>Realtime Todo List</h1>
          <p className="hero-copy">
            Track tasks, priorities, deadlines, and progress with instant updates.
          </p>
        </div>
        <div className="today-card">
          <span>Today</span>
          <strong>{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong>
        </div>
      </section>

      <section className="stats-grid" aria-label="Todo statistics">
        <Stat label="Total" value={stats.total} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Done" value={stats.completed} />
        <Stat label="Overdue" value={stats.overdue} />
      </section>

      <form className="todo-form" onSubmit={addTodo}>
        <label>
          <span>Task</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a new task..."
            maxLength="80"
          />
        </label>
        <label>
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          <span>Due date</span>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <button type="submit">Add Task</button>
      </form>

      <section className="toolbar">
        <div className="filters" role="tablist" aria-label="Todo filters">
          {["all", "active", "completed", "overdue"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks"
        />
      </section>

      <section className="todo-list" aria-label="Todo list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <h2>No tasks found</h2>
            <p>Add a task or adjust your filter to see todos here.</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <article
              className={`todo-item ${todo.completed ? "completed" : ""} ${isOverdue(todo) ? "overdue" : ""}`}
              key={todo.id}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`Mark ${todo.title} complete`}
              />

              {editingId === todo.id ? (
                <div className="edit-panel">
                  <input
                    value={editDraft.title}
                    onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })}
                    maxLength="80"
                  />
                  <select
                    value={editDraft.priority}
                    onChange={(event) => setEditDraft({ ...editDraft, priority: event.target.value })}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    type="date"
                    value={editDraft.dueDate}
                    onChange={(event) => setEditDraft({ ...editDraft, dueDate: event.target.value })}
                  />
                  <div className="row-actions">
                    <button type="button" onClick={() => saveEdit(todo.id)}>Save</button>
                    <button type="button" className="ghost" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="todo-content">
                    <h2>{todo.title}</h2>
                    <div className="meta">
                      <span className={`badge ${priorities[todo.priority].color}`}>
                        {priorities[todo.priority].label}
                      </span>
                      {todo.dueDate && <span>Due {todo.dueDate}</span>}
                      {isOverdue(todo) && <span className="overdue-text">Overdue</span>}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button type="button" className="ghost" onClick={() => beginEdit(todo)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => deleteTodo(todo.id)}>Delete</button>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </section>

      {stats.completed > 0 && (
        <button className="clear-button" type="button" onClick={clearCompleted}>
          Clear completed tasks
        </button>
      )}
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
