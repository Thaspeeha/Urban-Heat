# 🌆 UAE HeatLens

**Theme:** Urban Heat Island Mitigation using Open Data  
**Focus Area:** Downtown Dubai, United Arab Emirates  

---

## 📖 Project Overview

**UAE HeatLens** is a data-driven urban analytics tool designed to **visualize, predict, and mitigate Urban Heat Island (UHI)** effects in dense urban regions such as **Downtown Dubai**.  
By leveraging **open datasets** — including NASA MODIS Land Surface Temperature (LST) imagery and UAE meteorological records — the project provides interactive, AI-assisted insights to support **urban planners, policymakers, and citizens** in understanding and responding to rising urban heat.

---

## ⚠️ Problem Statement

The **Urban Heat Island (UHI)** effect poses a growing **environmental and public health challenge** in the UAE, especially in densely urbanized areas like **Downtown Dubai**.  
Rapid urbanization, limited vegetation, and heat-retaining surfaces have caused **surface temperatures to rise**, with urban cores often recording **several degrees higher** than surrounding natural zones.

📊 Data from **NASA MODIS LST datasets (2010–2024)** and **UAE meteorological records** reveal:
- A **steady increase** in land surface temperatures across the past decade.  
- **Summer temperatures frequently exceeding 45°C** on exposed surfaces.  

These extreme conditions impact **residents, pedestrians, and cyclists**, discouraging walking and cycling, and increasing reliance on **private vehicles** — further elevating **energy consumption and carbon emissions**.

While the UAE has launched multiple **national sustainability and resilience initiatives**, there remains a **gap in localized, interactive, and predictive heat visualization tools**.  
**UAE HeatLens** bridges this gap by transforming open data into actionable insights — empowering communities and urban planners to **adapt, plan, and act** against rising urban heat.

---

## 🧭 Objectives
- Map and analyze **urban heat intensity** across Downtown Dubai.  
- Use **open satellite and meteorological data** to predict future surface temperature trends.  
- Offer an **interactive web interface** to visualize real-time and forecasted heat patterns.  
- Support **evidence-based decision-making** for sustainable urban design and green infrastructure planning.

---

## 🧠 Tech Stack
- **Backend:** FastAPI (Python)  
- **Frontend:** Next.js + React + Leaflet/Folium  
- **Data Sources:** NASA MODIS, UAE Meteorological Data  
- **Deployment:** Under development phase (Ready to show live for PPT)

---

## 📖 Features

It uses **OpenStreetMap** and **NASA vegetation data** to provide two smart routing options:  
- **Faster Route:** the shortest path by time or distance.  
- **Cooler Path:** optimized to pass through **shaded and vegetated areas**, reducing **heat exposure** for pedestrians and cyclists.  

The system also integrates **NASA NDVI (Normalized Difference Vegetation Index)**, **EVI (Enhanced Vegetation Index)**, and **LST (Land Surface Temperature)** datasets from **2010–2025** to **forecast absolute future Land Surface Temperatures** in **Downtown Dubai**.  

Predicted temperatures are classified into four **Future Heat Zones**:
- **Low** — coolest 25%  
- **Medium** — 25–50%  
- **Medium-High** — 50–75%  
- **High** — hottest 25%  

“**Absolute predicted future LST values**” simply mean the **actual temperature** the model predicts for a specific location at a future point in time, rather than the relative change from today — giving a clear and realistic picture of how hot each location may become.

--

## 📈 Impact
By integrating open data and machine learning, **UAE HeatLens** aims to:
- Enhance **public awareness** of heat exposure risks.  
- Support **sustainable mobility and cooling strategies**.  
- Enable **policy-driven urban heat resilience** in Dubai and beyond.  

---

## 🎨 Figma Prototype
[![Open in Figma](https://img.shields.io/badge/Open%20in-Figma-blue?logo=figma)](https://www.figma.com/design/esmDyJnfGJG2018hC6sr3O/Innovation-Hackathon?node-id=0-1&t=k3E1M5muXM7BJeJi-1)

---

This project is used for educational purposes.

---

**Developed with 🌍 data and 💡 innovation for a cooler, smarter Dubai.**
