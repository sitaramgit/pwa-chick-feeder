import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

const MODEL_URL = "/my-model/";

const ImageClassifier: React.FC = () => {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const webcamRef = useRef<tmImage.Webcam | null | any>(null);
  const canvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

const startWebcam = async (mode: "user" | "environment") => {
  const webcam = new tmImage.Webcam(200, 200, true);
  await webcam.setup({ facingMode: mode });
  await webcam.play();
  webcamRef.current = webcam;
  if (canvasRef.current) {
    canvasRef.current.innerHTML = ""; // reset
    canvasRef.current.appendChild(webcam.canvas);
  }
  window.requestAnimationFrame(loop);
};

useEffect(() => {
  (navigator as any).getBattery?.().then((battery: any) => {
    setBatteryLevel(battery.level * 100);
    battery.addEventListener("levelchange", () => {
      setBatteryLevel(battery.level * 100);
    });
  });
}, []);

useEffect(() => {
  startWebcam(facingMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [facingMode]);

  // Load model on mount
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tmImage.load(
        MODEL_URL + "model.json",
        MODEL_URL + "metadata.json"
      );
      setModel(loadedModel);

      // Setup webcam
      const webcam = new tmImage.Webcam(200, 200, true); 
      await webcam.setup({ facingMode: "environment" }); // back camera
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;
      if (canvasRef.current) {
        canvasRef.current.appendChild(webcam.canvas);
      }
      window.requestAnimationFrame(loop);
    };

    // loadModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loop = async () => {
    console.log(webcamRef.current , model)
    if (webcamRef.current && model) {
      webcamRef.current.update();
      const preds = await model.predict(webcamRef.current.canvas);
      console.log(preds)
      setPredictions(preds);
    }
    window.requestAnimationFrame(loop);
  };

  const toggleTorch = (on: boolean) => {
  const track = webcamRef.current?.stream.getVideoTracks()[0];
  if (!track) return;
  const capabilities = track.getCapabilities();
  if (capabilities.torch) {
    track.applyConstraints({
      advanced: [{ torch: on }]
    });
  }
};
  return (
    <div>
      <h2>Teachable Machine Image Classifier</h2>
      <p>Battery: {batteryLevel !== null ? `${batteryLevel.toFixed(0)}%` : "N/A"}</p>
      <button onClick={() => toggleTorch(true)}>Flash On</button>
      <button onClick={() => toggleTorch(false)}>Flash Off</button>
      <div ref={canvasRef}></div>
      <ul>
        {predictions.map((p, i) => (
          <li key={i}>
            {p.className}: {(p.probability * 100).toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageClassifier;
