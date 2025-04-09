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
  
    let currentFile = null;
  
    chooseFileBtn?.addEventListener('click', () => fileInput?.click());
  
    uploadBox?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.backgroundColor = '#e0f7ff';
    });
  
    uploadBox?.addEventListener('dragleave', () => {
        uploadBox.style.backgroundColor = 'transparent';
    });
  
    uploadBox?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.backgroundColor = 'transparent';
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
  
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 2s ease-in-out';
  
        setTimeout(() => {
            progressBar.style.width = '100%';
  
            setTimeout(() => {
                progressBarContainer.style.display = 'none';
                analyzeBtnContainer.style.display = 'block';
            }, 2000);
        }, 100);
    }
  
    analyzeBtn?.addEventListener('click', async () => {
        if (!currentFile) {
            alert('Please upload a file first');
            return;
        }
  
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
  
        try {
            const formData = new FormData();
            formData.append('poster', currentFile);

            const API_BASE_URL = 'http://127.0.0.1:5000';

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

            sessionStorage.setItem('analysisData', JSON.stringify(analysisData));
            window.location.href = 'analysis.html';
        } catch (error) {
            alert('Error analyzing file. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze';
        }
    });
  
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
                
                    const API_BASE_URL = 'http://127.0.0.1:5000';
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
  