import {MutableRefObject, useRef, useState} from "react";
import {DispatchSetStateAction} from "react-cslib";
import {DelayedFunction, ResettableTimer} from "@sidfishus/cslib";
import "./carousel.scss";


//sidtodo remove these
import WhiteChevronLeft from "../images-deleteafter/white-chevron-left.svg";
import WhiteChevronRight from "../images-deleteafter/white-chevron-right.svg";
import CrossStaticSvg from "../images-deleteafter/cross.static.svg";

export type SetSelectedFileFunc<FILE_T extends CarouselFileDetails> = (idx: number, file: FILE_T) => void;

export type OnDeleteFileFunc<FILE_T extends CarouselFileDetails> = (idx: number, file: FILE_T) => void;

export type CarouselProps<FILE_T extends CarouselFileDetails> = {
    files: FILE_T[];
    selectedId: number;
    setSelectedFile: SetSelectedFileFunc<FILE_T>;
    fileDir?: string;
    thumbnailDir?: string; //sidtodo remove: replace with fileDir
    showThumbnails?: boolean|undefined;
    showChevrons?: boolean; // Defaults to true
    autoChangeMs?: number;
    OnClick?: (()=>void|undefined);
    loadFileOverride?: (url: string) => Promise<string>; //sidtodo why does this return a string? comment..
    shouldLoad: boolean; // Allows the client to override whether files should be loaded.
    autoLoadLeftAndRightFiles?: boolean; // Defaults to true if not specified
    onDelete?: OnDeleteFileFunc<FILE_T>;
    getFileClass?: (isLoading: boolean)=>string;
    fileContainerClass?: string;
    loadingFile: string;
}

//sidtodo change id from number to 64 bit???
export type CarouselFileDetails = {
    src: string;
    id: number;
    allowDelete?: boolean;
    overrideObjectFit?: "scale-down"|"cover"|"contain"|"fill"|"none";
}

type FileLoadingState = {
    src: string|null;
    error: boolean;
    isLoading: boolean;
}

type FileNonState = {
    loadingIdList: Set<number>;
    selectedId: number;
}

type CarouselState = {
    loadingState: Map<number /* File ID */,FileLoadingState>;
}

export function Carousel<FILE_T extends CarouselFileDetails>(props: CarouselProps<FILE_T>) {

    const { showChevrons, OnClick } = props;

    const [fileState,SetFileState] = useState(() => CreateDefaultState(props));

    const fileNonState=useRef<FileNonState>({
        selectedId: props.selectedId,
        loadingIdList: new Set<number>()
    });

    // useRef's persist after a component has been removed from the DOM
    if(fileNonState.current.selectedId !==props.selectedId) {
        fileNonState.current.selectedId = props.selectedId;
    }

    const delaySetSelectedFile=ResettableTimer();

    // We need to be able to reference the carousel in various places
    const carouselRef=useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>;

    //console.log("Render carousel: ");

    //sidtodo thumbnails

    const rv=(
        <>
            <CarouselComponent fileState={fileState} SetFileState={SetFileState}
                      fileNonState={fileNonState} delaySetSelectedFile={delaySetSelectedFile}
                      carouselRef={carouselRef}
                      showChevrons={showChevrons}
                      OnClick={OnClick} mainProps={props}
            />

            {/*{showThumbnails &&*/}
            {/*    <Thumbnails {...props} fileState={fileState} SetFileState={SetFileState}*/}
            {/*                carouselRef={carouselRef}*/}
            {/*    />}*/}

        </>
    );

    return rv;
}

const CreateDefaultState = <FILE_T extends CarouselFileDetails,> (props: CarouselProps<FILE_T>): CarouselState => {
    const { files } = props;

    const rv={
        loadingState: new Map<number,FileLoadingState>()
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

type CarouselComponentProps<FILE_T extends CarouselFileDetails,> = {
    mainProps: CarouselProps<FILE_T>;
    fileState: CarouselState;
    SetFileState: DispatchSetStateAction<CarouselState>;
    fileNonState: MutableRefObject<FileNonState>;
    delaySetSelectedFile: DelayedFunction;
    carouselRef: MutableRefObject<HTMLDivElement>;
    showChevrons?: boolean;
    //sidtodo remove??
    OnClick?: (()=>void|undefined);
}

function CarouselComponent<FILE_T extends CarouselFileDetails>(props: CarouselComponentProps<FILE_T>) {

    const { fileState, SetFileState, fileNonState, delaySetSelectedFile, carouselRef,
        OnClick, mainProps } = props;

    const { files } = mainProps;

    const CarouselScroll =
        ()=>OnCarouselScroll(mainProps,carouselRef, delaySetSelectedFile, fileNonState, fileState, files);

    const ScrollLeft = () => {
        ShowFile(mainProps, curIdx=> GetCarouselFileLeftIdx(curIdx, files), carouselRef,false, "smooth", fileNonState);
    }

    const ScrollRight = () => {
        ShowFile(mainProps, curIdx=> GetCarouselFileRightIdx(curIdx, files), carouselRef,false, "smooth", fileNonState);
    }

    const showChevrons = mainProps.showChevrons === undefined || mainProps.showChevrons;

    return (
        <>
            <div ref={carouselRef} className={"CarouselContainer"}
                 onScroll={CarouselScroll}>

                {files.map((_,idx) => {
                    return (
                        <GalleryFileComponent idx={idx} state={fileState}
                                               SetState={SetFileState}
                                               key={idx} loadingNonState={fileNonState}
                                               carouselRef={carouselRef}
                                               OnClick={OnClick} mainProps={mainProps}
                        />
                    );
                })}
            </div>

            {showChevrons && files.length > 1 && <img src={WhiteChevronLeft}
                                                       className={"CarouselLeftChevron"}
                                                       onClick={ScrollLeft}
            />}

            {showChevrons && files.length > 1 && <img src={WhiteChevronRight}
                                                       className={"CarouselRightChevron"}
                                                       onClick={ScrollRight}
            />}
        </>
    );
}

const GetCarouselFileLeftIdx = (idx: number, files: CarouselFileDetails[]): number => {
    return (idx === 0 ? files.length -1 : idx-1);
}

const GetCarouselFileRightIdx = (idx: number, files: CarouselFileDetails[]): number => {
    return (idx === (files.length -1) ? 0 : idx+1);
}

const OnCarouselScroll = <FILE_T extends CarouselFileDetails,>(
    mainProps: CarouselProps<FILE_T>, ref: MutableRefObject<HTMLDivElement>,
    delaySetSelectedFile: DelayedFunction, nonState: MutableRefObject<FileNonState>, fileState: CarouselState,
    files: CarouselFileDetails[]): void => {

    const filesDisplayed=GetFilesDisplayed(ref, files);
    let allFilesLoaded=true;
    filesDisplayed.forEach(iterIdx => {

        const fileId=files[iterIdx]!.id;

        if(!fileState.loadingState.get(fileId)!.src) {
            allFilesLoaded=false;
        }
    });

    console.log("OnCarouselScroll allFilesLoaded=" + allFilesLoaded);

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
    nonState: MutableRefObject<FileNonState>): void => {

    const { setSelectedFile, files } = mainProps;

    const file=files[index]!;

    if(file.id !== nonState.current.selectedId) {

        nonState.current.selectedId=file.id;
        setSelectedFile(index, file);
    }
}

const ShowFile = <FILE_T extends CarouselFileDetails,>(
    mainProps: CarouselProps<FILE_T>, getIdx: (idx: number)=>number,
    carouselRef: MutableRefObject<HTMLDivElement>, scrollVertical: boolean, scrollBehaviour: ScrollBehavior,
    galleryFileNonState: MutableRefObject<FileNonState>) => {

    const { files } = mainProps;

    const currentIndex=files.findIndex(iterFile => iterFile.id === galleryFileNonState.current.selectedId);

    const newIdx=getIdx(currentIndex);

    if(scrollVertical)
        window.scrollTo(0, 0);

    const scrollX=GetClientXInRelationToFileIndex(0,newIdx,carouselRef.current);
    console.log("scroll x: " + scrollX + ", new Idx: " + newIdx + ", " + scrollBehaviour);

    carouselRef.current.scrollTo({
        left: scrollX,
        top: 0,
        behavior: scrollBehaviour
    });
};

const FileIndexIsDisplayedOrNextToDisplayed = (carouselRef: MutableRefObject<HTMLDivElement>,
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
    carouselRef: MutableRefObject<HTMLDivElement>, files: CarouselFileDetails[], idx: number): boolean => {

    if(files.length === 1)
        return true;

    const displayedFiles=GetFilesDisplayed(carouselRef,files);

    if(displayedFiles[0] === idx)
        return true;

    return (displayedFiles.length === 2 && displayedFiles[1] === idx);
}

const GetFilesDisplayed = (carouselRef: MutableRefObject<HTMLDivElement>, files: CarouselFileDetails[]): number[] => {
    const scrollX=carouselRef.current?.scrollLeft;
    const fileWidth=carouselRef.current.offsetWidth;

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

const GetCurrentFileIndex = (carouselRef: MutableRefObject<HTMLDivElement>) => {
    const scrollX=carouselRef.current?.scrollLeft;
    const fileWidth=carouselRef.current.offsetWidth;

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
    loadingNonState: MutableRefObject<FileNonState>;
    carouselRef: MutableRefObject<HTMLDivElement>;
    OnClick?: (()=>void|undefined);
};

//sidtodo make function smaller
function GalleryFileComponent<FILE_T extends CarouselFileDetails>(props: GalleryFileComponentProps<FILE_T>) {

    const { idx, carouselRef, state, loadingNonState, SetState, mainProps } = props;

    const { loadFileOverride, files, loadingFile } = mainProps;

    const { loadingState } = state;

    const file=files[idx]!;

    const fileLoadingState = loadingState.get(file.id)!;

    const fileContainerClass = mainProps.fileContainerClass
        ? "CarouselFileContainer " + mainProps.fileContainerClass
        : "CarouselFileContainer";

    const getFileClass = (isLoading: boolean) => mainProps.getFileClass
        ? "CarouselFile " + mainProps.getFileClass(isLoading)
        : "CarouselFile";

    //console.log(JSON.stringify(file) + " loadingIdListHasFile?: " + loadingNonState.current.loadingIdList.has(file.id)
    //  + " " + JSON.stringify(fileLoadingState));

    if(fileLoadingState.src) {

        return (
            <div className={fileContainerClass}>
                <img src={fileLoadingState.src} className={getFileClass(fileLoadingState.isLoading)} />
                {file.allowDelete && !fileLoadingState.error && !fileLoadingState.isLoading &&
                    <FileDeleteButton mainProps={mainProps} idx={idx} />
                }
            </div>
        );
    }

    const autoLoadLeftAndRightFiles =mainProps.autoLoadLeftAndRightFiles === undefined
        ? true
        : mainProps.autoLoadLeftAndRightFiles;

    const loadFile=
        ShouldLoadFile(carouselRef, autoLoadLeftAndRightFiles, files, idx, loadingNonState.current, mainProps.shouldLoad);

    if(!loadFile) {
        // Show the loading SVG
        return (
            <div className={fileContainerClass}>
                <img src={FileFullUrl(mainProps,loadingFile)} className={getFileClass(true)} />
            </div>
        );
    }

    if(loadFileOverride) {
        loadingNonState.current.loadingIdList.add(file.id);

        loadFileOverride(FileFullUrl(mainProps, file.src)).then((url: string) => {
            loadingNonState.current.loadingIdList.delete(file.id);
            SetState(curState => MutateStateSetFileLoadedState(curState, {
                src: url,
                error: false,
                isLoading: false
            }, file.id, true));
        }).catch(() => {
            loadingNonState.current.loadingIdList.delete(file.id);

            //sidtodo create a better icon on loading.io
            SetState(curState => MutateStateSetFileLoadedState(curState, {
                src: "/Files/fail-1.1s-200px.svg",
                error: true,
                isLoading: false
            }, file.id, true));
        });
    }
    else {
        const domFile=new Image();
        domFile.src=FileFullUrl(mainProps,file.src);

        loadingNonState.current.loadingIdList.add(file.id);

        domFile.onload = () => {

            console.log(loadingNonState.current.loadingIdList);

            loadingNonState.current.loadingIdList.delete(file.id);
            //console.log("LOASDED " + domFile.src);
            SetState(curState => MutateStateSetFileLoadedState(curState, {
                isLoading: false,
                src: domFile.src,
                error: false,
            }, file.id, true));
        }
        domFile.onerror = (e) => {
            //sidtodo deal with errors.
            loadingNonState.current.loadingIdList.delete(file.id);
            console.log("failed to load " + JSON.stringify(e));
            console.log("filename: " + domFile.src);
        }
    }

    const isFirstTimeLoad=!carouselRef.current;

    if(isFirstTimeLoad) {

        // Don't show the loading SVG until after 100ms
        // If the images are cached, and the client has a reasonably fast internet connection, this stops
        //  the flicker from quickly going from the loading SVG to the loaded image.
        setTimeout(() => {
            SetState(curState =>MutateStateSetFileLoadedState(curState, {
                src: FileFullUrl(mainProps,loadingFile),
                error: false,
                isLoading: true
            }, file.id, false));
        }, 100);

        return (
            <div className={fileContainerClass}>
                <div className={getFileClass(true)} />
            </div>
        );
    }
}

type FileDeleteButtonProps<FILE_T extends CarouselFileDetails> = {
    mainProps: CarouselProps<FILE_T>;
    idx: number;
};

function FileDeleteButton<FILE_T extends CarouselFileDetails>(props: FileDeleteButtonProps<FILE_T>) {

    const { mainProps,idx } = props;
    const { files } = mainProps;

    const onDelete = mainProps.onDelete
        ? ()=>mainProps.onDelete!(idx, files[idx]!)
        : undefined;

    return (
        <img className="GalleryComponentFileDeleteIcon" src={CrossStaticSvg} onClick={onDelete} />
    );
}

const ShouldLoadFile =
    (carouselRef: MutableRefObject<HTMLDivElement>, autoLoadLeftAndRightFiles: boolean|undefined,
     files: CarouselFileDetails[], idx: number, loadingNonState: FileNonState, shouldLoadClientOverride: boolean) => {

        const file=files[idx];
        const fileIsAlreadyLoading=loadingNonState.loadingIdList.has(file.id);
        if(fileIsAlreadyLoading || !shouldLoadClientOverride)
            return true;

        // If there's no ref then this is the first time we have drawn the UI
        if(!carouselRef.current) {
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

const MutateStateSetFileLoadedState = (state: CarouselState, fileLoadingState: FileLoadingState, fileId: number
    , overwrite: boolean): CarouselState => {

    if(!overwrite) {
        const loadingStateForFile=state.loadingState.get(fileId)!;

        if(loadingStateForFile.src || loadingStateForFile.error)
            return state; // Don't overwrite the state
    }

    const loadingCopy=new Map<number,FileLoadingState>();
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