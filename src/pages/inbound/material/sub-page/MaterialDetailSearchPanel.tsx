import React, { useState } from 'react';
import type { MachineData } from "../model/Material-model"

export default function DetailSerach() {
    const [rawData, setRawData]= useState<MachineData[] > ([]);

    return (
        <div>
            <span>
                <img>icon</img>
                <h2>Detail Search zone</h2>
            </span>
      </div>  
    )
}