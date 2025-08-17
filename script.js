let model = null;
let imageElement = null;
const CLASS_NAMES = ['Acne', 'Eczema', 'Tinea', 'Warts'];
const CLASS_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🩺 Skin Disease Classifier - Starting...');
    loadModel();
    setupEventListeners();
});

async function loadModel() {
    try {
        console.log('📥 Loading model...');
        model = await tf.loadLayersModel('./web_model/model.json');
        console.log('✅ Model loaded successfully!');
        console.log('Model input shape:', model.inputs[0].shape);
        console.log('Model output shape:', model.outputs.shape);
    } catch (error) {
        console.error('❌ Error loading model:', error);
        alert('Failed to load AI model. Please check console for details.');
    }
}

function setupEventListeners() {
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');

    imageInput.addEventListener('change', handleImageSelect);
    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) displayImage(file);
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0) displayImage(files[0]);
}

function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImg');
        previewImg.src = e.target.result;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        imageElement = previewImg;
        console.log('📸 Image loaded for preview');
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('imageInput').value = '';
    imageElement = null;
    console.log('🗑️ Image cleared');
}

async function classifyImage() {
    if (!model) {
        alert('Model is still loading. Please wait...');
        return;
    }
    
    if (!imageElement) {
        alert('Please select an image first.');
        return;
    }
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    try {
        console.log('🔍 Starting image classification...');
        const tensor = preprocessImage(imageElement);
        console.log('📊 Image preprocessed, tensor shape:', tensor.shape);
        
        const predictions = await model.predict(tensor).data();
        console.log('🎯 Raw predictions:', predictions);
        
        const results = processResults(predictions);
        console.log('📋 Processed results:', results);
        
        displayResults(results);
        tensor.dispose();
        
    } catch (error) {
        console.error('❌ Classification error:', error);
        alert('Error during classification. Please try again.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function preprocessImage(imageElement) {
    return tf.tidy(() => {
        let tensor = tf.browser.fromPixels(imageElement);
        const resized = tf.image.resizeBilinear(tensor, [224, 224]);
        const normalized = resized.div(255.0);
        return normalized.expandDims(0);
    });
}

function processResults(predictions) {
    const predArray = Array.from(predictions);
    const maxIndex = predArray.indexOf(Math.max(...predArray));
    const predictedClass = CLASS_NAMES[maxIndex];
    const confidence = predArray[maxIndex];
    
    const allResults = predArray.map((prob, index) => ({
        className: CLASS_NAMES[index],
        probability: prob,
        percentage: (prob * 100).toFixed(2),
        color: CLASS_COLORS[index]
    })).sort((a, b) => b.probability - a.probability);
    
    return {
        predictedClass,
        confidence,
        confidencePercentage: (confidence * 100).toFixed(2),
        allResults
    };
}

function displayResults(results) {
    document.getElementById('results').style.display = 'block';
    document.getElementById('predictedClass').textContent = results.predictedClass;
    document.getElementById('confidence').textContent = results.confidencePercentage + '%';
    
    const confidenceFill = document.getElementById('confidenceFill');
    confidenceFill.style.width = results.confidencePercentage + '%';
    
    const probabilityList = document.getElementById('probabilityList');
    probabilityList.innerHTML = '';
    
    results.allResults.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'probability-item';
        
        if (result.className === results.predictedClass) {
            item.style.borderLeftColor = result.color;
            item.style.backgroundColor = result.color + '15';
        }
        
        item.innerHTML = `
            <span class="probability-name">${result.className}</span>
            <span class="probability-value">${result.percentage}%</span>
        `;
        probabilityList.appendChild(item);
    });
    
    console.log('✅ Results displayed successfully');
    document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}
