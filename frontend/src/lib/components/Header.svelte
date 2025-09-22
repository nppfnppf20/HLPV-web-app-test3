<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let searchQuery = '';
  
  function handleSearch() {
    if (searchQuery.trim()) {
      dispatch('search', { query: searchQuery });
    }
  }
  
  function handleKeyPress(/** @type {KeyboardEvent} */ event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<header class="header">
  <div class="header-content">
    <!-- Logo/Brand -->
    <div class="brand">
      <div class="logo">
        <span class="logo-icon">🏛️</span>
        <span class="logo-text">HLPV</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="nav">
      <button class="nav-link active" type="button">Analysis</button>
      <button class="nav-link" type="button">Reports</button>
      <button class="nav-link" type="button">History</button>
      <button class="nav-link" type="button">Help</button>
    </nav>

    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search location or postcode..."
          bind:value={searchQuery}
          on:keypress={handleKeyPress}
          class="search-input"
        />
        <button 
          type="button" 
          class="search-btn"
          on:click={handleSearch}
        >
          Search
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="btn-secondary">Login</button>
      <button class="btn-primary">New Analysis</button>
    </div>
  </div>
</header>

<style>
  .header {
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    gap: 2rem;
  }

  .brand {
    flex-shrink: 0;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.25rem;
    color: #1f2937;
    text-decoration: none;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    font-family: 'Arial', sans-serif;
    letter-spacing: -0.025em;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    color: #6b7280;
    background: transparent;
    border: none;
    font-weight: 500;
    font-size: 0.875rem;
    padding: 0.5rem 0;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .nav-link:hover {
    color: #374151;
  }

  .nav-link.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  .search-container {
    flex: 1;
    max-width: 400px;
    min-width: 300px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    transition: all 0.2s ease;
  }

  .search-box:focus-within {
    background: white;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .search-icon {
    color: #9ca3af;
    margin-right: 0.75rem;
    font-size: 1rem;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .search-input::placeholder {
    color: #9ca3af;
  }

  .search-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    margin-left: 0.5rem;
    transition: background-color 0.2s ease;
  }

  .search-btn:hover {
    background: #2563eb;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .btn-secondary {
    background: transparent;
    color: #6b7280;
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    color: #374151;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header-content {
      gap: 1rem;
      padding: 0.75rem 1rem;
    }

    .nav {
      display: none;
    }

    .search-container {
      min-width: 200px;
      max-width: 300px;
    }

    .actions {
      gap: 0.5rem;
    }

    .btn-secondary {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .logo-text {
      display: none;
    }

    .search-container {
      min-width: 150px;
    }

    .search-btn {
      padding: 0.5rem;
    }
  }
</style>
