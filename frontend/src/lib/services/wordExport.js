import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import fileSaver from 'file-saver';
import { getScreenshots, getScreenshotsBySection } from './screenshotManager.js';
const { saveAs } = fileSaver;

/**
 * Generate and download a Word document from TRP report data
 * @param {any} editableReport - The editable TRP report data
 * @param {string} siteName - Name of the site for the filename
 */
export async function generateWordReport(editableReport, siteName = 'TRP_Report') {
  try {
    const doc = await createWordDocument(editableReport);
    const blob = await Packer.toBlob(doc);

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `${siteName.replace(/[^a-zA-Z0-9]/g, '_')}_TRP_Report_${date}.docx`;

    saveAs(blob, filename);
    console.log('✅ Word document generated successfully:', filename);
  } catch (error) {
    console.error('❌ Error generating Word document:', error);
    throw error;
  }
}

/**
 * Create a Word document from TRP report data
 * @param {any} report - The TRP report data
 * @returns {Document} Word document
 */
async function createWordDocument(report) {
  const children = [];


  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Technical Risk Profile (TRP) Report",
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Report metadata
  if (report.metadata) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Report Information",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Add metadata as simple paragraphs instead of table
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Generated: ",
            bold: true,
          }),
          new TextRun({
            text: report.metadata.generatedAt || new Date().toLocaleString(),
          }),
        ],
        spacing: { after: 100 },
      })
    );

    if (report.metadata.analyst) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Analyst: ",
              bold: true,
            }),
            new TextRun({
              text: report.metadata.analyst,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    if (report.metadata.version) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Version: ",
              bold: true,
            }),
            new TextRun({
              text: report.metadata.version,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    children.push(new Paragraph({ text: "", spacing: { after: 400 } }));
  }

  // Executive Summary
  if (report.structuredReport?.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Executive Summary",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Overall Risk
    if (report.structuredReport.summary.overallRisk) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Overall Risk Assessment: ",
              bold: true,
            }),
            new TextRun({
              text: report.structuredReport.summary.overallRisk,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Risk by discipline summary table
    if (report.structuredReport.summary.riskByDiscipline) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Risk Summary by Discipline",
              bold: true,
              size: 20,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );

      // Add risk summary as simple list instead of table
      report.structuredReport.summary.riskByDiscipline.forEach(discipline => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${discipline.name}: `,
                bold: true,
              }),
              new TextRun({
                text: `${discipline.riskSummary?.label || 'Not assessed'}`,
              }),
              new TextRun({
                text: discipline.riskSummary?.description ? ` - ${discipline.riskSummary.description}` : '',
                italics: true,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });

      children.push(new Paragraph({ text: "", spacing: { after: 400 } }));
    }
  }

  // Discipline sections
  if (report.structuredReport?.disciplines) {
    for (const discipline of report.structuredReport.disciplines) {
      // Discipline heading
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: discipline.name,
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
        })
      );

      // Risk level
      if (discipline.riskSummary) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Risk Level: ",
                bold: true,
              }),
              new TextRun({
                text: `${discipline.riskSummary.label} - ${discipline.riskSummary.description}`,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      // Triggered rules with more detail
      if (discipline.triggeredRules && discipline.triggeredRules.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Assessment Rules",
                bold: true,
                size: 20,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        discipline.triggeredRules.forEach(rule => {
          // Rule title/name
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${rule.rule || rule.title || rule.name}`,
                  bold: true,
                }),
              ],
              spacing: { after: 50 },
            })
          );

          // Rule findings (description)
          if (rule.findings) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `  ${rule.findings}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              })
            );
          }

          // Risk level for this specific rule
          if (rule.level) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `  Risk Level: ${rule.level.replace(/_/g, ' ').toUpperCase()}`,
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }

          // Rule-specific recommendations
          if (rule.recommendations && rule.recommendations.length > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `  Recommendations:`,
                    bold: true,
                  }),
                ],
                spacing: { after: 50 },
              })
            );

            rule.recommendations.forEach(rec => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `    - ${rec}`,
                    }),
                  ],
                  spacing: { after: 30 },
                })
              );
            });
          }

          children.push(new Paragraph({ text: "", spacing: { after: 150 } }));
        });
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Assessment Rules",
                bold: true,
                size: 20,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `No ${discipline.name.toLowerCase()} risk rules were triggered. Standard development considerations apply.`,
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      // Recommendations
      const recommendations = getRecommendationsForDiscipline(discipline);
      if (recommendations.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${discipline.name} Recommendations`,
                bold: true,
                size: 20,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        recommendations.forEach(recommendation => {
          if (recommendation.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${recommendation}`,
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        });
      }

      // Add screenshots for this discipline
      const screenshotParagraphs = await addScreenshotsForSection(discipline.name);
      children.push(...screenshotParagraphs);

      children.push(new Paragraph({ text: "", spacing: { after: 300 } }));
    }

    // Add general site screenshots
    const generalScreenshots = await addScreenshotsForSection('General Site');
    if (generalScreenshots.length > 0) {
      children.push(...generalScreenshots);
    }
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });
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

  // Fallback to original logic (same as getAggregatedRecommendations)
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
 * Convert base64 image to buffer for Word document
 * @param {string} base64Data - Base64 image data
 * @returns {Uint8Array} Image buffer
 */
function base64ToBuffer(base64Data) {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  // Convert base64 to binary string
  const binaryString = atob(base64);

  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Add screenshots to document for a specific section
 * @param {string} sectionName - Name of the section
 * @returns {Array} Array of paragraphs containing images
 */
async function addScreenshotsForSection(sectionName) {
  let screenshots = getScreenshotsBySection(sectionName);

  const imageParagraphs = [];

  if (screenshots.length > 0) {
    // Add screenshots heading
    imageParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${sectionName} Images`,
            bold: true,
            size: 20,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    // Add each screenshot
    for (const screenshot of screenshots) {
      try {
        if (screenshot.dataUrl) {
          try {
            const imageBuffer = base64ToBuffer(screenshot.dataUrl);

            // Add image with more conservative settings for better Word compatibility
            imageParagraphs.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: 400,
                      height: 300,
                    },
                    // Remove type specification to let docx auto-detect
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
              })
            );
            console.log(`✅ Added image to Word doc for ${sectionName}`);
          } catch (imageError) {
            console.error(`❌ Error processing image for ${sectionName}:`, imageError);
            // Fallback to placeholder
            imageParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[Screenshot: ${screenshot.caption || 'Image could not be embedded'}]`,
                    bold: true,
                    color: "0066cc",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              })
            );
          }

          // Add caption if provided
          if (screenshot.caption && screenshot.caption.trim()) {
            imageParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: screenshot.caption,
                    italics: true,
                    size: 18,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              })
            );
          }
        }
      } catch (error) {
        console.error(`Error adding screenshot for ${sectionName}:`, error);
        // Add error note instead of failing completely
        imageParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Image could not be included: ${screenshot.caption || 'Screenshot'}]`,
                italics: true,
                color: "999999",
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    }
  }

  return imageParagraphs;
}