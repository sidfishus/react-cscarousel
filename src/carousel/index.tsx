import React from "react";
import "./carousel.scss";
/*
import {MutableRefObject, ReactNode, useRef, useState} from "react";
import "../Styles/GalleryComponent.scss";
import {DispatchSetStateAction} from "../Library/State";
import {DelayedFunction, ResettableTimer} from "../Library/ResettableTimer";
import WhiteChevronLeft from "../Images/white-chevron-left.svg";
import WhiteChevronRight from "../Images/white-chevron-right.svg";
import LoadingSvg from "../Images/Blocks-0.5s-88px.svg";
import CrossStaticSvg from "../Images/cross.static.svg";

export type SetSelectedImageFunc<IMAGE_T extends GalleryImage> = (idx: number, image: IMAGE_T) => void;

export type OnDeleteImageFunc<IMAGE_T extends GalleryImage> = (idx: number, image: IMAGE_T) => void;

export type GalleryComponentSelectionProps = SelectionProps & {
    coordsImageId: number|null;
}

export type GalleryComponentProps<IMAGE_T extends GalleryImage> = {
    images: IMAGE_T[];
    selectedId: number;
    setSelectedImage: SetSelectedImageFunc<IMAGE_T>;
    imageDir?: string;
    thumbnailDir?: string;
    isStatic: boolean;
    showThumbnails?: boolean|undefined;
    showChevrons?: boolean|undefined;
    autoChangeMs?: number;
    OnClick?: (()=>void|undefined);
    loadImage: (url: string) => Promise<string>;
    shouldLoad: boolean;
    autoLoadLeftAndRightImages?: boolean;
    onDelete?: OnDeleteImageFunc<IMAGE_T>;

    selection?: GalleryComponentSelectionProps;
}

export type GalleryImage = {
    src: string;
    id: number;
    allowDelete?: boolean;
}

type ImageLoadingState = {
    loadedSrc: string|null;
    error: boolean;
    isLoading: boolean;
}

type GalleryImageNonState = {
    loadingIdList: Set<number>;
    selectedId: number;
}

type GalleryState = {
    loadingState: Map<number /* Image ID */,ImageLoadingState>;
}

export function GalleryComponent<IMAGE_T extends GalleryImage>(props: GalleryComponentProps<IMAGE_T>) {

    const { showChevrons, OnClick } = props;

    const [imageState,SetImageState] = useState(() => CreateDefaultState(props));

    const imageNonState=useRef<GalleryImageNonState>({
        selectedId: props.selectedId,
        loadingIdList: new Set<number>()
    });
    // useRef's persist after a component has been removed from the DOM
    if(imageNonState.current.selectedId !==props.selectedId) {
        imageNonState.current.selectedId = props.selectedId;
    }

    const delaySetSelectedImage=ResettableTimer();

    // We need to be able to reference the carousel in various places
    const carouselRef=useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>;

    console.log("Render carousel: ");

    const rv=(
        <>
            <Carousel imageState={imageState} SetImageState={SetImageState}
                      imageNonState={imageNonState} delaySetSelectedImage={delaySetSelectedImage}
                      carouselRef={carouselRef}
                      showChevrons={showChevrons}
                      OnClick={OnClick} mainProps={props}
            />

            {/*{showThumbnails &&*/}
            {/*    <Thumbnails {...props} imageState={imageState} SetImageState={SetImageState}*/}
            {/*                carouselRef={carouselRef}*/}
            {/*    />}*/}

        </>
    );

    return rv;
}

function GallerySelection<IMAGE_T extends GalleryImage>(
    mainProps: GalleryComponentProps<IMAGE_T>): ReactNode|null {

    const { selection } = mainProps;

    const { xAsPercentage, yAsPercentage, drawFunc } = selection!;

    if(!xAsPercentage || !yAsPercentage)
        return null;

    return drawFunc(xAsPercentage, yAsPercentage);
}

const CreateDefaultState = <IMAGE_T extends GalleryImage,> (props: GalleryComponentProps<IMAGE_T>): GalleryState => {
    const { images } = props;

    const rv={
        loadingState: new Map<number,ImageLoadingState>()
    }

    images.forEach(iterImg => {

        rv.loadingState.set(iterImg.id,{
            loadedSrc: null,
            error: false,
            isLoading: false
        });
    });

    return rv;
}

type CarouselProps<IMAGE_T extends GalleryImage,> = {
    mainProps: GalleryComponentProps<IMAGE_T>;
    imageState: GalleryState;
    SetImageState: DispatchSetStateAction<GalleryState>;
    imageNonState: MutableRefObject<GalleryImageNonState>;
    delaySetSelectedImage: DelayedFunction;
    carouselRef: MutableRefObject<HTMLDivElement>;
    showChevrons?: boolean|undefined;
    //sidtodo remove
    OnClick?: (()=>void|undefined);
}

function Carousel<IMAGE_T extends GalleryImage>(props: CarouselProps<IMAGE_T>) {

    const { imageState, SetImageState, imageNonState, delaySetSelectedImage, carouselRef,
        showChevrons, OnClick, mainProps } = props;

    const { images } = mainProps;

    const CarouselScroll =
        ()=>OnCarouselScroll(mainProps,carouselRef, delaySetSelectedImage, imageNonState, imageState, images);

    const ScrollLeft = () => {
        ShowImage(mainProps, curIdx=> GetCarouselImageLeftIdx(curIdx, images), carouselRef,false, "smooth", imageNonState);
    }

    const ScrollRight = () => {
        ShowImage(mainProps, curIdx=> GetCarouselImageRightIdx(curIdx, images), carouselRef,false, "smooth", imageNonState);
    }

    return (
        <>
            <div style={{position: "relative"}}>
                <div ref={carouselRef} className={"GalleryComponentContainer"}
                     onScroll={CarouselScroll}>

                    {images.map((iterImg,idx) => {
                        return (
                            <GalleryImageComponent idx={idx} state={imageState}
                                                   SetState={SetImageState}
                                                   key={idx} loadingNonState={imageNonState}
                                                   carouselRef={carouselRef}
                                                   OnClick={OnClick} mainProps={mainProps}
                            />
                        );
                    })}
                </div>

                {showChevrons && images.length > 1 && <img src={WhiteChevronLeft}
                                                           className={"GalleryComponentImageLeftChevron"}
                                                           onClick={ScrollLeft}
                />}

                {showChevrons && images.length > 1 && <img src={WhiteChevronRight}
                                                           className={"GalleryComponentImageRightChevron"}
                                                           onClick={ScrollRight}
                />}
            </div>
        </>
    );
}

const GetCarouselImageLeftIdx = (idx: number, images: GalleryImage[]): number => {
    return (idx === 0 ? images.length -1 : idx-1);
}

const GetCarouselImageRightIdx = (idx: number, images: GalleryImage[]): number => {
    return (idx === (images.length -1) ? 0 : idx+1);
}

const OnCarouselScroll = <IMAGE_T extends GalleryImage,>(
    mainProps: GalleryComponentProps<IMAGE_T>, ref: MutableRefObject<HTMLDivElement>,
    delaySetSelectedImage: DelayedFunction,nonState: MutableRefObject<GalleryImageNonState>, imageState: GalleryState,
    images: GalleryImage[]): void => {

    const imagesDisplayed=GetImagesDisplayed(ref, images);
    let allImagesLoaded=true;
    imagesDisplayed.forEach(iterIdx => {

        const imageId=images[iterIdx]!.id;

        if(!imageState.loadingState.get(imageId)!.loadedSrc) {
            allImagesLoaded=false;
        }
    });

    if(allImagesLoaded)
        SetCurrentImage(mainProps,imagesDisplayed[0]!, nonState);
    else {
        // This is so we don't try to load lots of images whilst we're scrolling through them.
        delaySetSelectedImage(() => {
            SetCurrentImage(mainProps, GetCurrentImageIndex(ref), nonState);
        }, 200);
    }
}

const GetClientXInRelationToImageIndex = (x: number, imgIndex: number, carousel: HTMLDivElement) => {

    return (imgIndex*carousel.offsetWidth) + x;
}

const SetCurrentImage = <IMAGE_T extends GalleryImage,>(
    mainProps: GalleryComponentProps<IMAGE_T>, index: number,
    nonState: MutableRefObject<GalleryImageNonState>): void => {

    const { setSelectedImage, images } = mainProps;

    const image=images[index]!;

    if(image.id !== nonState.current.selectedId) {

        nonState.current.selectedId=image.id;
        setSelectedImage(index, image);
    }
}

const ShowImage = <IMAGE_T extends GalleryImage,>(
    mainProps: GalleryComponentProps<IMAGE_T>, getIdx: (idx: number)=>number,
    carouselRef: MutableRefObject<HTMLDivElement>, scrollVertical: boolean, scrollBehaviour: ScrollBehavior,
    galleryImageNonState: MutableRefObject<GalleryImageNonState>) => {

    const { images } = mainProps;

    const currentIndex=images.findIndex(iterImage => iterImage.id === galleryImageNonState.current.selectedId);

    const newIdx=getIdx(currentIndex);

    if(scrollVertical)
        window.scrollTo(0, 0);

    const scrollX=GetClientXInRelationToImageIndex(0,newIdx,carouselRef.current);
    console.log("scroll x: " + scrollX + ", new Idx: " + newIdx + ", " + scrollBehaviour);

    carouselRef.current.scrollTo({
        left: scrollX,
        top: 0,
        behavior: scrollBehaviour});
};

const ImageIndexIsDisplayedOrNextToDisplayed = (carouselRef: MutableRefObject<HTMLDivElement>, images: GalleryImage[], idx: number): boolean => {

    if(images.length === 1)
        return true;

    const displayedImages=GetImagesDisplayed(carouselRef,images);

    const leftIdx=GetCarouselImageLeftIdx(idx,images);

    const rightIdx=GetCarouselImageRightIdx(idx,images);

    if(displayedImages[0] === idx || displayedImages[0] === leftIdx || displayedImages[0] === rightIdx)
        return true;

    if(displayedImages.length === 1)
        return false;

    return (displayedImages[1] === idx || displayedImages[1] === leftIdx || displayedImages[1] === rightIdx);
}

const ImageIndexIsDisplayed = (carouselRef: MutableRefObject<HTMLDivElement>, images: GalleryImage[], idx: number): boolean => {

    if(images.length === 1)
        return true;

    const displayedImages=GetImagesDisplayed(carouselRef,images);

    console.log(displayedImages);

    if(displayedImages[0] === idx)
        return true;

    return (displayedImages.length === 2 && displayedImages[1] === idx);
}

const GetImagesDisplayed = (carouselRef: MutableRefObject<any>, images: GalleryImage[]): number[] => {
    const scrollX=carouselRef.current?.scrollLeft;
    const imageWidth=carouselRef.current.offsetWidth;

    const currentIdxWithDecimal=scrollX/imageWidth;
    const currentIdx=Math.round(currentIdxWithDecimal);
    const percentageOfLessProminentImage=currentIdxWithDecimal-currentIdx;

    if(Math.abs(percentageOfLessProminentImage)<0.01) {
        return [currentIdx];
    }

    if(percentageOfLessProminentImage<0) {
        return [currentIdx, GetCarouselImageLeftIdx(currentIdx,images)];
    }

    return [currentIdx, GetCarouselImageRightIdx(currentIdx,images)];
}

const GetCurrentImageIndex = (carouselRef: MutableRefObject<any>) => {
    const scrollX=carouselRef.current?.scrollLeft;
    const imageWidth=carouselRef.current.offsetWidth;

    let currentIdx=Math.round(scrollX/imageWidth);

    const diff=scrollX - (currentIdx * imageWidth);
    if(diff > (imageWidth / 2)) {
        currentIdx = currentIdx + 1;
    }

    return currentIdx;
}

const SetSelectedCoords = <IMAGE_T extends GalleryImage>(
    e: React.MouseEvent<HTMLImageElement,MouseEvent>, mainProps: GalleryComponentProps<IMAGE_T>) => {

    const { selection } = mainProps;

    if(!selection)
        return;

    const { setSelectedCoords, clientPadding, clientLength } = selection!;

    // Get the bounding rectangle of target
    const target=e.target;
    const boundingClientRect = target
        //@ts-ignore
        .getBoundingClientRect();

    // Mouse position
    let clientX = e.clientX - boundingClientRect.left;
    let clientY = e.clientY - boundingClientRect.top;

    const [xAsPercentage,yAsPercentage]=ConvertClientCoords(clientPadding,clientX, clientY,
        boundingClientRect.width, boundingClientRect.height,clientLength);

    setSelectedCoords(xAsPercentage,yAsPercentage);
}

type GalleryImageComponentProps<IMAGE_T extends GalleryImage> = {
    mainProps: GalleryComponentProps<IMAGE_T>;
    idx: number;
    state: GalleryState;
    SetState: DispatchSetStateAction<GalleryState>;
    loadingNonState: MutableRefObject<GalleryImageNonState>;
    carouselRef: MutableRefObject<HTMLDivElement>;
    OnClick?: (()=>void|undefined);
};

function GalleryImageComponent<IMAGE_T extends GalleryImage>(props: GalleryImageComponentProps<IMAGE_T>) {

    const { idx, carouselRef, state, loadingNonState, SetState, mainProps } = props;

    const { loadImage, shouldLoad, autoLoadLeftAndRightImages, images, selection } = mainProps;

    const { loadingState } = state;

    const image=images[idx]!;

    const imageLoadingState = loadingState.get(image.id)!;

    if(imageLoadingState.loadedSrc) {

        let onClick = undefined;
        if (!imageLoadingState.error) {
            if (image.id === mainProps.selectedId) {
                onClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => SetSelectedCoords(e, mainProps);
            }
        }

        return (
            <span className={"GalleryComponentSelectedCoordsImageContainer"}>
                <img src={imageLoadingState.loadedSrc} className={"GalleryComponentImageContainer"} onClick={onClick} />
                {!imageLoadingState.isLoading && selection?.coordsImageId === image.id && GallerySelection(mainProps)}
                {image.allowDelete && <ImageDeleteButton mainProps={mainProps} idx={idx} />}
            </span>
        );
    }

    if (!loadingNonState.current.loadingIdList.has(image.id) && shouldLoad
        && (!imageLoadingState.loadedSrc || imageLoadingState.error)) {

        if(ShouldLoadImage(carouselRef, autoLoadLeftAndRightImages, images, idx)) {

            loadingNonState.current.loadingIdList.add(image.id);

            loadImage(ImageFullUrl(mainProps,image)).then((url: string) => {
                loadingNonState.current.loadingIdList.delete(image.id);
                SetState(curState => MutateStateSetImageLoadedState(curState, {
                    loadedSrc: url,
                    error: false,
                    isLoading: false
                }, image.id, true));
            }).catch(() => {
                loadingNonState.current.loadingIdList.delete(image.id);

                //sidtodo create a better icon on loading.io
                SetState(curState => MutateStateSetImageLoadedState(curState, {
                    loadedSrc: "/Images/fail-1.1s-200px.svg",
                    error: true,
                    isLoading: false
                }, image.id, true));
            });

            // Don't show the loading icon until after 100ms
            if(!carouselRef.current && idx === 0) {

                // Show the loading SVG if the image is not loaded in 100 ms
                setTimeout(() => {
                    SetState(curState =>MutateStateSetImageLoadedState(curState, {
                        loadedSrc: LoadingSvg,
                        error: false,
                        isLoading: true
                    }, image.id, false));
                }, 100);

                return (
                    <span className={"GalleryComponentImageContainer GalleryComponentSelectedCoordsImageContainer"} />
                );
            }
        }
    }

    return (
        <span className={"GalleryComponentSelectedCoordsImageContainer"}>
            <img src={LoadingSvg} className={"GalleryComponentImageContainer"} />
        </span>
    );
};

type ImageDeleteButtonProps<IMAGE_T extends GalleryImage> = {
    mainProps: GalleryComponentProps<IMAGE_T>;
    idx: number;
};

function ImageDeleteButton<IMAGE_T extends GalleryImage>(props: ImageDeleteButtonProps<IMAGE_T>) {

    const { mainProps,idx } = props;
    const { images } = mainProps;

    const onDelete = mainProps.onDelete
        ? ()=>mainProps.onDelete!(idx, images[idx]!)
        : undefined;

    return (
        <img className="GalleryComponentImageDeleteIcon" src={CrossStaticSvg} onClick={onDelete} />
    );
}

const ShouldLoadImage =
    (carouselRef: MutableRefObject<HTMLDivElement>, autoLoadLeftAndRightImages: boolean|undefined,
     images: GalleryImage[], idx: number) => {

        // If there's no ref then this is the first time we have drawn the UI
        if(!carouselRef.current) {
            if(!autoLoadLeftAndRightImages)
                return idx === 0;

            const leftIdx=GetCarouselImageLeftIdx(idx, images);
            const rightIdx=GetCarouselImageRightIdx(idx, images);

            return idx === 0 || leftIdx === 0 || rightIdx === 0;
        }

        if(autoLoadLeftAndRightImages)
            return ImageIndexIsDisplayedOrNextToDisplayed(carouselRef, images, idx);

        return ImageIndexIsDisplayed(carouselRef, images, idx);
    }

const MutateStateSetImageLoadedState = (  state: GalleryState, imageLoadingState: ImageLoadingState, imageId: number
    , overwrite: boolean): GalleryState => {

    if(!overwrite) {
        const loadingStateForImage=state.loadingState.get(imageId)!;

        if(loadingStateForImage.loadedSrc || loadingStateForImage.error) // No change
            return state;
    }

    const loadingCopy=new Map<number,ImageLoadingState>();
    state.loadingState.forEach((iterLoadingState, iterImageId) => {

        if(iterImageId !== imageId)
            loadingCopy.set(iterImageId, iterLoadingState);

        else {
            loadingCopy.set(iterImageId,{
                ...iterLoadingState,
                ...imageLoadingState
            });
        }
    });

    const rv= {
        ...state,
        loadingState: loadingCopy
    }

    return rv;
}

function ImageFullUrl<IMAGE_T extends GalleryImage>(props: GalleryComponentProps<IMAGE_T>, img: GalleryImage): string {
    if(props.imageDir)
        return props.imageDir + img.src;

    return img.src;
}
*/