/* eslint-disable react/prop-types */
"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { server } from "../../constants/config";

const CricketScoreDirect = ({ eventId }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          setHtmlContent("<p>Match not started yet</p>");
        } else {
          setHtmlContent(score);
        }
  
        setError(null);
        localStorage.setItem(`cricketScoreHtml_${eventId}`, score);
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError("Failed to fetch cricket scores");
  
        // Load cached score if available
        const cachedHtml = localStorage.getItem(`cricketScoreHtml_${eventId}`);
        if (cachedHtml) {
          setHtmlContent(cachedHtml);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchScores();
    intervalId = setInterval(fetchScores, 1000);
  
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
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: "Chakra Petch", sans-serif;
              }
              
              body {
                background-color: #000000;
                color: white;
                font-size: 12px;
                line-height: 1.4;
                overflow-x: hidden;
              }
              
              .sc_cw-body {
                height: 100%;
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                background-color: #000000 !important;
              }
              
              .sc_cw-main-container {
                width: 100%;
                background-color: #000000 !important;
                border-radius: 0.5rem;
              }
              
              .sc_cw-header {
                color: white !important;
                background-color: #000000 !important;
              }
              
              .sc_cw-team-info-desktop, 
              .sc_cw-team-info-mobile {
                color: white !important;
                background-color: #000000 !important;
              }
              
              .sc_cw-team-info-desktop span, 
              .sc_cw-team-info-mobile span {
                color: white !important;
              }
              
              .sc_cw-table-heading {
                background-color: #202020 !important;
                color: white !important;
              }
              
              .sc_cw-table-row, 
              .sc_cw-desktop-row, 
              .sc_cw-mobile-row {
                background-color: #000000 !important;
                color: white !important;
              }
              
              .sc_cw-table-row div, 
              .sc_cw-desktop-row div, 
              .sc_cw-mobile-row div {
                color: white !important;
              }
              
              .sc_cw-other-info, 
              .sc_cw-other-info-mobile {
                background-color: #202020 !important;
                color: white !important;
              }
              
              .sc_cw-overs-info, 
              .sc_cw-overs-info-mobile {
                background-color: #000000 !important;
                color: white !important;
              }
              
              .sc_cw-mobile-label {
                background-color: #868686 !important;
                color: #000000 !important;
              }
              
              svg path {
                fill: white !important;
              }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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

  if (loading) {
    return (
      <div className="h-24 w-full flex justify-center items-center text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div
            className="h-4 w-24 rounded mb-2"
            style={{ backgroundColor: `rgba(var(--color-primary), 0.3)` }}
          ></div>
          <div
            className="h-6 w-32 rounded"
            style={{ backgroundColor: `rgba(var(--color-primary), 0.3)` }}
          ></div>
        </div>
      </div>
    );
  }

  if (error && !htmlContent) {
    return (
      <div
        className="h-24 w-full flex justify-center items-center text-center"
        style={{ color: `rgb(var(--color-primary-dark))` }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="cricket-score-container rounded-lg overflow-hidden my-4">
      <div
        className="p-2"
        style={{ backgroundColor: `rgb(var(--color-primary-lighter))` }}
      >
        <h3
          className="text-sm font-bold"
          style={{ color: `rgb(var(--color-primary-dark))` }}
        >
          Live Score
        </h3>
      </div>
      <iframe
        ref={iframeRef}
        title="Cricket Score"
        className="w-full h-52 p-2 md:h-[210px]  border-none bg-black"
        style={{ 
         
          maxWidth: "100%",
          borderRadius: "0 0 0.5rem 0.5rem"
        }}
      />
    </div>
  );
};

export default CricketScoreDirect;
