/**
 * BPER System Iframe Integration
 * 
 * This script provides easy integration of the BPER medical device system
 * into any website via iframe embedding.
 */

class BPERIframeIntegration {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'bper-container',
            url: options.url || 'https://bper.me/',
            height: options.height || '800px',
            showHeader: options.showHeader !== false,
            headerTitle: options.headerTitle || 'BPER Blutdruckmessgerät System',
            allowFullscreen: options.allowFullscreen !== false,
            showNavButtons: options.showNavButtons !== false,
            autoResize: options.autoResize || false,
            onLoad: options.onLoad || null,
            onError: options.onError || null,
            customStyles: options.customStyles || {},
            sandbox: options.sandbox || 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox',
            pages: {
                home: '',
                test: 'blutdruck-test',
                knowledge: 'wissen/blutdruck',
                tips: 'wissen/gesundheitstipps'
            }
        };
        
        this.container = null;
        this.iframe = null;
        this.isFullscreen = false;
        this.isLoaded = false;
        
        this.init();
    }
    
    init() {
        this.container = document.getElementById(this.options.containerId);
        
        if (!this.container) {
            console.error(`BPER Integration: Container with id '${this.options.containerId}' not found`);
            return;
        }
        
        this.render();
        this.attachEventListeners();
        
        if (this.options.autoResize) {
            this.enableAutoResize();
        }
    }
    
    render() {
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'bper-iframe-wrapper';
        
        // Apply custom styles
        if (this.options.customStyles.wrapper) {
            Object.assign(wrapper.style, this.options.customStyles.wrapper);
        }
        
        // Create header if enabled
        if (this.options.showHeader) {
            const header = this.createHeader();
            wrapper.appendChild(header);
        } else {
            wrapper.classList.add('minimal');
        }
        
        // Create loading indicator
        const loading = document.createElement('div');
        loading.className = 'bper-iframe-loading';
        loading.innerHTML = `
            <div class="spinner"></div>
            <div>BPER System wird geladen...</div>
        `;
        wrapper.appendChild(loading);
        
        // Create iframe
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'bper-iframe';
        this.iframe.src = this.options.url;
        this.iframe.title = 'BPER Medical Device System';
        this.iframe.style.height = this.options.height;
        this.iframe.sandbox = this.options.sandbox;
        this.iframe.loading = 'lazy';
        
        // Apply custom iframe styles
        if (this.options.customStyles.iframe) {
            Object.assign(this.iframe.style, this.options.customStyles.iframe);
        }
        
        wrapper.appendChild(this.iframe);
        
        // Create overlay for fullscreen
        if (this.options.allowFullscreen) {
            const overlay = document.createElement('div');
            overlay.className = 'bper-iframe-overlay';
            overlay.onclick = () => this.exitFullscreen();
            document.body.appendChild(overlay);
        }
        
        // Clear container and add wrapper
        this.container.innerHTML = '';
        this.container.appendChild(wrapper);
        
        // Store references
        this.wrapper = wrapper;
        this.loading = loading;
    }
    
    createHeader() {
        const header = document.createElement('div');
        header.className = 'bper-iframe-header';
        
        const title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = `
            <span>💉</span>
            <span>${this.options.headerTitle}</span>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        if (this.options.showNavButtons) {
            actions.innerHTML = `
                <button onclick="bperIntegration.navigate('home')">Start</button>
                <button onclick="bperIntegration.navigate('test')">Test</button>
                <button onclick="bperIntegration.navigate('knowledge')">Wissen</button>
            `;
        }
        
        if (this.options.allowFullscreen) {
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.innerHTML = '⛶ Vollbild';
            fullscreenBtn.onclick = () => this.toggleFullscreen();
            actions.appendChild(fullscreenBtn);
        }
        
        header.appendChild(title);
        header.appendChild(actions);
        
        return header;
    }
    
    attachEventListeners() {
        // Handle iframe load
        this.iframe.onload = () => {
            this.isLoaded = true;
            this.loading.style.display = 'none';
            
            if (this.options.onLoad) {
                this.options.onLoad(this.iframe);
            }
            
            console.log('BPER iframe loaded successfully');
        };
        
        // Handle iframe error
        this.iframe.onerror = (error) => {
            this.loading.innerHTML = `
                <div class="bper-iframe-error">
                    <h3>Verbindungsfehler</h3>
                    <p>Das BPER System konnte nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
                </div>
            `;
            
            if (this.options.onError) {
                this.options.onError(error);
            }
            
            console.error('BPER iframe loading error:', error);
        };
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.options.autoResize && this.isLoaded) {
                this.adjustHeight();
            }
        });
        
        // Handle escape key for fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });
    }
    
    navigate(page) {
        if (!this.iframe) return;
        
        const basePath = this.options.url.endsWith('/') ? this.options.url : this.options.url + '/';
        const pagePath = this.options.pages[page] || page;
        
        this.iframe.src = basePath + pagePath;
        console.log(`BPER navigating to: ${basePath + pagePath}`);
    }
    
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        if (!this.wrapper || !this.options.allowFullscreen) return;
        
        this.wrapper.classList.add('bper-iframe-fullscreen');
        document.querySelector('.bper-iframe-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isFullscreen = true;
        
        // Update button text
        const fullscreenBtn = this.wrapper.querySelector('button:last-child');
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = '✕ Schließen';
        }
    }
    
    exitFullscreen() {
        if (!this.wrapper || !this.isFullscreen) return;
        
        this.wrapper.classList.remove('bper-iframe-fullscreen');
        document.querySelector('.bper-iframe-overlay').classList.remove('active');
        document.body.style.overflow = '';
        this.isFullscreen = false;
        
        // Update button text
        const fullscreenBtn = this.wrapper.querySelector('button:last-child');
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = '⛶ Vollbild';
        }
    }
    
    reload() {
        if (!this.iframe) return;
        
        this.loading.style.display = 'block';
        this.iframe.src = this.iframe.src;
    }
    
    adjustHeight() {
        if (!this.iframe || !this.options.autoResize) return;
        
        try {
            // This will only work for same-origin iframes
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            const height = iframeDoc.body.scrollHeight;
            this.iframe.style.height = height + 'px';
        } catch (e) {
            // Cross-origin iframe - cannot access content
            console.log('Cannot auto-resize cross-origin iframe');
        }
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        const overlay = document.querySelector('.bper-iframe-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.iframe = null;
        this.wrapper = null;
        this.loading = null;
        this.isLoaded = false;
        this.isFullscreen = false;
    }
    
    // Utility method to check if iframe is accessible
    isAccessible() {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            return !!doc;
        } catch (e) {
            return false;
        }
    }
    
    // Get current URL of iframe
    getCurrentUrl() {
        if (!this.iframe) return null;
        return this.iframe.src;
    }
    
    // Update configuration
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.destroy();
        this.init();
    }
}

// Auto-initialize if container exists with data attributes
document.addEventListener('DOMContentLoaded', () => {
    const autoContainer = document.querySelector('[data-bper-auto-init]');
    
    if (autoContainer) {
        const options = {
            containerId: autoContainer.id,
            url: autoContainer.dataset.bperUrl || 'https://bper.me/',
            height: autoContainer.dataset.bperHeight || '800px',
            showHeader: autoContainer.dataset.bperHeader !== 'false',
            headerTitle: autoContainer.dataset.bperTitle || 'BPER System',
            allowFullscreen: autoContainer.dataset.bperFullscreen !== 'false',
            showNavButtons: autoContainer.dataset.bperNav !== 'false'
        };
        
        window.bperIntegration = new BPERIframeIntegration(options);
    }
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BPERIframeIntegration;
}