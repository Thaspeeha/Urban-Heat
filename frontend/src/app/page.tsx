"use client";
import Image from "next/image";
import Header from "./components/Header";

export default function Home() {
  return (
    <div
      className="font-[Kumbh_Sans] text-[#2A4C4A] overflow-x-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        scrollBehavior: "smooth",
      }}
    >
      {/* Header at the top */}
      <Header />

      {/* Hero Section */}
      <section
        className="relative flex flex-col justify-center text-white w-full h-[870px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/dashboad-img.jpg')",
        }}
      >
        <div
          className="absolute right-[10%] top-[25%] w-[129px] h-[142px] bg-no-repeat bg-cover"
          style={{
            backgroundImage: "url('/OIP__8_-removebg-preview.png')",
          }}
        />

        <div className="px-8 md:px-16 max-w-3xl z-10">
          <h2 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight">
            Building Cooler Futures for Desert Cities
          </h2>
          <p className="text-2xl md:text-3xl mb-10">
            AI-driven heat resilience for the UAE
          </p>

          <div className="flex flex-col md:flex-row gap-6">
            <a
              href="/coolpath"
              className="rounded-lg px-10 py-5 text-2xl text-center text-white hover:opacity-90 transition"
              style={{
                background: "rgba(52,107,164,0.9)",
              }}
            >
              Explore CoolPath
            </a>
            <a
              href="/predictor"
              className="rounded-lg px-10 py-5 text-2xl text-center text-white hover:opacity-90 transition"
              style={{
                background: "rgba(52,107,164,0.9)",
              }}
            >
              Explore HeatVision 2030
            </a>
          </div>
        </div>
      </section>

      {/* CoolPath Section */}
      <section
        id="coolpath"
        className="grid md:grid-cols-2 gap-12 items-center py-20 px-8 md:px-16 w-full"
        style={{
          background: "#FCEDD7",
        }}
      >
        <div>
          <h2
            className="font-bold mb-6 text-4xl md:text-5xl"
            style={{ color: "#346AA3" }}
          >
            CoolPath
          </h2>
          <p className="text-2xl md:text-3xl leading-snug">
            Discover Cooler Routes, Not Just Shorter Ones. <br />
            AI-powered heat-safe mobility for walking and cycling routes. <br />
            Uses satellite data, urban heat island effects, and sunlight timing.
          </p>
        </div>
        <div
          className="rounded-2xl overflow-hidden shadow-lg w-full h-[350px] bg-cover bg-center"
          style={{
            backgroundImage: "url('/heatzones2.jpg')",
          }}
        />
      </section>

      {/* HeatVision Section */}
      <section
        id="heatvision"
        className="grid md:grid-cols-2 gap-12 items-center py-20 px-8 md:px-16 w-full"
        style={{
          background: "#FCEDD7",
        }}
      >
        <div>
          <h2
            className="font-bold mb-6 text-4xl md:text-5xl"
            style={{ color: "#346AA3" }}
          >
            HeatVision 2030
          </h2>
          <p className="text-2xl md:text-3xl leading-snug">
            Predicts future heat intensification zones for 2030 using a machine
            learning model trained on past satellite data.
          </p>
        </div>
        <div
          className="rounded-2xl overflow-hidden shadow-lg w-full h-[350px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/heat zones.jpg')",
          }}
        />
      </section>

      {/* Footer Section */}
      <footer
        className="flex items-center justify-center w-full py-20 px-8"
        style={{
          background: "#FFD86F",
        }}
      >
        <p
          className="text-2xl md:text-3xl italic font-semibold text-center max-w-5xl"
          style={{
            color: "#A33434",
          }}
        >
          🌎 Note: Our model provides data-driven insights to help understand
          urban heat patterns. While results are carefully estimated, they may
          not be 100% precise due to natural and environmental variations.
        </p>
      </footer>
    </div>
  );
}
