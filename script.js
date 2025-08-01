// Global variables
let links = [];
let currentAnalytics = null;

// DOM elements
const createLinkForm = document.getElementById('createLinkForm');
const originalUrlInput = document.getElementById('originalUrl');
const resultSection = document.getElementById('result');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const originalUrlDisplay = document.getElementById('originalUrlDisplay');
const linksList = document.getElementById('linksList');
const loadingLinks = document.getElementById('loadingLinks');
const noLinks = document.getElementById('noLinks');
const analyticsModal = document.getElementById('analyticsModal');
const analyticsContent = document.getElementById('analyticsContent');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadLinks();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    createLinkForm.addEventListener('submit', handleCreateLink);
    
    // Close modal when clicking outside
    analyticsModal.addEventListener('click', function(e) {
        if (e.target === analyticsModal) {
            closeAnalyticsModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && analyticsModal.style.display === 'block') {
            closeAnalyticsModal();
        }
    });
}

// Backend API URL
const BACKEND_URL = 'https://backend-monitor-4bnm.onrender.com';

// Handle form submission for creating new links
async function handleCreateLink(e) {
    e.preventDefault();
    
    const originalUrl = originalUrlInput.value.trim();
    
    if (!originalUrl) {
        showMessage('Please enter a valid URL', 'error');
        return;
    }
    
    // Validate URL format
    try {
        new URL(originalUrl);
    } catch {
        showMessage('Please enter a valid URL format (e.g., https://example.com)', 'error');
        return;
    }
    
    const submitBtn = createLinkForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/links`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ originalUrl })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success result
            shortUrlDisplay.value = data.shortUrl;
            originalUrlDisplay.textContent = data.originalUrl;
            resultSection.style.display = 'block';
            
            // Clear form
            originalUrlInput.value = '';
            
            // Reload links list
            loadLinks();
            
            showMessage('Short link created successfully! 🥇', 'success');
        } else {
            showMessage(data.error || 'Failed to create short link', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Load all links from the server
async function loadLinks() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/links`);
        const data = await response.json();
        
        if (response.ok) {
            links = data;
            displayLinks();
            updateStats();
        } else {
            showMessage('Failed to load links', 'error');
        }
    } catch (error) {
        showMessage('Network error while loading links', 'error');
    }
}

// Display links in the UI
function displayLinks() {
    loadingLinks.style.display = 'none';
    
    if (links.length === 0) {
        noLinks.style.display = 'block';
        linksList.innerHTML = '';
        return;
    }
    
    noLinks.style.display = 'none';
    
    const linksHTML = links.map(link => createLinkHTML(link)).join('');
    linksList.innerHTML = linksHTML;
}

// Create HTML for a single link
function createLinkHTML(link) {
    const createdDate = new Date(link.created_at).toLocaleDateString();
    const filteredClicks = (link.total_clicks || 0) - (link.total_clicks_recorded || 0);
    
    return `
        <div class="link-item">
            <div class="link-header">
                <div class="link-info">
                    <div class="link-title">${link.short_code}</div>
                    <div class="link-url">${link.original_url}</div>
                </div>
                <div class="link-actions">
                    <button class="btn btn-secondary" onclick="copyToClipboard('${link.shortUrl}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="btn btn-secondary" onclick="viewAnalytics('${link.short_code}')">
                        <i class="fas fa-chart-bar"></i> Analytics
                    </button>
                    <button class="btn btn-danger" onclick="deleteLink('${link.short_code}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="link-stats">
                <span><i class="fas fa-calendar"></i> Created: ${createdDate}</span>
                <span><i class="fas fa-mouse-pointer"></i> Total Clicks: ${link.total_clicks || 0}</span>
                <span><i class="fas fa-users"></i> Unique Clicks: ${link.unique_clicks || 0}</span>
                <span><i class="fas fa-shield-alt"></i> Filtered: ${filteredClicks}</span>
            </div>
        </div>
    `;
}

// Update statistics display
function updateStats() {
    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0);
    const uniqueClicks = links.reduce((sum, link) => sum + (link.unique_clicks || 0), 0);
    const filteredClicks = links.reduce((sum, link) => {
        return sum + ((link.total_clicks || 0) - (link.total_clicks_recorded || 0));
    }, 0);
    
    document.getElementById('totalLinks').textContent = totalLinks;
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('uniqueClicks').textContent = uniqueClicks;
    document.getElementById('filteredClicks').textContent = filteredClicks;
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (!text) {
        text = shortUrlDisplay.value;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showMessage('Copied to clipboard! 🥇', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('Copied to clipboard! 🥇', 'success');
    });
}

// View analytics for a specific link
async function viewAnalytics(shortCode) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/links/${shortCode}/analytics`);
        const data = await response.json();
        
        if (response.ok) {
            currentAnalytics = data;
            displayAnalytics(data);
            analyticsModal.style.display = 'block';
        } else {
            showMessage('Failed to load analytics', 'error');
        }
    } catch (error) {
        showMessage('Network error while loading analytics', 'error');
    }
}

// Display analytics in the modal
function displayAnalytics(data) {
    const { link, dailyStats } = data;
    const filteredClicks = (link.total_clicks || 0) - (link.total_clicks_recorded || 0);
    
    const analyticsHTML = `
        <div class="analytics-summary">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-link"></i>
                </div>
                <div class="stat-content">
                    <h3>${link.short_code}</h3>
                    <p>Short Code</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-mouse-pointer"></i>
                </div>
                <div class="stat-content">
                    <h3>${link.total_clicks || 0}</h3>
                    <p>Total Clicks</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <h3>${link.total_clicks_recorded || 0}</h3>
                    <p>Unique Clicks</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="stat-content">
                    <h3>${filteredClicks}</h3>
                    <p>Filtered Duplicates</p>
                </div>
            </div>
        </div>
        
        <div class="link-details">
            <h3><i class="fas fa-info-circle"></i> Link Details</h3>
            <p><strong>Original URL:</strong> <a href="${link.original_url}" target="_blank">${link.original_url}</a></p>
            <p><strong>Short URL:</strong> <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a></p>
            <p><strong>Created:</strong> ${new Date(link.created_at).toLocaleString()}</p>
        </div>
        
        <div class="analytics-chart">
            <h3><i class="fas fa-chart-line"></i> Daily Click Statistics</h3>
            <div class="chart-container">
                ${dailyStats.length > 0 ? createDailyStatsChart(dailyStats) : '<p>No click data available yet.</p>'}
            </div>
        </div>
    `;
    
    analyticsContent.innerHTML = analyticsHTML;
}

// Create a simple chart for daily stats
function createDailyStatsChart(dailyStats) {
    const maxClicks = Math.max(...dailyStats.map(stat => stat.clicks));
    const maxUnique = Math.max(...dailyStats.map(stat => stat.unique_clicks));
    const maxValue = Math.max(maxClicks, maxUnique);
    
    const chartHTML = dailyStats.map(stat => {
        const clickHeight = maxValue > 0 ? (stat.clicks / maxValue) * 100 : 0;
        const uniqueHeight = maxValue > 0 ? (stat.unique_clicks / maxValue) * 100 : 0;
        
        return `
            <div class="chart-bar-group">
                <div class="chart-label">${new Date(stat.date).toLocaleDateString()}</div>
                <div class="chart-bars">
                    <div class="chart-bar total" style="height: ${clickHeight}%" title="Total Clicks: ${stat.clicks}"></div>
                    <div class="chart-bar unique" style="height: ${uniqueHeight}%" title="Unique Clicks: ${stat.unique_clicks}"></div>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="chart-legend">
            <span class="legend-item"><span class="legend-color total"></span> Total Clicks</span>
            <span class="legend-item"><span class="legend-color unique"></span> Unique Clicks</span>
        </div>
        <div class="chart-container-inner">
            ${chartHTML}
        </div>
    `;
}

// Delete a link
async function deleteLink(shortCode) {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/links/${shortCode}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Link deleted successfully! 🥇', 'success');
            loadLinks(); // Reload the list
        } else {
            const data = await response.json();
            showMessage(data.error || 'Failed to delete link', 'error');
        }
    } catch (error) {
        showMessage('Network error while deleting link', 'error');
    }
}

// Close analytics modal
function closeAnalyticsModal() {
    analyticsModal.style.display = 'none';
    currentAnalytics = null;
}

// Show message to user
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Add chart styles dynamically
const chartStyles = `
    .chart-legend {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        justify-content: center;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: #4a5568;
    }
    
    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
    }
    
    .legend-color.total {
        background: #667eea;
    }
    
    .legend-color.unique {
        background: #48bb78;
    }
    
    .chart-container-inner {
        display: flex;
        gap: 8px;
        align-items: end;
        height: 200px;
        padding: 20px 0;
    }
    
    .chart-bar-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    
    .chart-label {
        font-size: 0.8rem;
        color: #718096;
        text-align: center;
        transform: rotate(-45deg);
        white-space: nowrap;
    }
    
    .chart-bars {
        display: flex;
        gap: 2px;
        width: 100%;
        height: 100%;
        align-items: end;
    }
    
    .chart-bar {
        flex: 1;
        min-height: 4px;
        border-radius: 2px 2px 0 0;
        transition: all 0.3s ease;
    }
    
    .chart-bar.total {
        background: #667eea;
    }
    
    .chart-bar.unique {
        background: #48bb78;
    }
    
    .chart-bar:hover {
        opacity: 0.8;
    }
    
    .link-details {
        background: #f7fafc;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
    }
    
    .link-details h3 {
        margin-bottom: 15px;
        color: #2d3748;
    }
    
    .link-details p {
        margin-bottom: 10px;
        color: #4a5568;
    }
    
    .link-details a {
        color: #667eea;
        text-decoration: none;
    }
    
    .link-details a:hover {
        text-decoration: underline;
    }
`;

// Inject chart styles
const styleSheet = document.createElement('style');
styleSheet.textContent = chartStyles;
document.head.appendChild(styleSheet); 