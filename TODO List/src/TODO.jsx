import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import './styles.css';

function ToDoList() {
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
  });
  const [filter, setFilter] = useState('all');
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (task.trim()) {
      const newTask = {
        text: task.trim(),
        completed: false,
        deadline: deadline || null
      };
      setTasks([...tasks, newTask]);
      setTask('');
      setDeadline('');
      toast.success('Task added!');
    }
  };

  const toggleComplete = (index) => {
    const updatedTasks = tasks.map((t, i) =>
      i === index ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
  };

  const handleDelete = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
    toast.info('Task deleted');
  };

  const handleClearAll = () => {
    setTasks([]);
    toast.warn('All tasks cleared');
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditText(tasks[index].text);
  };

  const saveEdit = () => {
    const updatedTasks = tasks.map((t, i) =>
      i === editIndex ? { ...t, text: editText } : t
    );
    setTasks(updatedTasks);
    setEditIndex(null);
    setEditText('');
    toast.success('Task updated!');
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditText('');
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
    toast('Tasks reordered');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.completed;
    if (filter === 'incomplete') return !t.completed;
    return true;
  });

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1c1c1c, #111)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#4da8ff' }}>📝  To-Do List</h1>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a task..."
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: '#2b2b2b',
              color: '#fff',
              fontSize: '1rem'
            }}
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: '#2b2b2b',
              color: '#fff',
              fontSize: '1rem'
            }}
          />
          <button style={{
            padding: '0.75rem',
            backgroundColor: '#4da8ff',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>Add</button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['all', 'completed', 'incomplete'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === type ? '#4da8ff' : '#2b2b2b',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  width: '100%',
                  background: '#1e1e1e',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                {filteredTasks.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#aaa' }}>No tasks found.</p>
                ) : (
                  filteredTasks.map((t, index) => (
                    <Draggable key={index} draggableId={`${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: t.completed ? '#2e7d32' : '#424242',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '0.75rem',
                            ...provided.draggableProps.style
                          }}
                        >
                          {editIndex === index ? (
                            <>
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                style={{
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  border: 'none',
                                  width: '100%'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button onClick={saveEdit} style={{ flex: 1 }}>Save</button>
                                <button onClick={cancelEdit} style={{ flex: 1 }}>Cancel</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{
                                  textDecoration: t.completed ? 'line-through' : 'none',
                                  fontWeight: 'bold'
                                }}>{t.text}</span>
                                {t.deadline && <span style={{ fontSize: '0.8rem', color: '#ccc' }}>⏰ {t.deadline}</span>}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button onClick={() => toggleComplete(index)} style={{ flex: 1 }}>
                                  {t.completed ? '↩️' : '✅'}
                                </button>
                                <button onClick={() => startEdit(index)} style={{ flex: 1 }}>✏️</button>
                                <button onClick={() => handleDelete(index)} style={{ flex: 1 }}>❌</button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={handleClearAll}
          style={{
            marginTop: '1.5rem',
            backgroundColor: '#ff1744',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          Clear All
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default ToDoList;