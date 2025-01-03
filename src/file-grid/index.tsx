
import {ReactNode} from "react";
import "./index.scss";

type FileGridProps = {
    fileDir?: string;
    files: string[];
    onClick?: (fileIndex: number)=>void;
    overrideFileClass?: string;
}

export const FileGrid: React.FunctionComponent<FileGridProps> = props => {

    const { files, overrideFileClass } = props;


    const fileList: ReactNode[]=[];
    for(let i=0;i<files.length; ++i) {
        const file=files[i];

        //sidtodo
        // const extraClass= (i === imageState.imageIndex) ?
        //     "selected": undefined;

        const onClick = props.onClick
            ? ()=>props.onClick!(i)
            : undefined;

        fileList.push((
            <img className={(overrideFileClass ? overrideFileClass : "FileGridFile")}
                 src={FileFullUrl(props,file)} key={i}
                 loading="lazy"
                 onClick={onClick}
            />
        ));
    }

    return (
        <div className={"FileGridContainer"}>
            {fileList}
        </div>
    );
}

//sidtodo remove
export const FileGridOld: React.FunctionComponent<FileGridProps> = props => {

    //const { imageState, mediaMatching, SetImageState, carouselRef, isProgrammaticScroll, isStatic } = props;

    const { files, overrideFileClass, fileWidth } = props;

    //const numColumns = NumberOfThumbnailColumns(isStatic, res);
    const numColumns = 3; //sidtodo use fileWidth

    const rowList: ReactNode[] = [];
    const fileList: ReactNode[]=[];
    for(let i=0;i<files.length; ++i) {
        const file=files[i];

        //sidtodo
        // const extraClass= (i === imageState.imageIndex) ?
        //     "selected": undefined;

        const onClick = props.onClick
            ? ()=>props.onClick!(i)
            : undefined;

        fileList.push((
            <img style={{width: fileWidth}} className={(overrideFileClass ? overrideFileClass : "FileGridImage")}
                 src={FileFullUrl(props,file)} key={i}
                 loading="lazy"
                 onClick={onClick}
            />
        ));

        // New row
        if(((i+1)%numColumns) == 0) {
            rowList.push(
                <div className={"FileGridRow"} key={rowList.length}>
                    {fileList}
                </div>
            );

            fileList=[];
        }
    }

    // Final row
    if(fileList.length !== 0) {
        rowList.push(
            <div className={"FileGridRow"} key={-1}>
                {fileList}
            </div>
        );
    }

    return (
        <div className={"FileGridContainer"}>
            {rowList}
        </div>
    );
}

function FileFullUrl(props: FileGridProps, fileSrc: string): string {
    if(props.fileDir)
        return props.fileDir + fileSrc;

    return fileSrc;
}