import React, { useEffect, useState, useRef } from "react";

export default function ClockTimerApp() {
  const [countdowns, setCountdowns] = useState([]);
  const [newCountdown, setNewCountdown] = useState(10);
  const [selectedZone, setSelectedZone] = useState(() => localStorage.getItem("selectedZone") || "UTC");
  const [customLabel, setCustomLabel] = useState(() => localStorage.getItem("customLabel") || "My Clock");
  const selectedSound = "/10secs.mp3";
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const countdownRef = useRef(null);
  const voiceRef = useRef(null);
 const [clockSize, setClockSize] = useState(() => {
  const savedSize = localStorage.getItem("clockSize");
  return savedSize ? parseFloat(savedSize) : 6;
});

  // Play sound safely, avoid overlaps
  const playSound = async () => {
    try {
      if (voiceRef.current && !voiceRef.current.paused) {
        // Already playing, don't overlap
        return;
      }

      const audio = new Audio(selectedSound);
      audio.playbackRate = 2.2;   // ✅ This sets playback to 2.2x speed
      voiceRef.current = audio;

 // ✅ Clear ref when finished
      audio.onended = () => {
        voiceRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.warn("Playback error:", err);
    }
  };
  
  useEffect(() => {
    localStorage.setItem("selectedZone", selectedZone);
  }, [selectedZone]);

  useEffect(() => {
    localStorage.setItem("customLabel", customLabel);
  }, [customLabel]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
  localStorage.setItem("clockSize", clockSize);
}, [clockSize]);

useEffect(() => {
  try {
    if (window.adsbygoogle && process.env.NODE_ENV !== "development") {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  } catch (e) {
    console.error("Adsense error", e);
  }
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
    setCountdowns((prev) =>
      prev.map((cd) => {
        if (!cd.running || cd.time <= 0) return cd;

          const newTime = cd.time - 1;

          if (newTime <= 0) {
              playSound();  // ✅ centralized and overlap-safe
            return {
              ...cd,
              time: 0,
              running: false,
              message: "⏰ Time's up!",
              animate: true,
            };
          }

        return { ...cd, time: newTime };
      })
    );
  }, 1000);

  return () => clearInterval(interval);
}, []);

const formatTime = (seconds) => {
  return seconds.toString().padStart(2, "0");
};


  const addCountdown = () => {
 // 🚫 Prevent adding more than one countdown
 if (countdowns.length > 0) return;
    
  playSound();  // ✅ Safe audio play

  setCountdowns([
    {
      id: Date.now(),
      time: 10,
      running: true,
      message: "",
      animate: false,
    },
  ]);
};

  const resetCountdown = (id) => {
    if (voiceRef.current) {
      voiceRef.current.pause();  // ✅ Ensure sound stops
      voiceRef.current.currentTime = 0;
      voiceRef.current = null;   // ✅ Clean up reference
    }

    playSound(); // ✅ Safe play again

    setCountdowns((prev) =>
      prev.map((cd) =>
        cd.id === id
          ? { ...cd, time: 10, running: true, message: "", animate: false }
          : cd
      )
    );
  };
  
  const deleteCountdown = (id) => {
    if (voiceRef.current) {
      voiceRef.current.pause(); // ✅ Stop any active sound
      voiceRef.current.currentTime = 0;
      voiceRef.current = null; // ✅ Clean up reference
    }

    setCountdowns((prev) => prev.filter((cd) => cd.id !== id));
  };

  const getZoneTime = (zone) =>
    new Date().toLocaleTimeString(undefined, { timeZone: zone });

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap"
        rel="stylesheet"
      />

<style>
  {`
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.6;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `}
</style>


      <div
        style={{
          backgroundColor: darkMode ? "#000" : "#fff",
          color: darkMode ? "#0ff" : "#000",
          minHeight: "100vh",
          textAlign: "center",
          padding: "20px",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
<div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
  <button
    onClick={() => setDarkMode(!darkMode)}
    style={{
      padding: "10px 20px",
      background: darkMode ? "#0ff" : "#000",
      color: darkMode ? "#000" : "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    Toggle {darkMode ? "Light" : "Dark"} Mode
  </button>

  <div>
    <label htmlFor="sizeSlider">Clock Size: {clockSize.toFixed(1)}x</label>
    <input
      id="sizeSlider"
      type="range"
      min="2"
      max="12"
      step="0.5"
      value={clockSize}
      onChange={(e) => setClockSize(parseFloat(e.target.value))}
      style={{ width: "200px", marginLeft: "10px" }}
    />
  </div>
</div>

        <h1>{customLabel}</h1>
        <h3>Timezone: {selectedZone}</h3>

        <div
          style={{
            fontSize: `${clockSize}rem`,  // ✅ dynamic font size based on slider
            background: "#111",
            color: "#0ff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 0 30px #0ff",
            marginTop: "10px",
            display: "inline-block",
          }}
        >
          {getZoneTime(selectedZone)}
        </div>

        <div style={{ margin: "1rem 0" }}>
          <label>Clock Label: </label>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            style={{
              padding: "10px",
              margin: "5px",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label>Timezone: </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{
              padding: "10px",
              margin: "5px",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            {Intl.supportedValuesOf("timeZone").map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

<div style={{ margin: "30px 0" }}>
  <ins className="adsbygoogle"
       style={{ display: "block" }}
       data-ad-client="ca-pub-7817395457584126"
       data-ad-slot="6362211799"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
</div>

        <h2>Countdown Timer</h2>
        <div>

        <p style={{ fontSize: "2rem" }}>Countdown starts at 10 seconds - Includes Sound</p>

        <button
         onClick={addCountdown}
         disabled={countdowns.length > 0}
         style={{
          padding: "10px 20px",
          margin: "5px",
          borderRadius: "5px",
          background: darkMode ? "#0ff" : "#000",
          color: darkMode ? "#000" : "#fff",
          border: "none",
          cursor: countdowns.length > 0 ? "not-allowed" : "pointer"
         }}
>
  Start Countdown
</button>
        </div>

        {countdowns.map((cd) => (
          <div
            key={cd.id}
            style={{
              border: "4px solid #0ff",
              borderRadius: "10px",
              padding: "2rem",
              margin: "2rem auto",
              maxWidth: "400px",
              fontSize: "3rem", // ⬅️ Add this line
              textAlign: "center", // Optional: center-align the text
            }}
          >
<div
  style={{
    fontSize: "4rem",
    color:
      cd.running && cd.time <= 3
        ? cd.time % 2 === 0
          ? "#000"
          : "#fff"
        : "#0ff",
    backgroundColor:
      cd.running && cd.time <= 3
        ? cd.time % 2 === 0
          ? "#f00"
          : "#000"
        : "transparent",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    animation:
      cd.running && cd.time <= 3
        ? "pulse 1s infinite"
        : "none",
  }}
>
  ⏳ {formatTime(cd.time ?? 0)}
</div>


            {cd.message && <div>{cd.message}</div>}
            <div>
              <button
                onClick={() => resetCountdown(cd.id)}
                style={{
                  padding: "8px",
                  margin: "10px",
                  borderRadius: "5px",
                  background: "#0ff",
                  color: "#000",
                  border: "none",
                }}
              >
                Reset
              </button>
              <button
                onClick={() => deleteCountdown(cd.id)}
                style={{
                  padding: "8px",
                  margin: "6px",
                  borderRadius: "5px",
                  background: "#f55",
                  color: "#fff",
                  border: "none",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}


<div style={{ margin: "30px 0" }}>
  <ins
    className="adsbygoogle"
    style={{ display: "block" }}
     data-ad-client="ca-pub-7817395457584126"
     data-ad-slot="6362211799"
    data-ad-format="auto"
    data-full-width-responsive="true"
  />
</div>
</div>
    </>
  );
}


