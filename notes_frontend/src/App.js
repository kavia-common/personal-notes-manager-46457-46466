import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

// Simple ID generator for local notes
const genId = () => `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// PUBLIC_INTERFACE
export function useNotesService() {
  /**
   * PUBLIC_INTERFACE
   * A storage strategy that supports localStorage by default and is structured
   * to allow switching to an API later if REACT_APP_API_BASE is present.
   */
  const apiBase = typeof process !== 'undefined' ? process.env.REACT_APP_API_BASE : undefined;

  const isApiEnabled = !!apiBase;

  // Keys for localStorage
  const STORAGE_KEY = 'notes_app_items_v1';

  // Helpers for local storage
  const readLocal = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeLocal = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors in this lightweight app
    }
  };

  // PUBLIC_INTERFACE
  const list = async () => {
    if (isApiEnabled) {
      // Future-ready: API integration placeholder
      // const res = await fetch(`${apiBase}/notes`);
      // if (!res.ok) throw new Error('Failed to fetch');
      // return res.json();
    }
    return readLocal();
  };

  // PUBLIC_INTERFACE
  const create = async (note) => {
    if (isApiEnabled) {
      // const res = await fetch(`${apiBase}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) });
      // if (!res.ok) throw new Error('Failed to create');
      // return res.json();
    }
    const items = readLocal();
    const now = new Date().toISOString();
    const newItem = { id: genId(), title: note.title, content: note.content || '', createdAt: now, updatedAt: now };
    const updated = [newItem, ...items];
    writeLocal(updated);
    return newItem;
  };

  // PUBLIC_INTERFACE
  const update = async (id, patch) => {
    if (isApiEnabled) {
      // const res = await fetch(`${apiBase}/notes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      // if (!res.ok) throw new Error('Failed to update');
      // return res.json();
    }
    const items = readLocal();
    const updated = items.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n));
    writeLocal(updated);
    return updated.find((n) => n.id === id);
  };

  // PUBLIC_INTERFACE
  const remove = async (id) => {
    if (isApiEnabled) {
      // const res = await fetch(`${apiBase}/notes/${id}`, { method: 'DELETE' });
      // if (!res.ok) throw new Error('Failed to delete');
      // return { id };
    }
    const items = readLocal();
    const updated = items.filter((n) => n.id !== id);
    writeLocal(updated);
    return { id };
  };

  return { list, create, update, remove, isApiEnabled };
}

// Components

function Header({ theme, onToggleTheme }) {
  return (
    <header className="header" role="banner">
      <div className="header-content container">
        <div className="branding">
          <span className="logo" aria-hidden="true">📝</span>
          <h1 className="title">Personal Notes</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>
    </header>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-card">
        <div className="empty-icon" aria-hidden="true">📄</div>
        <p className="empty-title">No notes yet</p>
        <p className="empty-subtitle">Start by creating your first note.</p>
        <button className="btn btn-primary" onClick={onCreate}>Create Note</button>
      </div>
    </div>
  );
}

function NoteItem({ note, onEdit, onDelete }) {
  return (
    <article className="note-item" aria-label={`Note titled ${note.title}`}>
      <div className="note-item-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button className="btn btn-small btn-secondary" onClick={() => onEdit(note)} aria-label={`Edit ${note.title}`}>Edit</button>
          <button className="btn btn-small btn-danger" onClick={() => onDelete(note.id)} aria-label={`Delete ${note.title}`}>Delete</button>
        </div>
      </div>
      {note.content && <p className="note-content">{note.content}</p>}
      <div className="note-meta">
        <span>Updated {new Date(note.updatedAt || note.createdAt).toLocaleString()}</span>
      </div>
    </article>
  );
}

function NotesList({ notes, onEdit, onDelete }) {
  if (!notes.length) {
    return null;
  }
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Your Notes</h2>
      </div>
      <div className="notes-list" role="list">
        {notes.map((n) => (
          <div role="listitem" key={n.id}>
            <NoteItem note={n} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </section>
  );
}

function NoteForm({ initial, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setTitle(initial?.title || '');
    setContent(initial?.content || '');
    setTouched(false);
  }, [initial?.id]);

  const titleError = !title.trim() && touched ? 'Title is required' : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!title.trim()) return;
    onSave({
      ...initial,
      title: title.trim(),
      content,
    });
    // Reset if creating
    if (!initial?.id) {
      setTitle('');
      setContent('');
      setTouched(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">{initial?.id ? 'Edit Note' : 'Add Note'}</h2>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className={`form-field ${titleError ? 'has-error' : ''}`}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Note title"
            required
            aria-invalid={!!titleError}
            aria-describedby={titleError ? 'title-error' : undefined}
          />
          {titleError && <div id="title-error" className="error-text">{titleError}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={6}
          />
        </div>
        <div className="form-actions">
          {initial?.id && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {initial?.id ? 'Save Changes' : 'Add Note'}
          </button>
        </div>
      </form>
    </section>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** App state and handlers for Notes manager */
  const [theme, setTheme] = useState('light');
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const service = useNotesService();

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load initial notes
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await service.list();
      if (active) {
        setNotes(data);
        setLoading(false);
      }
    })();
    return () => { active = false; };
    // We intentionally ignore service dependency to avoid refetch loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),
    [notes]
  );

  const handleCreate = async () => {
    setEditing({ title: '', content: '' });
    // focus handled by browser naturally when first input
  };

  const handleSave = async (note) => {
    if (note.id) {
      const updated = await service.update(note.id, { title: note.title, content: note.content });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setEditing(null);
    } else {
      const created = await service.create({ title: note.title, content: note.content });
      setNotes((prev) => [created, ...prev]);
      // keep form open for a new note
    }
  };

  const handleDelete = async (id) => {
    await service.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  const handleEdit = (note) => {
    setEditing(note);
    // scroll into view on small screens
    const formEl = document.getElementById('note-form-panel');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="App">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="main container" role="main">
        <div className="grid">
          <div className="col col-list">
            {loading ? (
              <div className="loading" role="status" aria-live="polite">Loading...</div>
            ) : sortedNotes.length === 0 ? (
              <EmptyState onCreate={handleCreate} />
            ) : (
              <NotesList notes={sortedNotes} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
          <div className="col col-form" id="note-form-panel">
            <NoteForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSave={handleSave}
            />
            {sortedNotes.length > 0 && !editing && (
              <div className="hint">
                Tip: Select a note to edit, or start a new one.
                <div>
                  <button className="btn btn-link" onClick={handleCreate}>Create a new note</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-content">
          <span className="muted">Ocean Professional theme • {service.isApiEnabled ? 'API-ready' : 'Local only'}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
