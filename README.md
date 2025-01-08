# react-cscarousel
A re-usable responsive React carousel component.

# Notes
- Lazy loading: Files are lazy loaded to make the component more responsive, and avoid downloading files which are not displayed.
- File order: Files are displayed in the order they are presented in the **files** array prop. This means that the file at index 0 is the first displayed file in the carousel.
- Thumbnails: If used alongside a list of thumbnails, it is recommended that the thumbnail images are created separately and with a reduced size. Otherwise this will default the lazy loading aspect of the carousel.
- Styles: Don't forget to import "react-cscarousel/dist/styles.scss" otherwise the styling won't work!

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

# Example

Index.tsx
```
<div style={{width: "calc(100% - 20px)", margin: "auto"}}>

    <div style={{width: "620px", margin: "auto"}}>
        <Carousel
            files={bmsImages}
            selectedId={imageId}
            setSelectedFile={setGallerySelectedImage}
            shouldLoad={true}
            fileDir={"/src/images/bms/"}
            additionalFileClass={(isLoading)=> isLoading ? "BMSFileLoading" : "BMSFile"}
            additionalFileContainerClass={"BMSFileContainer"}
            loadingFileUrl={"Spinner-1s-300px.svg"}
            chevronUrl={"../orange-chevron-left.svg"}
            ref={carouselRef}
            autoChangeMs={10000}
            overrideLeftChevronClass={"BMSFileLeftChevron"}
            overrideRightChevronClass={"BMSFileRightChevron"}
        />
    </div>

    <br />

    <FileGrid
        fileDir={"/src/images/bms/"}
        files={thumbnails}
        selectedIndex={(imageId === null ? 0 : bmsImages.findIndex(img => img.id === imageId))}
        onClick={idx => ShowFileFromIndex(carouselRef.current,idx,"smooth")}
    />

</div>
```

Index.scss
```
.BMSFileContainer {
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.BMSFile,.BMSFileLoading {
  border-radius: 5px;

  border: white solid 1.5px;
  box-shadow: 0 0 0 1px black;
}

.BMSFileLeftChevron,.BMSFileRightChevron {
  width: 100px;
  position: absolute;
  z-index: 5;

  top: calc(50% - (100px / 2));

  cursor: pointer;
}

.BMSFileLeftChevron {
  left: 30px;
}

.BMSFileRightChevron {
  right: 30px;
  transform: rotate(-180deg);
}

.BMSFileLeftChevron:active,.BMSFileRightChevron:active {
  opacity: 25%;
}
```

Produces
![Carousel with thumbnails](https://github.com/sidfishus/react-cscarousel/blob/main/carousel-example.png)
