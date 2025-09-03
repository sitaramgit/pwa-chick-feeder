
import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
// import * as abcd from "../../../public/model/model.json"; 
const ModelDetect: React.FC = () => {
    const [model, setModel] = useState<tf.GraphModel | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [labels, setLabels] = useState<string[]>(["sitaram", "book", "noting"]);
    useEffect(() => { loadModel(); }, []);
    useEffect(() => {
  const setupCamera = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error("Video play error:", err);
          });
        };
      }
    } catch (err) {
      console.error("Camera setup error:", err);
    }
  };

  setupCamera();
}, []);

    const loadModel = async () => {
        try {
            // use loadLayersModel instead of loadGraphModel     
            const loadedModel: any = await tf.loadLayersModel("/my-model/model.json");
            setModel(loadedModel);
            console.log("✅ Model loaded", loadedModel);
        } catch (err) {
            console.error("❌ Model load failed:", err);
        }
    };
    const runDetection = async () => {
        if (!model || !videoRef.current) return;
        const input = tf.browser.fromPixels(videoRef.current).resizeNearestNeighbor([224, 224])   // 👈 check your model’s input size      
            .toFloat()
            .div(tf.scalar(255.0))               // 👈 normalize to 0–1      
            .expandDims(0);                      // batch dimension    
        const preds = model.predict(input) as tf.Tensor;
        const values: any = await preds.data();
        const maxIndex = values.indexOf(Math.max(...values));
        console.log("maxIndex:", maxIndex);
        console.log("Raw probs:", values);
        console.log("Predicted class:", labels[maxIndex] || maxIndex);
        tf.dispose([input, preds]);
    };

    return (<div>      
        <h1>Object Detection</h1>      
        <video ref={videoRef} width="400" height="300" autoPlay muted />      
        <button onClick={runDetection}>Detect</button>    
        </div>);
}; 
export default ModelDetect;  