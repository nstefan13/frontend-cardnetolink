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
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    inputRef: RefObject<any>,
}

function loadPlacesLibrary(mixin: (root: ShadowRoot) => ShadowRoot) {
    const originalAttachShadow = Element.prototype.attachShadow;

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
    }, [places])
}

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

&-input {
    width: 70%;

    @media screen and (max-width: 768px) {
       width: 60%;
    }
}
`;

function modifyStyle(root: ShadowRoot) {
    const styleNode = document.createElement('style');
    styleNode.textContent = stylesheet;
    root.prepend(styleNode);
    return root;
}

function PlaceAutocomplete({ onPlaceSelect, inputRef }: PlaceAutcompleteProps) {
    /// Load the places library and modify the styling of the component
    loadPlacesLibrary((root) => {
        const ret = modifyStyle(root);
        return ret;
    });
    const elRef = useRef<google.maps.places.PlaceAutocompleteElement>(null);

    /// Whenever a place was selected, we extract the useful information and pass it
    /// down to `onPlaceSelect`
    const handlePlaceSelect = useCallback((e: any) => {
        console.log(e);
    }, [onPlaceSelect]);

    useLayoutEffect(() => {
        if (!elRef.current?.shadowRoot || !inputRef.current) return;

        const inputBox = elRef.current.shadowRoot.querySelector('input')!;
        const externalInput = inputRef.current;
        function forwardEvent(e: KeyboardEvent) {
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
                
                console.log('Forwarding key:', mappedKey, newEvent);
                inputBox.dispatchEvent(newEvent);
                
                // Also try dispatching on the custom element itself
                elRef.current?.dispatchEvent(newEvent);
                return;
            }
            
            // For other keys, forward normally but ensure value is synced
            inputBox.value = externalInput.value;
            const newEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                composed: true,
                inputType: 'insertText'
            });
            inputBox.dispatchEvent(newEvent);
        }

        /// All input and keydown events will be forwarded to the
        /// google maps input box so that it can show suggestions
        externalInput.addEventListener('input', forwardEvent);
        externalInput.addEventListener('keydown', forwardEvent);

        /// These events are dispatched by the gmp-place-autocomplete
        /// element and give us details regarding the selected place
        elRef.current.addEventListener('gmp-select', handlePlaceSelect);
        elRef.current.addEventListener('gmp-placeselect', handlePlaceSelect)

        const el = elRef.current;
        return () => {
            externalInput.removeEventListener('input', forwardEvent);
            externalInput.removeEventListener('keydown', forwardEvent);
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
        // console.log(url);
        /// Same, forward this request to our proxy, which will add
        /// the required API_KEY
        return originalOpen.apply(this, arguments as any);
    };
    (HTMLElement.prototype as any).append = function(...args: any) {
        for (const arg of args) {
            if (arg && arg.src && arg.tagName === "SCRIPT") {
                if (arg.src.includes('maps.googleapis.com')) {
                    /// Now forward this request to our proxy, which will
                    /// add the required API_KEY
                    // console.log("INTERCEPTED ", arg.src);
                }
            }
        }
        return originalAppend.call(this, ...args);
    }

    /// Mai ai de:
    ///     2. Autocomplete the fields
    ///     3. Fix the jitter of the input textbox
    ///     1. Stilizat Input
    return <GoogleMapsApiProvider apiKey={'AIzaSyCAnKLuvG7GHZt3bfrElzosAQJLYGHo6JU'} version='beta'>
        <PlaceAutocomplete {...props as any} />
    </GoogleMapsApiProvider>
};
