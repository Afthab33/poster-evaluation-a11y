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
            
            componentsImage.onload = () => {};
            
            componentsImage.onerror = () => {
                componentsImage.alt = 'Failed to load components analysis';
            };
        } catch (error) {
            componentsImage.alt = 'Error loading components analysis';
        }
    }

    async function initializeAnalysis() {
        const analysisDataString = sessionStorage.getItem('analysisData');
        if (!analysisDataString) {
            window.location.href = 'index.html';
            return;
        }

        const analysisData = JSON.parse(analysisDataString);

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
                                stroke="${passPercentage >= 70 ? '#2ec4b6' : '#ef476f'}"
                                stroke-width="2"
                                stroke-dasharray="${passPercentage}, 100"
                                style="transform: rotate(-90deg); transform-origin: center;"
                            />
                            <text x="18" y="20.35" text-anchor="middle" fill="${passPercentage >= 70 ? '#2ec4b6' : '#ef476f'}" style="font-size: 8px; font-weight: bold;">
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

        const imageMetrics = document.getElementById('imageMetrics');
        if (imageMetrics && analysisData.image_accessibility) {
            const imgAccessibility = analysisData.image_accessibility;
            imageMetrics.innerHTML = `
                <ul>
                    <li>DPI: ${imgAccessibility.dpi}</li>
                    <li>Resolution: ${imgAccessibility.width} x ${imgAccessibility.height}</li>
                    <li>Status: ${imgAccessibility.is_accessible ? 'Accessible' : 'Not Accessible'}</li>
                </ul>
            `;
        }

        const linkMetrics = document.getElementById('hyperlinksDetails');
        if (linkMetrics) {
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
                linkMetrics.innerHTML = `
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
                linkMetrics.innerHTML = `
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

        const componentMetrics = document.getElementById('componentMetrics');
        if (componentMetrics && analysisData.poster_components) {
            const components = analysisData.poster_components;
            componentMetrics.innerHTML = `
                <ul>
                    <li>Authors: ${components.Authors.join(', ')}</li>
                    <li>Captions: ${components["Caption Count"]}</li>
                    <li>Complex Logos: ${components["Complex Logo Count"]}</li>
                    <li>Simple Logos: ${components["Simple Logo Count"]}</li>
                    <li>Diagrams: ${components["Diagram Count"]}</li>
                    <li>Figures: ${components["Figure Count"]}</li>
                </ul>
            `;
        }

        const captionsContainer = document.getElementById('captionsContainer');
        if (captionsContainer && analysisData.captions) {
            const captionsHtml = Object.entries(analysisData.captions).map(([key, value]) => `
                <div class="caption-item">
                    <h4>${key}</h4>
                    <p>${value.caption}</p>
                    <img src="https://poster-evaluation-a11y-production.up.railway.app/get-image/${value.img}" alt="${value.caption}" />
                </div>
            `).join('');
            captionsContainer.innerHTML = captionsHtml;
        }

        // Update resolution card
        const resolutionCard = document.querySelector('.metric-card[onclick*="resolution_analysis.html"]');
        if (resolutionCard && analysisData.image_resolution) {
            const resolution = analysisData.image_resolution;
            const [width, height] = resolution.Resolution.split('x').map(Number);
            const resolutionStatus = width >= 800 && height >= 600;

            resolutionCard.innerHTML = `
                <div class="metric-title">
                    <i class="fas fa-expand-arrows-alt"></i>
                    <span>Resolution</span>
                </div>
                <div class="percentage-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
                    <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div style="font-size: 5em; color: var(--${resolutionStatus ? 'success' : 'danger'}-color);">
                            <i class="fas fa-${resolutionStatus ? 'check' : 'times'}-circle"></i>
                        </div>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); font-size: 1.1em; line-height: 1.4;">
                        ${resolutionStatus ? 'Meets minimum requirements' : 'Below recommended resolution'}
                    </div>
                </div>
            `;
        }

        // Update authors card
        const authorsCard = document.querySelector('.metric-card[onclick*="authors_analysis.html"]');
        if (authorsCard) {
            const hasAuthors = analysisData.authors && 
                             Array.isArray(analysisData.authors) &&
                             analysisData.authors.length > 0;

            authorsCard.innerHTML = `
                <div class="metric-title">
                    <i class="fas fa-users"></i>
                    <span>Authors</span>
                </div>
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

        // Update diagram card
        const diagramCard = document.getElementById('diagramCard');
        if (diagramCard && analysisData.captions) {
            const diagramCaptions = Object.entries(analysisData.captions)
                .filter(([key]) => key.startsWith('diagram_') || key.startsWith('bar_graphs_') || key.startsWith('pie_chart_'))
                .map(([key, value]) => ({
                    id: key,
                    hasValidCaption: value.caption && value.caption.trim() !== '' && 
                                   value.caption !== "No caption provided" && 
                                   value.caption !== '""' && 
                                   value.caption !== '"'
                }));
            
            const totalDiagrams = diagramCaptions.length;
            const diagramsWithCaptions = diagramCaptions.filter(d => d.hasValidCaption).length;
            
            const score = totalDiagrams > 0 ? 
                Math.round((diagramsWithCaptions / totalDiagrams) * 100) : 0;
            
            diagramCard.innerHTML = `
                <div class="metric-title">
                    <i class="fas fa-diagram-project"></i>
                    <span>Diagram</span>
                </div>
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

            diagramCard.addEventListener('click', (e) => {
                e.preventDefault();
                if (!analysisData.captions) {
                    sessionStorage.setItem('diagramData', JSON.stringify([]));
                } else {
                    const diagramData = Object.entries(analysisData.captions)
                        .filter(([key]) => key.startsWith('diagram_') || key.startsWith('bar_graphs_') || key.startsWith('pie_chart_'))
                        .map(([key, val]) => ({ 
                            id: key, 
                            ...val,
                            hasCaption: val.caption && val.caption.trim() !== '' && 
                                       val.caption !== "No caption provided" &&
                                       val.caption !== '""' &&
                                       val.caption !== '"'
                        }));
                    sessionStorage.setItem('diagramData', JSON.stringify(diagramData));
                }
                window.location.href = 'diagram_analysis.html';
            });
        }

        // Update logo evaluation card
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
            `
        }

        // Update font size widget
        const fontWidget = document.getElementById('fontWidget');
        if (fontWidget) {
            const MIN_ACCESSIBLE_FONT = 14.0;
            let totalFonts = 0;
            let accessibleFonts = 0;

            if (analysisData.font_sizes) {
                Object.values(analysisData.font_sizes).forEach(font => {
                    totalFonts++;
                    if (font.font_size >= MIN_ACCESSIBLE_FONT) {
                        accessibleFonts++;
                    }
                });
            }

            const score = totalFonts > 0 ? Math.round((accessibleFonts / totalFonts) * 100) : 0;
            const scoreColor = score >=75 ? '#2ec4b6' : score >= 50 ? '#ff9f1c' : '#ef476f';

            fontWidget.innerHTML = `
                <h2 class="metric-title">
                    <i class="fas fa-text-height"></i>
                    Font Sizes
                </h2>
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

            fontWidget.addEventListener('click', (e) => {
                e.preventDefault();
                if (!analysisData.font_sizes) {
                    sessionStorage.setItem('fontData', JSON.stringify([]));
                } else {
                    sessionStorage.setItem('fontData', JSON.stringify(analysisData.font_sizes));
                }
                window.location.href = 'font_analysis.html';
            });
        }

        // Update table widget
        const tableWidget = document.getElementById('tableWidget');
        if (tableWidget) {
            let totalTables = 0;
            let tablesWithCaptions = 0;

            if (analysisData.captions) {
                const tableCaptions = Object.entries(analysisData.captions)
                    .filter(([key]) => key.startsWith("table_"));
                
                totalTables = tableCaptions.length;
                tablesWithCaptions = tableCaptions.filter(([_, value]) => 
                    value.caption && value.caption.trim() !== '' && value.caption !== "No caption provided").length;
            }

            const score = totalTables > 0 ? Math.round((tablesWithCaptions / totalTables) * 100) : 0;
            const scoreColor = score === 100 ? '#2ec4b6' : score >= 50 ? '#ff9f1c' : '#ef476f';

            tableWidget.innerHTML = `
                <h2 class="metric-title">
                    <i class="fas fa-table"></i>
                    Table Evaluation
                </h2>
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

            tableWidget.addEventListener('click', (e) => {
                e.preventDefault();
                if (!analysisData.captions) {
                    sessionStorage.setItem('tableData', JSON.stringify([]));
                } else {
                    const tableCaptions = Object.entries(analysisData.captions)
                        .filter(([key]) => key.startsWith("table_"))
                        .map(([key, val]) => ({ id: key, ...val }));
                    sessionStorage.setItem('tableData', JSON.stringify(tableCaptions));
                }
                window.location.href = 'table_analysis.html';
            });
        }
    }

    // Start the initialization
    initializeAnalysis().catch(error => {});
});