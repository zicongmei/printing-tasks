document.addEventListener('DOMContentLoaded', () => {
    const startCmInput = document.getElementById('startCm');
    const generatePdfButton = document.getElementById('generatePdf');
    const rulerPreview = document.getElementById('rulerPreview');

    // Constants for letter size (8.5 x 11 inches) in points (1 inch = 72 points)
    // For landscape: width = 11 * 72 = 792, height = 8.5 * 72 = 612
    const PAGE_WIDTH_POINTS = 792; // 11 inches for landscape
    const PAGE_HEIGHT_POINTS = 612; // 8.5 inches for landscape

    // 1 cm = approx 28.3465 points (at 72 DPI)
    const CM_TO_POINTS = 28.3465;

    // Ruler dimensions
    const RULER_LENGTH_CM = 25;
    const RULER_HEIGHT_POINTS = 60; // Increased to 200% wider (from 30)

    // Margin from the edge of the page
    const MARGIN_POINTS = 36; // 0.5 inch margin

    const RULER_WIDTH_POINTS = RULER_LENGTH_CM * CM_TO_POINTS; // 20cm in points

    function createRulerSVG(startValueCm) {
        const svgWidth = RULER_WIDTH_POINTS; // Corresponds to 20cm
        const svgHeight = RULER_HEIGHT_POINTS;
        const cmToSvgScale = svgWidth / RULER_LENGTH_CM;
        const INCH_TO_CM = 2.54;
        const CM_TO_INCH_SCALE = 1 / INCH_TO_CM; // cm to inch conversion

        // Ruler appearance adjustments - Exposed constants for easy modification
        // Moved inside function to ensure scope and resolve ReferenceError
        const CM_LABEL_Y = 25; // Y-position for CM labels (from top edge)
        const CM_MAJOR_LINE_Y2 = 15; // Y2 for major CM lines (length from top edge)
        const CM_HALF_LINE_Y2 = 10; // Y2 for half CM lines
        const CM_MM_LINE_Y2 = 5; // Y2 for millimeter lines

        const INCH_LABEL_Y = 40; // Y-position for Inch labels (from top edge)
        const INCH_MAJOR_LINE_Y1 = 45; // Y1 for major Inch lines (length from top edge)
        const INCH_HALF_LINE_Y1 = 50; // Y1 for half Inch lines
        const INCH_QUARTER_LINE_Y1 = 55; // Y1 for quarter Inch lines

        let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
        svgContent += `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="white" stroke="black" stroke-width="1"/>`;

        // CM Marks (top half of the ruler)
        // CM labels will be in the upper part of the central whitespace
        for (let i = 0; i <= RULER_LENGTH_CM; i++) {
            const currentCm = startValueCm + i;
            const xPos = i * cmToSvgScale;

            // Major marks (cm)
            svgContent += `<line x1="${xPos}" y1="0" x2="${xPos}" y2="${CM_MAJOR_LINE_Y2}" stroke="black" stroke-width="1"/>`;
            if (i % 1 === 0) { // Label every cm
                svgContent += `<text x="${xPos}" y="${CM_LABEL_Y}" text-anchor="middle" font-size="6" fill="black">${currentCm}</text>`;
            }

            if (i < RULER_LENGTH_CM) {
                // Half cm marks
                const halfCmXPos = (i + 0.5) * cmToSvgScale;
                svgContent += `<line x1="${halfCmXPos}" y1="0" x2="${halfCmXPos}" y2="${CM_HALF_LINE_Y2}" stroke="black" stroke-width="0.5"/>`;

                // Millimeter marks
                for (let j = 1; j < 10; j++) {
                    if (j !== 5) { // Skip half cm mark as it's already drawn
                        const mmXPos = (i + j / 10) * cmToSvgScale;
                        svgContent += `<line x1="${mmXPos}" y1="0" x2="${mmXPos}" y2="${CM_MM_LINE_Y2}" stroke="black" stroke-width="0.25"/>`;
                    }
                }
            }
        }

        // Inch Marks (bottom half of the ruler)
        // Inch labels will be in the lower part of the central whitespace



        const startInchValue = startValueCm * CM_TO_INCH_SCALE; // Starting value in inches
        const rulerLengthInches = RULER_LENGTH_CM * CM_TO_INCH_SCALE;

        for (let i = 0; i <= Math.ceil(rulerLengthInches); i++) {
            const currentInch = Math.floor(startInchValue) + i; // Current major inch mark
            const currentCmFromStart = (currentInch - startInchValue) * INCH_TO_CM;
            
            // Only draw if within the 20cm length
            if (currentCmFromStart >= 0 && currentCmFromStart <= RULER_LENGTH_CM) {
                const xPosInch = currentCmFromStart * cmToSvgScale;

                // Major inch marks
                svgContent += `<line x1="${xPosInch}" y1="${INCH_MAJOR_LINE_Y1}" x2="${xPosInch}" y2="${svgHeight}" stroke="red" stroke-width="1"/>`;
                svgContent += `<text x="${xPosInch}" y="${INCH_LABEL_Y}" text-anchor="middle" font-size="6" fill="red">${currentInch}"</text>`;

                // Half inch marks
                const halfInchCm = currentCmFromStart + (0.5 * INCH_TO_CM);
                if (halfInchCm <= RULER_LENGTH_CM) {
                    const halfInchXPos = halfInchCm * cmToSvgScale;
                    svgContent += `<line x1="${halfInchXPos}" y1="${INCH_HALF_LINE_Y1}" x2="${halfInchXPos}" y2="${svgHeight}" stroke="red" stroke-width="0.5"/>`;
                }

                // Quarter inch marks
                const quarterInchCm1 = currentCmFromStart + (0.25 * INCH_TO_CM);
                if (quarterInchCm1 <= RULER_LENGTH_CM) {
                    const quarterInchXPos1 = quarterInchCm1 * cmToSvgScale;
                    svgContent += `<line x1="${quarterInchXPos1}" y1="${INCH_QUARTER_LINE_Y1}" x2="${quarterInchXPos1}" y2="${svgHeight}" stroke="red" stroke-width="0.25"/>`;
                }
                const quarterInchCm2 = currentCmFromStart + (0.75 * INCH_TO_CM);
                if (quarterInchCm2 <= RULER_LENGTH_CM) {
                    const quarterInchXPos2 = quarterInchCm2 * cmToSvgScale;
                    svgContent += `<line x1="${quarterInchXPos2}" y1="${INCH_QUARTER_LINE_Y1}" x2="${quarterInchXPos2}" y2="${svgHeight}" stroke="red" stroke-width="0.25"/>`;
                }
            }
        }
        
        svgContent += `</svg>`;
        return svgContent;
    }

    function updateRulerPreview(startValue) {
        rulerPreview.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const rulerStart = startValue + (i * RULER_LENGTH_CM); // Incremental start for preview
            const rulerSvg = createRulerSVG(rulerStart);
            const div = document.createElement('div');
            div.style.marginBottom = '5px'; // Small spacing for preview
            div.innerHTML = rulerSvg;
            rulerPreview.appendChild(div);
        }
    }

    generatePdfButton.addEventListener('click', async () => {
        const startCm = parseFloat(startCmInput.value);
        if (isNaN(startCm)) {
            alert('Please enter a valid starting CM value.');
            return;
        }

        console.log('Attempting to generate PDF with starting CM:', startCm);

        try {
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                console.error('jsPDF library not loaded.');
                alert('Error: jsPDF library not loaded. Please check your internet connection.');
                return;
            }
            console.log('jsPDF library loaded successfully.');

            const doc = new jsPDF({
                unit: 'pt',
                format: 'letter',
                orientation: 'landscape' // Changed to landscape
            });
            console.log('jsPDF document initialized with landscape orientation.');

            // Add 6 rulers
            for (let i = 0; i < 6; i++) {
                const rulerStart = startCm + (i * RULER_LENGTH_CM); // Incremental start for PDF
                const svgString = createRulerSVG(rulerStart);
                console.log(`Generated SVG string for ruler ${i + 1}. Length: ${svgString.length}`);

                // Create a temporary div to render the SVG with html2canvas
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svgString;
                tempDiv.style.position = 'absolute'; // Prevent it from affecting layout
                tempDiv.style.left = '-9999px'; // Move off-screen
                document.body.appendChild(tempDiv);

                console.log(`Rendering SVG for ruler ${i + 1} to canvas using html2canvas...`);
                // Use html2canvas to convert the SVG to a canvas
                const canvas = await html2canvas(tempDiv, {
                    scale: 2, // Increase scale for better resolution in PDF
                    logging: false, // Suppress html2canvas logs
                    useCORS: true // Important for SVGs that might load external resources
                });
                document.body.removeChild(tempDiv); // Clean up the temporary div
                console.log(`SVG for ruler ${i + 1} rendered to canvas.`);

                const imgData = canvas.toDataURL('image/png');
                
                // Calculate position for each ruler
                const x = (PAGE_WIDTH_POINTS - RULER_WIDTH_POINTS) / 2;
                const y = MARGIN_POINTS + i * (RULER_HEIGHT_POINTS + 10);

                // Add the image to the PDF
                // Parameters: imgData, format, x, y, width, height
                doc.addImage(imgData, 'PNG', x, y, RULER_WIDTH_POINTS, RULER_HEIGHT_POINTS);
                console.log(`Ruler ${i + 1} added as image to PDF.`);
            }

            console.log('All rulers added to PDF. Attempting to save...');
            doc.save('rulers.pdf');
            console.log('PDF save initiated.');
        } catch (error) {
            console.error('An error occurred during PDF generation or saving:', error);
            alert('An error occurred while generating the PDF. Please check the console for more details.');
        }
    });

    // Initial preview update
    updateRulerPreview(parseFloat(startCmInput.value));
    startCmInput.addEventListener('input', () => {
        updateRulerPreview(parseFloat(startCmInput.value));
    });
});