import React from "react";
import {Shared,Blah} from "../shared.ts";


export const Carousel = (props: Blah): React.ReactElement<Blah> => {
    return <div style={{backgroundColor: "red"}}>{Shared()}{props.test}</div>
}

export const AFunction = (): number =>
{
    let i;
    for(i=0;i<100000;++i) ;

    return i;
};