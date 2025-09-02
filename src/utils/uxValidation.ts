// UX Validation utilities for testing user experience
export const uxValidation = {
  // Test accessibility features
  checkAccessibility: () => {
    const results = [];
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let prevLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > prevLevel + 1) {
        results.push(`Heading hierarchy issue: ${heading.tagName} skips levels`);
      }
      prevLevel = level;
    });
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt) {
        results.push(`Image ${index + 1} missing alt text`);
      }
    });
    
    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                      input.getAttribute('aria-label') ||
                      input.getAttribute('aria-labelledby');
      if (!hasLabel) {
        results.push(`Form input ${index + 1} missing label`);
      }
    });
    
    return results;
  },
  
  // Test performance metrics
  checkPerformance: () => {
    const results = [];
    
    // Check for large images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
        results.push(`Image ${index + 1} is very large (${img.naturalWidth}x${img.naturalHeight})`);
      }
    });
    
    // Check for blocking resources
    const scripts = document.querySelectorAll('script:not([async]):not([defer])');
    if (scripts.length > 3) {
      results.push(`${scripts.length} blocking scripts found`);
    }
    
    return results;
  },
  
  // Test error handling
  checkErrorHandling: () => {
    const results = [];
    
    // Check for error boundaries
    const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
    if (errorBoundaries.length === 0) {
      results.push('No error boundaries found');
    }
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[data-loading], .loading, .skeleton');
    if (loadingElements.length === 0) {
      results.push('No loading states implemented');
    }
    
    return results;
  },
  
  // Test mobile responsiveness
  checkResponsiveness: () => {
    const results = [];
    const viewport = window.innerWidth;
    
    // Check for horizontal scroll on mobile
    if (viewport < 768 && document.body.scrollWidth > viewport) {
      results.push('Horizontal scroll detected on mobile');
    }
    
    // Check for too small touch targets
    const buttons = document.querySelectorAll('button, a, input');
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      if (rect.height < 44 || rect.width < 44) {
        results.push(`Touch target ${index + 1} too small (${Math.round(rect.width)}x${Math.round(rect.height)})`);
      }
    });
    
    return results;
  },
  
  // Run all UX tests
  runAllTests: () => {
    const allResults = {
      accessibility: uxValidation.checkAccessibility(),
      performance: uxValidation.checkPerformance(),
      errorHandling: uxValidation.checkErrorHandling(),
      responsiveness: uxValidation.checkResponsiveness(),
    };
    
    const totalIssues = Object.values(allResults).reduce((sum, issues) => sum + issues.length, 0);
    
    return {
      ...allResults,
      summary: {
        totalIssues,
        passed: totalIssues === 0,
        score: Math.max(0, 100 - (totalIssues * 5))
      }
    };
  }
};

// Development helper to run tests in console
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).uxValidation = uxValidation;
}