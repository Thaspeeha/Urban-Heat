from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import osmnx as ox
import networkx as nx
from typing import Optional, List, Dict, Tuple
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ----------------------------
# FastAPI
# ----------------------------
app = FastAPI(title="CoolPath API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
    allow_credentials=True
)

# ----------------------------
# Request & Response models
# ----------------------------
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

# ----------------------------
# Global variables
# ----------------------------
DUBAI_CENTER = (25.2048, 55.2708)
graphs: Dict = {}
node_latlng: Dict[str, Dict] = {}

# ----------------------------
# Helper functions
# ----------------------------
def load_graph(transport_mode: str):
    """Load and cache OSM graph for given transport mode"""
    global node_latlng
    
    if transport_mode not in graphs:
        try:
            logger.info(f"Loading {transport_mode} graph for Downtown Dubai...")
            G = ox.graph_from_point(DUBAI_CENTER, dist=2000, network_type=transport_mode)
            
            # Store original lat/lng BEFORE projection
            node_latlng[transport_mode] = {
                node: (float(data['y']), float(data['x'])) 
                for node, data in G.nodes(data=True)
            }
            
            # Project for accurate routing
            G = ox.project_graph(G)
            
            graphs[transport_mode] = G
            logger.info(f"Graph loaded: {len(G.nodes)} nodes, {len(G.edges)} edges")
            logger.info(f"Stored {len(node_latlng[transport_mode])} node coordinates")
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
        logger.info(f"Geocoded '{place}' to {coords}")
        return [float(coords[0]), float(coords[1])]
    except Exception as e:
        logger.error(f"Geocoding failed for '{place}': {e}")
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

# ----------------------------
# Main endpoint
# ----------------------------
@app.post("/find_route", response_model=RouteResponse)
async def find_route(req: RouteRequest):
    """Find fastest and coolest routes between two locations"""
    try:
        if req.transport_mode not in ['walk', 'bike']:
            raise HTTPException(status_code=400, detail="transport_mode must be 'walk' or 'bike'")
        
        G = load_graph(req.transport_mode)

        logger.info(f"Finding route from '{req.start_place}' to '{req.end_place}'")
        start_coords = get_coords(req.start_place)
        end_coords = get_coords(req.end_place)

        # Find nearest nodes using UNPROJECTED coordinates
        # We need to search in the lat/lng space, not projected space
        min_dist_start = float('inf')
        min_dist_end = float('inf')
        orig = None
        dest = None
        
        for node, (lat, lng) in node_latlng[req.transport_mode].items():
            # Calculate distance to start
            dist_start = ((lat - start_coords[0])**2 + (lng - start_coords[1])**2)**0.5
            if dist_start < min_dist_start:
                min_dist_start = dist_start
                orig = node
            
            # Calculate distance to end
            dist_end = ((lat - end_coords[0])**2 + (lng - end_coords[1])**2)**0.5
            if dist_end < min_dist_end:
                min_dist_end = dist_end
                dest = node

        logger.info(f"Origin node: {orig} (dist: {min_dist_start:.6f}), Destination node: {dest} (dist: {min_dist_end:.6f})")
        
        if orig == dest:
            raise HTTPException(status_code=400, detail="Start and end locations are too close together. Try locations further apart.")

        if not nx.has_path(G, orig, dest):
            raise HTTPException(status_code=400, detail="No route found between these locations")

        route_fast = nx.shortest_path(G, orig, dest, weight="length")

        calculate_shade_weights(G)
        route_cool = nx.shortest_path(G, orig, dest, weight="shade_weight")

        # Convert node IDs to coordinates using stored lat/lng
        coords_fast = [list(node_latlng[req.transport_mode][n]) for n in route_fast]
        coords_cool = [list(node_latlng[req.transport_mode][n]) for n in route_cool]

        logger.info(f"Converted routes - Fast: {len(coords_fast)} points, Cool: {len(coords_cool)} points")
        logger.info(f"Sample fast coord: {coords_fast[0] if coords_fast else 'none'}")

        fast_length = get_route_length(G, route_fast)
        cool_length = get_route_length(G, route_cool)

        logger.info(f"Routes found - Fast: {fast_length:.0f}m, Cool: {cool_length:.0f}m")

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
        "graphs_loaded": list(graphs.keys())
    }