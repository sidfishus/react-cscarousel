# react-cscarousel
A re-usable responsive React carousel component.

# Notes
- Lazy loading: Files are lazy loaded to make the component more responsive, and avoid downloading files which are not displayed.
- File order: Files are displayed in the order they are presented in the **files** array prop. This means that the file at index 0 is the first displayed file in the carousel.
- Thumbnails: If used alongside a list of thumbnails, it is recommended that the thumbnail images are created separately and with a reduced size. Otherwise this will default the lazy loading aspect of the carousel.

# Exported Functions
- **ShowFileFromIndex**: Programatically scroll the carousel to the file at the specified index.

# Dependencies
- React 19+ (peer).
- react-cslib (peer): https://github.com/sidfishus/react-cslib.
- @sidfishus/cslib (peer): https://github.com/sidfishus/cslib.

# To Install
npm install react-cscarousel react-cslib @sidfishus/cslib

# props
- **files**: *FILE_T[]*: The list of files to display.
- **selectedId**: *bigint|null*: The ID of the selected file. If null, defaults to the first file.
- **setSelectedFile**: *SetSelectedFileFunc<FILE_T>*: Callback to update the selected file. 
- **fileDir?**: *string*: An optional source file directory which is prefixed to the file source for brevity if specified.
- **autoChangeMs?**: *number*: If specified, automatically scrolls to the next image on the right every *autoChangeMs* milliseconds.
- **loadFileOverride?**: *(url: string) => Promise<string>*: Override loading files. Useful if the file get URL requires an auth header and must be manually loaded.
- **shouldLoad**: *boolean*: Override whether or not files should be loaded.
- **autoLoadLeftAndRightFiles?**: *boolean*: Loads the files to the immediate left and right hand sides of the current displayed file. Defaults to true if not specified.
- **additionalFileClass?**: ((isLoading: boolean)=>string*: Additional file class name.
- **additionalFileContainerClass?**: *string*: Additional file container class name.
- **loadingFileUrl**: *string*: URL to the loading image.
- **chevronUrl?**: *string*: URL to the chevron image, if the ability to scroll files left and right is enabled.
- **overrideLeftChevronClass?**: *string*: Override the class of the left chevron.
- **overrideRightChevronClass?**: *string*: Override the class of the right chevron.
- **ref**: *RefObject<HTMLDivElement>*: The ref of the carousel div (instanciated via React.useRef).
