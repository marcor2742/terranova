#!/usr/bin/env python3
import json
import os
import re
from fractions import Fraction

# Measurement conversion constants
FLUID_OZ_TO_ML = 29.57
TSP_TO_ML = 4.93
TBSP_TO_ML = 14.79
DASH_TO_ML = 0.92
SPLASH_TO_ML = 5.0
DROP_TO_ML = 0.05
CUP_TO_ML = 236.59
SHOT_TO_ML = 44.36
PINT_TO_ML = 473.18

# Glass data with volumes
GLASS_VOLUMES = {
    "Highball glass": {"name": "Highball glass", "volume_ml": 300},
    "Cocktail glass": {"name": "Cocktail glass", "volume_ml": 120}, 
    "Old-fashioned glass": {"name": "Old-fashioned glass", "volume_ml": 240},
    "Collins glass": {"name": "Collins glass", "volume_ml": 350},
    "Whiskey Glass": {"name": "Whiskey glass", "volume_ml": 240},
    "Martini Glass": {"name": "Martini glass", "volume_ml": 150},
    "Margarita glass": {"name": "Margarita glass", "volume_ml": 250},
    "Wine Glass": {"name": "Wine glass", "volume_ml": 240},
    "Champagne flute": {"name": "Champagne flute", "volume_ml": 175},
    "Shot glass": {"name": "Shot glass", "volume_ml": 45},
    "Coffee mug": {"name": "Coffee mug", "volume_ml": 300},
    "Beer mug": {"name": "Beer mug", "volume_ml": 500},
    "Irish coffee cup": {"name": "Irish coffee cup", "volume_ml": 250},
    "Hurricane glass": {"name": "Hurricane glass", "volume_ml": 450},
    "Punch bowl": {"name": "Punch bowl", "volume_ml": 2000},
    "Pitcher": {"name": "Pitcher", "volume_ml": 1200},
    "Pint glass": {"name": "Pint glass", "volume_ml": 470},
    "Copper Mug": {"name": "Copper mug", "volume_ml": 350},
    "Beer Glass": {"name": "Beer glass", "volume_ml": 400},
    "Parfait glass": {"name": "Parfait glass", "volume_ml": 200},
    "Mason jar": {"name": "Mason jar", "volume_ml": 400},
    "Brandy snifter": {"name": "Brandy snifter", "volume_ml": 180},
    "Cordial glass": {"name": "Cordial glass", "volume_ml": 45},
    "White wine glass": {"name": "White wine glass", "volume_ml": 240},
    "Rocks glass": {"name": "Rocks glass", "volume_ml": 200},
    "Beer pilsner": {"name": "Beer pilsner", "volume_ml": 350},
    "Pousse cafe glass": {"name": "Pousse cafe glass", "volume_ml": 120},
    "Coupe glass": {"name": "Coupe glass", "volume_ml": 180},
    # Default for unknown glasses
    "unknown": {"name": "Standard glass", "volume_ml": 250}
}

def parse_fraction(fraction_str):
    """Parse fraction strings like 1/2, 1 1/2, etc."""
    try:
        # First check if it's a single fraction (e.g., '1/2')
        if '/' in fraction_str and ' ' not in fraction_str:
            return float(Fraction(fraction_str))
            
        # Check for mixed numbers like '1 1/2'
        if ' ' in fraction_str and '/' in fraction_str:
            whole, frac = fraction_str.split(' ', 1)
            return int(whole) + float(Fraction(frac))
        
        # If no fractions, just convert to float
        return float(fraction_str)
    except ValueError:
        return None

def convert_to_metric(measure):
    """Convert imperial measurements to metric"""
    if measure is None:
        return {"original": None, "metric": None, "unit": None}
    
    # Standardize spacing
    measure = measure.strip().lower()
    if not measure:
        return {"original": measure, "metric": None, "unit": None}
    
    # Handle special cases
    if measure in ['to taste', 'as needed', 'for rimming', '']:
        return {"original": measure, "metric": None, "unit": "to taste"}
        
    if 'fill' in measure or 'top' in measure or 'up with' in measure:
        return {"original": measure, "metric": None, "unit": "fill"}
    
    if any(word in measure for word in ['splash', 'sprinkle', 'garnish']):
        return {"original": measure, "metric": None, "unit": "garnish"}
    
    if any(word in measure for word in ['dash', 'dashes']):
        # Extract number of dashes
        dash_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*dash', measure)
        if dash_pattern:
            try:
                num_dashes = parse_fraction(dash_pattern.group(1))
                if num_dashes:
                    ml_value = round(num_dashes * DASH_TO_ML, 1)
                    return {"original": measure, "metric": ml_value, "unit": "ml"}
            except:
                pass
        return {"original": measure, "metric": DASH_TO_ML, "unit": "ml"}
    
    # Regular pattern matching for common units
    oz_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*(?:oz|ounce|fl oz|fluid ounce)', measure)
    tsp_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*(?:tsp|teaspoon)', measure)
    tbsp_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*(?:tbsp|tablespoon)', measure)
    cup_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*cup', measure)
    shot_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*shot', measure)
    pint_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*pint', measure)
    ml_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*ml', measure)
    cl_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*cl', measure)
    gram_pattern = re.search(r'(\d+(?:\s*\d*\/\d+)?)\s*(?:g|gram)', measure)
    
    # Just extract numbers if no unit is specified
    any_number = re.search(r'(\d+(?:\s*\d*\/\d+)?)', measure)
    
    if oz_pattern:
        amount = parse_fraction(oz_pattern.group(1))
        if amount:
            ml_value = round(amount * FLUID_OZ_TO_ML, 1)
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    elif tsp_pattern:
        amount = parse_fraction(tsp_pattern.group(1))
        if amount:
            ml_value = round(amount * TSP_TO_ML, 1)
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    elif tbsp_pattern:
        amount = parse_fraction(tbsp_pattern.group(1))
        if amount:
            ml_value = round(amount * TBSP_TO_ML, 1)
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    elif cup_pattern:
        amount = parse_fraction(cup_pattern.group(1))
        if amount:
            ml_value = round(amount * CUP_TO_ML, 1)
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    elif shot_pattern:
        amount = parse_fraction(shot_pattern.group(1))
        if amount:
            ml_value = round(amount * SHOT_TO_ML, 1)
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    elif pint_pattern:
        amount = parse_fraction(pint_pattern.group(1))
        if amount:
            ml_value = round(amount * PINT_TO_ML, 1)
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    elif ml_pattern:
        amount = parse_fraction(ml_pattern.group(1))
        if amount:
            return {"original": measure, "metric": round(amount, 1), "unit": "ml"}
    
    elif cl_pattern:
        amount = parse_fraction(cl_pattern.group(1))
        if amount:
            ml_value = round(amount * 10, 1)  # cl to ml
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    elif gram_pattern:
        amount = parse_fraction(gram_pattern.group(1))
        if amount:
            return {"original": measure, "metric": round(amount, 1), "unit": "g"}
            
    elif any_number:
        # For ambiguous measures, assume it's fl oz if related to drinks
        amount = parse_fraction(any_number.group(1))
        if amount:
            ml_value = round(amount * FLUID_OZ_TO_ML, 1)
            return {"original": measure, "metric": ml_value, "unit": "ml"}
    
    # Default for unrecognized formats
    return {"original": measure, "metric": None, "unit": "special"}

def get_glass_info(glass_name):
    """Look up glass information including volume"""
    if not glass_name:
        return GLASS_VOLUMES["unknown"]
        
    # Search for partial matches
    for key in GLASS_VOLUMES:
        if glass_name.lower() in key.lower() or key.lower() in glass_name.lower():
            return GLASS_VOLUMES[key]
    
    # Return a default if no match
    return {"name": glass_name, "volume_ml": GLASS_VOLUMES["unknown"]["volume_ml"]}

def transform_cocktail_data(input_file="cocktails_fixed.json", output_file="cocktails_metric.json"):
    """Transform the cocktail JSON data structure with metric conversions"""
    
    # Remove the comment line if it exists
    with open(input_file, 'r') as f:
        lines = f.readlines()
        if lines[0].strip().startswith('//'):
            lines = lines[1:]
        content = ''.join(lines)
    
    try:
        cocktails = json.loads(content)
    except json.JSONDecodeError:
        print("Error parsing JSON. Try removing the comment line with:")
        print("sed '1d' cocktails_fixed.json > cocktails_no_comment.json")
        return
    
    transformed_cocktails = []
    new_id = 1
    
    for cocktail in cocktails:
        # Skip empty entries
        if not isinstance(cocktail, dict) or "idDrink" not in cocktail:
            continue
            
        # Get glass information
        glass_info = get_glass_info(cocktail.get("strGlass"))
        
        # Create new cocktail structure
        new_cocktail = {
            "id": new_id,
            "oldId": cocktail.get("idDrink"),
            "name": cocktail.get("strDrink"),
            "category": cocktail.get("strCategory"),
            "alcoholic": cocktail.get("strAlcoholic"),
            "glass": glass_info,
            "instructions": {
                "en": cocktail.get("strInstructions"),
                "es": cocktail.get("strInstructionsES"),
                "de": cocktail.get("strInstructionsDE"),
                "fr": cocktail.get("strInstructionsFR"),
                "it": cocktail.get("strInstructionsIT")
            },
            "tags": cocktail.get("strTags"),
            "image": cocktail.get("strDrinkThumb"),
            "video": cocktail.get("strVideo"),
            "iba": cocktail.get("strIBA"),
            "ingredients": [],
            "dateModified": cocktail.get("dateModified")
        }
        
        # Extract and transform ingredients
        for i in range(1, 16):
            ingredient = cocktail.get(f"strIngredient{i}")
            measure = cocktail.get(f"strMeasure{i}")
            
            if ingredient:  # Only add non-empty ingredients
                metric_measure = convert_to_metric(measure)
                new_cocktail["ingredients"].append({
                    "name": ingredient,
                    "measure": metric_measure
                })
        
        transformed_cocktails.append(new_cocktail)
        new_id += 1
    
    # Write the transformed data to the output file
    with open(output_file, 'w') as f:
        json.dump(transformed_cocktails, f, indent=2)
    
    print(f"Transformation complete! {len(transformed_cocktails)} cocktails transformed.")
    print(f"Output saved to {output_file}")

if __name__ == "__main__":
    # Transform all cocktails
    transform_cocktail_data()