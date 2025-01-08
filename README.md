# react-cscarousel
A re-usable responsive React carousel component.

# To Install
npm install react-cscarousel react-cslib @sidfishus/cslib

# props
- **files**: *FILE_T[]*:
- **selectedId**: *bigint|null*:
- **setSelectedFile**: *SetSelectedFileFunc<FILE_T>*:
- **fileDir?**: *string*:
- **showThumbnails?**: *boolean|undefined*:
- **autoChangeMs?*: number*:
- **loadFileOverride?**: *(url: string) => Promise<string>*: // The return is used as the image source.
- **shouldLoad**: *boolean*: // Allows the client to override whether files should be loaded.
- **autoLoadLeftAndRightFiles?**: *boolean*: // Defaults to true if not specified
- **additionalFileClass?**: ((isLoading: boolean)=>string*:
- **additionalFileContainerClass?**: *string*:
- **loadingFileUrl**: *string*:
- **chevronUrl?**: *string*:
- **overrideLeftChevronClass?**: *string*:
- **overrideRightChevronClass?**: *string*:
- **ref**: *RefObject<HTMLDivElement>*:
