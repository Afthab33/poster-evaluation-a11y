// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const backToUpload = document.getElementById('backToUpload');
    if (backToUpload) {
        backToUpload.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Function to fetch and display the components image
    async function fetchComponentsImage() {
        const componentsImage = document.getElementById('componentsImage');
        if (!componentsImage) return;

        try {
            const response = await fetch('https://poster-evaluation-a11y-production.up.railway.app/get-image/Output/extracted_components.png');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            componentsImage.src = imageUrl;
            componentsImage.setAttribute('aria-label', 'Visual breakdown of poster components showing all detected elements');
            
            componentsImage.onload = () => {
                // Announce to screen readers that the image is loaded
                const statusElement = document.createElement('div');
                statusElement.setAttribute('role', 'status');
                statusElement.setAttribute('aria-live', 'polite');
                statusElement.classList.add('sr-only');
                statusElement.textContent = 'Components image loaded successfully';
                document.body.appendChild(statusElement);
                
                setTimeout(() => {
                    document.body.removeChild(statusElement);
                }, 1000);
            };
            
            componentsImage.onerror = () => {
                componentsImage.alt = 'Failed to load components analysis';
                componentsImage.setAttribute('aria-label', 'Failed to load components analysis image');
            };
        } catch (error) {
            componentsImage.alt = 'Error loading components analysis';
            componentsImage.setAttribute('aria-label', 'Error loading components analysis image');
            console.error('Error fetching components image:', error);
        }
    }

    async function initializeAnalysis() {
        const analysisDataString = sessionStorage.getItem('analysisData');
        if (!analysisDataString) {
            window.location.href = 'index.html';
            return;
        }

        const analysisData = JSON.parse(analysisDataString);
        console.log('Analysis data loaded:', analysisData);

        const fileName = document.getElementById('fileName');
        const originalFileName = sessionStorage.getItem('originalFileName');
        if (fileName && originalFileName) {
            fileName.textContent = originalFileName;
        }

        const uploadedImage = document.getElementById('uploadedImage');
        if (uploadedImage) {
            const originalImage = sessionStorage.getItem('originalImage');
            if (originalImage) {
                uploadedImage.src = originalImage;
            }
        }

        await fetchComponentsImage();
        await updateMetrics(analysisData);
        await updateSummarySection(analysisData);
    }

    // New function to update the summary section
    async function updateSummarySection(analysisData) {
        // Update Color Contrast Summary
        const contrastSummary = document.getElementById('contrastSummary');
        if (contrastSummary && analysisData.color_contrast && analysisData.color_contrast.sections) {
            const sections = analysisData.color_contrast.sections;
            const passCount = sections.filter(s => s.accessibility === "PASS").length;
            const totalCount = sections.length;
            const passPercentage = Math.round((passCount / totalCount) * 100);
            
            let statusClass = passPercentage >= 70 ? 'success' : passPercentage >= 50 ? 'warning' : 'error';
            
            contrastSummary.innerHTML = `
                <span class="status-badge ${statusClass}">
                    <i class="fas fa-${passPercentage >= 70 ? 'check' : passPercentage >= 50 ? 'exclamation' : 'times'}-circle"></i>
                    ${passPercentage}% Pass
                </span>
            `;
        }
        
        // Update Font Size Summary
        const fontSummary = document.getElementById('fontSummary');
        if (fontSummary && analysisData.font_sizes) {
            const MIN_ACCESSIBLE_FONT = 14.0;
            let totalFonts = 0;
            let accessibleFonts = 0;

            Object.values(analysisData.font_sizes).forEach(font => {
                totalFonts++;
                if (font.font_size >= MIN_ACCESSIBLE_FONT) {
                    accessibleFonts++;
                }
            });

            const score = totalFonts > 0 ? Math.round((accessibleFonts / totalFonts) * 100) : 0;
            let statusClass = score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error';
            
            fontSummary.innerHTML = `
                <span class="status-badge ${statusClass}">
                    <i class="fas fa-${score >= 75 ? 'check' : score >= 50 ? 'exclamation' : 'times'}-circle"></i>
                    ${score}% Readable
                </span>
            `;
        }
        
        // Update Logo Accessibility Summary
        const logoSummary = document.getElementById('logoSummary');
        if (logoSummary && analysisData.logo_evaluation && analysisData.logo_evaluation.logos) {
            const logos = analysisData.logo_evaluation.logos;
            const simpleLogos = logos.filter(logo => logo.label === "Simple");
            const percentage = logos.length > 0 ? Math.round((simpleLogos.length / logos.length) * 100) : 0;
            
            let statusClass = percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'error';
            
            logoSummary.innerHTML = `
                <span class="status-badge ${statusClass}">
                    <i class="fas fa-${percentage >= 70 ? 'check' : percentage >= 50 ? 'exclamation' : 'times'}-circle"></i>
                    ${percentage}% Simple
                </span>
            `;
        }
        
        // Update Resolution Summary
        const resolutionSummary = document.getElementById('resolutionSummary');
        if (resolutionSummary && analysisData.image_resolution) {
            const dpi = analysisData.image_resolution.DPI || 0;
            const isAccessible = dpi >= 300;
            
            let statusClass = isAccessible ? 'success' : 'error';
            
            resolutionSummary.innerHTML = `
                <span class="status-badge ${statusClass}">
                    <i class="fas fa-${isAccessible ? 'check' : 'times'}-circle"></i>
                    ${dpi} DPI
                </span>
            `;
        }
    }

    // Function to update all metrics
    async function updateMetrics(analysisData) {
        // Update contrast card with percentage
        const contrastDetails = document.getElementById('contrastDetails');
        if (contrastDetails && analysisData.color_contrast && analysisData.color_contrast.sections) {
            const sections = analysisData.color_contrast.sections;
            const passCount = sections.filter(s => s.accessibility === "PASS").length;
            const totalCount = sections.length;
            const passPercentage = Math.round((passCount / totalCount) * 100);

            contrastDetails.innerHTML = `
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px;">
                        <svg viewBox="0 0 36 36" class="circular-chart" style="width: 100%; height: 100%;">
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                stroke-width="2"
                            />
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="${passPercentage >= 70 ? '#2ec4b6' : passPercentage >= 50 ? '#ff9f1c' : '#ef476f'}"
                                stroke-width="2"
                                stroke-dasharray="${passPercentage}, 100"
                                style="transform: rotate(-90deg); transform-origin: center;"
                            />
                            <text x="18" y="20.35" text-anchor="middle" fill="${passPercentage >= 70 ? '#2ec4b6' : passPercentage >= 50 ? '#ff9f1c' : '#ef476f'}" style="font-size: 8px; font-weight: bold;">
                                ${passPercentage}%
                            </text>
                        </svg>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${passCount} out of ${totalCount} sections pass accessibility standards
                    </div>
                </div>
            `;
        }

        // Update contrastMetrics if it exists on this page
        const contrastMetrics = document.getElementById('contrastMetrics');
        if (contrastMetrics && analysisData.color_contrast && analysisData.color_contrast.sections) {
            const sections = analysisData.color_contrast.sections;
            console.log('=== Contrast Analysis Debug Info ===');
            console.log('1. Found sections:', sections);
            
            const contrastHtml = sections.map(section => {
                console.log('2. Processing section:', section);
                const imageUrl = `https://poster-evaluation-a11y-production.up.railway.app/${section.section_image}`;
                const isFailed = section.accessibility === "FAIL";
                console.log('3. Section failed?', isFailed);
                
                // Generate improvement feedback for failed sections
                let feedbackHtml = '';
                if (isFailed) {
                    console.log('4. Generating feedback for failed section');
                    const currentRatio = section.contrast_ratio;
                    const requiredRatio = section.threshold;
                    console.log('5. Contrast values:', { current: currentRatio, required: requiredRatio });
                    
                    feedbackHtml = `
                        <div class="contrast-feedback" style="margin-top: 15px; padding: 15px; background-color: #fff3f3; border-radius: 8px; border-left: 4px solid #ef476f;">
                            <h5 style="margin: 0 0 10px 0; color: #ef476f;">How to Improve:</h5>
                            <ul style="margin: 0; padding-left: 20px; color: #666;">
                                <li>Current contrast ratio is ${currentRatio.toFixed(2)}, but needs to be at least ${requiredRatio}</li>
                                <li>To improve the contrast ratio:
                                    <ul style="margin-top: 5px;">
                                        <li>Make the text color (RGB(${section.text_color.join(',')})) darker</li>
                                        <li>Or make the background color (RGB(${section.background_color.join(',')})) lighter</li>
                                        <li>Consider using a different color combination with higher contrast</li>
                                        <li>If possible, increase the font weight or size</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    `;
                    console.log('6. Generated feedback HTML');
                }

                const sectionHtml = `
                    <div class="contrast-section" style="background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h4 style="margin: 0 0 15px 0; color: #333;">Section ${section.section_id}</h4>
                        <div class="section-details" style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                            <div class="section-metrics">
                                <ul style="list-style: none; padding: 0; margin: 0 0 15px 0;">
                                    <li style="margin-bottom: 8px;">Accessibility: <span class="${section.accessibility.toLowerCase()}" style="font-weight: bold;">${section.accessibility}</span></li>
                                    <li style="margin-bottom: 8px;">Contrast Ratio: ${section.contrast_ratio.toFixed(2)}</li>
                                    <li style="margin-bottom: 8px;">Type: ${section.type}</li>
                                    <li style="margin-bottom: 8px;">Threshold: ${section.threshold}</li>
                                </ul>
                                <div class="color-samples" style="display: flex; gap: 15px; margin-bottom: 15px;">
                                    <div class="color-sample" style="display: flex; align-items: center; gap: 8px;">
                                        <span>Text Color:</span>
                                        <div style="background-color: rgb(${section.text_color.join(',')}); width: 24px; height: 24px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);"></div>
                                    </div>
                                    <div class="color-sample" style="display: flex; align-items: center; gap: 8px;">
                                        <span>Background Color:</span>
                                        <div style="background-color: rgb(${section.background_color.join(',')}); width: 24px; height: 24px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);"></div>
                                    </div>
                                </div>
                                ${feedbackHtml}
                            </div>
                            <div class="section-image" style="margin-top: 15px;">
                                <img src="${imageUrl}" alt="Section ${section.section_id} contrast analysis" 
                                     style="max-width: 100%; height: auto; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);"
                                     onerror="this.alt='Failed to load section image'; this.classList.add('error');" />
                            </div>
                        </div>
                    </div>
                `;
                console.log('7. Generated section HTML');
                return sectionHtml;
            }).join('');

            console.log('8. Final HTML length:', contrastHtml.length);
            contrastMetrics.innerHTML = contrastHtml;
            console.log('9. Updated contrastMetrics innerHTML');

            const passCount = sections.filter(s => s.accessibility === "PASS").length;
            const summaryHtml = `
                <div class="contrast-summary" style="margin-bottom: 20px;">
                    <h3>Color Contrast Analysis</h3>
                    <p>${passCount} out of ${sections.length} sections pass accessibility standards</p>
                </div>
            `;
            contrastMetrics.insertAdjacentHTML('afterbegin', summaryHtml);
            console.log('10. Added summary HTML');
            console.log('=== End Contrast Analysis Debug Info ===');
        } else {
            console.log('=== Contrast Analysis Debug Error ===');
            console.log('contrastMetrics element exists:', !!contrastMetrics);
            console.log('analysisData.color_contrast exists:', !!analysisData.color_contrast);
            console.log('analysisData.color_contrast.sections exists:', !!(analysisData.color_contrast && analysisData.color_contrast.sections));
            console.log('=== End Contrast Analysis Debug Error ===');
        }

        // Update resolution details
        const resolutionDetails = document.getElementById('resolutionDetails');
        if (resolutionDetails && analysisData.image_resolution) {
            const resolution = analysisData.image_resolution;
            const dpi = resolution.DPI || 0;
            const [width, height] = resolution.Resolution ? resolution.Resolution.toString().split('x').map(Number) : [0, 0];
            const isAccessible = dpi >= 300;

            resolutionDetails.innerHTML = `
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div style="font-size: 5em; color: var(--${isAccessible ? 'success' : 'danger'}-color);">
                            <i class="fas fa-${isAccessible ? 'check' : 'times'}-circle"></i>
                        </div>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${dpi} DPI (${isAccessible ? 'Meets' : 'Below'} recommended 300 DPI)
                    </div>
                </div>
            `;
        }

        // Update hyperlinks details
        const hyperlinksDetails = document.getElementById('hyperlinksDetails');
        if (hyperlinksDetails) {
            console.log('=== Hyperlinks Debug Info ===');
            console.log('1. Analysis Data:', analysisData);
            
            // Count hyperlinks from the hyperlinks object
            let totalLinks = 0;
            if (analysisData.hyperlinks && typeof analysisData.hyperlinks === 'object') {
                // Count the number of URLs in the hyperlinks object
                totalLinks = Object.keys(analysisData.hyperlinks).length;
            }
            
            console.log('2. Total links found:', totalLinks);

            if (totalLinks > 0) {
                console.log('3. Condition met: totalLinks > 0');
                hyperlinksDetails.innerHTML = `
                    <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                        <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                            <div style="font-size: 5em; color: var(--success-color);">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                        <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                            ${totalLinks} hyperlink${totalLinks > 1 ? 's' : ''} present
                        </div>
                    </div>
                `;
            } else {
                console.log('3. Condition not met: totalLinks <= 0');
                hyperlinksDetails.innerHTML = `
                    <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                        <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                            <div style="font-size: 5em; color: var(--danger-color);">
                                <i class="fas fa-times-circle"></i>
                            </div>
                        </div>
                        <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                            No hyperlinks present
                        </div>
                    </div>
                `;
            }
            console.log('=== End Hyperlinks Debug Info ===');
        }

        // Update diagram details
        const diagramDetails = document.getElementById('diagramDetails');
        if (diagramDetails && analysisData.captions) {
            const diagramCaptions = Object.entries(analysisData.captions)
                .filter(([key]) => key.startsWith('diagram_') || key.startsWith('bar_graphs_') || key.startsWith('pie_chart_'));
            
            const totalDiagrams = diagramCaptions.length;
            const diagramsWithCaptions = diagramCaptions.filter(([_, val]) => 
                val.caption && 
                val.caption.trim() !== '' && 
                val.caption !== "No caption provided" && 
                val.caption !== '""' && 
                val.caption !== '"').length;
            
            const score = totalDiagrams > 0 ? 
                Math.round((diagramsWithCaptions / totalDiagrams) * 100) : 0;
            
            diagramDetails.innerHTML = `
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px;">
                        <svg viewBox="0 0 36 36" class="circular-chart" style="width: 100%; height: 100%;">
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                stroke-width="2"
                            />
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="${score === 100 ? '#2ec4b6' : score >= 50 ? '#ff9f1c' : '#ef476f'}"
                                stroke-width="2"
                                stroke-dasharray="${score}, 100"
                                style="transform: rotate(-90deg); transform-origin: center;"
                            />
                            <text x="18" y="20.35" text-anchor="middle" fill="${score === 100 ? '#2ec4b6' : score >= 50 ? '#ff9f1c' : '#ef476f'}" style="font-size: 8px; font-weight: bold;">
                                ${score}%
                            </text>
                        </svg>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${diagramsWithCaptions} out of ${totalDiagrams} diagrams have captions
                    </div>
                </div>
            `;
        }

        // Update authors details
        const authorsDetails = document.getElementById('authorsDetails');
        if (authorsDetails) {
            const hasAuthors = analysisData.authors && 
                             Array.isArray(analysisData.authors) &&
                             analysisData.authors.length > 0;

            authorsDetails.innerHTML = `
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div style="font-size: 5em; color: var(--${hasAuthors ? 'success' : 'danger'}-color);">
                            <i class="fas fa-${hasAuthors ? 'check' : 'times'}-circle"></i>
                        </div>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${hasAuthors ? `${analysisData.authors.length} author(s) present` : 'No authors found'}
                    </div>
                </div>
            `;
        }

        // Update font details
        const fontDetails = document.getElementById('fontDetails');
        if (fontDetails && analysisData.font_sizes) {
            const MIN_ACCESSIBLE_FONT = 14.0;
            let totalFonts = 0;
            let accessibleFonts = 0;

            Object.values(analysisData.font_sizes).forEach(font => {
                totalFonts++;
                if (font.font_size >= MIN_ACCESSIBLE_FONT) {
                    accessibleFonts++;
                }
            });

            const score = totalFonts > 0 ? Math.round((accessibleFonts / totalFonts) * 100) : 0;
            const scoreColor = score >= 75 ? '#2ec4b6' : score >= 50 ? '#ff9f1c' : '#ef476f';

            fontDetails.innerHTML = `
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px;">
                        <svg viewBox="0 0 36 36" class="circular-chart" style="width: 100%; height: 100%;">
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                stroke-width="2"
                            />
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="${scoreColor}"
                                stroke-width="2"
                                stroke-dasharray="${score}, 100"
                                style="transform: rotate(-90deg); transform-origin: center;"
                            />
                            <text x="18" y="20.35" text-anchor="middle" fill="${scoreColor}" style="font-size: 8px; font-weight: bold;">
                                ${score}%
                            </text>
                        </svg>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${accessibleFonts} out of ${totalFonts} font sizes are accessible
                    </div>
                </div>
            `;
        }

        // Update table details
        const tableDetails = document.getElementById('tableDetails');
        if (tableDetails && analysisData.captions) {
            const tableCaptions = Object.entries(analysisData.captions)
                .filter(([key]) => key.startsWith("table_"));
            
            const totalTables = tableCaptions.length;
            const tablesWithCaptions = tableCaptions.filter(([_, value]) => 
                value.caption && 
                value.caption.trim() !== '' && 
                value.caption !== "No caption provided" &&
                value.caption !== '""' &&
                value.caption !== '"').length;

            const score = totalTables > 0 ? Math.round((tablesWithCaptions / totalTables) * 100) : 0;
            const scoreColor = score === 100 ? '#2ec4b6' : score >= 50 ? '#ff9f1c' : '#ef476f';

            tableDetails.innerHTML = `
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px;">
                        <svg viewBox="0 0 36 36" class="circular-chart" style="width: 100%; height: 100%;">
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                stroke-width="2"
                            />
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="${scoreColor}"
                                stroke-width="2"
                                stroke-dasharray="${score}, 100"
                                style="transform: rotate(-90deg); transform-origin: center;"
                            />
                            <text x="18" y="20.35" text-anchor="middle" fill="${scoreColor}" style="font-size: 8px; font-weight: bold;">
                                ${score}%
                            </text>
                        </svg>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${tablesWithCaptions} out of ${totalTables} tables have captions
                    </div>
                </div>
            `;
        }

        // Update logo details
        const logoDetails = document.getElementById('logoDetails');
        if (logoDetails && analysisData.logo_evaluation && analysisData.logo_evaluation.logos) {
            const logos = analysisData.logo_evaluation.logos;
            const simpleLogos = logos.filter(logo => logo.label === "Simple");
            const percentage = logos.length > 0 ? Math.round((simpleLogos.length / logos.length) * 100) : 0;

            logoDetails.innerHTML = `
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px;">
                        <svg viewBox="0 0 36 36" class="circular-chart" style="width: 100%; height: 100%;">
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                stroke-width="2"
                            />
                            <path d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="${percentage >= 70 ? '#2ec4b6' : '#ef476f'}"
                                stroke-width="2"
                                stroke-dasharray="${percentage}, 100"
                                style="transform: rotate(-90deg); transform-origin: center;"
                            />
                            <text x="18" y="20.35" text-anchor="middle" fill="${percentage >= 70 ? '#2ec4b6' : '#ef476f'}" style="font-size: 8px; font-weight: bold;">
                                ${percentage}%
                            </text>
                        </svg>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${simpleLogos.length} out of ${logos.length} logos are simple and accessible
                    </div>
                </div>
            `;
        }

        // Make all metric cards accessible via keyboard
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    this.dispatchEvent(clickEvent);
                }
            });
        });
    }

    // Start the initialization
    initializeAnalysis().catch(error => {
        console.error('Error initializing analysis:', error);
        
        // Create accessible error message
        const errorMessage = document.createElement('div');
        errorMessage.setAttribute('role', 'alert');
        errorMessage.style.padding = '20px';
        errorMessage.style.margin = '20px auto';
        errorMessage.style.backgroundColor = '#ffe3e3';
        errorMessage.style.color = '#e63946';
        errorMessage.style.borderRadius = '8px';
        errorMessage.style.textAlign = 'center';
        errorMessage.style.maxWidth = '800px';
        errorMessage.innerHTML = `
            <h2>Error Loading Analysis</h2>
            <p>There was a problem loading the analysis data. Please try uploading your document again.</p>
            <a href="index.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #0a3d91; color: white; text-decoration: none; border-radius: 4px;">Return to Upload Page</a>
        `;
        
        // Clear the container and add the error message
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = '';
            container.appendChild(errorMessage);
        }
    });
});