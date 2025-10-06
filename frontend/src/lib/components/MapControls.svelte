<script>
  import { RISK_LEVELS } from '../utils/riskLevels.js';

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

  /**
   * Create and add custom grouped layer control to map
   * @param {import('leaflet')} L - Leaflet instance
   * @param {any} base - Base layer
   */
  export function createLayerControl(L, base) {
    if (!map) return;

    // Create custom control
    layerControl = L.control({ position: 'topright' });
    layerControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'grouped-layer-control');

      // Define discipline groups
      const disciplineGroups = {
        heritage: {
          title: 'Heritage',
          layers: [
            { layer: conservationAreasLayer, name: 'Conservation Areas', style: 'rgba(14, 165, 233, 0.15); border: 2px solid #0ea5e9; border-radius: 3px;', shape: 'rect' },
            { layer: listedBuildingsGradeILayer, name: 'Grade I Listed', style: '#dc2626', shape: 'circle' },
            { layer: listedBuildingsGradeIIStarLayer, name: 'Grade II* Listed', style: '#ea580c', shape: 'circle' },
            { layer: listedBuildingsGradeIILayer, name: 'Grade II Listed', style: '#8b5cf6', shape: 'circle' },
            { layer: scheduledMonumentsLayer, name: 'Scheduled Monuments', style: '#ffed4e; border: 2px solid #000000', shape: 'circle' }
          ]
        },
        landscape: {
          title: 'Landscape',
          layers: [
            { layer: greenBeltLayer, name: 'Green Belt', style: 'rgba(34, 197, 94, 0.2); border: 3px solid #22c55e; border-radius: 3px;', shape: 'rect' },
            { layer: aonbLayer, name: 'AONB', style: 'rgba(59, 130, 246, 0.2); border: 3px solid #3b82f6; border-radius: 3px;', shape: 'rect' }
          ]
        },
        energy: {
          title: 'Cumulative Development',
          layers: [
            { layer: renewablesLayer, name: 'Renewables', style: '#dc2626', shape: 'square', multiStyle: [
              { style: '#dc2626', shape: 'square', label: 'Built/Approved' },
              { style: '#f59e0b', shape: 'square', label: 'Pending' },
              { style: '#f59e0b; border: 2px solid #f59e0b; background: transparent', shape: 'square', label: 'Refused' }
            ] }
          ]
        }
      };

      let html = '<div class="layer-control-content"><h4>Map Layers</h4>';

      // Add base layer section
      html += '<div class="base-layers-section"><h5>Base Map</h5>';
      html += '<label class="layer-item"><input type="radio" name="base-layer" checked> OSM</label>';
      html += '</div>';

      // Add discipline groups
      Object.entries(disciplineGroups).forEach(([groupKey, group]) => {
        html += `
          <div class="discipline-group" data-group="${groupKey}">
            <div class="discipline-header">
              <button class="group-toggle" data-group="${groupKey}">
                <span class="toggle-icon">▶</span>
                <input type="checkbox" class="group-checkbox" data-group="${groupKey}">
                <span class="group-title">${group.title}</span>
              </button>
            </div>
            <div class="discipline-layers" data-group="${groupKey}" style="display: none;">
        `;

        group.layers.forEach((layerInfo, index) => {
          if (layerInfo.layer) {
            const layerId = `${groupKey}-${index}`;

            // Handle multiStyle for renewables with multiple square types
            if (layerInfo.multiStyle && layerInfo.multiStyle.length > 0) {
              let multiIconsHtml = '';
              layerInfo.multiStyle.forEach((styleInfo, styleIndex) => {
                const multiShapeStyle = styleInfo.shape === 'circle'
                  ? `width: 12px; height: 12px; background: ${styleInfo.style}; border-radius: 50%;`
                  : `width: 12px; height: 12px; background: ${styleInfo.style}; border-radius: 2px; margin-right: 4px;`;
                multiIconsHtml += `<span class="layer-icon" style="${multiShapeStyle}"></span>`;
              });

              html += `
                <label class="layer-item">
                  <input type="checkbox" id="${layerId}">
                  <div class="multi-layer-icons">${multiIconsHtml}</div>
                  <span class="layer-name">${layerInfo.name}</span>
                </label>
              `;
            } else {
              // Standard single icon display
              const shapeStyle = layerInfo.shape === 'circle'
                ? `width: 12px; height: 12px; background: ${layerInfo.style}; border-radius: 50%;`
                : `width: 16px; height: 12px; background: ${layerInfo.style};`;

              html += `
                <label class="layer-item">
                  <input type="checkbox" id="${layerId}">
                  <span class="layer-icon" style="${shapeStyle}"></span>
                  <span class="layer-name">${layerInfo.name}</span>
                </label>
              `;
            }
          }
        });

        html += '</div></div>';
      });

      html += '</div>';
      div.innerHTML = html;

      // Add event listeners
      setupLayerControlEvents(div, disciplineGroups, L);

      // Prevent map interaction when clicking on control
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };

    layerControl.addTo(map);
  }

  /**
   * Setup event listeners for the custom layer control
   */
  function setupLayerControlEvents(div, disciplineGroups, L) {
    // Group toggle functionality
    div.querySelectorAll('.group-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const groupKey = button.dataset.group;
        const layersDiv = div.querySelector(`.discipline-layers[data-group="${groupKey}"]`);
        const icon = button.querySelector('.toggle-icon');

        if (layersDiv.style.display === 'none') {
          layersDiv.style.display = 'block';
          icon.textContent = '▼';
        } else {
          layersDiv.style.display = 'none';
          icon.textContent = '▶';
        }
      });
    });

    // Group checkbox functionality
    div.querySelectorAll('.group-checkbox').forEach(groupCheckbox => {
      groupCheckbox.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent toggle button from firing
        const groupKey = groupCheckbox.dataset.group;
        const group = disciplineGroups[groupKey];
        const checkboxes = div.querySelectorAll(`.discipline-layers[data-group="${groupKey}"] input[type="checkbox"]`);
        const newState = groupCheckbox.checked;

        checkboxes.forEach((checkbox, index) => {
          checkbox.checked = newState;
          const layerInfo = group.layers[index];
          if (layerInfo.layer && map.hasLayer(layerInfo.layer) !== newState) {
            if (newState) {
              map.addLayer(layerInfo.layer);
            } else {
              map.removeLayer(layerInfo.layer);
            }
          }
        });
      });
    });

    // Individual layer toggle functionality
    Object.entries(disciplineGroups).forEach(([groupKey, group]) => {
      group.layers.forEach((layerInfo, index) => {
        if (layerInfo.layer) {
          const layerId = `${groupKey}-${index}`;
          const checkbox = div.querySelector(`#${layerId}`);
          if (checkbox) {
            // Initialize layer state (layers start unchecked/hidden)
            // Don't add layers to map on initialization

            checkbox.addEventListener('change', () => {
              if (checkbox.checked) {
                map.addLayer(layerInfo.layer);
              } else {
                map.removeLayer(layerInfo.layer);
              }

              // Update group checkbox state
              updateGroupCheckboxState(div, groupKey, group);
            });
          }
        }
      });
    });
  }

  /**
   * Update the state of the group checkbox based on individual checkboxes
   */
  function updateGroupCheckboxState(div, groupKey, group) {
    const checkboxes = div.querySelectorAll(`.discipline-layers[data-group="${groupKey}"] input[type="checkbox"]`);
    const groupCheckbox = div.querySelector(`.group-checkbox[data-group="${groupKey}"]`);

    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;

    if (checkedCount === 0) {
      groupCheckbox.checked = false;
      groupCheckbox.indeterminate = false;
    } else if (checkedCount === totalCount) {
      groupCheckbox.checked = true;
      groupCheckbox.indeterminate = false;
    } else {
      groupCheckbox.checked = false;
      groupCheckbox.indeterminate = true;
    }
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

  /* Grouped Layer Control Styles */
  :global(.grouped-layer-control) {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 12px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    min-width: 200px;
    max-width: 250px;
  }

  :global(.grouped-layer-control .layer-control-content h4) {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 6px;
  }

  :global(.grouped-layer-control .base-layers-section) {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }

  :global(.grouped-layer-control .base-layers-section h5) {
    margin: 0 0 6px 0;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
  }

  :global(.grouped-layer-control .discipline-group) {
    margin-bottom: 8px;
  }

  :global(.grouped-layer-control .discipline-header) {
    margin-bottom: 4px;
  }

  :global(.grouped-layer-control .group-toggle) {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    width: 100%;
  }

  :global(.grouped-layer-control .group-toggle:hover) {
    color: #1f2937;
  }

  :global(.grouped-layer-control .toggle-icon) {
    font-size: 10px;
    width: 12px;
    text-align: center;
  }

  :global(.grouped-layer-control .group-checkbox) {
    margin: 0;
    cursor: pointer;
  }

  :global(.grouped-layer-control .discipline-layers) {
    margin-left: 12px;
    border-left: 2px solid #f3f4f6;
    padding-left: 8px;
  }

  :global(.grouped-layer-control .layer-item) {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 2px 0;
    font-size: 11px;
    color: #6b7280;
    gap: 8px;
  }

  :global(.grouped-layer-control .layer-item:hover) {
    color: #374151;
  }

  :global(.grouped-layer-control .layer-item input[type="checkbox"],
         .grouped-layer-control .layer-item input[type="radio"]) {
    margin: 0;
    cursor: pointer;
  }

  :global(.grouped-layer-control .layer-icon) {
    display: inline-block;
    flex-shrink: 0;
  }

  :global(.grouped-layer-control .layer-name) {
    font-weight: 500;
  }

  :global(.grouped-layer-control .multi-layer-icons) {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  :global(.grouped-layer-control .multi-layer-icons .layer-icon:last-child) {
    margin-right: 0 !important;
  }

</style>