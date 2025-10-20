
<script>
  import { goto } from '$app/navigation';

  function goHome() {
    goto('/');
  }
</script>

<nav class="navbar">
  <div class="navbar-content">
    <button
      class="home-button"
      on:click={goHome}
      title="Back to Home">
      <i class="las la-home"></i>
      <span>Home</span>
    </button>
    <h1 class="navbar-title">HLPV Planning Assessment</h1>
  </div>
</nav>

<style>
  .navbar-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .home-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.375rem;
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .home-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .home-button i {
    font-size: 1.125rem;
  }
</style>