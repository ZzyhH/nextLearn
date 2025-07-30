'use client'
import { useState } from "react"

export default function Count(){
    const [counts,setCounts]=useState(0)
    return <button onClick={()=>setCounts(counts+1)}>{counts}</button>
}