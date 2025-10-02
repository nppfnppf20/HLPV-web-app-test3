import jsPDF from 'jspdf';
import { getScreenshotsBySection } from './screenshotManager.js';

/**
 * Generate and download a PDF document from TRP report data
 * @param {any} editableReport - The editable TRP report data
 * @param {string} siteName - Name of the site for the filename
 */
export async function generatePDFReport(editableReport, siteName = 'TRP_Report') {
  try {
    const doc = await createPDFDocument(editableReport);

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `${siteName.replace(/[^a-zA-Z0-9]/g, '_')}_TRP_Report_${date}.pdf`;

    doc.save(filename);
    console.log('✅ PDF document generated successfully:', filename);
  } catch (error) {
    console.error('❌ Error generating PDF document:', error);
    throw error;
  }
}

/**
 * Create a PDF document from TRP report data
 * @param {any} report - The TRP report data
 * @returns {jsPDF} PDF document
 */
async function createPDFDocument(report) {
  const doc = new jsPDF();
  let yPosition = 30; // Start lower to accommodate header
  const margin = 25;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - (margin * 2);
  let pageNumber = 1;

  // Professional color scheme
  const colors = {
    primary: '#1e40af',     // Blue
    secondary: '#374151',   // Dark gray
    accent: '#059669',      // Green
    light: '#f3f4f6',      // Light gray
    danger: '#dc2626'       // Red
  };

  // Add header to page
  function addHeader() {
    const currentY = yPosition;

    // Header background
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, pageWidth, 20, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Technical Risk Profile Report', margin, 12);

    // Date in header
    const date = new Date().toLocaleDateString();
    const dateWidth = doc.getTextWidth(date);
    doc.text(date, pageWidth - margin - dateWidth, 12);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    yPosition = currentY;
  }

  // Add footer to page
  function addFooter() {
    const footerY = pageHeight - 15;

    // Footer line
    doc.setDrawColor(colors.secondary);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    // Page number
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.secondary);
    const pageText = `Page ${pageNumber}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageTextWidth, footerY);

    // Company/document info
    doc.text('Heritage, Landscape & Planning Verification', margin, footerY);

    // Reset text color
    doc.setTextColor(0, 0, 0);
  }

  // Helper function to check if we need a new page
  function checkPageBreak(requiredSpace = 20) {
    if (yPosition + requiredSpace > pageHeight - 40) { // Account for footer space
      addFooter();
      doc.addPage();
      pageNumber++;
      addHeader();
      yPosition = 35; // Start below header
      return true;
    }
    return false;
  }

  // Add initial header
  addHeader();

  // Helper function to add text with automatic page breaks
  function addText(text, fontSize = 12, isBold = false, addSpacing = true, color = null, indent = 0) {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }

    if (color) {
      doc.setTextColor(color);
    } else {
      doc.setTextColor(0, 0, 0);
    }

    const lines = doc.splitTextToSize(text, maxWidth - indent);
    const lineHeight = fontSize * 0.7; // Better line spacing
    const totalHeight = lines.length * lineHeight;

    // Check if we need a new page
    checkPageBreak(totalHeight + (addSpacing ? fontSize * 0.5 : 0));

    lines.forEach(line => {
      doc.text(line, margin + indent, yPosition);
      yPosition += lineHeight;
    });

    if (addSpacing) {
      yPosition += fontSize * 0.5;
    }

    // Reset text color
    doc.setTextColor(0, 0, 0);

    return yPosition;
  }

  // Helper function to add a professional heading
  function addHeading(text, level = 1) {
    const fontSize = level === 1 ? 20 : level === 2 ? 16 : 14;
    const color = level === 1 ? colors.primary : colors.secondary;

    // Check if we need a new page for the heading
    checkPageBreak(fontSize * 1.5 + 20);

    yPosition += level === 1 ? 15 : 12; // Extra spacing before headings

    // Add heading with color
    doc.setFontSize(fontSize);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(color);
    doc.text(text, margin, yPosition);
    yPosition += fontSize * 0.8;

    // Add underline for level 1 headings
    if (level === 1) {
      doc.setDrawColor(color);
      doc.setLineWidth(1);
      doc.line(margin, yPosition, margin + doc.getTextWidth(text), yPosition);
      yPosition += 3;
    }

    yPosition += level === 1 ? 12 : 8; // Extra spacing after headings

    // Reset text color
    doc.setTextColor(0, 0, 0);

    return yPosition;
  }

  // Helper function to add a bullet point
  function addBulletPoint(text, fontSize = 12, indent = 15) {
    addText(`• ${text}`, fontSize, false, true, null, indent);
  }

  // Helper function to add a section divider
  function addSectionDivider() {
    yPosition += 8;
    doc.setDrawColor(colors.light);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;
  }

  // Helper function to get risk level colors
  function getRiskColor(riskLevel) {
    const level = (riskLevel || '').toLowerCase();
    if (level.includes('showstopper')) return '#991b1b';
    if (level.includes('extremely high') || level.includes('extreme')) return '#dc2626';
    if (level.includes('high')) return '#ea580c';
    if (level.includes('medium-high') || level.includes('medium high')) return '#d97706';
    if (level.includes('medium')) return '#ca8a04';
    if (level.includes('medium-low') || level.includes('medium low')) return '#65a30d';
    if (level.includes('low')) return '#16a34a';
    return colors.secondary;
  }

  // Professional Title Section
  yPosition += 10;

  // Main title
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(colors.primary);
  const title = "Technical Risk Profile";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 20;

  // Subtitle
  doc.setFontSize(18);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(colors.secondary);
  const subtitle = "Development Risk Assessment Report";
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPosition);
  yPosition += 25;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add decorative line
  doc.setDrawColor(colors.primary);
  doc.setLineWidth(2);
  const lineWidth = Math.min(100, maxWidth * 0.4);
  doc.line((pageWidth - lineWidth) / 2, yPosition, (pageWidth + lineWidth) / 2, yPosition);
  yPosition += 25;

  // Report metadata
  if (report.metadata) {
    addHeading("Report Information");

    addText(`Generated: ${report.metadata.generatedAt || new Date().toLocaleString()}`, 11, true);

    if (report.metadata.analyst) {
      addText(`Analyst: ${report.metadata.analyst}`, 11, true);
    }

    if (report.metadata.version) {
      addText(`Version: ${report.metadata.version}`, 11, true);
    }

    addSectionDivider();
  }

  // Executive Summary
  if (report.structuredReport?.summary) {
    addHeading("Executive Summary");

    // Overall Risk
    if (report.structuredReport.summary.overallRisk) {
      addText(`Overall Risk Assessment: ${report.structuredReport.summary.overallRisk}`, 13, true, true, colors.danger);
    }

    // Risk by discipline summary
    if (report.structuredReport.summary.riskByDiscipline) {
      addHeading("Risk Summary by Discipline", 2);

      report.structuredReport.summary.riskByDiscipline.forEach(discipline => {
        const riskText = `${discipline.name}: ${discipline.riskSummary?.label || 'Not assessed'}`;
        const descText = discipline.riskSummary?.description ? ` - ${discipline.riskSummary.description}` : '';
        addBulletPoint(riskText + descText, 11);
      });

      addSectionDivider();
    }
  }

  // Discipline sections
  if (report.structuredReport?.disciplines) {
    for (const discipline of report.structuredReport.disciplines) {
      addHeading(discipline.name);

      // Risk level with color coding
      if (discipline.riskSummary) {
        const riskColor = getRiskColor(discipline.riskSummary.label);
        addText(`Risk Level: ${discipline.riskSummary.label}`, 13, true, true, riskColor);
        if (discipline.riskSummary.description) {
          addText(discipline.riskSummary.description, 11, false, true, null, 10);
        }
      }

      // Assessment Rules
      addHeading("Assessment Rules", 2);

      if (discipline.triggeredRules && discipline.triggeredRules.length > 0) {
        discipline.triggeredRules.forEach((rule, index) => {
          // Rule title/name with numbering
          addText(`${index + 1}. ${rule.rule || rule.title || rule.name}`, 12, true, false, colors.secondary, 5);

          // Rule findings
          if (rule.findings) {
            addText(rule.findings, 11, false, true, null, 15);
          }

          // Risk level for this specific rule
          if (rule.level) {
            const ruleRiskColor = getRiskColor(rule.level);
            addText(`Risk Level: ${rule.level.replace(/_/g, ' ').toUpperCase()}`, 10, true, false, ruleRiskColor, 15);
          }

          // Rule-specific recommendations
          if (rule.recommendations && rule.recommendations.length > 0) {
            addText(`Recommendations:`, 11, true, false, colors.accent, 15);
            rule.recommendations.forEach(rec => {
              addBulletPoint(rec, 10, 25);
            });
          }

          yPosition += 8;
        });
      } else {
        addText(`No ${discipline.name.toLowerCase()} risk rules were triggered. Standard development considerations apply.`, 11, false, true, colors.accent, 10);
      }

      // Recommendations
      const recommendations = getRecommendationsForDiscipline(discipline);
      if (recommendations.length > 0) {
        addHeading(`${discipline.name} Recommendations`, 2);

        recommendations.forEach(recommendation => {
          if (recommendation.trim()) {
            addBulletPoint(recommendation, 11);
          }
        });
      }

      // Add screenshots for this discipline
      yPosition = await addScreenshotsForSection(doc, discipline.name, yPosition, margin, maxWidth, pageHeight, checkPageBreak, colors);

      addSectionDivider();
    }

    // Add general site screenshots
    yPosition = await addScreenshotsForSection(doc, 'General Site', yPosition, margin, maxWidth, pageHeight, checkPageBreak, colors);
  }

  // Add final footer to last page
  addFooter();

  return doc;
}

/**
 * Get recommendations for a discipline, handling both editable and default recommendations
 * @param {any} discipline - The discipline object
 * @returns {string[]} Array of recommendations
 */
function getRecommendationsForDiscipline(discipline) {
  // Use editable recommendations if available
  if (discipline.recommendations && Array.isArray(discipline.recommendations)) {
    return discipline.recommendations.filter(rec => rec.trim());
  }

  // Fallback to original logic
  const allRecommendations = [];

  if (!discipline?.triggeredRules || discipline.triggeredRules.length === 0) {
    if (discipline?.defaultNoRulesRecommendations && Array.isArray(discipline.defaultNoRulesRecommendations)) {
      allRecommendations.push(...discipline.defaultNoRulesRecommendations);
    }
  } else {
    if (discipline?.defaultTriggeredRecommendations && Array.isArray(discipline.defaultTriggeredRecommendations)) {
      allRecommendations.push(...discipline.defaultTriggeredRecommendations);
    }

    discipline.triggeredRules.forEach(rule => {
      if (rule.recommendations && Array.isArray(rule.recommendations)) {
        allRecommendations.push(...rule.recommendations);
      }
    });
  }

  // Deduplicate recommendations
  const uniqueRecommendations = [];
  const seen = new Set();

  allRecommendations.forEach(rec => {
    const normalizedRec = rec.toLowerCase().trim();
    if (!seen.has(normalizedRec)) {
      seen.add(normalizedRec);
      uniqueRecommendations.push(rec);
    }
  });

  return uniqueRecommendations;
}

/**
 * Add screenshots to PDF for a specific section
 * @param {jsPDF} doc - PDF document
 * @param {string} sectionName - Name of the section
 * @param {number} currentY - Current Y position
 * @param {number} margin - Page margin
 * @param {number} maxWidth - Maximum content width
 * @param {number} pageHeight - Page height
 * @param {Function} checkPageBreak - Function to check for page breaks
 * @param {Object} colors - Color scheme object
 * @returns {number} Updated Y position
 */
async function addScreenshotsForSection(doc, sectionName, currentY, margin, maxWidth, pageHeight, checkPageBreak, colors) {
  const screenshots = getScreenshotsBySection(sectionName);
  let yPosition = currentY;

  if (screenshots.length > 0) {
    // Check if we need a new page for the heading
    if (yPosition + 40 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Add screenshots heading with professional styling
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(colors.secondary);
    doc.text(`${sectionName} Images`, margin, yPosition);
    yPosition += 20;

    // Add subtle underline
    doc.setDrawColor(colors.secondary);
    doc.setLineWidth(0.5);
    const headerWidth = doc.getTextWidth(`${sectionName} Images`);
    doc.line(margin, yPosition, margin + headerWidth, yPosition);
    yPosition += 10;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Add each screenshot
    for (const screenshot of screenshots) {
      try {
        if (screenshot.dataUrl) {
          const imgWidth = Math.min(maxWidth * 0.8, 120); // Smaller images
          const imgHeight = 80; // Fixed aspect ratio for consistency
          const captionHeight = screenshot.caption ? 25 : 5; // Space for caption
          const totalImageSpace = imgHeight + captionHeight + 15; // Total space needed

          // Check if we need a new page for the image
          if (yPosition + totalImageSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }

          try {
            // Add image to PDF (jsPDF can handle base64 data URLs directly)
            doc.addImage(screenshot.dataUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;

            // Add professional caption if provided
            if (screenshot.caption && screenshot.caption.trim()) {
              doc.setFontSize(10);
              doc.setFont(undefined, 'italic');
              doc.setTextColor(colors.secondary);

              // Add "Figure:" prefix
              const captionText = `Figure: ${screenshot.caption}`;
              const captionLines = doc.splitTextToSize(captionText, maxWidth);

              captionLines.forEach(line => {
                doc.text(line, margin, yPosition);
                yPosition += 12;
              });
              yPosition += 5;

              // Reset text color
              doc.setTextColor(0, 0, 0);
            }

            yPosition += 10; // Extra spacing between images

            console.log(`✅ Added image to PDF for ${sectionName}`);
          } catch (imageError) {
            console.error(`❌ Error processing image for ${sectionName}:`, imageError);
            // Fallback to placeholder text
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`[Screenshot: ${screenshot.caption || 'Image could not be embedded'}]`, margin, yPosition);
            yPosition += 20;
          }
        }
      } catch (error) {
        console.error(`Error adding screenshot for ${sectionName}:`, error);
        // Add error note instead of failing completely
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text(`[Image could not be included: ${screenshot.caption || 'Screenshot'}]`, margin, yPosition);
        yPosition += 20;
      }
    }
  }

  return yPosition;
}