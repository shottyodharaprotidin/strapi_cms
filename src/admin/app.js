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
      font-size: 15px !important;
      font-weight: 600 !important;
    }
    
    [data-testid="content-manager-form-field"] label {
      font-size: 15px !important;
      font-weight: 600 !important;
    }
    
    /* Alternative selector for field labels */
    .sc-gJwTLC {
      font-size: 15px !important;
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

const ensureAdminBaseFontStyles = () => {
  if (document.getElementById('strapi-admin-font-size-fix')) return;

  const style = document.createElement('style');
  style.id = 'strapi-admin-font-size-fix';
  style.textContent = `
    html {
      /* Strapi defaults to 62.5% (10px). Bump slightly for readability. */
      font-size: 68.75% !important;
    }

    body,
    input,
    textarea,
    button {
      font-size: 1.4rem !important;
    }
  `;

  if (document.head) {
    document.head.appendChild(style);
  }
};

const ensureCommentsDiscoverOptimizations = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__spCommentsDiscoverOptInitialized) return;
  window.__spCommentsDiscoverOptInitialized = true;

  const TARGET_PATH = '/admin/plugins/comments/discover';
  const STATUS_VALUES = ['PENDING', 'APPROVED', 'REJECTED'];

  const isTargetPage = () => window.location.pathname.includes(TARGET_PATH);

  const detectStatus = (text) => {
    const value = String(text || '').toUpperCase();
    if (value.includes('APPROVED')) return 'APPROVED';
    if (value.includes('REJECTED')) return 'REJECTED';
    if (value.includes('PENDING')) return 'PENDING';
    return null;
  };

  const setActionVisibility = (row, status) => {
    const cells = row.querySelectorAll('td');
    if (!cells || cells.length < 2) return;

    const actionCell = cells[cells.length - 1];
    if (!actionCell) return;

    const buttons = actionCell.querySelectorAll('button');
    if (!buttons.length) return;

    const hasMultipleButtons = buttons.length > 1;
    const viewBtn = buttons[buttons.length - 1];

    buttons.forEach((btn, index) => {
      const isLast = index === buttons.length - 1;
      if (isLast) {
        btn.style.removeProperty('display');
        btn.style.setProperty('visibility', 'visible');
        btn.style.setProperty('opacity', '1');
        return;
      }

      if (status === 'PENDING') {
        btn.style.removeProperty('display');
        btn.style.setProperty('visibility', 'visible');
        btn.style.setProperty('opacity', '1');
      } else {
        btn.style.setProperty('display', 'none', 'important');
        btn.style.setProperty('visibility', 'hidden', 'important');
        btn.style.setProperty('opacity', '0', 'important');
      }
    });

    if (viewBtn && hasMultipleButtons) {
      if (status === 'PENDING') {
        viewBtn.style.removeProperty('border-left');
      } else {
        viewBtn.style.setProperty('border-left', '1px solid #32324d', 'important');
      }
    }
  };

  const updateStatus = async (id, nextStatus) => {
    const response = await fetch(`/api/comment-status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ approvalStatus: nextStatus }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update status: ${response.status}`);
    }
  };

  const optimizeRows = () => {
    if (!isTargetPage()) return;

    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (!cells || cells.length < 3) return;

      const statusCell = cells[cells.length - 2];
      const actionCell = cells[cells.length - 1];
      if (!statusCell || !actionCell) return;

      const id = Number(String(cells[0]?.textContent || '').trim());
      if (!Number.isInteger(id) || id <= 0) return;

      let select = statusCell.querySelector('select[data-comments-status="1"]');
      const status = detectStatus(select ? select.value : statusCell.textContent);
      if (!status) return;

      if (!select) {
        select = document.createElement('select');
        select.dataset.commentsStatus = '1';
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

        STATUS_VALUES.forEach((statusValue) => {
          const option = document.createElement('option');
          option.value = statusValue;
          option.textContent = statusValue;
          option.style.background = '#1f1f3d';
          option.style.color = '#f6f6ff';
          if (statusValue === status) option.selected = true;
          select.appendChild(option);
        });

        select.addEventListener('change', async (event) => {
          const nextStatus = event.target.value;
          const prevStatus = select.value;
          select.disabled = true;
          select.style.opacity = '0.7';
          try {
            await updateStatus(id, nextStatus);
            select.value = nextStatus;
            setActionVisibility(row, nextStatus);
          } catch (error) {
            console.error(error);
            select.value = prevStatus;
          } finally {
            select.disabled = false;
            select.style.opacity = '1';
          }
        });

        statusCell.innerHTML = '';
        statusCell.appendChild(select);
      }

      if (actionCell.dataset.commentsStatusBound !== '1') {
        actionCell.dataset.commentsStatusBound = '1';
        actionCell.addEventListener('click', async (event) => {
          const btn = event.target.closest('button');
          if (!btn) return;

          const buttons = Array.from(actionCell.querySelectorAll('button'));
          const buttonIndex = buttons.indexOf(btn);
          if (buttonIndex === -1) return;

          const isLast = buttonIndex === buttons.length - 1;
          if (isLast) return;
          if (buttonIndex !== 0 && buttonIndex !== 1) return;

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          const nextStatus = buttonIndex === 0 ? 'APPROVED' : 'REJECTED';
          try {
            await updateStatus(id, nextStatus);
            const activeSelect = statusCell.querySelector('select[data-comments-status="1"]');
            if (activeSelect) {
              activeSelect.value = nextStatus;
            }
            setActionVisibility(row, nextStatus);
          } catch (error) {
            console.error(error);
          }
        }, true);
      }

      setActionVisibility(row, select.value || status);
    });
  };

  let rafId = null;
  const scheduleOptimize = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      optimizeRows();
    });
  };

  // Initial pass and updates when the table is rerendered.
  scheduleOptimize();

  const observer = new MutationObserver(() => {
    scheduleOptimize();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', scheduleOptimize);
  window.addEventListener('hashchange', scheduleOptimize);
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

    setPluginConfig({
      presets: [ckeditorDefaultHtmlPreset],
    });

    app.customFields.register({
      name: 'tag-picker',
      type: 'string',
      intlLabel: {
        id: 'global.tag-picker.label',
        defaultMessage: 'Tags',
      },
      intlDescription: {
        id: 'global.tag-picker.description',
        defaultMessage: 'Search existing tags or create new ones by typing',
      },
      components: {
        Input: async () => import('./extensions/TagPickerInput'),
      },
    });
  },
  bootstrap() {
    ensureAdminBaseFontStyles();
    ensureCkeditorHeightStyles();
    ensureCommentsDiscoverOptimizations();
  },
};
