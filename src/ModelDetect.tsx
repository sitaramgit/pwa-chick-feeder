import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
// import * as abcd from "../public/my-model/model.json";
const ModelDetect: React.FC = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [labels, setLabels] = useState<string[]>(["sitaram", "book", "noting"]);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // 🔋 Battery listener
  useEffect(() => {
    (navigator as any).getBattery?.().then((battery: any) => {
      setBatteryLevel(battery.level * 100);
      battery.addEventListener("levelchange", () => {
        setBatteryLevel(battery.level * 100);
      });
    });
  }, []);

  // 📷 Start camera whenever facingMode changes
  useEffect(() => {
    startCamera(facingMode);
  }, [facingMode]);

  // 📥 Load model on mount
  useEffect(() => {
    loadModel();
  }, []);

  const startCamera = async (mode: "user" | "environment") => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: mode } },
        });
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

  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel("/my-model/model.json");
      setModel(loadedModel);
      console.log("✅ Model loaded", loadedModel);
    } catch (err) {
      console.error("❌ Model load failed:", err);
    }
  };

  const runDetection = async () => {
    if (!model || !videoRef.current) return;

    const input = tf.browser
      .fromPixels(videoRef.current)
      .resizeNearestNeighbor([224, 224]) // adjust if model requires different size
      .toFloat()
      .div(tf.scalar(255.0)) // normalize
      .expandDims(0); // batch dimension

    const preds = model.predict(input) as tf.Tensor;
    const values: any = await preds.data();
    const maxIndex = values.indexOf(Math.max(...values));

    console.log("maxIndex:", maxIndex);
    console.log("Raw probs:", values);
    console.log("Predicted class:", labels[maxIndex] || maxIndex);

    tf.dispose([input, preds]);
  };

  const toggleTorch = async (on: boolean) => {
  const stream = videoRef.current?.srcObject as MediaStream | null;
  if (!stream) return;

  const track = stream.getVideoTracks()[0];
  if (!track) return;

  const capabilities = track.getCapabilities() as any; // 👈 bypass TS check
  if (capabilities.torch) {
    try {
      await track.applyConstraints({
        advanced: [{ torch: on }] as any, // 👈 bypass TS check here too
      });
      console.log(`Torch ${on ? "ON" : "OFF"}`);
    } catch (err) {
      console.error("Torch error:", err);
    }
  } else {
    console.log("Torch not supported on this device");
  }
};


  return (
    <div>
      <h1>Object Detection</h1>

      {/* Camera Control */}
      <button onClick={() => setFacingMode("environment")}>Back Camera</button>
      <button onClick={() => setFacingMode("user")}>Front Camera</button>

      {/* Flashlight Control */}
      <button onClick={() => toggleTorch(true)}>Flash On</button>
      <button onClick={() => toggleTorch(false)}>Flash Off</button>

      {/* Video Preview */}
      <video ref={videoRef} width="400" height="300" autoPlay muted />

      {/* Detection */}
      <button onClick={runDetection}>Detect</button>

      {/* Battery Info */}
      <p>
        Battery:{" "}
        {batteryLevel !== null ? `${batteryLevel.toFixed(0)}%` : "N/A"}
      </p>
    </div>
  );
};

export default ModelDetect;
