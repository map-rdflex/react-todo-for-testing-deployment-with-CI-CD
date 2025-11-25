// src/App.jsx
import React, { useState, useEffect, useRef } from "react";


const STORAGE_KEY = "todos_v1";

export default function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    // inject small stylesheet once
    const id = "app-jsx-todo-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        :root{--bg:#0f1724;--card:#0b1220;--accent:#06b6d4;--muted:#94a3b8;--glass: rgba(255,255,255,0.02)}
        *{box-sizing:border-box}
        html,body,#root{height:100%}
        body{margin:0;font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;background:linear-gradient(180deg,#071021 0%, #07182b 100%);color:#e6eef8;display:flex;align-items:center;justify-content:center;padding:32px}
        .app{width:100%;max-width:760px}
        .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border-radius:12px;padding:20px;box-shadow:0 6px 30px rgba(2,6,23,0.6);border:1px solid rgba(255,255,255,0.03)}
        h1{margin:0 0 12px;font-size:22px;letter-spacing:0.4px}
        .controls{display:flex;gap:10px;margin-bottom:14px}
        .input-wrap{flex:1;display:flex;gap:8px}
        input[type="text"]{flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.02);color:inherit;outline:none}
        button{background:var(--accent);border:none;padding:10px 12px;border-radius:10px;color:#022;cursor:pointer;font-weight:600}
        button.ghost{background:transparent;border:1px solid rgba(255,255,255,0.04);color:var(--muted);font-weight:600}
        .filters{display:flex;gap:8px;align-items:center}
        .filters button{background:transparent;border:none;color:var(--muted);padding:6px 8px;border-radius:8px;cursor:pointer}
        .filters button.active{color:var(--accent);background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.12)}
        ul.todo-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
        li.todo{display:flex;gap:10px;align-items:center;padding:10px;border-radius:10px;background:var(--glass);border:1px solid rgba(255,255,255,0.02)}
        .todo .meta{flex:1;display:flex;flex-direction:column}
        .todo .title{font-size:15px;word-break:break-word}
        .todo .title.completed{text-decoration:line-through;color:var(--muted)}
        .todo .small{font-size:12px;color:var(--muted);margin-top:6px}
        .actions{display:flex;gap:6px}
        .icon-btn{background:transparent;border:1px solid rgba(255,255,255,0.03);padding:6px 8px;border-radius:8px;cursor:pointer;color:var(--muted)}
        .count{margin-top:12px;color:var(--muted);font-size:13px}
        @media (max-width:520px){
          body{padding:16px}
          .controls{flex-direction:column}
          .filters{justify-content:flex-start}
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch { }
  }, [todos]);

  // Helper to add
  const addTodo = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = {
      id: Date.now(),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((t) => [newTodo, ...t]);
    setText("");
    inputRef.current?.focus();
  };

  // Keyboard: Enter to add
  const onKeyDownAdd = (e) => {
    if (e.key === "Enter") addTodo();
  };

  const toggle = (id) =>
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)));

  const remove = (id) => setTodos((t) => t.filter((x) => x.id !== id));

  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = (id) => {
    const trimmed = editText.trim();
    if (!trimmed) {
      // if empty after editing - delete
      remove(id);
    } else {
      setTodos((t) => t.map((x) => (x.id === id ? { ...x, text: trimmed } : x)));
    }
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const clearCompleted = () => setTodos((t) => t.filter((x) => !x.completed));

  const filtered = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.completed : t.completed
  );

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <div className="card" role="application" aria-label="Todo application">
        <h1>Todo — single-file React app</h1>

        <div className="controls">
          <div className="input-wrap" style={{ alignItems: "center" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a todo and press Enter"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDownAdd}
              aria-label="New todo"
            />
            <button onClick={addTodo} aria-label="Add todo">
              Add
            </button>
          </div>

          <div className="filters" role="tablist" aria-label="Filter todos">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
            >
              All
            </button>
            <button
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
              aria-pressed={filter === "active"}
            >
              Active
            </button>
            <button
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
              aria-pressed={filter === "completed"}
            >
              Completed
            </button>
          </div>
        </div>

        <ul className="todo-list" aria-live="polite">
          {filtered.length === 0 && (
            <li style={{ color: "var(--muted)", padding: 12 }}>No todos here — add one ✨</li>
          )}

          {filtered.map((todo) => (
            <li key={todo.id} className="todo" onDoubleClick={() => startEdit(todo.id, todo.text)}>
              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggle(todo.id)}
                  aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
                />
              </label>

              <div className="meta">
                {editingId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      aria-label="Edit todo"
                    />
                    <div style={{ marginTop: 8 }}>
                      <button
                        className="icon-btn"
                        onClick={() => saveEdit(todo.id)}
                        aria-label="Save edit"
                      >
                        Save
                      </button>
                      <button className="icon-btn" onClick={cancelEdit} aria-label="Cancel edit">
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`title ${todo.completed ? "completed" : ""}`}>{todo.text}</div>
                    <div className="small">
                      Created: {new Date(todo.createdAt).toLocaleString()}
                    </div>
                  </>
                )}
              </div>

              <div className="actions" aria-hidden={editingId === todo.id}>
                <button
                  className="icon-btn"
                  onClick={() => startEdit(todo.id, todo.text)}
                  title="Edit"
                  aria-label={`Edit ${todo.text}`}
                >
                  ✏️
                </button>
                <button
                  className="icon-btn"
                  onClick={() => remove(todo.id)}
                  title="Delete"
                  aria-label={`Delete ${todo.text}`}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="count">
          <span>{activeCount} active</span>
          <span style={{ marginLeft: 12 }}>· {todos.length} total</span>
          <button
            className="ghost"
            style={{ marginLeft: 12 }}
            onClick={clearCompleted}
            aria-label="Clear completed todos"
          >
            Clear Completed
          </button>
        </div>
      </div>
    </div>
  );
}
