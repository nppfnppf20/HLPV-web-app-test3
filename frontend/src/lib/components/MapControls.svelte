<script>
  import { RISK_LEVELS } from '../utils/riskLevels.js';
  import { captureMapScreenshot } from '../services/screenshotManager.js';

  export let map = null;
  export let riskFilters = {};
  export let onRiskFilterChange = () => {};
  export let conservationAreasLayer = null;
  export let listedBuildingsGradeILayer = null;
  export let listedBuildingsGradeIIStarLayer = null;
  export let listedBuildingsGradeIILayer = null;
  export let scheduledMonumentsLayer = null;
  export let greenBeltLayer = null;
  export let aonbLayer = null;
  export let renewablesLayer = null;

  let layerControl = null;
  let riskFilterControl = null;
  let screenshotControl = null;

  /**
   * Create and add layer control to map
   * @param {import('leaflet')} L - Leaflet instance
   * @param {any} base - Base layer
   */
  export function createLayerControl(L, base) {
    if (!map) return;

    layerControl = L.control.layers(
      { 'OSM': base },
      {
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 16px; height: 12px; background: rgba(14, 165, 233, 0.15); border: 2px solid #0ea5e9; margin-right: 8px; border-radius: 3px;"></span>Conservation areas</span>': conservationAreasLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #dc2626; border-radius: 50%; margin-right: 8px;"></span>Grade I Listed</span>': listedBuildingsGradeILayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #ea580c; border-radius: 50%; margin-right: 8px;"></span>Grade II* Listed</span>': listedBuildingsGradeIIStarLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #8b5cf6; border-radius: 50%; margin-right: 8px;"></span>Grade II Listed</span>': listedBuildingsGradeIILayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #ffed4e; border: 2px solid #000000; border-radius: 50%; margin-right: 8px;"></span>Scheduled Monuments</span>': scheduledMonumentsLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 16px; height: 12px; background: rgba(34, 197, 94, 0.2); border: 3px solid #22c55e; margin-right: 8px; border-radius: 3px;"></span>Green Belt</span>': greenBeltLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 16px; height: 12px; background: rgba(59, 130, 246, 0.2); border: 3px solid #3b82f6; margin-right: 8px; border-radius: 3px;"></span>AONB</span>': aonbLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></span>Renewables</span>': renewablesLayer
      },
      { collapsed: false }
    ).addTo(map);
  }

  /**
   * Create and add risk filter control to map
   * @param {import('leaflet')} L - Leaflet instance
   */
  export function createRiskFilterControl(L) {
    if (!map) return;

    riskFilterControl = L.control({ position: 'topright' });
    riskFilterControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'risk-filter-control');
      div.innerHTML = `
        <div class="risk-filter-content">
          <h4>Risk Level Filter</h4>
          <div class="risk-filter-options">
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-${RISK_LEVELS.SHOWSTOPPER}" checked>
              <span class="risk-label showstopper">Showstopper</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-${RISK_LEVELS.EXTREMELY_HIGH_RISK}" checked>
              <span class="risk-label extremely-high">Extremely High</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-${RISK_LEVELS.HIGH_RISK}" checked>
              <span class="risk-label high">High Risk</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-${RISK_LEVELS.MEDIUM_HIGH_RISK}" checked>
              <span class="risk-label medium-high">Medium-High</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-${RISK_LEVELS.MEDIUM_RISK}" checked>
              <span class="risk-label medium">Medium Risk</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-${RISK_LEVELS.MEDIUM_LOW_RISK}" checked>
              <span class="risk-label medium-low">Medium-Low</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-${RISK_LEVELS.LOW_RISK}" checked>
              <span class="risk-label low">Low Risk</span>
            </label>
          </div>
        </div>
      `;

      // Add event listeners for checkboxes and sync initial state
      Object.keys(riskFilters).forEach(riskLevel => {
        const checkbox = div.querySelector(`#risk-${riskLevel}`);
        if (checkbox) {
          // Sync checkbox state with riskFilters initial values
          checkbox.checked = riskFilters[riskLevel];

          checkbox.addEventListener('change', () => {
            riskFilters[riskLevel] = checkbox.checked;
            onRiskFilterChange();
          });
        }
      });

      // Prevent map interaction when clicking on control
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };
    riskFilterControl.addTo(map);
  }

  /**
   * Create and add draw control to map
   * @param {import('leaflet')} L - Leaflet instance
   * @param {any} drawnItems - Feature group for drawn items
   * @param {(geojson: any) => void} onPolygonDrawn - Callback for when polygon is drawn
   */
  export function createDrawControl(L, drawnItems, onPolygonDrawn) {
    if (!map) return;

    // leaflet-draw types aren't available, cast to any to access Draw
    const Lany = /** @type {any} */ (L);
    const drawControl = new Lany.Control.Draw({
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems
      }
    });

    map.addControl(drawControl);

    map.on(Lany.Draw.Event.CREATED, function (/** @type {any} */ e) {
      const layer = e.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      const geojson = layer.toGeoJSON().geometry;
      onPolygonDrawn(geojson);
    });
  }

  /**
   * Create and add screenshot control to map
   * @param {import('leaflet')} L - Leaflet instance
   */
  export function createScreenshotControl(L) {
    if (!map) return;

    screenshotControl = L.control({ position: 'topleft' });
    screenshotControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'screenshot-control');
      div.innerHTML = `
        <div class="screenshot-buttons">
          <button class="screenshot-btn toggle-btn" id="toggle-screenshot-panel" title="Take Screenshot">
            📷
          </button>
          <div class="screenshot-panel" id="screenshot-panel" style="display: none;">
            <h4>Capture Screenshot</h4>
            <div class="section-selector">
              <label for="section-select">Save to section:</label>
              <select id="section-select">
                <option value="general">General</option>
                <option value="heritage">Heritage</option>
                <option value="landscape">Landscape</option>
                <option value="agricultural_land">Agricultural Land</option>
                <option value="renewables">Renewables</option>
                <option value="ecology">Ecology</option>
              </select>
            </div>
            <div class="caption-input">
              <label for="caption-input">Caption (optional):</label>
              <input type="text" id="caption-input" placeholder="Enter caption..." />
            </div>
            <div class="screenshot-actions">
              <button class="capture-btn" id="capture-screenshot">Capture</button>
              <button class="cancel-btn" id="cancel-screenshot">Cancel</button>
            </div>
          </div>
        </div>
      `;

      // Toggle panel visibility
      const toggleBtn = div.querySelector('#toggle-screenshot-panel');
      const panel = div.querySelector('#screenshot-panel');
      const cancelBtn = div.querySelector('#cancel-screenshot');

      function showPanel() {
        panel.style.display = 'block';
        toggleBtn.classList.add('active');
      }

      function hidePanel() {
        panel.style.display = 'none';
        toggleBtn.classList.remove('active');
        // Clear inputs
        div.querySelector('#caption-input').value = '';
        div.querySelector('#section-select').value = 'general';
      }

      toggleBtn.addEventListener('click', () => {
        if (panel.style.display === 'none') {
          showPanel();
        } else {
          hidePanel();
        }
      });

      cancelBtn.addEventListener('click', hidePanel);

      // Add event listener for screenshot capture button
      const captureBtn = div.querySelector('#capture-screenshot');
      if (captureBtn) {
        captureBtn.addEventListener('click', async () => {
          try {
            const section = div.querySelector('#section-select').value;
            const caption = div.querySelector('#caption-input').value ||
              `Map screenshot captured on ${new Date().toLocaleString()}`;

            console.log('📷 Capturing map screenshot for section:', section);

            // Hide panel BEFORE taking screenshot to avoid capturing it
            hidePanel();

            // Also temporarily hide the entire screenshot control
            const screenshotControl = div;
            const originalDisplay = screenshotControl.style.display;
            screenshotControl.style.display = 'none';

            // Wait longer for elements to fully hide, then capture
            setTimeout(async () => {
              try {
                const screenshot = await captureMapScreenshot(map, {
                  section,
                  caption,
                  quality: 0.8,
                  format: 'image/png'
                });
                console.log('✅ Screenshot captured successfully:', screenshot.id);

                // Restore screenshot control visibility
                screenshotControl.style.display = originalDisplay;

                // Show success notification
                const btn = toggleBtn;
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅';
                setTimeout(() => {
                  btn.innerHTML = originalText;
                }, 1500);
              } catch (error) {
                console.error('❌ Failed to capture screenshot:', error);

                // Restore screenshot control visibility
                screenshotControl.style.display = originalDisplay;

                // Show error notification
                const btn = toggleBtn;
                const originalText = btn.innerHTML;
                btn.innerHTML = '❌';
                setTimeout(() => {
                  btn.innerHTML = originalText;
                }, 1500);
              }
            }, 500); // Wait 500ms for panel to fully hide

          } catch (error) {
            console.error('❌ Failed to prepare screenshot:', error);

            // Show error notification
            const btn = toggleBtn;
            const originalText = btn.innerHTML;
            btn.innerHTML = '❌';
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 1500);
          }
        });
      }

      // Prevent map interaction when clicking on control
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };
    screenshotControl.addTo(map);
  }
</script>

<style>
  /* Risk Filter Control Styles */
  :global(.risk-filter-control) {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 12px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    min-width: 160px;
    margin-top: 10px;
  }

  :global(.risk-filter-control .risk-filter-content h4) {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
  }

  :global(.risk-filter-control .risk-filter-options) {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  :global(.risk-filter-control .risk-filter-item) {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 11px;
    color: #6b7280;
  }

  :global(.risk-filter-control .risk-filter-item input[type="checkbox"]) {
    margin-right: 6px;
    margin-top: 0;
    cursor: pointer;
  }

  :global(.risk-filter-control .risk-label) {
    font-weight: 500;
  }

  :global(.risk-filter-control .risk-label.showstopper) {
    color: #dc2626;
  }

  :global(.risk-filter-control .risk-label.extremely-high) {
    color: #b91c1c;
  }

  :global(.risk-filter-control .risk-label.high) {
    color: #ea580c;
  }

  :global(.risk-filter-control .risk-label.medium-high) {
    color: #d97706;
  }

  :global(.risk-filter-control .risk-label.medium) {
    color: #f59e0b;
  }

  :global(.risk-filter-control .risk-label.medium-low) {
    color: #84cc16;
  }

  :global(.risk-filter-control .risk-label.low) {
    color: #059669;
  }

  /* Screenshot Control Styles */
  :global(.screenshot-control) {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
    margin-bottom: 10px;
    position: relative;
  }

  :global(.screenshot-control .screenshot-buttons) {
    display: flex;
    flex-direction: column;
  }

  :global(.screenshot-control .screenshot-btn) {
    background: white;
    border: none;
    width: 34px;
    height: 34px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  :global(.screenshot-control .screenshot-btn:hover) {
    background-color: #f5f5f5;
  }

  :global(.screenshot-control .screenshot-btn:active) {
    background-color: #e5e5e5;
  }

  :global(.screenshot-control .screenshot-btn.active) {
    background-color: #3b82f6;
    color: white;
  }

  :global(.screenshot-control .screenshot-panel) {
    position: absolute;
    top: 0;
    left: 44px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    padding: 12px;
    min-width: 200px;
    z-index: 1000;
  }

  :global(.screenshot-control .screenshot-panel h4) {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  :global(.screenshot-control .section-selector) {
    margin-bottom: 12px;
  }

  :global(.screenshot-control .section-selector label) {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  :global(.screenshot-control .section-selector select) {
    width: 100%;
    padding: 4px 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
  }

  :global(.screenshot-control .caption-input) {
    margin-bottom: 12px;
  }

  :global(.screenshot-control .caption-input label) {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  :global(.screenshot-control .caption-input input) {
    width: 100%;
    padding: 4px 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
  }

  :global(.screenshot-control .screenshot-actions) {
    display: flex;
    gap: 6px;
  }

  :global(.screenshot-control .capture-btn) {
    flex: 1;
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  :global(.screenshot-control .capture-btn:hover) {
    background: #2563eb;
  }

  :global(.screenshot-control .cancel-btn) {
    flex: 1;
    padding: 6px 12px;
    background: #f3f4f6;
    color: #374151;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  :global(.screenshot-control .cancel-btn:hover) {
    background: #e5e7eb;
  }
</style>