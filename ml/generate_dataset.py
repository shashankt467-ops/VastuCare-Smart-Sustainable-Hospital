import random
import os
import pandas as pd
import json
import math

def generate_dataset(num_samples=12000, seed=42):
    # Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "data", "synthetic")
    os.makedirs(output_dir, exist_ok=True)
    
    random.seed(seed)
    
    samples = []
    discard_stats = {
        "total_generated": 0,
        "valid": 0,
        "discard_dept_area": 0,
        "discard_open_space": 0,
        "discard_density": 0
    }
    
    for i in range(num_samples):
        discard_stats["total_generated"] += 1
        
        # 1. INPUT FEATURES
        site_length_m = random.uniform(30, 200)
        site_width_m = random.uniform(30, 150)
        north_angle = random.uniform(0, 359)
        latitude = random.uniform(8, 35)
        longitude = random.uniform(68, 97)
        climate_zone = random.choice(['tropical', 'temperate', 'arid', 'cold'])
        floors = random.randint(1, 5)
        bed_capacity = random.choice([30, 50, 75, 100, 150, 200, 250, 300, 400, 500])
        
        has_emergency = random.random() < 0.80
        has_icu = random.random() < 0.75
        has_ot = random.random() < 0.70
        has_opd = random.random() < 0.95
        has_pharmacy = random.random() < 0.90
        has_lab = random.random() < 0.80
        has_radiology = random.random() < 0.60
        has_cafeteria = random.random() < 0.70
        has_solar = random.random() < 0.75
        has_rainwater = random.random() < 0.65
        has_courtyard = random.random() < 0.60
        has_green_roof = random.random() < 0.40
        occupancy_percent = random.uniform(40, 95)
        
        if climate_zone == 'tropical':
            rainfall_mm_assumption = random.uniform(1200, 2500)
            avg_temp_assumption = random.uniform(25, 35)
        elif climate_zone == 'temperate':
            rainfall_mm_assumption = random.uniform(600, 1200)
            avg_temp_assumption = random.uniform(15, 25)
        elif climate_zone == 'arid':
            rainfall_mm_assumption = random.uniform(100, 400)
            avg_temp_assumption = random.uniform(30, 45)
        else: # cold
            rainfall_mm_assumption = random.uniform(400, 800)
            avg_temp_assumption = random.uniform(0, 15)

        # 2. DERIVED FEATURES
        site_area_sqm = site_length_m * site_width_m
        dept_count = sum([has_emergency, has_icu, has_ot, has_opd, has_pharmacy, has_lab, has_radiology, has_cafeteria])
        built_area_per_floor = site_area_sqm * random.uniform(0.45, 0.65)
        built_area_sqm = built_area_per_floor * floors
        open_space_percent = (1 - built_area_per_floor / site_area_sqm) * 100
        courtyard_area_sqm = site_area_sqm * random.uniform(0.05, 0.15) if has_courtyard else 0
        green_area_sqm = courtyard_area_sqm + (site_area_sqm * random.uniform(0.05, 0.15))
        solar_area_sqm = built_area_per_floor * random.uniform(0.3, 0.6) if has_solar else 0
        roof_area_sqm = built_area_per_floor
        avg_window_ratio = random.uniform(0.15, 0.35)

        # 3. DEPARTMENT AREAS
        area_per_bed = random.uniform(8, 14)
        ward_area_sqm = bed_capacity * area_per_bed * 0.4
        icu_area_sqm = bed_capacity * area_per_bed * 0.08 if has_icu else 0
        ot_area_sqm = bed_capacity * area_per_bed * 0.06 if has_ot else 0
        opd_area_sqm = bed_capacity * area_per_bed * 0.12 if has_opd else 0
        emergency_area_sqm = bed_capacity * area_per_bed * 0.07 if has_emergency else 0
        
        sum_dept_areas = ward_area_sqm + icu_area_sqm + ot_area_sqm + opd_area_sqm + emergency_area_sqm
        corridor_factor = random.uniform(1.15, 1.25)
        total_dept_area = sum_dept_areas * corridor_factor

        # 4. VALIDATION
        if total_dept_area > built_area_sqm:
            discard_stats["discard_dept_area"] += 1
            continue
        if open_space_percent < 15:
            discard_stats["discard_open_space"] += 1
            continue
        if bed_capacity > site_area_sqm / 4:
            discard_stats["discard_density"] += 1
            continue
            
        discard_stats["valid"] += 1

        # 5. TARGET LABELS

        # Vastu Score
        vastu = 50
        if 0 <= north_angle <= 45 or 315 <= north_angle <= 360:
            vastu += 15
        elif 45 < north_angle < 135:
            vastu += 12
        if has_courtyard:
            vastu += 10
        if open_space_percent > 30:
            vastu += 8
        if avg_window_ratio > 0.2:
            vastu += 5
        vastu = max(0, min(100, vastu))
        vastu += random.uniform(-3, 3)
        vastu = max(0, min(100, vastu))

        # Solar Potential
        solar_base = 40
        solar_area_factor = min(30, (solar_area_sqm / roof_area_sqm) * 40) if (has_solar and roof_area_sqm > 0) else 0
        climate_solar = {'tropical': 20, 'temperate': 15, 'arid': 25, 'cold': 10}[climate_zone]
        orientation_solar = 10 if 135 <= north_angle <= 225 else 5
        solar_potential = solar_base + solar_area_factor + climate_solar + orientation_solar
        solar_potential = max(0, min(100, solar_potential))
        solar_potential += random.uniform(-2, 2)
        solar_potential = max(0, min(100, solar_potential))

        # Daylight Potential
        daylight_base = 30
        window_factor = avg_window_ratio * 80
        courtyard_factor = 15 if has_courtyard else 0
        floor_factor = -2 * (floors - 1)
        # Orientation for daylight: east/north facing -> east is roughly 45-135, north is 315-45.
        is_east_north = (0 <= north_angle <= 135) or (315 <= north_angle <= 360)
        orientation_daylight = 10 if is_east_north else 5
        
        daylight_potential = daylight_base + window_factor + courtyard_factor + floor_factor + orientation_daylight
        daylight_potential = max(0, min(100, daylight_potential))
        daylight_potential += random.uniform(-3, 3)
        daylight_potential = max(0, min(100, daylight_potential))

        # Ventilation Potential
        vent_base = 35
        vent_courtyard = 20 if has_courtyard else 0
        open_space_factor = open_space_percent * 0.5
        vent_window = avg_window_ratio * 40
        vent_climate = {'tropical': 10, 'temperate': 8, 'arid': -5, 'cold': -10}[climate_zone]
        ventilation_potential = vent_base + vent_courtyard + open_space_factor + vent_window + vent_climate
        ventilation_potential = max(0, min(100, ventilation_potential))
        ventilation_potential += random.uniform(-3, 3)
        ventilation_potential = max(0, min(100, ventilation_potential))

        # Rainwater Potential
        rain_base = 20
        rain_has_factor = 25 if has_rainwater else 0
        rain_roof = min(20, (roof_area_sqm / 200) * 10)
        rain_rainfall = min(25, rainfall_mm_assumption / 100)
        rain_green_roof = 10 if has_green_roof else 0
        rainwater_potential = rain_base + rain_has_factor + rain_roof + rain_rainfall + rain_green_roof
        rainwater_potential = max(0, min(100, rainwater_potential))
        rainwater_potential += random.uniform(-2, 2)
        rainwater_potential = max(0, min(100, rainwater_potential))

        # Green Coverage Score
        green_ratio = green_area_sqm / site_area_sqm
        green_base = green_ratio * 200
        green_court = 15 if has_courtyard else 0
        green_roof_bonus = 10 if has_green_roof else 0
        green_coverage_score = green_base + green_court + green_roof_bonus
        green_coverage_score = max(0, min(100, green_coverage_score))
        green_coverage_score += random.uniform(-2, 2)
        green_coverage_score = max(0, min(100, green_coverage_score))

        # Energy Demand
        base_per_bed_energy = 12
        icu_energy = icu_area_sqm * 0.15
        ot_energy = ot_area_sqm * 0.20
        lab_energy = 0.08 * built_area_sqm if has_lab else 0
        climate_cooling = {'tropical': 1.3, 'temperate': 1.0, 'arid': 1.4, 'cold': 1.2}[climate_zone]
        solar_mult = {'tropical': 5, 'arid': 4}.get(climate_zone, 3.5)
        solar_offset = solar_area_sqm * 0.15 * solar_mult
        
        energy_demand = (bed_capacity * base_per_bed_energy + icu_energy + ot_energy + lab_energy) * climate_cooling * (occupancy_percent / 100) - solar_offset
        energy_demand = max(energy_demand, bed_capacity * 3)
        energy_demand *= random.uniform(0.95, 1.05)

        # Peak Energy
        peak_energy = energy_demand * random.uniform(0.08, 0.12)

        # Water Demand
        base_water_bed = 350
        occupancy_factor = occupancy_percent / 100
        dept_factor = 1.0 + 0.03 * dept_count
        laundry_factor = 1.1 if bed_capacity > 100 else 1.0
        climate_water = {'tropical': 1.15, 'arid': 1.2, 'temperate': 1.0, 'cold': 0.95}[climate_zone]
        
        water_demand = bed_capacity * base_water_bed * occupancy_factor * dept_factor * laundry_factor * climate_water
        water_demand *= random.uniform(0.97, 1.03)

        # Rainwater Harvest
        annual_collection = roof_area_sqm * rainfall_mm_assumption * 0.8  # /1000 * 1000 cancels out
        daily_rainwater = annual_collection / 365
        if not has_rainwater:
            daily_rainwater = 0
        daily_rainwater *= random.uniform(0.95, 1.05)

        # Sustainability Sub-scores
        solar_pct = (solar_offset / max(energy_demand + solar_offset, 1)) * 100
        energy_score = min(25, max(10, 15 + solar_pct * 0.1))
        
        water_saved_pct = min(40, (daily_rainwater / max(water_demand, 1)) * 100)
        water_score = min(20, max(8, 10 + water_saved_pct * 0.25))
        
        waste_score = 14 + (2 if has_courtyard else 0) + min(4, dept_count * 0.3)
        
        ieq_score = min(15, max(5, ventilation_potential * 0.12 + 3))
        
        daylight_score_val = min(10, max(4, daylight_potential * 0.09 + 2))
        
        green_score = min(10, max(3, green_coverage_score * 0.08 + 2))

        sustainability_score = energy_score + water_score + waste_score + ieq_score + daylight_score_val + green_score

        # Adjacency Score
        adjacency = 60
        if has_emergency and has_icu: adjacency += 10
        if has_ot and has_icu: adjacency += 8
        if has_opd and has_pharmacy: adjacency += 7
        if dept_count > 10: adjacency -= 5
        if floors > 3: adjacency -= 3
        adjacency += random.uniform(-8, 8)
        adjacency = max(0, min(100, adjacency))

        # Layout Quality Score
        layout_quality = (0.25 * adjacency + 
                          0.20 * vastu + 
                          0.15 * daylight_potential + 
                          0.15 * ventilation_potential + 
                          0.15 * solar_potential + 
                          0.10 * green_coverage_score)
                          
        # Append to samples
        samples.append({
            'data_source': 'synthetic_simulation',
            'dataset_version': 'v1',
            'site_length_m': site_length_m,
            'site_width_m': site_width_m,
            'north_angle': north_angle,
            'latitude': latitude,
            'longitude': longitude,
            'climate_zone': climate_zone,
            'floors': floors,
            'bed_capacity': bed_capacity,
            'has_emergency': has_emergency,
            'has_icu': has_icu,
            'has_ot': has_ot,
            'has_opd': has_opd,
            'has_pharmacy': has_pharmacy,
            'has_lab': has_lab,
            'has_radiology': has_radiology,
            'has_cafeteria': has_cafeteria,
            'has_solar': has_solar,
            'has_rainwater': has_rainwater,
            'has_courtyard': has_courtyard,
            'has_green_roof': has_green_roof,
            'occupancy_percent': occupancy_percent,
            'rainfall_mm_assumption': rainfall_mm_assumption,
            'avg_temp_assumption': avg_temp_assumption,
            'site_area_sqm': site_area_sqm,
            'dept_count': dept_count,
            'built_area_per_floor': built_area_per_floor,
            'built_area_sqm': built_area_sqm,
            'open_space_percent': open_space_percent,
            'courtyard_area_sqm': courtyard_area_sqm,
            'green_area_sqm': green_area_sqm,
            'solar_area_sqm': solar_area_sqm,
            'roof_area_sqm': roof_area_sqm,
            'avg_window_ratio': avg_window_ratio,
            'area_per_bed': area_per_bed,
            'ward_area_sqm': ward_area_sqm,
            'icu_area_sqm': icu_area_sqm,
            'ot_area_sqm': ot_area_sqm,
            'opd_area_sqm': opd_area_sqm,
            'emergency_area_sqm': emergency_area_sqm,
            'total_dept_area': total_dept_area,
            'vastu_score': vastu,
            'solar_potential': solar_potential,
            'daylight_potential': daylight_potential,
            'ventilation_potential': ventilation_potential,
            'rainwater_potential': rainwater_potential,
            'green_coverage_score': green_coverage_score,
            'energy_demand_kwh_day': energy_demand,
            'peak_energy_kwh': peak_energy,
            'water_demand_liters_day': water_demand,
            'rainwater_harvest_liters_day': daily_rainwater,
            'energy_score': energy_score,
            'water_score': water_score,
            'waste_score': waste_score,
            'ieq_score': ieq_score,
            'daylight_score': daylight_score_val,
            'green_score': green_score,
            'sustainability_score': sustainability_score,
            'adjacency_score': adjacency,
            'layout_quality_score': layout_quality
        })

        if discard_stats["total_generated"] % 1000 == 0:
            print(f"Generated {discard_stats['total_generated']} candidates. Valid so far: {discard_stats['valid']}")

    # Convert to DataFrame
    df = pd.DataFrame(samples)
    
    # Save files
    csv_path = os.path.join(output_dir, "hospital_designs_v1.csv")
    df.to_csv(csv_path, index=False)
    
    json_path = os.path.join(output_dir, "dataset_summary.json")
    with open(json_path, 'w') as f:
        json.dump(discard_stats, f, indent=4)
        
    print("\nGeneration Complete!")
    print(f"Total Generated: {discard_stats['total_generated']}")
    print(f"Valid Samples Saved: {discard_stats['valid']}")
    print(f"Discarded - Department Area mismatch: {discard_stats['discard_dept_area']}")
    print(f"Discarded - Not enough open space: {discard_stats['discard_open_space']}")
    print(f"Discarded - Density too high: {discard_stats['discard_density']}")
    print(f"\nSaved CSV to: {csv_path}")
    print(f"Saved Summary to: {json_path}")

if __name__ == "__main__":
    # Generate at least 12,000 samples to yield ~10,000+ valid records
    generate_dataset(num_samples=12000, seed=42)
