// Vanilla JS Content Script for Selection Only
console.log('Quicks Content Script Loaded');

let selecting = false;
let badge: HTMLElement | null = null;

const createBadge = () => {
  if (badge) return;
  badge = document.createElement('div');
  badge.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>📸</span>
      <span>Click any image to grab inspiration</span>
    </div>
  `;
  Object.assign(badge.style, {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    background: '#09090b', // zinc-950
    color: '#ffffff',
    borderRadius: '9999px',
    zIndex: '2147483647',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    pointerEvents: 'none',
    transition: 'opacity 0.2s',
    border: '1px solid #27272a'
  });
  document.body.appendChild(badge);
};

const removeBadge = () => {
  if (badge) {
    badge.remove();
    badge = null;
  }
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_SELECTION') {
    selecting = true;
    document.body.style.cursor = 'crosshair';
    createBadge();
  }
});

const getTargetImage = (target: HTMLElement): string | null => {
  if (target.tagName === 'IMG') {
    return (target as HTMLImageElement).src;
  }
  const style = window.getComputedStyle(target);
  if (style.backgroundImage && style.backgroundImage !== 'none') {
    const match = style.backgroundImage.match(/url\((['"]?)(.*?)\1\)/);
    if (match) return match[2];
  }
  return null;
};

document.addEventListener('mouseover', (e) => {
  if (!selecting) return;
  const target = e.target as HTMLElement;
  if (getTargetImage(target)) {
    target.style.outline = '4px solid #a855f7';
    target.style.outlineOffset = '-4px';
    target.style.cursor = 'copy';
    target.style.boxShadow = '0 0 0 4px rgba(168, 85, 247, 0.3)';
    target.style.transition = 'all 0.1s ease-out';
  }
});

document.addEventListener('mouseout', (e) => {
  if (!selecting) return;
  const target = e.target as HTMLElement;
  target.style.outline = '';
  target.style.outlineOffset = '';
  target.style.cursor = '';
  target.style.boxShadow = '';
});

const convertToDataURL = async (src: string): Promise<string> => {
  try {
    // Check if it's already data url
    if (src.startsWith('data:')) return src;
    
    const response = await fetch(src);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to convert image', e);
    return src; // Fallback
  }
};

document.addEventListener('click', async (e) => {
  if (!selecting) return;
  const target = e.target as HTMLElement;
  const src = getTargetImage(target);
  
  if (src) {
    e.preventDefault();
    e.stopPropagation();
    
    // UI Cleanup
    target.style.outline = '';
    target.style.cursor = '';
    target.style.boxShadow = '';
    document.body.style.cursor = '';
    selecting = false;
    removeBadge();
    
    // Convert and send
    const dataUrl = await convertToDataURL(src);
    chrome.runtime.sendMessage({ type: 'IMAGE_SELECTED', src: dataUrl });
  }
}, true);
