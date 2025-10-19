from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from datetime import datetime
import os
import folium
from folium.plugins import HeatMap
import osmnx as ox
import networkx as nx
from typing import Optional, List, Dict
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Urban Heat & CoolPath API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== HEAT MAP SECTION ====================

# Data paths
DATA_FOLDER = "data"
LST_FILE = "lst-final-MOD11A1-061-results.csv"
VEG_FILE = "Downtown-evi-ndvi-MOD13A1-061-results.csv"

# Global variables for heat map
processed_data = {
    "merged_df": None,
    "merged_df_original": None,
    "model": None,
    "scaler": None,
    "numerical_cols": None,
    "lat_center": None,
    "lon_center": None,
    "lst_df": None
}

def load_and_train_model():
    """Load data from folder and train model on startup"""
    try:
        lst_path = os.path.join(DATA_FOLDER, LST_FILE)
        veg_path = os.path.join(DATA_FOLDER, VEG_FILE)
        
        lst_df = pd.read_csv(lst_path)
        veg_df = pd.read_csv(veg_path)
        
        print(f"✅ Loaded {len(lst_df)} LST records and {len(veg_df)} vegetation records")
        
        date_col = [c for c in lst_df.columns if "date" in c.lower()][0]
        date_col_veg = [c for c in veg_df.columns if "date" in c.lower()][0]
        
        lst_df[date_col] = pd.to_datetime(lst_df[date_col], errors="coerce")
        veg_df[date_col_veg] = pd.to_datetime(veg_df[date_col_veg], errors="coerce")
        
        merged_df = pd.merge(lst_df, veg_df, on=['Date', 'Latitude', 'Longitude'], how='inner')
        print(f"✅ Merged data: {len(merged_df)} records")
        
        merged_df['Day_of_Year'] = merged_df[date_col].dt.dayofyear
        
        lst_day_col = None
        for col in merged_df.columns:
            if "lst_day" in col.lower() and merged_df[col].dtype in ['float64', 'int64']:
                lst_day_col = col
                break
        
        veg_col = None
        if "NDVI" in merged_df.columns and merged_df["NDVI"].dtype in ['float64', 'int64']:
            veg_col = "NDVI"
        elif "EVI" in merged_df.columns and merged_df["EVI"].dtype in ['float64', 'int64']:
            veg_col = "EVI"
        
        numerical_cols = ['Day_of_Year', lst_day_col]
        if veg_col:
            numerical_cols.append(veg_col)
        
        merged_df_original = merged_df.copy()
        
        scaler = MinMaxScaler()
        merged_df[numerical_cols] = scaler.fit_transform(merged_df[numerical_cols])
        
        X = merged_df[['Day_of_Year', lst_day_col]]
        y = merged_df[lst_day_col]
        
        model = LinearRegression()
        model.fit(X, y)
        
        lat_col = [c for c in lst_df.columns if "lat" in c.lower()][0]
        lon_col = [c for c in lst_df.columns if "lon" in c.lower()][0]
        lat_center = float(lst_df[lat_col].mean())
        lon_center = float(lst_df[lon_col].mean())
        
        processed_data["merged_df"] = merged_df
        processed_data["merged_df_original"] = merged_df_original
        processed_data["model"] = model
        processed_data["scaler"] = scaler
        processed_data["numerical_cols"] = numerical_cols
        processed_data["lat_center"] = lat_center
        processed_data["lon_center"] = lon_center
        processed_data["lst_df"] = lst_df
        
        print("✅ Model trained successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading data: {str(e)}")
        return False

@app.on_event("startup")
async def startup_event():
    load_and_train_model()

@app.get("/")
def read_root():
    return {
        "message": "Urban Heat & CoolPath API is running",
        "heat_map_status": "Model loaded" if processed_data["model"] is not None else "Model not loaded",
        "route_graphs": list(graphs.keys())
    }

@app.get("/heat-map/{year}", response_class=HTMLResponse)
async def get_heat_map(year: int = 2030):
    try:
        merged_df = processed_data["merged_df"]
        model = processed_data["model"]
        scaler = processed_data["scaler"]
        numerical_cols = processed_data["numerical_cols"]
        
        if merged_df is None or model is None:
            raise HTTPException(status_code=500, detail="Model not loaded. Check data folder.")
        
        date_col = [c for c in merged_df.columns if "date" in c.lower()][0]
        lst_day_col = numerical_cols[1]
        
        future_date = datetime(year, 9, 30)
        future_pred_df = merged_df[['Latitude', 'Longitude']].drop_duplicates().copy()
        day_of_year_raw = future_date.timetuple().tm_yday
        
        temp_scale_df = pd.DataFrame()
        temp_scale_df['Day_of_Year'] = [day_of_year_raw] * len(future_pred_df)
        for col in numerical_cols:
            if col != 'Day_of_Year':
                temp_scale_df[col] = 0
        
        scaled_features = scaler.transform(temp_scale_df[numerical_cols])
        future_pred_df['Day_of_Year_scaled'] = scaled_features[:, 0]
        
        median_scaled_lst = merged_df[lst_day_col].median()
        
        X_future = pd.DataFrame({
            'Day_of_Year': future_pred_df['Day_of_Year_scaled'],
            lst_day_col: median_scaled_lst
        })
        
        future_pred_df['Future_LST_scaled'] = model.predict(X_future)
        
        temp_denorm = pd.DataFrame()
        temp_denorm['Day_of_Year'] = future_pred_df['Day_of_Year_scaled']
        temp_denorm[lst_day_col] = future_pred_df['Future_LST_scaled']
        
        if len(numerical_cols) > 2:
            temp_denorm[numerical_cols[2]] = 0
        
        denormalized = scaler.inverse_transform(temp_denorm[numerical_cols])
        future_pred_df['Future_LST_Kelvin'] = denormalized[:, 1]
        future_pred_df['Future_LST'] = future_pred_df['Future_LST_Kelvin'] - 273.15
        
        merged_df_original = processed_data["merged_df_original"]
        lst_day_col_original = None
        for col in merged_df_original.columns:
            if "lst_day" in col.lower() and merged_df_original[col].dtype in ['float64', 'int64']:
                lst_day_col_original = col
                break
        
        merged_df_original_celsius = merged_df_original.copy()
        merged_df_original_celsius[lst_day_col_original] -= 273.15
        
        merged_temp = pd.merge(
            future_pred_df,
            merged_df_original_celsius[['Latitude', 'Longitude', lst_day_col_original]].drop_duplicates(),
            on=['Latitude', 'Longitude'],
            how='left'
        )
        
        future_lst_quantiles = future_pred_df['Future_LST'].quantile([0.25, 0.5, 0.75])
        low_threshold = future_lst_quantiles[0.25]
        medium_threshold = future_lst_quantiles[0.50]
        high_threshold = future_lst_quantiles[0.75]
        
        def assign_heat_zone(lst):
            if lst <= low_threshold:
                return 'Low'
            elif lst <= medium_threshold:
                return 'Medium'
            elif lst > high_threshold:
                return 'High'
            else:
                return 'Medium-High'
        
        merged_temp['Future_Heat_Zone'] = merged_temp['Future_LST'].apply(assign_heat_zone)
        
        m_future_heat = folium.Map(
            location=[processed_data["lat_center"], processed_data["lon_center"]],
            zoom_start=13,
            tiles="cartodbdarkmatter"
        )
        
        folium.TileLayer('OpenStreetMap').add_to(m_future_heat)
        
        geojson_features = []
        for index, row in merged_temp.dropna(subset=['Latitude', 'Longitude', 'Future_Heat_Zone', 'Future_LST']).iterrows():
            feature = {
                'type': 'Feature',
                'geometry': {'type': 'Point', 'coordinates': [row['Longitude'], row['Latitude']]},
                'properties': {
                    'Future_Heat_Zone': row['Future_Heat_Zone'],
                    'Future_LST': float(row['Future_LST']),
                    'Current_LST': float(row[lst_day_col_original]) if pd.notna(row[lst_day_col_original]) else 0,
                },
                'id': str(index)
            }
            geojson_features.append(feature)
        
        geojson_data = {'type': 'FeatureCollection', 'features': geojson_features}
        
        def style_function(feature):
            heat_zone = feature['properties']['Future_Heat_Zone']
            color_map = {'Low': 'green', 'Medium': 'yellow', 'Medium-High': 'orange', 'High': 'red'}
            return {'radius': 8, 'fillColor': color_map.get(heat_zone, 'white'), 'color': 'black',
                    'weight': 1, 'opacity': 1, 'fillOpacity': 0.8}
        
        folium.GeoJson(
            geojson_data,
            name='Future Heat Zones',
            marker=folium.CircleMarker(),
            style_function=style_function,
            tooltip=folium.features.GeoJsonTooltip(
                fields=['Future_Heat_Zone', 'Future_LST', 'Current_LST'],
                aliases=['Future Heat Zone:', 'Predicted Future LST (°C):', 'Current LST (°C):'],
                localize=True
            )
        ).add_to(m_future_heat)
        
        folium.LayerControl().add_to(m_future_heat)
        
        return m_future_heat._repr_html_()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating map: {str(e)}")

# ==================== COOL PATH SECTION ====================

DUBAI_CENTER = (25.2048, 55.2708)
graphs: Dict = {}
node_latlng: Dict[str, Dict] = {}

class RouteRequest(BaseModel):
    start_place: str
    end_place: str
    transport_mode: str

class RouteResponse(BaseModel):
    start_coords: List[float]
    end_coords: List[float]
    route_fast: List[List[float]]
    route_cool: List[List[float]]
    fast_length: float
    cool_length: float
    error: Optional[str] = None

def load_graph(transport_mode: str):
    """Load and cache OSM graph for given transport mode"""
    global node_latlng
    
    if transport_mode not in graphs:
        try:
            logger.info(f"Loading {transport_mode} graph for Downtown Dubai...")
            G = ox.graph_from_point(DUBAI_CENTER, dist=2000, network_type=transport_mode)
            
            node_latlng[transport_mode] = {
                node: (float(data['y']), float(data['x'])) 
                for node, data in G.nodes(data=True)
            }
            
            G = ox.project_graph(G)
            graphs[transport_mode] = G
            logger.info(f"Graph loaded: {len(G.nodes)} nodes, {len(G.edges)} edges")
        except Exception as e:
            logger.error(f"Failed to load graph: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load map data: {str(e)}")
    return graphs[transport_mode]

def get_coords(place: str) -> List[float]:
    """Geocode a place name to coordinates"""
    try:
        if "dubai" not in place.lower():
            place = f"{place}, Dubai, UAE"
        coords = ox.geocode(place)
        return [float(coords[0]), float(coords[1])]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not find location: {place}")

def get_route_length(G, route: List) -> float:
    """Calculate total route length in meters"""
    length = 0.0
    for u, v in zip(route[:-1], route[1:]):
        data = G.get_edge_data(u, v)
        if isinstance(data, dict):
            if 0 in data:
                length += data[0].get("length", 0)
            else:
                length += list(data.values())[0].get("length", 0)
    return length

def calculate_shade_weights(G):
    """Add shade weights to edges based on road type"""
    for u, v, data in G.edges(data=True):
        highway = data.get("highway", "")
        
        if isinstance(highway, list):
            highway = highway[0] if highway else ""
        
        if highway in ["residential", "service", "pedestrian", "footway", "living_street", "path"]:
            data["shade_weight"] = data.get("length", 100) * 0.7
        elif highway in ["primary", "secondary", "trunk"]:
            data["shade_weight"] = data.get("length", 100) * 1.5
        else:
            data["shade_weight"] = data.get("length", 100)

@app.post("/find_route", response_model=RouteResponse)
async def find_route(req: RouteRequest):
    """Find fastest and coolest routes between two locations"""
    try:
        if req.transport_mode not in ['walk', 'bike']:
            raise HTTPException(status_code=400, detail="transport_mode must be 'walk' or 'bike'")
        
        G = load_graph(req.transport_mode)
        start_coords = get_coords(req.start_place)
        end_coords = get_coords(req.end_place)

        min_dist_start = float('inf')
        min_dist_end = float('inf')
        orig = None
        dest = None
        
        for node, (lat, lng) in node_latlng[req.transport_mode].items():
            dist_start = ((lat - start_coords[0])**2 + (lng - start_coords[1])**2)**0.5
            if dist_start < min_dist_start:
                min_dist_start = dist_start
                orig = node
            
            dist_end = ((lat - end_coords[0])**2 + (lng - end_coords[1])**2)**0.5
            if dist_end < min_dist_end:
                min_dist_end = dist_end
                dest = node
        
        if orig == dest:
            raise HTTPException(status_code=400, detail="Start and end locations are too close together")

        if not nx.has_path(G, orig, dest):
            raise HTTPException(status_code=400, detail="No route found between these locations")

        route_fast = nx.shortest_path(G, orig, dest, weight="length")
        calculate_shade_weights(G)
        route_cool = nx.shortest_path(G, orig, dest, weight="shade_weight")

        coords_fast = [list(node_latlng[req.transport_mode][n]) for n in route_fast]
        coords_cool = [list(node_latlng[req.transport_mode][n]) for n in route_cool]

        fast_length = get_route_length(G, route_fast)
        cool_length = get_route_length(G, route_cool)

        return RouteResponse(
            start_coords=start_coords,
            end_coords=end_coords,
            route_fast=coords_fast,
            route_cool=coords_cool,
            fast_length=fast_length,
            cool_length=cool_length
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "heat_map_loaded": processed_data["model"] is not None,
        "graphs_loaded": list(graphs.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)