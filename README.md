# react-cscarousel
A re-usable responsive React carousel component which lazy loads files.

Dependencies:
- React 19+ (peer).
- react-cslib (peer): https://github.com/sidfishus/react-cslib.
- @sidfishus/cslib (peer): https://github.com/sidfishus/cslib.

# To Install
npm install react-cscarousel react-cslib @sidfishus/cslib

# props
- **files**: *FILE_T[]*: The list of files to display.
- **selectedId**: *bigint|null*: The ID of the selected file. If null, defaults to the first file.
- **setSelectedFile**: *SetSelectedFileFunc<FILE_T>*: Callback to update the selected file. 
- **fileDir?**: *string*: An optional source file directory.
- **autoChangeMs?*: number*: If specified, automatically scrolls to the next image on the right every *autoChangeMs* milliseconds.
- **loadFileOverride?**: *(url: string) => Promise<string>*: Override loading files. Useful if the file get URL requires a bearer token and must be manually loaded.
- **shouldLoad**: *boolean*: Override whether or not files should be loaded.
- **autoLoadLeftAndRightFiles?**: *boolean*: Loads the files to the immediate left and right hand sides of the current displayed file. if this is enabled. Defaults to true if not specified
- **additionalFileClass?**: ((isLoading: boolean)=>string*: Additional file class name.
- **additionalFileContainerClass?**: *string*: Additional file container class name.
- **loadingFileUrl**: *string*: URL to the loading image.
- **chevronUrl?**: *string*: URL to the chevron image, if the ability to scroll files left and right is enabled.
- **overrideLeftChevronClass?**: *string*: Override the class of the left chevron.
- **overrideRightChevronClass?**: *string*: Override the class of the right chevron.
- **ref**: *RefObject<HTMLDivElement>*: The ref of the carousel (instanciated via React.useRef).
