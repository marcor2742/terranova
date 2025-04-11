#!/usr/bin/env python3
import requests
import json
import os
import time
import sys
from tqdm import tqdm

# API endpoints
ID_API_URL = "https://thecocktaildb.com/api/json/v1/1/lookup.php?i="
LIST_URL = "https://thecocktaildb.com/api/json/v1/1/list.php?c=list"
FILTER_URL = "https://thecocktaildb.com/api/json/v1/1/filter.php?c="

# Output files
TYPES_FILE = "cocktail_types.json"
IDS_FILE = "cocktail_ids.json"
DETAILS_FILE = "cocktails.json"

# Checkpoint files
TYPES_PROGRESS_FILE = "types_progress.json"
IDS_PROGRESS_FILE = "ids_progress.json"
DETAILS_PROGRESS_FILE = "details_progress.json"

# Rate limiting
RATE_LIMIT_DELAY = 0.5  # 1 second delay between requests
RETRY_DELAY = 30  # 30 seconds retry delay after rate limit hit

def load_json_file(filename, default=None):
    """Load JSON data from file with fallback to default"""
    try:
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
    return default if default is not None else {}

def save_json_file(filename, data):
    """Save data to JSON file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

def make_request(url, description=""):
    """Make API request with rate limit handling"""
    while True:
        try:
            response = requests.get(url)
            if response.status_code == 429:  # Rate limited
                retry_after = int(response.headers.get('Retry-After', RETRY_DELAY))
                print(f"\nRate limited! Waiting {retry_after} seconds before retrying...")
                time.sleep(retry_after)
                continue
                
            if response.status_code == 200:
                return response.json()
            else:
                print(f"\nError ({response.status_code}) fetching {description}: {url}")
                return None
                
        except Exception as e:
            print(f"\nRequest error: {e}")
            time.sleep(RATE_LIMIT_DELAY)
            return None

def fetch_cocktail_types():
    """Fetch and save all cocktail types"""
    # Load checkpoint if exists
    types = load_json_file(TYPES_FILE, [])
    
    if not types:
        print("Fetching cocktail types...")
        data = make_request(LIST_URL, "cocktail types")
        
        if data and 'drinks' in data:
            types = [category['strCategory'] for category in data['drinks']]
            save_json_file(TYPES_FILE, types)
            print(f"Found {len(types)} cocktail categories")
        else:
            print("Failed to fetch cocktail types")
            return []
    else:
        print(f"Loaded {len(types)} existing cocktail categories")
    
    return types

def fetch_cocktail_ids(cocktail_types):
    """Fetch and save cocktail IDs for each type"""
    # Load checkpoint if exists
    cocktail_ids = load_json_file(IDS_FILE, {})
    processed_types = load_json_file(TYPES_PROGRESS_FILE, [])
    
    for cocktail_type in tqdm(cocktail_types, desc="Fetching cocktail IDs by type"):
        if cocktail_type in processed_types:
            tqdm.write(f"Skipping already processed type: {cocktail_type}")
            continue
            
        # Skip if we already have IDs for this type (sanity check)
        if cocktail_type in cocktail_ids:
            processed_types.append(cocktail_type)
            save_json_file(TYPES_PROGRESS_FILE, processed_types)
            continue
        
        tqdm.write(f"Fetching cocktails for type: {cocktail_type}")
        
        # URL encode the category name for the API
        encoded_type = requests.utils.quote(cocktail_type)
        data = make_request(f"{FILTER_URL}{encoded_type}", f"cocktails in {cocktail_type}")
        
        if data and 'drinks' in data:
            # Extract IDs for this type
            ids = [drink['idDrink'] for drink in data['drinks']]
            cocktail_ids[cocktail_type] = ids
            
            # Save progress after each type
            save_json_file(IDS_FILE, cocktail_ids)
            processed_types.append(cocktail_type)
            save_json_file(TYPES_PROGRESS_FILE, processed_types)
            
            tqdm.write(f"Found {len(ids)} cocktails for {cocktail_type}")
            time.sleep(RATE_LIMIT_DELAY)
        else:
            tqdm.write(f"Failed to fetch cocktails for type {cocktail_type}")
    
    return cocktail_ids

def fetch_cocktail_details(cocktail_ids):
    """Fetch full details for each cocktail ID"""
    # Load checkpoints if exist
    cocktails = []
    if os.path.exists(DETAILS_FILE):
        with open(DETAILS_FILE, 'r') as f:
            cocktails = [json.loads(line) for line in f if line.strip()]
    
    processed_ids = load_json_file(DETAILS_PROGRESS_FILE, [])
    
    # Create a flat list of all IDs from all types
    all_ids = []
    for type_name, ids in cocktail_ids.items():
        all_ids.extend([(id, type_name) for id in ids])
    
    # Remove duplicates while preserving order
    unique_ids = []
    seen = set()
    for id_info in all_ids:
        if id_info[0] not in seen:
            unique_ids.append(id_info)
            seen.add(id_info[0])
    
    print(f"Processing {len(unique_ids)} unique cocktail IDs")
    
    # Process each ID
    with open(DETAILS_FILE, 'a') as f:
        for cocktail_id, type_name in tqdm(unique_ids, desc="Fetching cocktail details"):
            if cocktail_id in processed_ids:
                continue
                
            data = make_request(f"{ID_API_URL}{cocktail_id}", f"cocktail {cocktail_id}")
            
            if data and 'drinks' in data and data['drinks']:
                drink = data['drinks'][0]
                # Add the category explicitly
                drink['strCategory'] = type_name
                
                # Write directly to file
                f.write(json.dumps(drink) + "\n")
                f.flush()
                
                processed_ids.append(cocktail_id)
                save_json_file(DETAILS_PROGRESS_FILE, processed_ids)
                
                tqdm.write(f"Saved details for: {drink['strDrink']}")
            else:
                tqdm.write(f"Failed to fetch details for ID {cocktail_id}")
            
            time.sleep(RATE_LIMIT_DELAY)
    
    # Count how many cocktails we have in the details file
    with open(DETAILS_FILE, 'r') as f:
        count = sum(1 for _ in f)
    
    print(f"Total cocktails with details: {count}")

def main():
    try:
        # Step 1: Get all cocktail types
        cocktail_types = fetch_cocktail_types()
        if not cocktail_types:
            print("No cocktail types found. Exiting.")
            return
        
        # Step 2: Get all cocktail IDs for each type
        cocktail_ids = fetch_cocktail_ids(cocktail_types)
        if not cocktail_ids:
            print("No cocktail IDs found. Exiting.")
            return
        
        # Step 3: Get full details for each cocktail
        fetch_cocktail_details(cocktail_ids)
        
        print("Process completed successfully!")
        
    except KeyboardInterrupt:
        print("\nProcess interrupted by user. Progress has been saved.")
        sys.exit(0)

if __name__ == "__main__":
    main()