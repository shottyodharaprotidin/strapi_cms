import { defaultHtmlPreset, setPluginConfig } from '@_sh/strapi-plugin-ckeditor';

const ckeditorDefaultHtmlPreset = {
  ...defaultHtmlPreset,
  editorConfig: {
    ...defaultHtmlPreset.editorConfig,
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'removeFormat',
        '|',
        'link',
        'bulletedList',
        'numberedList',
        'blockQuote',
        '|',
        'alignment',
        'outdent',
        'indent',
        '|',
        'fontSize',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'strapiMediaLib',
        'mediaEmbed',
        'insertTable',
        '|',
        'undo',
        'redo',
        'sourceEditing',
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
  },
};

const ensureCkeditorHeightStyles = () => {
  // Style CKEditor to be full width and larger height
  const style = document.createElement('style');
  style.textContent = `
    /* Make field labels/titles bigger */
    .strapi-header {
      font-size: 18px !important;
      font-weight: 600 !important;
    }
    
    [data-testid="content-manager-form-field"] label {
      font-size: 18px !important;
      font-weight: 600 !important;
    }
    
    /* Alternative selector for field labels */
    .sc-gJwTLC {
      font-size: 18px !important;
      font-weight: 600 !important;
    }
    
    /* Make CKEditor container full width */
    [data-testid="content-manager-form-field-content"] {
      grid-column: 1 / -1!important;
    }
    
    /* Increase CKEditor height */
    .ck-editor__main {
      min-height: 400px !important;
    }
    
    .ck-content {
      min-height: 350px !important;
    }
  `;
  
  if (document.head) {
    document.head.appendChild(style);
  }
};

const config = {
  auth: {
    logo: undefined,
  },
  head: {
    favicon: undefined,
    title: 'Shottyodhara Protidin Admin',
  },
  menu: {
    logo: undefined,
  },
  translations: {
    en: {
        'Auth.form.welcome.title': 'Welcome to Admin Portal',
      'Auth.form.welcome.subtitle': 'Log in to your Account',
      'app.components.LeftMenu.navbrand.title': 'Shottyodhara Protidin',
    },
  },
  theme: {
    colors: {
      primary100: '#f0f4ff',
      primary200: '#d9e8ff',
      primary500: '#004eeb',
      primary600: '#004ce0',
      primary700: '#0040c4',
      danger700: '#b72b1a',
    },
  },
  tutorials: false,
  notifications: {
    releases: false,
  },
};

export default {
  config,
  register(app) {
    document.title = 'Shottyodhara Protidin Admin';
    
    // Create style tag with extreme priority
    const createAndInjectStyles = () => {
      if (document.getElementById('strapi-label-fix-css')) {
        return; // Already injected
      }
      
      const style = document.createElement('style');
      style.id = 'strapi-label-fix-css';
      style.textContent = `
        /* Maximum specificity - override everything */
        html label {
          font-size: 14px !important;
          line-height: 1.5 !important;
          font-weight: 600 !important;
          letter-spacing: 0 !important;
          display: inline-block !important;
          min-height: auto !important;
        }
        
        body label {
          font-size: 14px !important;
          line-height: 1.5 !important;
          font-weight: 600 !important;
        }
        
        /* Target Strapi's field label wrappers */
        [role="main"] label,
        [class*="Box"] label,
        [class*="Flex"] label {
          font-size: 14px !important;
          line-height: 1.5 !important;
          font-weight: 600 !important;
        }
        
        /* Override inline styles for labels */
        label[style*="font-size: 12px"],
        label[style*="font-size: 13px"] {
          font-size: 14px !important;
        }
      `;
      document.head.insertBefore(style, document.head.firstChild);
    };
    
    // Inject styles immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createAndInjectStyles);
    } else {
      createAndInjectStyles();
    }
    
    // Also inject inline styles directly to all labels using MutationObserver
    const fixLabelSizes = (nodeList) => {
      if (!nodeList || !nodeList.forEach) return;
      
      nodeList.forEach(node => {
        if (node.tagName === 'LABEL') {
          // Remove all font-size related styles and set new one
          node.style.removeProperty('font-size');
          node.style.setProperty('font-size', '14px', 'important');
          node.style.setProperty('line-height', '1.5', 'important');
          node.style.setProperty('font-weight', '600', 'important');
          node.style.setProperty('letter-spacing', '0', 'important');
        }
        // Recurse into children
        if (node.childNodes && node.childNodes.length > 0) {
          fixLabelSizes(node.childNodes);
        }
      });
    };
    
    // Run on all current labels
    setTimeout(() => {
      fixLabelSizes(document.querySelectorAll('label'));
    }, 100);
    
    setTimeout(() => {
      fixLabelSizes(document.querySelectorAll('label'));
    }, 1000);
    
    // Watch for new labels being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.tagName === 'LABEL') {
              node.style.setProperty('font-size', '14px', 'important');
              node.style.setProperty('line-height', '1.5', 'important');
              node.style.setProperty('font-weight', '600', 'important');
            }
            // Check if any descendants are labels
            if (node.querySelectorAll) {
              node.querySelectorAll('label').forEach((label) => {
                label.style.setProperty('font-size', '14px', 'important');
                label.style.setProperty('line-height', '1.5', 'important');
                label.style.setProperty('font-weight', '600', 'important');
              });
            }
          });
        }
      });
    });
    
    // Start observing
    setTimeout(() => {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }, 500);
    
    setPluginConfig({
      presets: [ckeditorDefaultHtmlPreset],
    });

    app.customFields.register({
      name: 'tag-picker',
      type: 'string',
      components: {
        Input: async () => import('./extensions/TagPickerInput'),
      },
    });
  },
  bootstrap() {
    ensureCkeditorHeightStyles();

    const STATUS_VALUES = ['PENDING', 'APPROVED', 'REJECTED'];

    const detectStatus = (text) => {
      const value = String(text || '').toUpperCase();
      if (value.includes('APPROVED')) return 'APPROVED';
      if (value.includes('REJECTED')) return 'REJECTED';
      if (value.includes('PENDING')) return 'PENDING';
      return null;
    };

    const updateActionButtonsVisibility = (row, status) => {
      const actionCell = row.querySelectorAll('td')[row.querySelectorAll('td').length - 1];
      if (!actionCell) return;

      // Apply multiple times with delays to ensure buttons get styled
      const applyVisibility = () => {
        const buttons = actionCell.querySelectorAll('button');
        if (buttons.length === 0) return false;

        const viewBtn = buttons[buttons.length - 1]; // Last button is view/eye button
        const hasSiblingButtons = buttons.length > 1;

        buttons.forEach((btn, index) => {
          const isLastButton = index === buttons.length - 1; // Last button is view/eye button
          
          if (isLastButton) {
            // Always show the last button (view button)
            btn.style.removeProperty('display');
            btn.style.setProperty('visibility', 'visible');
            btn.style.setProperty('opacity', '1');
          } else {
            // Show approve/reject buttons only when status is PENDING
            if (status === 'PENDING') {
              btn.style.removeProperty('display');
              btn.style.setProperty('visibility', 'visible');
              btn.style.setProperty('opacity', '1');
            } else {
              // Hide for APPROVED, REJECTED, Removed, or any other status
              btn.style.setProperty('display', 'none', 'important');
              btn.style.setProperty('visibility', 'hidden', 'important');
              btn.style.setProperty('opacity', '0', 'important');
            }
          }
        });

        // Restore left border on view button when sibling buttons are hidden
        // Strapi uses CSS adjacent sibling selectors for the border, so we add it manually
        if (viewBtn && hasSiblingButtons) {
          if (status === 'PENDING') {
            viewBtn.style.removeProperty('border-left');
          } else {
            viewBtn.style.setProperty('border-left', '1px solid #32324d', 'important');
          }
        }
        return true;
      };

      // Apply immediately
      applyVisibility();
      
      // Apply again with delays to catch async renders
      setTimeout(applyVisibility, 10);
      setTimeout(applyVisibility, 50);
      setTimeout(applyVisibility, 150);
    };

    const interceptActionButtons = (row, select, id) => {
      const actionCell = row.querySelectorAll('td')[row.querySelectorAll('td').length - 1];
      if (!actionCell) return;

      // Use a more robust approach - listen for all clicks on this cell
      const handleButtonClick = async (event) => {
        const btn = event.target.closest('button');
        if (!btn) return;

        // Get current buttons in the action cell for accurate index
        const buttons = Array.from(actionCell.querySelectorAll('button'));
        const buttonIndex = buttons.indexOf(btn);
        
        if (buttonIndex === -1) return; // Button not found in this cell
        
        const isLastButton = buttonIndex === buttons.length - 1; // Last button is view
        
        // Skip view button - let it work normally
        if (isLastButton) {
          return;
        }

        // Only intercept the first two buttons (approve, reject)
        if (buttonIndex !== 0 && buttonIndex !== 1) {
          return;
        }

        // Prevent the original button handler from running
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Determine which status based on button position
        // Index 0 = approve (✓), Index 1 = reject (✕)
        let newStatus = 'PENDING';
        if (buttonIndex === 0) {
          newStatus = 'APPROVED';
        } else if (buttonIndex === 1) {
          newStatus = 'REJECTED';
        }

        // Call API to update status
        try {
          select.disabled = true;
          btn.disabled = true;
          btn.style.opacity = '0.6';

          const response = await fetch(`/api/comment-status/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ approvalStatus: newStatus }),
          });

          if (!response.ok) {
            throw new Error(`Failed to update status: ${response.status}`);
          }

          // Update dropdown immediately
          select.value = newStatus;
          select.dataset.currentStatus = newStatus;
          select.disabled = false;
          
          // Update action buttons visibility
          updateActionButtonsVisibility(row, newStatus);
          
          // Trigger visual feedback
          row.style.backgroundColor = 'rgba(126, 122, 255, 0.2)';
          setTimeout(() => {
            row.style.backgroundColor = '';
          }, 400);
        } catch (error) {
          console.error('Error updating status:', error);
          select.disabled = false;
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      };

      // Remove any existing listeners to prevent duplicates
      const newHandler = handleButtonClick.bind({});
      actionCell.removeEventListener('click', newHandler, true);
      
      // Attach delegated listener at the action cell level with capture
      actionCell.addEventListener('click', newHandler, true);
    };

    const enhanceCommentsDiscoverTable = () => {
      if (!window.location.pathname.includes('/admin/plugins/comments/discover')) {
        return;
      }

      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach((row) => {
        // Check if row was already enhanced
        const alreadyEnhanced = row.dataset.statusDropdownEnhanced === '1';
        
        const cells = row.querySelectorAll('td');
        if (!cells || cells.length < 3) return;

        const id = Number(String(cells[0]?.textContent || '').trim());
        if (!Number.isInteger(id) || id <= 0) return;

        const statusCell = cells[cells.length - 2];
        if (!statusCell) return;
        statusCell.style.pointerEvents = 'auto';

        const currentStatus = detectStatus(statusCell.textContent);
        if (!currentStatus) return;

        // If already enhanced but status cell has a select, it's good
        // If already enhanced but status cell doesn't have a select, re-enhance (React re-rendered)
        if (alreadyEnhanced) {
          const existingSelect = statusCell.querySelector('select');
          if (existingSelect) {
            // Already properly enhanced
            return;
          } else {
            // Status cell was reset (React re-render), clear the flag to re-enhance
            row.dataset.statusDropdownEnhanced = '0';
          }
        }

        const select = document.createElement('select');
        select.style.background = '#1f1f3d';
        select.style.color = '#f6f6ff';
        select.style.border = '1px solid #7e7aff';
        select.style.borderRadius = '4px';
        select.style.padding = '4px 8px';
        select.style.fontSize = '12px';
        select.style.fontWeight = '600';
        select.style.position = 'relative';
        select.style.zIndex = '2';
        select.style.pointerEvents = 'auto';
        select.dataset.currentStatus = currentStatus;

        // Keep dropdown interaction local so table/row handlers don't swallow clicks.
        const stopRowHandlers = (event) => {
          event.stopPropagation();
        };
        select.addEventListener('mousedown', stopRowHandlers);
        select.addEventListener('click', stopRowHandlers);
        select.addEventListener('keydown', stopRowHandlers);
        select.addEventListener('focus', stopRowHandlers);
        select.addEventListener('click', () => {
          if (typeof select.showPicker === 'function' && !select.disabled) {
            try {
              select.showPicker();
            } catch (error) {
              // Ignore; showPicker can throw on unsupported contexts.
            }
          }
        });

        STATUS_VALUES.forEach((statusValue) => {
          const option = document.createElement('option');
          option.value = statusValue;
          option.textContent = statusValue;
          option.style.background = '#1f1f3d';
          option.style.color = '#f6f6ff';
          if (statusValue === currentStatus) option.selected = true;
          select.appendChild(option);
        });

        select.addEventListener('change', async (event) => {
          const nextStatus = event.target.value;
          const previousStatus = select.dataset.currentStatus || currentStatus;
          select.disabled = true;
          select.style.opacity = '0.7';

          try {
            const response = await fetch(`/api/comment-status/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify({ approvalStatus: nextStatus }),
            });

            if (!response.ok) {
              throw new Error(`Failed to update status: ${response.status}`);
            }

            select.dataset.currentStatus = nextStatus;
            select.value = nextStatus;
            select.disabled = false;
            select.style.opacity = '1';

            // Hide or show action buttons based on new status
            updateActionButtonsVisibility(row, nextStatus);

            // Trigger visual feedback
            row.style.backgroundColor = 'rgba(126, 122, 255, 0.2)';
            setTimeout(() => {
              row.style.backgroundColor = '';
            }, 400);
          } catch (error) {
            console.error(error);
            select.value = previousStatus;
            select.disabled = false;
            select.style.opacity = '1';
          }
        });

        statusCell.innerHTML = '';
        statusCell.appendChild(select);

        // Make the whole status cell clickable as a fallback for tight hit targets.
        statusCell.addEventListener('mousedown', (event) => {
          const clickedSelect = event.target.closest('select');
          if (clickedSelect) return;

          event.preventDefault();
          event.stopPropagation();

          if (select.disabled) return;
          select.focus();
          if (typeof select.showPicker === 'function') {
            try {
              select.showPicker();
            } catch (error) {
              // Ignore; browser will still focus the element.
            }
          }
        });
        
        // Intercept action button clicks to update dropdown and API
        interceptActionButtons(row, select, id);
        
        // Watch for when buttons are rendered in the action cell and apply visibility
        const actionCell = row.querySelectorAll('td')[row.querySelectorAll('td').length - 1];
        const buttonObserver = new MutationObserver(() => {
          setTimeout(() => {
            updateActionButtonsVisibility(row, select.dataset.currentStatus || currentStatus);
          }, 50);
        });
        
        if (actionCell) {
          buttonObserver.observe(actionCell, { childList: true, subtree: true });
        }
        
        row.dataset.statusDropdownEnhanced = '1';
      });
    };

    enhanceCommentsDiscoverTable();

    // Periodic check to ensure all rows have proper button visibility
    setInterval(() => {
      if (!window.location.pathname.includes('/admin/plugins/comments/discover')) {
        return;
      }
      
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach((row) => {
        const statusCell = row.querySelectorAll('td')[row.querySelectorAll('td').length - 2];
        if (!statusCell) return;
        
        // Try to get status from the select dropdown first
        const select = statusCell.querySelector('select');
        let currentStatus = 'PENDING'; // Default to PENDING
        
        if (select) {
          // Read from dropdown
          currentStatus = select.value || select.dataset.currentStatus || 'PENDING';
        } else {
          // Read from cell text if no dropdown
          currentStatus = detectStatus(statusCell.textContent);
          if (!currentStatus) return;
        }
        
        // Ensure buttons have correct visibility
        updateActionButtonsVisibility(row, currentStatus);
      });
    }, 500);

    const observer = new MutationObserver(() => {
      enhanceCommentsDiscoverTable();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('popstate', enhanceCommentsDiscoverTable);
    window.addEventListener('hashchange', enhanceCommentsDiscoverTable);
  },
};
