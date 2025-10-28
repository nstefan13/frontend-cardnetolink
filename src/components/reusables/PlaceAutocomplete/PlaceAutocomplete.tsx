import { useMapsLibrary, APIProvider as GoogleMapsApiProvider } from '@vis.gl/react-google-maps';
import React, { CSSProperties, RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            'gmp-place-autocomplete': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
        }
    }
}

export interface PlaceAutcompleteProps {
    // Invoked after the user selects a place.
    // Receives the google.maps.places.Place (or null/undefined) — only the properties
    // requested via `fields` will be populated.
    onPlaceSelect: (place?: google.maps.places.Place) => void;

    // Names of place fields to retrieve when a selection occurs.
    // See Google Places documentation for available field names.
    fields: string[],

    // Ref to an external HTML input element whose value is forwarded to the
    // Google Places autocomplete input to trigger suggestions.
    inputRef: RefObject<HTMLInputElement | null>,
}

// Utility function which loads the Google Maps places library, opens the
// Shadow DOM of its autocomplete component calls the custom `mixin` function
// on it for extra manipulation
function loadPlacesLibrary(mixin: (root: ShadowRoot) => ShadowRoot) {
    const originalAttachShadow = Element.prototype.attachShadow;
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query: string) {
        if (query === "only screen and (max-width: 450px)") {
            console.warn("Overwriting matchMedia", this);
            return originalMatchMedia('(min-width: 9999px)');
        }
        return originalMatchMedia.call(this, query);
    };

    /// Monkey-patch the attachShadow function to open the shadow DOM.
    /// This allows us to execute arbitrary code (that can be provided via
    /// the `mixin` parameter) which can be used to style the component
    /// before the first render.
    (Element.prototype as any).attachShadow = function(options: any) {
        if (options && options.mode === "closed") {
            console.warn("Forcing closed shadow DOM to open:", this);
            const root = originalAttachShadow.call(this, { ...options, mode: "open" });
            return mixin(root);
        }
        return originalAttachShadow.call(this, options);
    };

    /// Load the places library (this will use the .attachShadow
    /// function we previously patched )
    const places = useMapsLibrary('places');

    /// Cleanup: After the library was load we have no need to keep the modified
    /// .attachShadow method, so we restore it
    useLayoutEffect(() => {
        if (!places) return;
        (Element.prototype as any).attachShadow = originalAttachShadow;
        window.matchMedia = originalMatchMedia;
    }, [places])
}

// Utility function which just adds some custom styles to a Shadow Root element
function modifyStyle(root: ShadowRoot) {
    const stylesheet = `
    /* Hello from the shadows */
    :host {
        color-scheme: none !important;
    }
    
    .autocomplete-icon,
    .clear-button,
    .input-container,
    .focus-ring {
        display: none !important;
    }
    
    .place-autocomplete-element-text-div {
        text-align: start !important;
    }
    `;

    const styleNode = document.createElement('style');
    styleNode.textContent = stylesheet;
    root.prepend(styleNode);
    return root;
}

function PlaceAutocomplete({ onPlaceSelect, fields, inputRef }: PlaceAutcompleteProps) {
    /// Load the places library and modify the styling of the component
    loadPlacesLibrary((root) => {
        modifyStyle(root);
        return root;
    });
    const elRef = useRef<google.maps.places.PlaceAutocompleteElement>(null);

    /// Whenever a place was selected, we extract the useful information and pass it
    /// down to `onPlaceSelect`
    const handlePlaceSelect = useCallback(async (e: any) => {
        if (!e?.placePrediction?.toPlace) return;
        const place = e.placePrediction.toPlace();

        if (!place?.fetchFields) return;
        const resp = await place.fetchFields({ fields });

        onPlaceSelect(resp.place)
    }, [onPlaceSelect]);

    useLayoutEffect(() => {
        if (!elRef.current?.shadowRoot || !inputRef.current) return;

        const inputBox = elRef.current.shadowRoot.querySelector('input')!;
        const externalInput = inputRef.current;
        
        // Track previous value to detect deletions
        let previousValue = externalInput.value;
        function forwardKeyEvent(e: KeyboardEvent) {
            // For arrow keys, Enter, and Esc - prevent the external input from handling them
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Esc') {
                e.preventDefault();
                e.stopPropagation();
                
                // Map key names for consistency
                let mappedKey = e.key;
                let keyCode, which;
                
                switch (e.key) {
                    case 'ArrowDown':
                        keyCode = 40;
                        which = 40;
                        break;
                    case 'ArrowUp':
                        keyCode = 38;
                        which = 38;
                        break;
                    case 'Enter':
                        keyCode = 13;
                        which = 13;
                        break;
                    case 'Escape':
                    case 'Esc': // Some browsers might use 'Esc'
                        mappedKey = 'Escape';
                        keyCode = 27;
                        which = 27;
                        break;
                    default:
                        keyCode = e.keyCode;
                        which = e.which;
                }
                
                // Create a proper event for the Google Places input
                const newEvent = new KeyboardEvent(e.type, {
                    key: mappedKey,
                    code: e.code,
                    keyCode: keyCode,
                    which: which,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    view: window
                });
                
                // Set readonly properties
                Object.defineProperty(newEvent, 'keyCode', { value: keyCode });
                Object.defineProperty(newEvent, 'which', { value: which });
                
                // console.log('Forwarding key:', mappedKey, newEvent);
                inputBox.dispatchEvent(newEvent);
                
                // Also try dispatching on the custom element itself
                elRef.current?.dispatchEvent(newEvent);
                return;
            }
            
            // For Backspace and Delete, forward the keydown but don't prevent default
            // The actual value sync will happen in the input event
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const keyCode = e.key === 'Backspace' ? 8 : 46;
                const which = e.key === 'Backspace' ? 8 : 46;
                
                const newEvent = new KeyboardEvent(e.type, {
                    key: e.key,
                    code: e.code,
                    keyCode: keyCode,
                    which: which,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    view: window
                });
                
                Object.defineProperty(newEvent, 'keyCode', { value: keyCode });
                Object.defineProperty(newEvent, 'which', { value: which });
                
                // console.log('Forwarding deletion key:', e.key, newEvent);
                inputBox.dispatchEvent(newEvent);
                // Don't return here - let the normal input handling proceed
            }
        }

        function forwardInputEvent(e: Event) {
            const currentValue = externalInput.value;
            inputBox.value = currentValue;
            
            // Determine the correct inputType based on value change
            let inputType = 'insertText';
            if (currentValue.length < previousValue.length) {
                inputType = 'deleteContentBackward';
            } else if (currentValue.length > previousValue.length) {
                inputType = 'insertText';
            }
            // Update previous value for next comparison
            previousValue = currentValue;
            
            const newEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                composed: true,
                inputType: inputType
            });
            
            // console.log('Forwarding input event:', inputType, 'value:', currentValue);
            inputBox.dispatchEvent(newEvent);
        }

        /// All input and keydown events will be forwarded to the
        /// google maps input box so that it can show suggestions
        externalInput.addEventListener('input', forwardInputEvent);
        externalInput.addEventListener('keydown', forwardKeyEvent);

        /// These events are dispatched by the gmp-place-autocomplete
        /// element and give us details regarding the selected place
        elRef.current.addEventListener('gmp-select', handlePlaceSelect);
        elRef.current.addEventListener('gmp-placeselect', handlePlaceSelect)

        const el = elRef.current;
        return () => {
            externalInput.removeEventListener('input', forwardInputEvent);
            externalInput.removeEventListener('keydown', forwardKeyEvent);
            el.removeEventListener('gmp-select', handlePlaceSelect);
            el.removeEventListener('gmp-placeselect', handlePlaceSelect);
        };
    }, [inputRef?.current, elRef.current?.shadowRoot]);

    return <div className="place-autocomplete-container">
        <gmp-place-autocomplete
            ref={elRef}
            style={{ border: "0px" }}
        />
    </div>;
}

export default function ({ ...props }: PlaceAutcompleteProps) {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalAppend = HTMLElement.prototype.append;

    (XMLHttpRequest.prototype as any).open = function(method: any, url: any, ...args: any) {
        if (url.includes('googleapis.com')) {
        console.log("INTERCEPT FETCH", url);
        }
        return originalOpen.apply(this, arguments as any);
    };
    (HTMLElement.prototype as any).append = function(...args: any) {
        for (const arg of args) {
            if (arg && arg.src && arg.tagName === "SCRIPT") {
                if (arg.src.includes('googleapis.com')) {
                    console.log("INTERCEPTED SCRIPT", arg.src);
                }
            }
        }
        return originalAppend.call(this, ...args);
    }

    return <GoogleMapsApiProvider apiKey={'AIzaSyCAnKLuvG7GHZt3bfrElzosAQJLYGHo6JU'} version='beta' region='MD'>
        <PlaceAutocomplete {...props as any} />
    </GoogleMapsApiProvider>
};
