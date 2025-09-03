import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

const MODEL_URL = "/my-model/";

const ImageClassifier: React.FC = () => {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const webcamRef = useRef<tmImage.Webcam | null>(null);
  const canvasRef: any = useRef<HTMLCanvasElement | null>(null);

  // Load model on mount
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tmImage.load(
        MODEL_URL + "model.json",
        MODEL_URL + "metadata.json"
      );
      setModel(loadedModel);

      // Setup webcam
      const webcam = new tmImage.Webcam(200, 200, true); // width, height, flip
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;
      if (canvasRef.current) {
        canvasRef.current.appendChild(webcam.canvas);
      }
      window.requestAnimationFrame(loop);
    };

    loadModel();
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

  return (
    <div>
      <h2>Teachable Machine Image Classifier</h2>
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
