<script>
  import { goto } from '$app/navigation';

  function navigateToHLPV() {
    goto('/hlpv');
  }

  function navigateToSocioeconomics() {
    goto('/socioeconomics');
  }
</script>

<div class="home-page">
  <div class="home-container">
    <!-- Header Section -->
    <div class="home-header">
      <h1 class="home-title">
        Planning Assessment Tools
      </h1>
      <p class="home-subtitle">
        Comprehensive planning and development assessment tools for informed decision-making
      </p>
    </div>

    <!-- Tools Grid -->
    <div class="tools-grid">

      <!-- HLPV Assessment Tool Card -->
      <div class="tool-card" on:click={navigateToHLPV} on:keydown={(e) => e.key === 'Enter' && navigateToHLPV()} role="button" tabindex="0">
        <div class="card-content">
          <div class="card-icon card-icon-blue">
            <i class="las la-map-marked-alt"></i>
          </div>

          <h2 class="card-title">
            HLPV Assessment
          </h2>

          <p class="card-description">
            Comprehensive heritage, landscape, planning, and viability assessment tool.
            Analyze sites for heritage constraints, landscape impacts, agricultural land quality,
            renewable energy potential, and ecological considerations.
          </p>

          <div class="features-list">
            <div class="feature-item">
              <i class="las la-check-circle feature-icon-check"></i>
              <span>Heritage Analysis</span>
            </div>
            <div class="feature-item">
              <i class="las la-check-circle feature-icon-check"></i>
              <span>Landscape Assessment</span>
            </div>
            <div class="feature-item">
              <i class="las la-check-circle feature-icon-check"></i>
              <span>Agricultural Land Classification</span>
            </div>
            <div class="feature-item">
              <i class="las la-check-circle feature-icon-check"></i>
              <span>Renewables & Ecology</span>
            </div>
          </div>

          <button class="tool-button tool-button-blue" on:click|stopPropagation={navigateToHLPV}>
            Launch HLPV Assessment
            <i class="las la-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Socioeconomics Tool Card -->
      <div class="tool-card" on:click={navigateToSocioeconomics} on:keydown={(e) => e.key === 'Enter' && navigateToSocioeconomics()} role="button" tabindex="0">
        <div class="card-content">
          <div class="card-icon card-icon-green">
            <i class="las la-chart-bar"></i>
          </div>

          <h2 class="card-title">
            Socioeconomics Tool
          </h2>

          <p class="card-description">
            Analyze socioeconomic data including demographics, employment patterns,
            transportation methods, health statistics, and educational qualifications
            to understand community characteristics and development impacts.
          </p>

          <div class="features-list">
            <div class="feature-item">
              <i class="las la-users feature-icon-blue"></i>
              <span>Demographics Analysis</span>
            </div>
            <div class="feature-item">
              <i class="las la-briefcase feature-icon-blue"></i>
              <span>Employment Patterns</span>
            </div>
            <div class="feature-item">
              <i class="las la-car feature-icon-blue"></i>
              <span>Transportation Data</span>
            </div>
            <div class="feature-item">
              <i class="las la-graduation-cap feature-icon-blue"></i>
              <span>Education & Health</span>
            </div>
          </div>

          <button class="tool-button tool-button-green" on:click|stopPropagation={navigateToSocioeconomics}>
            Launch Socioeconomics Tool
            <i class="las la-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="home-footer">
      <p class="footer-text">
        Professional planning assessment tools designed for comprehensive site analysis and informed decision-making
      </p>
    </div>
  </div>
</div>

<style>
  .home-page {
    min-height: 100vh;
    background: #f8fafc;
    padding: 3rem 1rem;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  }

  .home-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .home-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .home-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem 0;
    line-height: 1.2;
  }

  .home-subtitle {
    font-size: 1.25rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.5;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .tool-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .tool-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: #cbd5e1;
  }

  .tool-card:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .card-content {
    text-align: center;
  }

  .card-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  .card-icon-blue {
    background: #dbeafe;
    color: #3b82f6;
  }

  .card-icon-green {
    background: #dcfce7;
    color: #16a34a;
  }

  .card-icon i {
    font-size: 2rem;
  }

  .card-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  .card-description {
    color: #64748b;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    font-size: 1rem;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
    text-align: left;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: #64748b;
  }

  .feature-icon-check {
    color: #16a34a;
    font-size: 1rem;
  }

  .feature-icon-blue {
    color: #3b82f6;
    font-size: 1rem;
  }

  .tool-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    color: white;
  }

  .tool-button-blue {
    background: #3b82f6;
  }

  .tool-button-blue:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .tool-button-green {
    background: #16a34a;
  }

  .tool-button-green:hover {
    background: #15803d;
    transform: translateY(-1px);
  }

  .tool-button i {
    font-size: 1.125rem;
  }

  .home-footer {
    text-align: center;
    margin-top: 3rem;
  }

  .footer-text {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .home-page {
      padding: 2rem 1rem;
    }

    .home-title {
      font-size: 2rem;
    }

    .home-subtitle {
      font-size: 1.125rem;
    }

    .tools-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .tool-card {
      padding: 1.5rem;
    }

    .features-list {
      max-width: none;
    }
  }
</style>