
import {Carousel as Carousel, CarouselFileDetails} from "./carousel/index.tsx";
import {useState} from "react";
import "./testapp.scss";

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
    CreateGalleryImage("main/IMG_2116.jpg",11)
];

//const bmsImages=[CreateGalleryImage("IMG_3005.jpg",2)];

export const TestApp = (): JSX.Element => {

    const [showMultiple,SetShowMultiple] = useState<boolean>(false);

    return (
        <>
            Show Multiple?
            <input type={"checkbox"} onChange={()=>SetShowMultiple(prevState => !prevState)} checked={showMultiple} />

            <ReplicateBMS />

            {showMultiple &&
                <>
                    <Standard key={1} />

                    <Standard1000x1000Fill key={2} />

                    <Standard1000x1000FillImageOverride key={3} />
                </>
            }
        </>
    );
}

export const Standard = (): JSX.Element => {

    const [imageId,setImageId]=useState<number>(2);

    const setGallerySelectedImage = (_: number, file: CarouselFileDetails) => setImageId(file.id);

    return (
        <>
            <div style={{width: 800, height: 800}} className={"StandardCarouselTest"}>
                <Carousel
                    files={sharedImages}
                    selectedId={imageId}
                    setSelectedFile={setGallerySelectedImage}
                    shouldLoad={true}
                    fileDir={"/src/images-deleteafter/"}
                    fileClass={"StandardFileClass"}
                />
            </div>
            <div style={{width: 100, height: 100, borderStyle: "solid", borderWidth: "1"}}></div>
        </>
    );
}

export const ReplicateBMS = (): JSX.Element => {

    const [imageId,setImageId]=useState<bigint>(2n);

    const setGallerySelectedImage = (_: number, file: CarouselFileDetails) => setImageId(file.id);

    return (
        <>
            <div className={"BMSCarouselContainer"}>
                <Carousel
                    files={bmsImages}
                    selectedId={imageId}
                    setSelectedFile={setGallerySelectedImage}
                    shouldLoad={true}
                    fileDir={"/src/images-deleteafter/bms/"}
                    getFileClass={(isLoading)=> isLoading ? "BMSFile loading" : "BMSFile"}
                    fileContainerClass={"BMSFileContainer"}
                    loadingFile={"Spinner-1s-300px.svg"}
                />
            </div>
            <div style={{width: 100, height: 100, borderStyle: "solid", borderWidth: "1", margin: 5}}></div>
        </>
    );
}

//sidtodo make a standard and allow override rather than copy and paste everywhere
export const Standard1000x1000Fill = (): JSX.Element => {

    const [imageId,setImageId]=useState<number>(1);

    const setGallerySelectedImage = (_: number, file: CarouselFileDetails) => setImageId(file.id);

    return (
        <div style={{width: 1000, height: 1000}} className={"StandardCarouselTest"}>
            <Carousel
                files={sharedImages}
                selectedId={imageId}
                setSelectedFile={setGallerySelectedImage}
                shouldLoad={true}
                fileDir={"/src/images-deleteafter/"}
                defaultObjectFit={"fill"}
            />
        </div>
    );
}

export const Standard1000x1000FillImageOverride = (): JSX.Element => {

    const [imageId,setImageId]=useState<number>(1);

    const setGallerySelectedImage = (_: number, file: CarouselFileDetails) => setImageId(file.id);


    const images=[...sharedImages];
    images[0]=CreateGalleryImage(images[0].src, images[0].id);
    images[0].overrideObjectFit="fill"

    return (
        <div style={{width: 1000, height: 1000}} className={"StandardCarouselTest"}>
            <Carousel
                files={images}
                selectedId={imageId}
                setSelectedFile={setGallerySelectedImage}
                shouldLoad={true}
                fileDir={"/src/images-deleteafter/"}
            />
        </div>
    );
}