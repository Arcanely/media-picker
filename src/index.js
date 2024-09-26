import './../styles/index.pcss';
import notifier from 'codex-notifier';
import Ele from '@stegopop/ele';
import { IconCross } from '@codexteam/icons';

/**
 * Timeout before search in ms after key pressed
 *
 * @type {number}
 */
const DEBOUNCE_TIMEOUT = 250;

/**
 * Enum specifying keyboard navigation directions
 * 
 * @enum {NavDirection}
 */
const NavDirection = {
  Next: 'Next',
  Previous: 'Previous',
};

/**
 * MediaPicker Tool for EditorJS
 */
export default class MediaPicker {

  static get toolbox() {
    return {
      title: 'Media Picker',
      icon: require('../icons/images.svg'),
    };
  }

  /**
   * Sanitizer Rule
   * Leave <figure> <img> and <figcaption> tags
   *
   * @returns {object}
   */
  static get sanitize() {
    return {
      figure: true,
      img: true,
      svg: true,
      figcaption: true,
    };
  }

  /**
   * Title for hover-tooltip
   *
   * @returns {string}
   */
  static get title() {
    return 'Media Picker';
  }

  /**
   * Set a shortcut
   *
   * @returns {string}
   */
  get shortcut() {
    // return 'CMD+I';
  }

  /**
   * Initialize basic data
   *
   * @param {object} options - tools constructor params
   * @param {object} options.config — initial config for the tool
   * @param {object} options.api — methods from Core
   */
  constructor({ config, api, data }) {
    /**
     * Essential tools
     */
    this.api = api;
    this.config = config || {};
    this.data = data || {};

    /**
     * Config
     * this.config.endpoint
     * this.config.queryParam
     */

    this.DICTIONARY = {
      searchPlaceholder: this.api.i18n.t('Search'),
      searchRequestError: this.api.i18n.t('Cannot process search request because of'),
      invalidServerData: this.api.i18n.t('Server responded with invalid data'),
      captionPlaceholder: this.api.i18n.t('Caption'),
      expandTooltip: this.api.i18n.t('View Details'),
      selectNewFileTooltip: this.api.i18n.t('Select New File'),
      tab: this.api.i18n.t('tab'),
      filename: this.api.i18n.t('Filename'),
      altText: this.api.i18n.t('Alt Text'),
      first: this.api.i18n.t('First'),
      last: this.api.i18n.t('Last')
    };

    this.nodes = {
      wrapper: null,
      library: null,
      search: null,
      searchResults: null,
      searchPagination: null,
      expandedPreviewWrapper: null,
      expandedPreview: null,
      expandedPreviewFilename: null,
      expandedPreviewAlt: null,
      expandedPreviewExit: null,
      previewWrapper: null,
      preview: null,
      previewImg: null,
      bottomFlex: null,
      caption: null,
      replace: null,
    };

    this.selectedFile = null;
    if (this.data.src) {
      this.selectedFile = this.data;
    }
    this.search = "";
    this.page = 1;

    this.KEYS = {
      ENTER: 'Enter',
      TAB: 'Tab',
      ESCAPE: 'Escape',
    };

    // Define debounce timer
    this.typingTimer = null;
  }

  /**
   * Build the Media Picker Block UI.
   *
   * @returns {HTMLDivElement}
   */
  render() {
    this.nodes.search = Ele.mint({
      element: "input",
      type: "text",
      class: "ce-mediapicker-search",
      placeholder: this.DICTIONARY.searchPlaceholder
    });
    this.nodes.searchResults = Ele.mint({
      element: "div",
      class: "ce-mediapicker-search-results",
    });

    this.nodes.searchPagination = Ele.mint({
      element: "div",
      class: "ce-mediapicker-search-pagination",
    });
    
    this.nodes.expandedPreviewExit = Ele.mint({
      element: 'button',
      type: 'button',
      class: 'ce-mediapicker-expanded-preview-exit',
      html: "" + IconCross
    });
    this.nodes.expandedPreviewFilename = Ele.mint({
      element: 'div',
      class: 'ce-mediapicker-expanded-preview-filename'
    });
    this.nodes.expandedPreviewAlt = Ele.mint({
      element: 'div',
      class: 'ce-mediapicker-expanded-preview-alt'
    });
    this.nodes.expandedPreview = Ele.mint({
      element: 'div',
      class: 'ce-mediapicker-expanded-preview',
      children: [
        this.nodes.expandedPreviewExit,
        this.nodes.expandedPreviewFilename,
        this.nodes.expandedPreviewAlt
      ]
    });
    this.nodes.expandedPreviewWrapper = Ele.mint({
      element: 'div',
      class: 'ce-mediapicker-expanded-preview-wrapper ce-mediapicker-hidden',
      children: [
        this.nodes.expandedPreview
      ]
    });

    this.nodes.previewImg = Ele.mint({
      element: "img",
      class: "ce-mediapicker-preview-img",
      src: "https://placehold.co/250x150/black/0f0"
    });
    this.nodes.preview = Ele.mint({
      element: "div",
      class: "ce-mediapicker-preview",
      children: [
        this.nodes.previewImg
      ]
    });
    this.nodes.caption = Ele.mint({
      element: "input",
      type: "text",
      class: "ce-mediapicker-caption",
      placeholder: this.DICTIONARY.captionPlaceholder
    });
    this.nodes.captionTabToComplete = Ele.mint({
      element: "div",
      class: "ce-mediapicker-tab-to-complete",
      text: this.DICTIONARY.tab
    });
    this.nodes.replace = Ele.mint({
        element: "button",
        class: "ce-mediapicker-replace",
        html: require('../icons/images.svg')
      }
    );
    this.nodes.bottomFlex = Ele.mint({
      element: "div",
      class: "ce-mediapicker-bottom-flex",
      children: [
        this.nodes.caption,
        this.nodes.captionTabToComplete,
        this.nodes.replace
      ]
    });
    this.nodes.previewWrapper = Ele.mint({
      element: "div",
      class: "ce-mediapicker-preview-wrapper ce-mediapicker-hidden",
      children: [
        this.nodes.preview,
        this.nodes.bottomFlex
      ]
    });
    this.nodes.library = Ele.mint({
      element: "div",
      class: "ce-mediapicker-library",
      children: [
        this.nodes.search,
        this.nodes.searchResults,
        this.nodes.expandedPreviewWrapper,
        this.nodes.searchPagination,
      ]
    });
    this.nodes.wrapper = Ele.mint({
      element: "div",
      class: "ce-mediapicker-wrapper",
      children: [
        this.nodes.library,
        this.nodes.previewWrapper
      ]
    });

    // Set tooltips
    this.api.tooltip.onHover(this.nodes.replace, this.DICTIONARY.selectNewFileTooltip, { placement: 'top'});

    // Listen to pressed enter, tab, and shift keys
    [this.nodes.search, this.nodes.caption, this.nodes.replace].forEach(node => {
      node.addEventListener('keydown', this.fieldKeydownHandler.bind(this));
    });

    // replace button toggles visibility of search results.
    this.nodes.replace.addEventListener('click', () => this.toggleVisibility());

    // Listen to search input
    this.nodes.search.addEventListener('input', this.searchInputHandler.bind(this));

    // Trap focus within the expanded preview
    this.nodes.expandedPreviewExit.addEventListener('keydown', (event) => {
      if (event.key === this.KEYS.TAB) {
        event.preventDefault();
        event.stopPropagation();
      }
    })

    // Allow them to exit the expanded preview with the escape key.
    document.addEventListener('keydown', (event) => {
      if (event.key === this.KEYS.ESCAPE) {
        if (this.expandedPreviewIsOpen()) {
          let srcOfImg = decodeURI(this.nodes.wrapper.querySelector('.ce-mediapicker-expanded-preview-exit').dataset.ceMediapickerShowingImg);
          let backToElement = this.nodes.searchResults.querySelector(`[src='${srcOfImg}']`).closest('.ce-mediapicker-img-result').querySelector('.ce-mediapicker-icon-button');
          this.closeExpandedPreview();
          backToElement.focus();
        }
      }
    })

    // Add enter event for expanded preview exit
    this.nodes.expandedPreviewExit.addEventListener('keydown', this.fieldKeydownHandler.bind(this));
    this.nodes.expandedPreviewExit.addEventListener('click', (event) => {
      let srcOfImg = decodeURI(this.nodes.wrapper.querySelector('.ce-mediapicker-expanded-preview-exit').dataset.ceMediapickerShowingImg);
      let backToElement = this.nodes.searchResults.querySelector(`[src='${srcOfImg}']`).closest('.ce-mediapicker-img-result').querySelector('.ce-mediapicker-icon-button');
      this.closeExpandedPreview();
      backToElement.focus();
    });

    // load saved data
    if (this.selectedFile) {
      this.nodes.caption.value = this.selectedFile?.caption;
      this.nodes.previewImg.src = this.selectedFile?.src;
      this.nodes.previewImg.alt = this.selectedFile?.alt;

      this.toggleVisibility();
    }

    // search when rendered
    this.searchInputHandler({
      target: {
        value: "",
      },
      type: "load",
    });

    setTimeout(() => {
      if (this.selectedFile) {
        let selectedLibraryElement = document.querySelector(`[data-filename='${this.selectedFile.filename}'][data-extension='${this.selectedFile.extension}']`);
        if (selectedLibraryElement) {
          selectedLibraryElement.setAttribute('data-ce-mediapicker-selected', '');
        }
      }
    }, DEBOUNCE_TIMEOUT*2);

    return this.nodes.wrapper;
  }

  save() {
    let html = `<img class='mediapicker-image' src='${this.selectedFile.src}' alt='${this.selectedFile.alt}' data-filename='${this.selectedFile.filename}' data-extension='${this.selectedFile.extension}'>`;
    let caption = this.nodes.caption.value;
    let htmlWithCaption = `<figure class='mediapicker-figure'>${html}<figcaption>${caption}</figcaption></figure>`
    return {
      src: this.selectedFile.src,
      alt: this.selectedFile.alt,
      filename: this.selectedFile.filename,
      extension: this.selectedFile.extension,
      caption: caption,
      html: html,
      htmlWithCaption: htmlWithCaption
    };
  }

  /**
   * Process keydown events to detect arrow keys or enter pressed
   *
   * @param {KeyboardEvent} event — keydown event
   * @returns {void}
   */
  fieldKeydownHandler(event) {
    const isEnterKey = this.KEYS.ENTER === event.key;
    const isTabKey = this.KEYS.TAB === event.key;

    if (!isEnterKey && !isTabKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Choose handler
    switch (true) {

      // Handle Enter key
      case isEnterKey: {
        this.processEnterKeyPressed(event);
        break;
      }

      // Handle tab and shift keys
      case isTabKey: {
        let direction;

        if (event.key === this.KEYS.TAB) {
          direction = NavDirection.Next;
          if (event.shiftKey) {
            direction = NavDirection.Previous;
          }
        }
        this.tabNavigate(direction);
        break;
      }
    }
  }

  /**
   * Input event listener for search input field
   *
   * @param {KeyboardEvent} event — input event
   * @returns {void}
   */
  searchInputHandler(event) {
    // Stop debounce timer
    clearTimeout(this.typingTimer);

    if (event.type === 'click') { // paging
      let toPage = parseInt(event.target.dataset.ceMediapickerPage);

      // Define a new timer
      this.typingTimer = setTimeout(async () => {
        // Show the loader during request
        this.toggleLoadingState(true);
        try {
          const searchDataResponse = await this.searchRequest(this.search, toPage);

          // Generate list and pagination
          this.generateSearchList(searchDataResponse.files);
          this.generateSearchPagination(searchDataResponse.page, searchDataResponse.totalPages);
        } catch (e) {
          notifier.show({
            message: `${this.DICTIONARY.searchRequestError} "${e.message}"`,
            style: 'error',
          });
        }
        this.toggleLoadingState(false);

        if (this.selectedFile) {
          let selectedLibraryElement = document.querySelector(`[data-filename='${this.selectedFile.filename}'][data-extension='${this.selectedFile.extension}']`);
          if (selectedLibraryElement) {
            selectedLibraryElement.setAttribute('data-ce-mediapicker-selected', '');
          }
        }

        this.page = toPage;
        
      }, DEBOUNCE_TIMEOUT);

    } else if (event.type === 'input' || event.type === 'load') { // searching

      const searchString = event.target.value;
      this.search = searchString;

      let pageString = 1;
      if (event.type === 'keydown') {
        pageString = this.page;
      }

      // If no server endpoint then do nothing
      if (!this.isServerEnabled()) {
        console.warn("No server endpoint was configured for Media Picker.")
        return;
      }

      // Define a new timer
      this.typingTimer = setTimeout(async () => {
        // Show the loader during request
        this.toggleLoadingState(true);
        try {
          const searchDataResponse = await this.searchRequest(searchString, pageString);

          // Generate list and pagination
          this.generateSearchList(searchDataResponse.files);
          this.generateSearchPagination(searchDataResponse.page, searchDataResponse.totalPages);
        } catch (e) {
          notifier.show({
            message: `${this.DICTIONARY.searchRequestError} "${e.message}"`,
            style: 'error',
          });
        }
        this.toggleLoadingState(false);

        if (this.selectedFile) {
          let selectedLibraryElement = document.querySelector(`[data-filename='${this.selectedFile.filename}'][data-extension='${this.selectedFile.extension}']`);
          if (selectedLibraryElement) {
            selectedLibraryElement.setAttribute('data-ce-mediapicker-selected', '');
          }
        }
        
      }, DEBOUNCE_TIMEOUT);

    }
    
  }

  /**
   * Hides / shows loader
   *
   * @param {boolean} state - true to show
   * @returns {void}
   */
  toggleLoadingState(state) {
    this.nodes.searchResults.classList.toggle('ce-mediapicker-search-results-loading', state);
  }

  /**
   * Navigate between inputs and buttons
   *
   * @param {NavDirection} direction - next or previous
   * @returns {void}
   */
  tabNavigate(direction) {
    let fields = this.nodes.wrapper.querySelectorAll('input, button:not(.ce-mediapicker-expanded-preview-exit)');
    if (this.expandedPreviewIsOpen()) {
      fields = this.nodes.wrapper.querySelectorAll('.ce-mediapicker-expanded-preview-exit');
    }
    let i = Array.prototype.indexOf.call(fields, document.activeElement);
    if (i < fields.length - 1 && direction === NavDirection.Next) {
      fields[++i].focus();  
    } else if (i > 0 && direction === NavDirection.Previous) {
      fields[--i].focus();
    } else if (i === fields.length-1 && direction === NavDirection.Next) {
      this.moveToNextBlock();
    } else if (i === 0 && direction === NavDirection.Previous) {
      this.moveToPreviousBlock();
    }
  }

  /**
   * Process enter key pressing
   * @returns {void}
   */
  processEnterKeyPressed(event) {
    let focused = document.activeElement;

    // if focusing on library image
    if (focused.classList.contains('ce-mediapicker-select-img-button')) {
      this.searchFilePressed(event.target.querySelector('img'));
    }
    // if focusing on library details button
    else if (focused.classList.contains('ce-mediapicker-icon-button')) {
      let img = event.target.parentElement.parentElement.querySelector('img');
      this.toggleExpandedPreview(img);
    } 
    // if focusing on expanded preview exit
    else if (focused.classList.contains('ce-mediapicker-expanded-preview-exit')) {
      let srcOfImg = decodeURI(focused.getAttribute('data-ce-mediapicker-showing-img'));
      let backToElement = this.nodes.searchResults.querySelector(`[src='${srcOfImg}']`).closest('.ce-mediapicker-img-result').querySelector('.ce-mediapicker-icon-button');
      this.closeExpandedPreview();
      backToElement.focus();
    }
    // if editing in preview mode, then move to next block
    else if (focused.classList.contains('ce-mediapicker-caption') || focused.classList.contains('ce-mediapicker-replace')) {
      this.moveToNextBlock();
    }
    
  }

  /**
   * Remove search result elements
   *
   * @returns {void}
   */
  clearSearchList() {
    this.nodes.searchResults.innerHTML = '';
  }

  /**
   * Fill up a search list results by data
   *
   * @param {SearchFileData[]} files — files to be shown
   * @returns {void}
   */
  generateSearchList(files = []) {

    this.clearSearchList();

    // If files data is not an array
    if (!Array.isArray(files)) {
      notifier.show({
        message: this.DICTIONARY.invalidServerData,
        style: 'error',
      });
      return;
    }

     // If no files returned
    if (files.length === 0) {
      return;
    }

    let fileCounter = 0;
    // Fill up search list by new elements
    files.forEach(file => {

      // Show up to 6 files
      if (fileCounter === 6) {
        return;
      } else if (fileCounter > 6) {
        console.warn("MediaPicker: configured endpoint is returning more than the maximum number of shown files.");
      }

      // The actual rendered image
      const searchFilePreviewElement = Ele.mint({
        element: 'img',
        src: file.url,
        alt: file.alt == "" || file.alt == "null" || file.alt == null ? "" : file.alt,
        dataFilename: file.filename,
        dataExtension: file.extension
      })
      const selectedFileIcon = Ele.mint({
        element: 'div',
      })
      const searchFilePreviewElementButton = Ele.mint({
        element: 'button',
        type: 'button',
        class: 'ce-mediapicker-select-img-button',
        children: [
          searchFilePreviewElement,
          selectedFileIcon
        ]
      })

      // A flex element to contain the filename and expand icon
      const searchFileName = Ele.mint({
        element: 'div',
        class: 'ce-mediapicker-img-result-name',
        html: `${file.filename}.${file.extension}`
      })
      const expandFile = Ele.mint({
        element: 'button',
        type: 'button',
        class: 'ce-mediapicker-icon-button',
        html: require('../icons/expand.svg')
      })
      const searchFileBottomFlex = Ele.mint({
        element: 'div',
        class: 'ce-mediapicker-img-result-bottom-flex',
        children: [
          searchFileName,
          expandFile
        ]
      })
      const searchFile = Ele.mint({
        element: 'div',
        class: 'ce-mediapicker-img-result',
        children: [
          searchFilePreviewElementButton,
          searchFileBottomFlex,
        ]
      });

      // Set tooltips
      this.api.tooltip.onHover(searchFileName, file.filename + "." + file.extension, { placement: 'top'});
      this.api.tooltip.onHover(expandFile, this.DICTIONARY.expandTooltip, { placement: 'top'});

      // Add tab navigation and enter listeners
      searchFilePreviewElementButton.addEventListener('keydown', this.fieldKeydownHandler.bind(this));
      expandFile.addEventListener('keydown', this.fieldKeydownHandler.bind(this));

      // Add select listeners to image previews
      searchFilePreviewElementButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.searchFilePressed(event.target);
      })

      // Add view details listeners to image previews
      expandFile.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        let img = event.target.closest('.ce-mediapicker-img-result').querySelector('img');
        this.toggleExpandedPreview(img);
      })

      this.nodes.searchResults.appendChild(searchFile);

      fileCounter++;
    });
  }

  generateSearchPagination(page, totalPages) {
    this.nodes.searchPagination.innerHTML = "";
    let numPageButtons = 7;
    if (totalPages < numPageButtons) {
      numPageButtons = totalPages;
    }
    let half = Math.ceil(numPageButtons/2);
    let startingPage = parseInt(page)-(half-1) > 0 ? parseInt(page)-(half-1) : 1;
    let endingPage = startingPage+numPageButtons-1;
    if (endingPage > totalPages) {
      // Find the difference and move the starting and ending points back that much.
      let diff = Math.abs(totalPages - endingPage);
      startingPage -= diff;
      endingPage -= diff;
    }


    // Create first page button if needed.
    if (startingPage > 1) {
      let firstPageButton = Ele.mint({
        element: 'button',
        type: 'button',
        text: this.DICTIONARY.first,
        dataCeMediapickerPage: 1,
        class: 'ce-mediapicker-pagination-button',
      });
      firstPageButton.addEventListener('click', this.searchInputHandler.bind(this)); // paginate
      firstPageButton.addEventListener('keydown', this.fieldKeydownHandler.bind(this));
      this.nodes.searchPagination.appendChild(firstPageButton);
    }
    
    for (let i = startingPage; i <= endingPage; i++) {

      let pageClass = i !== parseInt(page) ? 'ce-mediapicker-pagination-button' : 'ce-mediapicker-pagination-button-active'
      let pageButton = Ele.mint({
        element: 'button',
        type: 'button',
        text: i,
        dataCeMediapickerPage: i,
        class: pageClass,
      });
      pageButton.addEventListener('click', this.searchInputHandler.bind(this)); // paginate
      pageButton.addEventListener('keydown', this.fieldKeydownHandler.bind(this));
      this.nodes.searchPagination.appendChild(pageButton);

    }

    // Create last page button if needed.
    if (endingPage < totalPages) {
      let lastPageButton = Ele.mint({
        element: 'button',
        type: 'button',
        text: this.DICTIONARY.last,
        dataCeMediapickerPage: totalPages,
        class: 'ce-mediapicker-pagination-button',
      });
      lastPageButton.addEventListener('click', this.searchInputHandler.bind(this)); // paginate
      lastPageButton.addEventListener('keydown', this.fieldKeydownHandler.bind(this));
      this.nodes.searchPagination.appendChild(lastPageButton);
    }
  }

  /**
   * Process 'press' event on the search file
   *
   * @param {Element} element - pressed file element
   * @returns {void}
   */
  searchFilePressed(element) {

    if (!element.src || !element.dataset['filename'] || !element.dataset['extension']) {
      return;
    }

    // Set files.
    let previousSelectedFile = this.selectedFile;
    this.selectedFile = {
      src: element.src,
      alt: element.alt,
      filename: element.dataset['filename'],
      extension: element.dataset['extension']
    }

    // Clear selection if new file is clicked.
    this.nodes.searchResults.querySelectorAll("img").forEach(node => {
      if (node.src !== element.src) {
        node.removeAttribute('data-ce-mediapicker-selected');
      }
    });

    // Set selection and preview.
    element.setAttribute('data-ce-mediapicker-selected', '');
    this.nodes.previewImg.src = element.src;
    
    if (previousSelectedFile?.src !== element.src) {
      // element did not stay the same. We need to update the caption.
      this.nodes.caption.value = "";

      if (element.alt == "" || element.alt == "null") {
        this.nodes.caption.placeholder = this.DICTIONARY.captionPlaceholder;
        this.nodes.caption.removeAttribute('data-mediapicker-tab-to-complete', '');
        // remove event listener
        this.nodes.caption.parentElement.querySelector("div.ce-mediapicker-tab-to-complete").removeEventListener('click', this.tabToComplete);
      } else {
        // autocomplete option if alt text is provided.
        this.nodes.caption.placeholder = element.alt;
        this.nodes.caption.setAttribute('data-mediapicker-tab-to-complete', '');
        this.nodes.caption.parentElement.querySelector("div.ce-mediapicker-tab-to-complete").caption = element.alt; // pass data through event target
        this.nodes.caption.parentElement.querySelector("div.ce-mediapicker-tab-to-complete").addEventListener('click', this.tabToComplete);
        this.nodes.caption.caption = element.alt; // pass data through event target
        this.nodes.caption.addEventListener('keydown', this.tabToComplete);
      }
    }
      
    
    this.toggleVisibility();
  };

  tabToComplete = (event) => {
    if (event.type === 'keydown' && event.key === this.KEYS.TAB) {
      this.nodes.caption.value = event.currentTarget.caption;
      this.nodes.caption.removeEventListener(`${event.type}`, this.tabToComplete);
      // remove the tab hint by removing the data attribute.
      this.nodes.caption.removeAttribute('data-mediapicker-tab-to-complete', '');
      this.nodes.caption.focus();
    } else if (event.type === 'click') {
      this.nodes.caption.value = event.currentTarget.caption;
      this.nodes.caption.parentElement.querySelector("div.ce-mediapicker-tab-to-complete").removeEventListener(`${event.type}`, this.tabToComplete);
      // remove the tab hint by removing the data attribute.
      this.nodes.caption.removeAttribute('data-mediapicker-tab-to-complete', '');
    }
  }

  /**
   * Toggle the visibility between the search results and 
   * the selected image preview.
   *
   * @returns {void}
   */
  toggleVisibility() {
    if (this.nodes.previewWrapper.classList.contains('ce-mediapicker-hidden')) {
      // Show the preview
      this.nodes.previewWrapper.classList.remove('ce-mediapicker-hidden');
      this.nodes.library.classList.add('ce-mediapicker-hidden');
      this.nodes.caption.focus();
    } else {
      // Show the library
      this.nodes.previewWrapper.classList.add('ce-mediapicker-hidden');
      this.nodes.library.classList.remove('ce-mediapicker-hidden');
      this.nodes.search.focus();
    }
  }

  openExpandedPreview(element) {
    // set the details of the expanded preview
    this.nodes.expandedPreviewFilename.innerHTML = `${this.DICTIONARY.filename}: ` + element.dataset['filename'] + "." + element.dataset['extension'];
    this.nodes.expandedPreviewAlt.innerHTML = `${this.DICTIONARY.altText}: ${(element.alt == 'null' || element.alt == '') ? '' : element.alt}`;
    document.documentElement.style.setProperty('--ce-mediapicker-expanded-background-image', "url('" + element.src + "')");
    this.nodes.expandedPreview.style.backgroundImage = `url('${element.src}')`;
    this.nodes.expandedPreviewExit.setAttribute('data-ce-mediapicker-showing-img', element.src);

    // open the expanded preview
    this.nodes.expandedPreviewWrapper.classList.remove('ce-mediapicker-hidden');

    // set focus within the expanded preview
    this.nodes.expandedPreviewExit.focus();
  }

  closeExpandedPreview() {
    this.nodes.expandedPreviewWrapper.classList.add('ce-mediapicker-hidden');
  }

  toggleExpandedPreview(element) {
    if (this.expandedPreviewIsOpen()) {
      this.closeExpandedPreview();
    } else {
      this.openExpandedPreview(element)
    }
  }

  /**
   * Send search request
   *
   * @param {string} searchString - search string input
   *
   * @returns {Promise<SearchFileData[]>}
   */
  async searchRequest(searchString, pageString) {
    
    const queryString = new URLSearchParams(
      { 
        [this.config.queryParam ?? 'search']: searchString,
        [this.config.pageParam ?? 'page']: pageString,
      }
    ).toString();

    try {
      // hit search endpoint
      const searchResponseRaw = await fetch(`${this.config.endpoint}?${queryString}`);
      // get json
      const searchResponse = await searchResponseRaw.json();

      if (searchResponse && searchResponse.success) {
        return searchResponse;
      } else {
        console.warn('Media Picker: invalid response format: "success: true" expected, but got %o. Response: %o', searchResponse.success, searchResponse);
      }
    } catch (e) {
      notifier.show({
        message: `${this.DICTIONARY.searchRequestError} "${e.message}"`,
        style: 'error',
      });
    }
    return [];
  }

  expandedPreviewIsOpen() {
    return !this.nodes.expandedPreviewWrapper.classList.contains("ce-mediapicker-hidden");
  }

  moveToNextBlock() {
    this.api.caret.setToBlock(this.api.blocks.getCurrentBlockIndex() + 1);
  }

  moveToPreviousBlock() {
    this.api.caret.setToBlock(this.api.blocks.getCurrentBlockIndex() - 1);
  }

  /**
   * Do we need to send requests to the server
   *
   * @returns {boolean}
   */
  isServerEnabled() {
    return !!this.config.endpoint;
  }
}
