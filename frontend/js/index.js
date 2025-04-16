document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('uploadBox');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const fileInput = document.getElementById('fileInput');
    const progressContainer = document.getElementById('progressContainer');
    const fileNameDisplay = document.getElementById('fileName');
    const analyzeBtnContainer = document.getElementById('analyzeBtnContainer');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    const factContainer = document.getElementById('factContainer');
    const factText = document.getElementById('factText');
  
    let currentFile = null;
    let factInterval = null;
    
    // Array of accessibility facts related to poster design
    const accessibilityFacts = [
        "Did you know? <span class='fact-highlight'>Color contrast</span> of at least 4.5:1 for normal text ensures readability for people with visual impairments.",
        "<span class='fact-highlight'>Font size</span> of at least 18pt (24px) is recommended for posters to ensure readability from a distance.",
        "Nearly <span class='fact-highlight'>1 in 12 men</span> and <span class='fact-highlight'>1 in 200 women</span> have some form of color vision deficiency.",
        "Using <span class='fact-highlight'>descriptive alt text</span> for images helps screen reader users understand your poster's visual content.",
        "Simple, clean <span class='fact-highlight'>logos</span> are more easily recognizable and accessible than complex designs with fine details.",
        "<span class='fact-highlight'>High-resolution images</span> (300 DPI or higher) ensure your poster looks crisp and professional when printed.",
        "About <span class='fact-highlight'>15% of the world's population</span> lives with some form of disability, making accessibility a universal concern.",
        "Using <span class='fact-highlight'>headers and a clear hierarchy</span> in your poster helps visitors quickly navigate and understand your content.",
        "For hyperlinks, using <span class='fact-highlight'>descriptive link text</span> instead of 'click here' improves accessibility and SEO.",
        "The <span class='fact-highlight'>WCAG (Web Content Accessibility Guidelines)</span> are also applicable to print materials like posters.",
        "Avoiding <span class='fact-highlight'>overcrowded layouts</span> with adequate white space improves focus and comprehension for all viewers.",
        "<span class='fact-highlight'>Sans-serif fonts</span> like Arial, Calibri, or Verdana are generally more readable for digital displays and posters.",
        "Make sure any <span class='fact-highlight'>QR codes</span> on your poster are at least 1 inch (2.5cm) in size with adequate quiet zones.",
        "Not all disabilities are visible – designing with <span class='fact-highlight'>cognitive accessibility</span> in mind benefits everyone.",
        "Using <span class='fact-highlight'>clear language</span> and avoiding jargon makes your poster more accessible to a wider audience.",
        "Analyzing <span class='fact-highlight'>font size</span> on your poster ensures your message can be read from appropriate viewing distances.",
        "<span class='fact-highlight'>Table captions</span> help explain the purpose and context of data tables for better comprehension.",
        "For diagrams, include <span class='fact-highlight'>text descriptions</span> of the key information they convey for accessibility.",
        "<span class='fact-highlight'>Proper layout</span> with clear sections helps guide readers through your poster in a logical sequence.",
        "Using a <span class='fact-highlight'>color-blind friendly palette</span> ensures your poster's information is accessible to everyone."
    ];
    
    // Function to display random accessibility facts
    function showRandomFact() {
        const randomIndex = Math.floor(Math.random() * accessibilityFacts.length);
        factText.innerHTML = accessibilityFacts[randomIndex];
    }

    // Make uploadBox keyboard accessible
    if (uploadBox) {
        uploadBox.addEventListener('keydown', (e) => {
            // Trigger click on Enter or Space
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                chooseFileBtn.click();
            }
        });
    }
  
    chooseFileBtn?.addEventListener('click', () => fileInput?.click());
  
    uploadBox?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.backgroundColor = '#e0f7ff';
        uploadBox.setAttribute('aria-label', 'Release to upload file');
    });
  
    uploadBox?.addEventListener('dragleave', () => {
        uploadBox.style.backgroundColor = 'transparent';
        uploadBox.setAttribute('aria-label', null);
    });
  
    uploadBox?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.backgroundColor = 'transparent';
        uploadBox.setAttribute('aria-label', null);
        if (e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
  
    fileInput?.addEventListener('change', () => {
        if (fileInput.files[0]) {
            handleFileUpload(fileInput.files[0]);
        }
    });
  
    function handleFileUpload(file) {
        currentFile = file;
        if (fileNameDisplay) fileNameDisplay.textContent = file.name;
  
        sessionStorage.setItem('originalFileName', file.name);
  
        const reader = new FileReader();
        reader.onload = function (e) {
            sessionStorage.setItem('originalImage', e.target.result);
        };
        reader.readAsDataURL(file);
  
        uploadBox.style.display = 'none';
        progressContainer.style.display = 'flex';
        progressBarContainer.style.display = 'block';
        analyzeBtnContainer.style.display = 'none';
  
        // Update ARIA attributes
        progressContainer.setAttribute('aria-label', `File ${file.name} selected`);
        progressBarContainer.setAttribute('aria-valuenow', '0');
  
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 2s ease-in-out';
  
        setTimeout(() => {
            progressBar.style.width = '100%';
            progressBarContainer.setAttribute('aria-valuenow', '100');
  
            setTimeout(() => {
                progressBarContainer.style.display = 'none';
                analyzeBtnContainer.style.display = 'block';
                
                // Set focus to analyze button for better keyboard accessibility
                analyzeBtn.focus();
                
                // Announce completion to screen readers
                const announcer = document.createElement('div');
                announcer.setAttribute('aria-live', 'polite');
                announcer.classList.add('sr-only');
                announcer.textContent = 'File uploaded successfully. Ready for analysis.';
                document.body.appendChild(announcer);
                
                setTimeout(() => {
                    document.body.removeChild(announcer);
                }, 1000);
            }, 2000);
        }, 100);
    }
  
    analyzeBtn?.addEventListener('click', async () => {
        if (!currentFile) {
            alert('Please upload a file first');
            return;
        }
  
        // Replace text with loading animation
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
                <span>Analyzing...</span>
            </div>
        `;
        analyzeBtn.setAttribute('aria-label', 'Analyzing document, please wait');
        
        // Show fact container and start displaying facts
        if (factContainer) {
            factContainer.style.display = 'block';
            showRandomFact(); // Show first fact immediately
            
            // Change facts every 5 seconds
            factInterval = setInterval(showRandomFact, 5000);
        }
  
        try {
            const formData = new FormData();
            formData.append('poster', currentFile);

            const API_BASE_URL = 'https://poster-evaluation-a11y-production.up.railway.app';

            const response = await fetch(`${API_BASE_URL}/evaluate`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to analyze image: ${response.status} ${errorText}`);
            }
            
            const result = await response.json();

            const analysisData = {
                authors: result.authors || [],
                captions: Object.entries(result.captions || {}).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: {
                        ...value,
                        img: value.img ? `${API_BASE_URL}/${value.img}` : null
                    }
                }), {}),
                color_contrast: {
                    color_contrast_summary: result.color_contrast?.color_contrast_summary ? 
                        `${API_BASE_URL}/${result.color_contrast.color_contrast_summary}` : "",
                    sections: result.color_contrast?.sections.map(section => ({
                        ...section,
                        section_image: section.section_image ? 
                            `${API_BASE_URL}/${section.section_image}` : null
                    })) || []
                },
                hyperlinks: result.hyperlinks || {},
                image_resolution: result.image_resolution || {
                    DPI: 0,
                    Resolution: "0x0"
                },
                logo_evaluation: {
                    logo_evaluation_summary: result.logo_evaluation?.logo_evaluation_summary ? 
                        `${API_BASE_URL}/${result.logo_evaluation.logo_evaluation_summary}` : "",
                    logos: result.logo_evaluation?.logos.map(logo => ({
                        ...logo,
                        logo_1: logo.logo_1 ? `${API_BASE_URL}/${logo.logo_1}` : null,
                        logo_2: logo.logo_2 ? `${API_BASE_URL}/${logo.logo_2}` : null,
                        logo_3: logo.logo_3 ? `${API_BASE_URL}/${logo.logo_3}` : null
                    })) || []
                },
                poster_layout: result.poster_layout ? 
                    `${API_BASE_URL}/${result.poster_layout}` : "",
                    font_sizes: result.font_sizes || {}
            };

            // Clear the fact interval before navigation
            if (factInterval) {
                clearInterval(factInterval);
            }

            sessionStorage.setItem('analysisData', JSON.stringify(analysisData));
            window.location.href = 'analysis.html';
        } catch (error) {
            console.error('Error during analysis:', error);
            alert('Error analyzing file. Please try again.');
            
            // Clear the fact interval and hide the container on error
            if (factInterval) {
                clearInterval(factInterval);
                factInterval = null;
            }
            
            if (factContainer) {
                factContainer.style.display = 'none';
            }

            // Reset button state and add appropriate ARIA attributes
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Analyze';
            analyzeBtn.setAttribute('aria-label', 'Analyze document for accessibility');
            
            // Announce error to screen readers
            const errorAnnouncer = document.createElement('div');
            errorAnnouncer.setAttribute('aria-live', 'assertive');
            errorAnnouncer.classList.add('sr-only');
            errorAnnouncer.textContent = 'Error analyzing file. Please try again.';
            document.body.appendChild(errorAnnouncer);
            
            setTimeout(() => {
                document.body.removeChild(errorAnnouncer);
            }, 1000);
        }
    });
  
    // Add screen reader only style
    const style = document.createElement('style');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
    `;
    document.head.appendChild(style);

    if (window.location.pathname.includes('analysis.html')) {
        setTimeout(() => {
            const widget = document.getElementById('widget');
            const linksWidget = document.getElementById('linksWidget');
  
            if (widget) {
                widget.addEventListener('click', () => {
                    const analysisData = JSON.parse(sessionStorage.getItem('analysisData'));
                
                    if (!analysisData || !analysisData.color_contrast || !analysisData.color_contrast.sections) {
                        alert("Contrast data is missing. Please re-analyze the file.");
                        return;
                    }
                
                    const API_BASE_URL = 'https://poster-evaluation-a11y-production.up.railway.app';
                    const contrastSummary = {
                        "annotated_image": analysisData.color_contrast.color_contrast_summary ? 
                            `${API_BASE_URL}/${analysisData.color_contrast.color_contrast_summary}` : "",
                        "lowest_contrast": analysisData.color_contrast.sections.reduce((min, sec) => Math.min(min, sec.contrast_ratio), Infinity).toFixed(2),
                        "highest_contrast": analysisData.color_contrast.sections.reduce((max, sec) => Math.max(max, sec.contrast_ratio), -Infinity).toFixed(2),
                        "average_contrast": (analysisData.color_contrast.sections.reduce((sum, sec) => sum + sec.contrast_ratio, 0) / analysisData.color_contrast.sections.length).toFixed(2),
                        "pass_count": analysisData.color_contrast.sections.filter(sec => sec.accessibility === "PASS").length,
                        "fail_count": analysisData.color_contrast.sections.filter(sec => sec.accessibility === "FAIL").length,
                        "total_sections": analysisData.color_contrast.sections.length,
                        "sections": analysisData.color_contrast.sections.map(section => ({
                            ...section,
                            section_image: section.section_image
                        }))
                    };
                
                    sessionStorage.setItem('contrastImagePath', contrastSummary.annotated_image);
                    sessionStorage.setItem('contrastData', JSON.stringify(contrastSummary));
                
                    window.location.href = 'contrast_analysis.html';
                });
            }

            if (linksWidget) {
                linksWidget.addEventListener('click', () => {
                    const analysisData = JSON.parse(sessionStorage.getItem('analysisData'));
                    
                    if (!analysisData || !analysisData.hyperlinks || Object.keys(analysisData.hyperlinks).length === 0) {
                        alert("No hyperlinks data available.");
                        return;
                    }
                    
                    sessionStorage.setItem('linksData', JSON.stringify(analysisData.hyperlinks));
                    window.location.href = 'links_analysis.html';
                });

                // Update links count if hyperlinks exist
                const linksCount = document.getElementById('linksCount');
                if (linksCount) {
                    const analysisData = JSON.parse(sessionStorage.getItem('analysisData'));
                    const hyperlinksCount = analysisData?.hyperlinks ? Object.keys(analysisData.hyperlinks).length : 0;
                    linksCount.textContent = hyperlinksCount;
                }
            }

            const resolutionWidget = document.getElementById('resolutionWidget');
            if (resolutionWidget) {
                resolutionWidget.addEventListener('click', () => {
                    try {
                        const analysisData = JSON.parse(sessionStorage.getItem('analysisData'));
                    
                        if (!analysisData || !analysisData.image_resolution) {
                            alert("Resolution data is missing. Please re-analyze the file.");
                            return;
                        }

                        console.log("Raw image_resolution data:", analysisData.image_resolution);
                    
                        const resolutionSummary = {
                            "DPI": analysisData.image_resolution.DPI || 0,
                            "Resolution": analysisData.image_resolution.Resolution ? 
                                analysisData.image_resolution.Resolution.toString().split('x').map(num => parseInt(num) || 0) : 
                                [0, 0],
                            "Laplacian Variance": analysisData.image_resolution.Laplacian_Variance || "N/A",
                            "PSNR": analysisData.image_resolution.PSNR || "N/A",
                            "Accessible": analysisData.image_resolution.DPI >= 300
                        };

                        console.log("Processed resolutionSummary:", resolutionSummary);
                    
                        // Store the data before navigation
                        sessionStorage.setItem('resolutionData', JSON.stringify(resolutionSummary));
                        
                        // Navigate to the correct page
                        window.location.href = 'color_resolution.html';
                    } catch (error) {
                        console.error("Error processing resolution data:", error);
                        alert("Error processing resolution data. Please try again.");
                    }
                });
            }
        }, 500);
    }
    
    // Update component counts based on the actual data structure
    const analysisData = JSON.parse(sessionStorage.getItem('analysisData'));
    
    if (analysisData) {
        // Complex logos count
        const complexLogoCount = analysisData.logo_evaluation?.logos?.filter(logo => logo.label === "Complex").length || 0;
        const complexCountElement = document.getElementById("Complex_Logo_Count");
        if (complexCountElement) {
            complexCountElement.innerText = complexLogoCount;
        }

        // Simple logos count
        const simpleLogoCount = analysisData.logo_evaluation?.logos?.filter(logo => logo.label === "Simple").length || 0;
        const simpleCountElement = document.getElementById("Simple");
        if (simpleCountElement) {
            simpleCountElement.innerText = simpleLogoCount;
        }

        // Diagram count
        const diagramCount = Object.keys(analysisData.captions || {}).filter(key => key.startsWith('diagram_')).length || 0;
        const diagramCountElement = document.getElementById("diagram");
        if (diagramCountElement) {
            diagramCountElement.innerText = diagramCount;
        }

        // Caption count
        const captionCount = Object.keys(analysisData.captions || {}).length || 0;
        const captionCountElement = document.getElementById("caption");
        if (captionCountElement) {
            captionCountElement.innerText = captionCount;
        }

        const tableWidget = document.getElementById('tableWidget');
if (tableWidget) {
    tableWidget.addEventListener('click', () => {
        const analysisData = JSON.parse(sessionStorage.getItem('analysisData'));
        if (!analysisData || !analysisData.captions) {
            alert("No analysis data found. Please re-analyze the file.");
            return;
        }

        const tableCaptions = Object.entries(analysisData.captions)
            .filter(([key, val]) => key.startsWith("table_"))
            .map(([key, val]) => ({ id: key, ...val }));

        // Store whatever is found (even if empty)
        sessionStorage.setItem('tableData', JSON.stringify(tableCaptions));
        window.location.href = 'table_analysis.html';
    });
}



    }
});
