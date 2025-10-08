/**
 * Address Autocomplete Functionality
 * Simplified implementation for Google Places API address autocomplete
 */

// Configuration
const CONFIG = {
    googleApiKey: 'ADD-YOUR-GOOGLE-API-KEY-HERE',
    debounceMs: 300,
    minInputLength: 2,
    maxSuggestions: 5,
    addressFillDelay: 2000
};

/**
 * Address Autocomplete Service
 */
class AddressAutocompleteService {
    constructor(inputElement, options = {}) {
        this.inputElement = inputElement;
        this.config = { ...CONFIG, ...options };
        this.dropdown = null;
        this.currentSuggestions = [];
        this.selectedIndex = -1;
        this.debounceTimer = null;
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;

        this.loadGoogleMaps();
        this.createDropdown();
        this.attachEventListeners();
        this.isInitialized = true;
    }

    loadGoogleMaps() {
        if (window.google?.maps?.places) return;

        const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${this.config.googleApiKey}&loading=async&libraries=places`;

        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            document.head.appendChild(script);
        }
    }

    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'autocomplete-dropdown';
        this.dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;

        const parent = this.inputElement.parentElement;
        if (getComputedStyle(parent).position !== 'relative') {
            parent.style.position = 'relative';
        }
        parent.appendChild(this.dropdown);
    }

    attachEventListeners() {
        this.inputElement.addEventListener('input', (e) => {
            const value = e.target.value;
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.fetchSuggestions(value);
            }, this.config.debounceMs);
        });

        this.inputElement.addEventListener('keydown', (e) => {
            if (!this.dropdown || this.dropdown.style.display === 'none') return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentSuggestions.length - 1);
                    this.updateSelection();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                    this.updateSelection();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedIndex >= 0 && this.currentSuggestions[this.selectedIndex]) {
                        this.selectSuggestion(this.currentSuggestions[this.selectedIndex]);
                    }
                    break;
                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.inputElement.parentElement.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    async fetchSuggestions(input) {
        if (!input || input.length < this.config.minInputLength) {
            this.hideSuggestions();
            return;
        }

        // Wait for Google Maps to be available
        if (!window.google?.maps?.places) {
            setTimeout(() => this.fetchSuggestions(input), 100);
            return;
        }

        try {
            const request = {
                input: input,
                sessionToken: new google.maps.places.AutocompleteSessionToken(),
                includedPrimaryTypes: ['street_address', 'route', 'country', 'locality', 'postal_code'],
            };

            const { AutocompleteSuggestion } = await google.maps.importLibrary("places");
            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

            if (suggestions?.length > 0) {
                this.showSuggestions(suggestions.slice(0, this.config.maxSuggestions));
            } else {
                this.hideSuggestions();
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            this.hideSuggestions();
        }
    }

    showSuggestions(suggestions) {
        this.currentSuggestions = suggestions;
        this.selectedIndex = -1;
        this.dropdown.innerHTML = '';

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-suggestion';
            item.style.cssText = `
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        `;

            // Extract and display text
            const text = suggestion.text?.text || suggestion.description || suggestion.placePrediction?.text?.text || 'Unknown suggestion';
            item.textContent = text;

            item.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });

            item.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });

            this.dropdown.appendChild(item);
        });

        this.dropdown.style.display = 'block';
    }

    updateSelection() {
        const items = this.dropdown.querySelectorAll('.autocomplete-suggestion');
        items.forEach((item, index) => {
            item.style.backgroundColor = index === this.selectedIndex ? '#f0f0f0' : 'white';
        });
    }

    hideSuggestions() {
        if (this.dropdown) {
            this.dropdown.style.display = 'none';
        }
        this.currentSuggestions = [];
        this.selectedIndex = -1;
    }

    async selectSuggestion(suggestion) {
        this.hideSuggestions();

        try {
            const place = suggestion.placePrediction.toPlace();
            await place.fetchFields({ fields: ['addressComponents'] });

            const addressComponents = place.addressComponents;
            if (addressComponents?.length > 0) {
                this.populateFormFields(addressComponents);
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    }

    populateFormFields(addressComponents) {
        // Parse address components
        let street = '', city = '', countryCode = '', postalCode = '';

        addressComponents.forEach(component => {
            const types = component.types || [];
            if (types.includes('route')) {
                street = component.longText || component.long_name || '';
            } else if (types.includes('locality') || types.includes('sublocality')) {
                city = component.longText || component.long_name || '';
            } else if (types.includes('country')) {
                countryCode = component.shortText || component.short_name || '';
            } else if (types.includes('postal_code')) {
                postalCode = component.longText || component.long_name || '';
            }
        });

        // Set country first
        if (countryCode) {
            const countrySelect = document.getElementById('shipping_country_code');
            if (countrySelect) {
                countrySelect.value = countryCode;
                countrySelect.dispatchEvent(new Event('change'));
            }
        }

        // Set other fields after delay
        setTimeout(() => {
            this.setFieldValue('street', street);
            this.setFieldValue('shipping_city', city);
            this.setFieldValue('shipping_postcode', postalCode);
        }, this.config.addressFillDelay);
    }

    setFieldValue(selector, value) {
        if (!value) return;

        const field = document.getElementById(selector);
        if (field) {
            field.value = value;
            field.dispatchEvent(new Event('change'));
        }
    }
}

// Add this utility function at the top of the file
function initializeAutocompleteWhenReady(container, selector) {
    const observer = new MutationObserver((mutations) => {
        const streetInput = container.querySelector(selector);
        if (streetInput) {
            observer.disconnect();
            try {
                const autocompleteService = new AddressAutocompleteService(streetInput);
                autocompleteService.initialize();
            } catch (error) {
                console.error('Failed to enhance shipping form with autocomplete:', error);
            }
        }
    });

    // Check immediately first
    const streetInput = container.querySelector(selector);
    if (streetInput) {
        try {
            const autocompleteService = new AddressAutocompleteService(streetInput);
            autocompleteService.initialize();
        } catch (error) {
            console.error('Failed to enhance shipping form with autocomplete:', error);
        }
        return;
    }

    // Start observing if not found immediately
    observer.observe(container, {
        childList: true,
        subtree: true
    });
}

export { initializeAutocompleteWhenReady };

