/* eslint-disable react/prop-types */
"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { server } from "../../constants/config";

const CricketScore = ({ eventId }) => {
  const [htmlContent, setHtmlContent] = useState(
    localStorage.getItem(`cricketScoreHtml_${eventId}`) || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyResponseCount, setEmptyResponseCount] = useState(0);
  const iframeRef = useRef(null);

  useEffect(() => {
    let intervalId;

    const fetchScores = async () => {
      try {
        const response = await axios.get(
          `${server}api/v1/scores/cricket?eventId=${eventId}`
        );

        const { score } = response.data; // Extract score from response

        if (!score.trim()) {
          setEmptyResponseCount((prevCount) => prevCount + 1);
        } else {
          setEmptyResponseCount(0); // Reset counter if valid data is received
          setHtmlContent(score);
          localStorage.setItem(`cricketScoreHtml_${eventId}`, score);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError("Failed to fetch cricket scores");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
    intervalId = setInterval(fetchScores, 500); // Fetch every 5 seconds

    return () => clearInterval(intervalId);
  }, [eventId]);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      const completeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; font-family: "Chakra Petch", sans-serif; }
              body { background-color: #000; color: white; font-size: 12px; line-height: 1.4; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(completeHtml);
      iframeDoc.close();
    }
  }, [htmlContent]);

  if (loading && !htmlContent) {
    return (
      <div className="h-24 w-full flex justify-center items-center text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-24 rounded mb-2 bg-gray-500"></div>
          <div className="h-6 w-32 rounded bg-gray-500"></div>
        </div>
      </div>
    );
  }

  if (error && !htmlContent) {
    return (
      <div className="h-24 w-full flex justify-center items-center text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="cricket-score-container rounded-lg overflow-hidden my-4">
      <div className="p-2 bg-gray-800">
        <h3 className="text-sm font-bold text-white">Live Score</h3>
      </div>
      <iframe
        ref={iframeRef}
        title="Cricket Score"
        className="w-full h-52 p-2 md:h-[210px] border-none bg-black"
        style={{ maxWidth: "100%", borderRadius: "0 0 0.5rem 0.5rem" }}
      />
      {emptyResponseCount >= 3 && ( // Show message after 3 consecutive empty responses
        <p className="text-center text-gray-400 mt-2">Match not started yet</p>
      )}
    </div>
  );
};

export default CricketScore;
