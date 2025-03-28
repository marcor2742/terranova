#!/usr/bin/env python3
import json

def round_to_nearest_5(number):
    """Round a number to the nearest multiple of 5"""
    return round(number / 5) * 5

def round_metrics_in_json(input_file="cocktails_metric.json", output_file="cocktails_rounded.json"):
    """Round all metric values in the cocktail JSON to nearest 5ml/g"""
    
    with open(input_file, 'r') as f:
        cocktails = json.load(f)
    
    # Process each cocktail
    for cocktail in cocktails:
        # Round ingredient measurements
        for ingredient in cocktail.get('ingredients', []):
            measure = ingredient.get('measure', {})
            if measure and 'metric' in measure and measure['metric'] is not None:
                # Round to nearest 5 or 0
                measure['metric'] = round_to_nearest_5(measure['metric'])
    
    # Write the transformed data
    with open(output_file, 'w') as f:
        json.dump(cocktails, f, indent=2)
    
    print(f"Rounding complete! Output saved to {output_file}")

if __name__ == "__main__":
    round_metrics_in_json()