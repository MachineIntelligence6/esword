import React, { useState } from "react"

type Props = {
    heading: string,
    content: React.ReactNode,
}

export default function VersesComponent({ heading, content  }: Props) {
    // set bold property on click
    const [isBold, setIsBold] = useState(false);
      
        const handleClick = () => {
          setIsBold(!isBold);
        };
      
        const textStyle = {
          fontWeight: isBold ? 'bold' : 'normal',
        };
    return (
        // content
        <div className="flex font-normal" style={textStyle} onClick={handleClick}>
            <p className="text-base  min-w-[65px] text-light-green ">
                {heading}
            </p>
            <p className=" text-base text-primary-dark">
                {content}
            </p>
        </div>


    )
}
