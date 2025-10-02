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
  let yPosition = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - (margin * 2);

  // Helper function to check if we need a new page
  function checkPageBreak(requiredSpace = 20) {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  }

  // Helper function to add text with automatic page breaks
  function addText(text, fontSize = 12, isBold = false, addSpacing = true) {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }

    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.6; // Better line spacing
    const totalHeight = lines.length * lineHeight;

    // Check if we need a new page
    checkPageBreak(totalHeight + (addSpacing ? fontSize * 0.4 : 0));

    lines.forEach(line => {
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    if (addSpacing) {
      yPosition += fontSize * 0.4;
    }

    return yPosition;
  }

  // Helper function to add a heading
  function addHeading(text, level = 1) {
    const fontSize = level === 1 ? 18 : level === 2 ? 14 : 12;

    // Check if we need a new page for the heading
    checkPageBreak(fontSize * 1.5 + 15);

    yPosition += 10; // Extra spacing before headings
    addText(text, fontSize, true, false);
    yPosition += 8; // Extra spacing after headings

    return yPosition;
  }

  // Title
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  const title = "Technical Risk Profile (TRP) Report";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 30;

  // Report metadata
  if (report.metadata) {
    addHeading("Report Information");

    addText(`Generated: ${report.metadata.generatedAt || new Date().toLocaleString()}`);

    if (report.metadata.analyst) {
      addText(`Analyst: ${report.metadata.analyst}`);
    }

    if (report.metadata.version) {
      addText(`Version: ${report.metadata.version}`);
    }

    yPosition += 10;
  }

  // Executive Summary
  if (report.structuredReport?.summary) {
    addHeading("Executive Summary");

    // Overall Risk
    if (report.structuredReport.summary.overallRisk) {
      addText(`Overall Risk Assessment: ${report.structuredReport.summary.overallRisk}`, 12, true);
    }

    // Risk by discipline summary
    if (report.structuredReport.summary.riskByDiscipline) {
      addHeading("Risk Summary by Discipline", 2);

      report.structuredReport.summary.riskByDiscipline.forEach(discipline => {
        const riskText = `${discipline.name}: ${discipline.riskSummary?.label || 'Not assessed'}`;
        const descText = discipline.riskSummary?.description ? ` - ${discipline.riskSummary.description}` : '';
        addText(riskText + descText);
      });

      yPosition += 10;
    }
  }

  // Discipline sections
  if (report.structuredReport?.disciplines) {
    for (const discipline of report.structuredReport.disciplines) {
      addHeading(discipline.name);

      // Risk level
      if (discipline.riskSummary) {
        addText(`Risk Level: ${discipline.riskSummary.label} - ${discipline.riskSummary.description}`, 12, true);
      }

      // Assessment Rules
      addHeading("Assessment Rules", 2);

      if (discipline.triggeredRules && discipline.triggeredRules.length > 0) {
        discipline.triggeredRules.forEach(rule => {
          // Rule title/name
          addText(`• ${rule.rule || rule.title || rule.name}`, 12, true);

          // Rule findings
          if (rule.findings) {
            addText(`  ${rule.findings}`, 11, false, false);
          }

          // Risk level for this specific rule
          if (rule.level) {
            addText(`  Risk Level: ${rule.level.replace(/_/g, ' ').toUpperCase()}`, 11);
          }

          // Rule-specific recommendations
          if (rule.recommendations && rule.recommendations.length > 0) {
            addText(`  Recommendations:`, 11, true, false);
            rule.recommendations.forEach(rec => {
              addText(`    - ${rec}`, 10);
            });
          }

          yPosition += 5;
        });
      } else {
        addText(`No ${discipline.name.toLowerCase()} risk rules were triggered. Standard development considerations apply.`, 11, false, false);
      }

      // Recommendations
      const recommendations = getRecommendationsForDiscipline(discipline);
      if (recommendations.length > 0) {
        addHeading(`${discipline.name} Recommendations`, 2);

        recommendations.forEach(recommendation => {
          if (recommendation.trim()) {
            addText(`• ${recommendation}`);
          }
        });
      }

      // Add screenshots for this discipline
      yPosition = await addScreenshotsForSection(doc, discipline.name, yPosition, margin, maxWidth, pageHeight, checkPageBreak);

      yPosition += 15;
    }

    // Add general site screenshots
    yPosition = await addScreenshotsForSection(doc, 'General Site', yPosition, margin, maxWidth, pageHeight, checkPageBreak);
  }

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
 * @returns {number} Updated Y position
 */
async function addScreenshotsForSection(doc, sectionName, currentY, margin, maxWidth, pageHeight, checkPageBreak) {
  const screenshots = getScreenshotsBySection(sectionName);
  let yPosition = currentY;

  if (screenshots.length > 0) {
    // Check if we need a new page for the heading
    if (yPosition + 40 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Add screenshots heading
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${sectionName} Images`, margin, yPosition);
    yPosition += 25;

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

            // Add caption if provided
            if (screenshot.caption && screenshot.caption.trim()) {
              doc.setFontSize(10);
              doc.setFont(undefined, 'italic');
              const captionLines = doc.splitTextToSize(screenshot.caption, maxWidth);

              captionLines.forEach(line => {
                doc.text(line, margin, yPosition);
                yPosition += 12;
              });
              yPosition += 5;
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