import React from "react";
import BenefitSection from "./BenefitSection";

import { benefits } from "@/components/landing/data/benefits";

const Benefits: React.FC = () => {
    return (
        <div id="features" className="mt-20 lg:mt-28">
            <h2 className="sr-only">Features</h2>
            {benefits.map((item, index) => {
                return <BenefitSection key={index} benefit={item} imageAtRight={index % 2 !== 0} />
            })}
        </div>
    )
}

export default Benefits
