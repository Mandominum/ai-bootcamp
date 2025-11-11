import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [category, setCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  // Fetch todos from Supabase on mount
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Convert snake_case from database to camelCase for app
      const formattedTodos = data.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        category: todo.category,
        dueDate: todo.due_date,
        createdAt: todo.created_at
      }))

      setTodos(formattedTodos)
    } catch (error) {
      console.error('Error fetching todos:', error.message)
      alert('Error loading todos. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  // Add new todo
  const addTodo = async (e) => {
    e.preventDefault()
    if (inputValue.trim() === '') return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            text: inputValue,
            completed: false,
            category: category || 'General',
            due_date: dueDate || null
          }
        ])
        .select()

      if (error) throw error

      // Add the new todo to state
      const newTodo = {
        id: data[0].id,
        text: data[0].text,
        completed: data[0].completed,
        category: data[0].category,
        dueDate: data[0].due_date,
        createdAt: data[0].created_at
      }

      setTodos([newTodo, ...todos])
      setInputValue('')
      setCategory('')
      setDueDate('')
    } catch (error) {
      console.error('Error adding todo:', error.message)
      alert('Error adding todo. Please try again.')
    }
  }

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error.message)
      alert('Error deleting todo. Please try again.')
    }
  }

  // Toggle todo completion
  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id)

      if (error) throw error

      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ))
    } catch (error) {
      console.error('Error updating todo:', error.message)
      alert('Error updating todo. Please try again.')
    }
  }

  // Start editing a todo
  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  // Save edited todo
  const saveEdit = async (id) => {
    if (editingText.trim() === '') return

    try {
      const { error } = await supabase
        .from('todos')
        .update({ text: editingText })
        .eq('id', id)

      if (error) throw error

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editingText } : todo
      ))
      setEditingId(null)
      setEditingText('')
    } catch (error) {
      console.error('Error updating todo:', error.message)
      alert('Error updating todo. Please try again.')
    }
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

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <h1>My To-Do List</h1>
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading todos...</p>
        </div>
      </div>
    )
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
