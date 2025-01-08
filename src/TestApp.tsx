
import {Carousel as Carousel, CarouselFileDetails, ShowFileFromIndex} from "./carousel/index.tsx";
import {useRef, useState} from "react";
import "./testapp.scss";
import {FileGrid} from "react-csfilegrid";

const CreateGalleryImage = (url: string, id: number)=> {
    const x: CarouselFileDetails = {
        src: url,
        id: BigInt(id)
    };

    return x;
}

const sharedImages = [CreateGalleryImage("carouselmobile1.png",2),CreateGalleryImage("ailist1.jpg",3),CreateGalleryImage("ailist2.jpg",4)];

const bmsImages=[CreateGalleryImage("main/IMG_3005.jpg",2),
    CreateGalleryImage("main/IMG_002.jpg",3),
    CreateGalleryImage("main/IMG_0024.jpg",4),
    CreateGalleryImage("main/IMG_0040.jpg",5),
    CreateGalleryImage("main/IMG_0042.jpg",6),
    CreateGalleryImage("main/IMG_0117.jpg",7),
    CreateGalleryImage("main/IMG_1397.jpg",8),
    CreateGalleryImage("main/IMG_1402.jpg",9),
    CreateGalleryImage("main/IMG_1478.jpg",10),
    CreateGalleryImage("main/IMG_2116.jpg",11),
];

export const TestApp = () => {

    return (
        <>
            <ReplicatePortfolioInMobile />
            <ReplicateBMS />
        </>
    );
}

export const ReplicatePortfolioInMobile = () => {

    const [imageId,setImageId]=useState<bigint|null>(null);

    const setGallerySelectedImage = (_: number, file: CarouselFileDetails) => setImageId(file.id);

    const thumbnails=sharedImages.map(image => image.src);

    const carouselRef=useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

    return (
        <div style={{minWidth: "calc(100%)"}}>
            <Carousel
                files={sharedImages}
                selectedId={imageId}
                setSelectedFile={setGallerySelectedImage}
                shouldLoad={true}
                fileDir={"/src/images/"}
                additionalFileClass={(isLoading)=> isLoading ? "BMSFileLoading" : "BMSFile"}
                additionalFileContainerClass={"BMSFileContainer"}
                loadingFileUrl={"Spinner-1s-300px.svg"}
                chevronUrl={"orange-chevron-left.svg"}
                ref={carouselRef}
                overrideLeftChevronClass={"PortfolioLeftChevron"}
                overrideRightChevronClass={"PortfolioRightChevron"}
            />

            <br />

            <FileGrid
                fileDir={"/src/images/"}
                files={thumbnails}
                selectedIndex={(imageId === null ? 0 : bmsImages.findIndex(img => img.id === imageId))}
                onClick={idx => ShowFileFromIndex(carouselRef.current,idx,"smooth")}
                overrideFileClass={(isSelected)=>
                    (isSelected ? "PortfolioFileGridSelectedFile" : "PortfolioFileGridFile")}
            />

        </div>
    );

}

export const ReplicateBMS = () => {

    const [imageId,setImageId]=useState<bigint|null>(null);

    const setGallerySelectedImage = (_: number, file: CarouselFileDetails) => setImageId(file.id);

    const thumbnails=bmsImages.map(image => image.src);

    const carouselRef=useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

    return (
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

            <div style={{width: "100%"}}>
                <FileGrid
                    fileDir={"/src/images/bms/"}
                    files={thumbnails}
                    selectedIndex={(imageId === null ? 0 : bmsImages.findIndex(img => img.id === imageId))}
                    onClick={idx => ShowFileFromIndex(carouselRef.current,idx,"smooth")}
                />
            </div>

        </div>
    );

}