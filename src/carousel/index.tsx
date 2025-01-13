import {RefObject, useEffect, useRef, useState} from "react";
import {DispatchSetStateAction} from "react-cslib";
import {DelayedFunction, ResettableTimer} from "@sidfishus/cslib";
import "./index.scss";

export type SetSelectedFileFunc<FILE_T extends CarouselFileDetails> = (idx: number, file: FILE_T) => void;

export type CarouselProps<FILE_T extends CarouselFileDetails> = {
    files: FILE_T[];
    selectedId: bigint|null;
    setSelectedFile: SetSelectedFileFunc<FILE_T>;
    fileDir?: string;
    autoChangeMs?: number;
    loadFileOverride?: (url: string) => Promise<string>; // The return is used as the image source.
    shouldLoad: boolean; // Allows the client to override whether files should be loaded.
    autoLoadLeftAndRightFiles?: boolean; // Defaults to true if not specified
    additionalFileClass?: (isLoading: boolean)=>string;
    additionalFileContainerClass?: string;
    loadingFileUrl: string;
    chevronUrl?: string;
    overrideLeftChevronClass?: string;
    overrideRightChevronClass?: string;
    ref: RefObject<HTMLDivElement>;
    onFileClick?: (idx: number, file: FILE_T) => void;
}

export type CarouselFileDetails = {
    src: string;
    id: bigint;
    additionalClass?: string;
}

type FileLoadingState = {
    src: string|null;
    error: boolean;
    isLoading: boolean;
}

type FileNonState = {
    loadingIdList: Set<bigint>;
    selectedId: bigint;
}

type CarouselState = {
    loadingState: Map<bigint /* File ID */,FileLoadingState>;
}

export function Carousel<FILE_T extends CarouselFileDetails>(props: CarouselProps<FILE_T>) {

    const { files, chevronUrl, autoChangeMs } = props;

    const [fileState,SetFileState] = useState(() => CreateDefaultState(props));

    const fileNonState=useRef<FileNonState>({
        selectedId: (props.selectedId === null ? files[0].id : props.selectedId),
        loadingIdList: new Set<bigint>()
    }).current;

    const delaySetSelectedFile=ResettableTimer();

    const carouselRef=props.ref;

    const CarouselScroll =
        carouselRef.current
            ? ()=>OnCarouselScroll(props,carouselRef.current, delaySetSelectedFile, fileNonState, fileState, files)
            : undefined;


    const ScrollLeft = () => {
        ShowFile(props, curIdx=> GetCarouselFileLeftIdx(curIdx, files), carouselRef.current,false, "smooth", fileNonState);
    }

    const ScrollRight = () => {
        ShowFile(props, curIdx=> GetCarouselFileRightIdx(curIdx, files), carouselRef.current,false, "smooth", fileNonState);
    }

    const getChevronClass = props.overrideLeftChevronClass
        ? (isLeft: boolean)=>
            (isLeft ? props.overrideLeftChevronClass : props.overrideRightChevronClass)
        : (isLeft: boolean)=> isLeft ? "CarouselChevronLeft" : "CarouselChevronRight";

    const showChevrons = !!chevronUrl && files.length > 1;

    if(autoChangeMs) {

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const interval = setInterval(ScrollRight, autoChangeMs);
            return () => clearInterval(interval);
        }, [autoChangeMs]);
    }

    return (
        <div style={{position: "relative"}}>
            <div ref={carouselRef} className={"CarouselContainer"}
                 onScroll={CarouselScroll}>

                {files.map((_,idx) => {
                    return (
                        <GalleryFileComponent
                            idx={idx} state={fileState} SetState={SetFileState} key={idx}
                            loadingNonState={fileNonState} carouselRef={carouselRef.current} mainProps={props}
                        />
                    );
                })}
            </div>

            {showChevrons &&
                <>
                    <img src={FileFullUrl(props, chevronUrl)}
                         className={getChevronClass(true)}
                         onClick={ScrollLeft}
                    />
                    <img src={FileFullUrl(props, chevronUrl)}
                         className={getChevronClass(false)}
                         onClick={ScrollRight}
                    />
                </>
            }
        </div>
    );
}

const CreateDefaultState = <FILE_T extends CarouselFileDetails,> (props: CarouselProps<FILE_T>): CarouselState => {
    const { files } = props;

    const rv={
        loadingState: new Map<bigint,FileLoadingState>()
    }

    files.forEach(iterFile => {

        rv.loadingState.set(iterFile.id,{
            src: null,
            error: false,
            isLoading: false
        });
    });

    return rv;
}

const GetCarouselFileLeftIdx = (idx: number, files: CarouselFileDetails[]): number => {
    return (idx === 0 ? files.length -1 : idx-1);
}

const GetCarouselFileRightIdx = (idx: number, files: CarouselFileDetails[]): number => {
    return (idx === (files.length -1) ? 0 : idx+1);
}

const OnCarouselScroll = <FILE_T extends CarouselFileDetails,>(
    mainProps: CarouselProps<FILE_T>, ref: HTMLDivElement,
    delaySetSelectedFile: DelayedFunction, nonState: FileNonState, fileState: CarouselState,
    files: CarouselFileDetails[]): void => {

    const filesDisplayed=GetFilesDisplayed(ref, files);
    let allFilesLoaded=true;
    filesDisplayed.forEach(iterIdx => {

        const fileId=files[iterIdx]!.id;

        if(!fileState.loadingState.get(fileId)!.src) {
            allFilesLoaded=false;
        }
    });

    if(allFilesLoaded)
        SetCurrentFile(mainProps,filesDisplayed[0]!, nonState);
    else {
        // This is so we don't try to load lots of files whilst we're scrolling through them.
        delaySetSelectedFile(() => {
            SetCurrentFile(mainProps, GetCurrentFileIndex(ref), nonState);
        }, 200);
    }
}

const GetClientXInRelationToFileIndex = (x: number, fileIndex: number, carousel: HTMLDivElement) => {

    return (fileIndex*carousel.offsetWidth) + x;
}

const SetCurrentFile = <FILE_T extends CarouselFileDetails,>(
    mainProps: CarouselProps<FILE_T>, index: number,
    nonState: FileNonState): void => {

    const { setSelectedFile, files } = mainProps;

    const file=files[index]!;

    if(file.id !== nonState.selectedId) {

        nonState.selectedId=file.id;
        setSelectedFile(index, file);
    }
}

export const ShowFileFromIndex = (carouselRef: HTMLDivElement, index: number, scrollBehaviour: ScrollBehavior) => {

    const scrollX=GetClientXInRelationToFileIndex(0,index,carouselRef);

    carouselRef.scrollTo({
        left: scrollX,
        top: 0,
        behavior: scrollBehaviour
    });
}

const ShowFile = <FILE_T extends CarouselFileDetails,>(
    mainProps: CarouselProps<FILE_T>, getIdx: (idx: number)=>number,
    carouselRef: HTMLDivElement, scrollVertical: boolean, scrollBehaviour: ScrollBehavior,
    galleryFileNonState: FileNonState) => {

    const { files } = mainProps;

    const currentIndex=files.findIndex(iterFile => iterFile.id === galleryFileNonState.selectedId);

    const newIdx=getIdx(currentIndex);

    if(scrollVertical)
        window.scrollTo(0, 0);

    ShowFileFromIndex(carouselRef,newIdx,scrollBehaviour);
};

const FileIndexIsDisplayedOrNextToDisplayed = (carouselRef: HTMLDivElement,
                                               files: CarouselFileDetails[], idx: number): boolean => {

    if(files.length === 1)
        return true;

    const displayedFiles=GetFilesDisplayed(carouselRef,files);

    const leftIdx=GetCarouselFileLeftIdx(idx,files);

    const rightIdx=GetCarouselFileRightIdx(idx,files);

    if(displayedFiles[0] === idx || displayedFiles[0] === leftIdx || displayedFiles[0] === rightIdx)
        return true;

    if(displayedFiles.length === 1)
        return false;

    return (displayedFiles[1] === idx || displayedFiles[1] === leftIdx || displayedFiles[1] === rightIdx);
}

const FileIndexIsDisplayed = (
    carouselRef: HTMLDivElement, files: CarouselFileDetails[], idx: number): boolean => {

    if(files.length === 1)
        return true;

    const displayedFiles=GetFilesDisplayed(carouselRef,files);

    if(displayedFiles[0] === idx)
        return true;

    return (displayedFiles.length === 2 && displayedFiles[1] === idx);
}

const GetFilesDisplayed = (carouselRef: HTMLDivElement, files: CarouselFileDetails[]): number[] => {
    const scrollX=carouselRef.scrollLeft;
    const fileWidth=carouselRef.offsetWidth;

    const currentIdxWithDecimal=scrollX/fileWidth;
    const currentIdx=Math.round(currentIdxWithDecimal);
    const percentageOfLessProminentFile=currentIdxWithDecimal-currentIdx;

    if(Math.abs(percentageOfLessProminentFile)<0.01) {
        return [currentIdx];
    }

    if(percentageOfLessProminentFile<0) {
        return [currentIdx, GetCarouselFileLeftIdx(currentIdx,files)];
    }

    return [currentIdx, GetCarouselFileRightIdx(currentIdx,files)];
}

const GetCurrentFileIndex = (carouselRef: HTMLDivElement) => {
    const scrollX=carouselRef.scrollLeft;
    const fileWidth=carouselRef.offsetWidth;

    let currentIdx=Math.round(scrollX/fileWidth);

    const diff=scrollX - (currentIdx * fileWidth);
    if(diff > (fileWidth / 2)) {
        currentIdx = currentIdx + 1;
    }

    return currentIdx;
}

type GalleryFileComponentProps<FILE_T extends CarouselFileDetails> = {
    mainProps: CarouselProps<FILE_T>;
    idx: number;
    state: CarouselState;
    SetState: DispatchSetStateAction<CarouselState>;
    loadingNonState: FileNonState;
    carouselRef: HTMLDivElement|null;
};

function GalleryFileComponent<FILE_T extends CarouselFileDetails>(props: GalleryFileComponentProps<FILE_T>) {

    const { idx, carouselRef, state, loadingNonState, SetState, mainProps } = props;

    const { loadFileOverride, files, loadingFileUrl } = mainProps;

    const { loadingState } = state;

    const file=files[idx]!;

    const fileLoadingState = loadingState.get(file.id)!;

    const fileContainerClass = mainProps.additionalFileContainerClass
        ? "CarouselFileContainer " + mainProps.additionalFileContainerClass
        : "CarouselFileContainer";

    const getFileClass = (isLoading: boolean) => {

        const baseFileClass = isLoading
            ? "CarouselFileLoading"
            : "CarouselFile";

        const classWIP=mainProps.additionalFileClass
            ? baseFileClass + " " + mainProps.additionalFileClass(isLoading)
            : baseFileClass;

        if(!isLoading && file.additionalClass)
            return classWIP + " " + file.additionalClass;

        return classWIP
    }

    //console.log(JSON.stringify(file) + " loadingIdListHasFile?: " + loadingNonState.current.loadingIdList.has(file.id)
    //  + " " + JSON.stringify(fileLoadingState));

    // FYI: using a div with a background image (rather than <img>) is to prevent an issue when using object-fit / contain.
    // When initially loading you get a flicker where the width of the image is stretched (as per object-fit cover)
    //  and then resizes to the original size.
    // See https://stackoverflow.com/questions/64187659/react-js-image-size-flickers-on-reload-with-object-fit-cover-css-property
    if(fileLoadingState.src) {

        const onClick = mainProps.onFileClick && (!fileLoadingState.isLoading && !fileLoadingState.error)
            ? () => mainProps.onFileClick!(idx, file)
            : undefined;

        return (
            <div className={fileContainerClass}>
                <div className={getFileClass(fileLoadingState.isLoading)}
                     style={{backgroundImage: `url('${fileLoadingState.src}')`}} onClick={onClick}
                />
            </div>
        );
    }

    const autoLoadLeftAndRightFiles =mainProps.autoLoadLeftAndRightFiles === undefined
        ? true
        : mainProps.autoLoadLeftAndRightFiles;

    const loadFile=
        ShouldLoadFile(carouselRef, autoLoadLeftAndRightFiles, files, idx, loadingNonState, mainProps.shouldLoad);

    if(loadFile) {
        if (loadFileOverride) {
            loadingNonState.loadingIdList.add(file.id);

            const fullUrl=FileFullUrl(mainProps, file.src);

            loadFileOverride(fullUrl).then((url: string) => {
                loadingNonState.loadingIdList.delete(file.id);
                SetState(curState => MutateStateSetFileLoadedState(curState, {
                    src: url,
                    error: false,
                    isLoading: false
                }, file.id, true));
            }).catch(() => {
                loadingNonState.loadingIdList.delete(file.id);

                SetState(curState => MutateStateSetFileLoadedState(curState, {
                    src: fullUrl,
                    error: true,
                    isLoading: false
                }, file.id, true));
            });
        } else {
            const domFile = new Image();
            domFile.src = FileFullUrl(mainProps, file.src);

            loadingNonState.loadingIdList.add(file.id);

            domFile.onload = () => {

                loadingNonState.loadingIdList.delete(file.id);
                SetState(curState => MutateStateSetFileLoadedState(curState, {
                    isLoading: false,
                    src: domFile.src,
                    error: false,
                }, file.id, true));
            }
            domFile.onerror = () => {
                loadingNonState.loadingIdList.delete(file.id);

                SetState(curState => MutateStateSetFileLoadedState(curState, {
                    src: domFile.src,
                    error: true,
                    isLoading: false
                }, file.id, true));
            }
        }

        const isFirstTimeLoad = !carouselRef;

        if (isFirstTimeLoad) {

            // Don't show the loading SVG until after 200ms
            // If the images are cached, and the client has a reasonably fast internet connection, this stops
            //  the flicker when quickly going from the loading SVG to the loaded image.
            setTimeout(() => {
                SetState(curState => MutateStateSetFileLoadedState(curState, {
                    src: FileFullUrl(mainProps, loadingFileUrl),
                    error: false,
                    isLoading: true
                }, file.id, false));
            }, 200);

            return (
                <div className={fileContainerClass}>
                    <div className={getFileClass(true)}></div>
                </div>
            );
        }
    }

    return (
        <div className={fileContainerClass}>
            <div className={getFileClass(true)} style={{
                backgroundImage: `url('${FileFullUrl(mainProps,loadingFileUrl)}')`,
            }}>
            </div>
        </div>
    );
}

const ShouldLoadFile =
    (carouselRef: HTMLDivElement|null, autoLoadLeftAndRightFiles: boolean|undefined,
     files: CarouselFileDetails[], idx: number, loadingNonState: FileNonState, shouldLoadClientOverride: boolean) => {

        const file=files[idx];
        const fileIsAlreadyLoading=loadingNonState.loadingIdList.has(file.id);
        if(fileIsAlreadyLoading || !shouldLoadClientOverride)
            return true;

        // If there's no ref then this is the first time we have drawn the UI
        if(!carouselRef) {
            if(!autoLoadLeftAndRightFiles)
                return idx === 0;

            const leftIdx=GetCarouselFileLeftIdx(idx, files);
            const rightIdx=GetCarouselFileRightIdx(idx, files);

            return idx === 0 || leftIdx === 0 || rightIdx === 0;
        }

        if(autoLoadLeftAndRightFiles)
            return FileIndexIsDisplayedOrNextToDisplayed(carouselRef, files, idx);

        return FileIndexIsDisplayed(carouselRef, files, idx);
    }

const MutateStateSetFileLoadedState = (state: CarouselState, fileLoadingState: FileLoadingState, fileId: bigint
    , overwrite: boolean): CarouselState => {

    if(!overwrite) {
        const loadingStateForFile=state.loadingState.get(fileId)!;

        if(loadingStateForFile.src || loadingStateForFile.error)
            return state; // Don't overwrite the state
    }

    const loadingCopy=new Map<bigint,FileLoadingState>();
    state.loadingState.forEach((iterLoadingState, iterFileId) => {

        if(iterFileId !== fileId)
            loadingCopy.set(iterFileId, iterLoadingState);

        else {
            loadingCopy.set(iterFileId,{
                ...iterLoadingState,
                ...fileLoadingState
            });
        }
    });

    const rv= {
        ...state,
        loadingState: loadingCopy
    }

    return rv;
}

function FileFullUrl<FILE_T extends CarouselFileDetails>(
    props: CarouselProps<FILE_T>, fileSrc: string): string {
    if(props.fileDir)
        return props.fileDir + fileSrc;

    return fileSrc;
}