import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [category, setCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Add new todo
  const addTodo = (e) => {
    e.preventDefault()
    if (inputValue.trim() === '') return

    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      category: category || 'General',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString()
    }

    setTodos([...todos, newTodo])
    setInputValue('')
    setCategory('')
    setDueDate('')
  }

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // Toggle todo completion
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  // Start editing a todo
  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  // Save edited todo
  const saveEdit = (id) => {
    if (editingText.trim() === '') return

    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editingText } : todo
    ))
    setEditingId(null)
    setEditingText('')
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  // Get unique categories
  const categories = ['all', ...new Set(todos.map(todo => todo.category))]

  // Filter todos by category
  const filteredTodos = filterCategory === 'all'
    ? todos
    : todos.filter(todo => todo.category === filterCategory)

  // Check if task is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <div className="app">
      <div className="container">
        <h1>My To-Do List</h1>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="add-todo-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="category-input"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="date-input"
          />
          <button type="submit" className="add-button">Add Task</button>
        </form>

        {/* Category Filter */}
        <div className="filter-section">
          <label>Filter by category: </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Todo Stats */}
        <div className="stats">
          <span>Total: {filteredTodos.length}</span>
          <span>Active: {filteredTodos.filter(t => !t.completed).length}</span>
          <span>Completed: {filteredTodos.filter(t => t.completed).length}</span>
        </div>

        {/* Todo List */}
        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">No tasks yet. Add one above!</li>
          ) : (
            filteredTodos.map(todo => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${isOverdue(todo.dueDate) ? 'overdue' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="checkbox"
                />

                {editingId === todo.id ? (
                  <div className="edit-section">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="edit-input"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(todo.id)} className="save-btn">Save</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <div className="todo-content">
                    <span className="todo-text">{todo.text}</span>
                    <div className="todo-meta">
                      <span className="category-tag">{todo.category}</span>
                      {todo.dueDate && (
                        <span className={`due-date ${isOverdue(todo.dueDate) ? 'overdue-tag' : ''}`}>
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {editingId !== todo.id && (
                  <div className="todo-actions">
                    <button onClick={() => startEditing(todo)} className="edit-btn">Edit</button>
                    <button onClick={() => deleteTodo(todo.id)} className="delete-btn">Delete</button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default App
