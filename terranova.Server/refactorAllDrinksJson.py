##!/usr/bin/env python3
#import json
#import re
#import os
#from collections import OrderedDict
#
#def process_cocktail_json(input_file, output_file):
#    """Trasforma il file JSON dei cocktail secondo le specifiche richieste."""
#    
#    # Leggi il file come testo
#    with open(input_file, 'r', encoding='utf-8') as f:
#        content = f.read()
#    
#    # Trova i blocchi JSON
#    content = content.strip()
#    if content.startswith('['):
#        content = content[1:]
#    if content.endswith(']'):
#        content = content[:-1]
#    
#    # Dividi i blocchi alla fine di ogni oggetto
#    raw_blocks = re.split(r'},\s*{', content)
#    blocks = []
#    
#    # Ripristina le parentesi graffe
#    for block in raw_blocks:
#        if not block.startswith('{'):
#            block = '{' + block
#        if not block.endswith('}'):
#            block = block + '}'
#        blocks.append(block)
#    
#    processed_blocks = []
#    id_counter = 1
#    
#    for block in blocks:
#        try:
#            # Prova a parsare il blocco come JSON
#            data = json.loads(block)
#            
#            # Salta i blocchi che contengono solo dateModified
#            if len(data) <= 1 and 'dateModified' in data:
#                continue
#            
#            # Crea un nuovo dizionario ordinato con ID come primo campo
#            ordered_data = OrderedDict()
#            
#            # Aggiungi un ID come primo campo
#            ordered_data['id'] = id_counter
#            id_counter += 1
#            
#            # Aggiungi tutti gli altri campi originali
#            for key, value in data.items():
#                if key != 'strInstructionsZH-HANS' and key != 'strInstructionsZH-HANT':
#                    if key == 'strInstructions':
#                        ordered_data['strInstructionsEN'] = value
#                    else:
#                        ordered_data[key] = value
#            
#            # Crea il nuovo array Ingredients con la nuova struttura
#            ingredients = []
#            i = 1
#            while f'strIngredient{i}' in data:
#                ingredient_name = data.get(f'strIngredient{i}')
#                measure_value = data.get(f'strMeasure{i}')
#                
#                if ingredient_name:  # Aggiungi solo se l'ingrediente ha un nome
#                    ingredient = {
#                        "name": ingredient_name,
#                        "measureIM": measure_value if measure_value else "",
#                        "measureMT": ""
#                    }
#                    ingredients.append(ingredient)
#                
#                # Rimuovi i campi originali
#                ordered_data.pop(f'strIngredient{i}', None)
#                ordered_data.pop(f'strMeasure{i}', None)
#                
#                i += 1
#            
#            # Aggiungi il nuovo array Ingredients
#            ordered_data['Ingredients'] = ingredients
#            
#            processed_blocks.append(ordered_data)
#            
#        except json.JSONDecodeError as e:
#            print(f"Errore di decodifica JSON: {e}")
#            print(f"Blocco problematico: {block[:100]}...")
#    
#    # Salva come un array JSON
#    with open(output_file, 'w', encoding='utf-8') as f:
#        json.dump(processed_blocks, f, indent=2, ensure_ascii=False)
#    
#    print(f"Elaborazione completata. {len(processed_blocks)} cocktail processati.")
#
#if __name__ == "__main__":
#    input_file = "c:\\Users\\marco\\Downloads\\cocktail4.json"
#    output_file = "c:\\Users\\marco\\Downloads\\cocktail2_processed.json"
#    
#    # Verifica che il file di input esista
#    if not os.path.exists(input_file):
#        print(f"Il file {input_file} non esiste!")
#    else:
#        process_cocktail_json(input_file, output_file)
#        print(f"File salvato come {output_file}")


---


#!/usr/bin/env python3
#import json
#import re
#
#def convert_to_metric(imperial_measure):
#    """Converte le misure imperiali in metriche."""
#    if not imperial_measure or imperial_measure.strip() == "":
#        return ""
#    
#    # Definire pattern comuni e le loro conversioni
#    oz_pattern = r'(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*oz'
#    tsp_pattern = r'(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*tsp'
#    tbsp_pattern = r'(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*(?:tblsp|tbsp)'
#    
#    # Conversioni frazionarie comuni
#    fraction_map = {
#        '1/4': 0.25,
#        '1/2': 0.5,
#        '3/4': 0.75,
#        '1/3': 0.33,
#        '2/3': 0.67,
#        '1/8': 0.125,
#    }
#    
#    # Converti le frazioni in numeri decimali
#    def convert_fraction(fraction_str):
#        if '/' in fraction_str:
#            if ' ' in fraction_str:  # formato "1 1/2"
#                whole, frac = fraction_str.split()
#                num, den = frac.split('/')
#                return int(whole) + int(num) / int(den)
#            else:  # formato "1/2"
#                if fraction_str in fraction_map:
#                    return fraction_map[fraction_str]
#                else:
#                    num, den = fraction_str.split('/')
#                    return int(num) / int(den)
#        else:  # già un numero intero
#            return float(fraction_str)
#    
#    # Cerca pattern di once
#    oz_match = re.search(oz_pattern, imperial_measure)
#    if oz_match:
#        oz_val = convert_fraction(oz_match.group(1))
#        return f"{int(oz_val * 30) if oz_val * 30 == int(oz_val * 30) else oz_val * 30:.1f} ml"
#    
#    # Cerca pattern di cucchiaini
#    tsp_match = re.search(tsp_pattern, imperial_measure)
#    if tsp_match:
#        tsp_val = convert_fraction(tsp_match.group(1))
#        return f"{int(tsp_val * 5) if tsp_val * 5 == int(tsp_val * 5) else tsp_val * 5:.1f} ml"
#    
#    # Cerca pattern di cucchiai
#    tbsp_match = re.search(tbsp_pattern, imperial_measure)
#    if tbsp_match:
#        tbsp_val = convert_fraction(tbsp_match.group(1))
#        return f"{int(tbsp_val * 15) if tbsp_val * 15 == int(tbsp_val * 15) else tbsp_val * 15:.1f} ml"
#    
#    # Mantieni descrizioni qualitative e casi speciali
#    qualitative_terms = ['dash', 'twist', 'juice of', 'slice', 'chilled', 'wedge', 'sprig', 'cube']
#    for term in qualitative_terms:
#        if term.lower() in imperial_measure.lower():
#            return imperial_measure
#    
#    # Se è solo un numero (come "1", "2-3", ecc.)
#    if re.match(r'^\d+(?:-\d+)?$', imperial_measure.strip()):
#        return imperial_measure
#    
#    # Default: restituisci la misura originale
#    return imperial_measure
#
## Funzione principale per aggiornare il file JSON
#def update_cocktails_json(input_file, output_file, start_id, end_id):
#    with open(input_file, 'r', encoding='utf-8') as f:
#        data = json.load(f)
#    
#    for cocktail in data:
#        if 'id' in cocktail and start_id <= cocktail['id'] <= end_id:
#            if 'Ingredients' in cocktail:
#                for ingredient in cocktail['Ingredients']:
#                    if 'measureIM' in ingredient and 'measureMT' in ingredient:
#                        ingredient['measureMT'] = convert_to_metric(ingredient['measureIM'])
#    
#    with open(output_file, 'w', encoding='utf-8') as f:
#        json.dump(data, f, indent=2, ensure_ascii=False)
#    
#    print(f"Aggiornati i cocktail con ID da {start_id} a {end_id}")
#
## Esegui lo script
#update_cocktails_json('cocktail2_processed.json', 'cocktail_updated.json', 1, 649)


---


##!/usr/bin/env python3
#import json
#import copy

## Dizionario dei volumi dei bicchieri
#GLASS_VOLUMES = {
#    "Highball glass": {"name": "Highball glass", "volume_ml": 300},
#    "Cocktail glass": {"name": "Cocktail glass", "volume_ml": 120},
#    "Old-fashioned glass": {"name": "Old-fashioned glass", "volume_ml": 240},
#    "Collins glass": {"name": "Collins glass", "volume_ml": 350},
#    "Whiskey Glass": {"name": "Whiskey glass", "volume_ml": 240},
#    "Martini Glass": {"name": "Martini glass", "volume_ml": 150},
#    "Margarita glass": {"name": "Margarita glass", "volume_ml": 250},
#    "Wine Glass": {"name": "Wine glass", "volume_ml": 240},
#    "Champagne flute": {"name": "Champagne flute", "volume_ml": 175},
#    "Shot glass": {"name": "Shot glass", "volume_ml": 45},
#    "Coffee mug": {"name": "Coffee mug", "volume_ml": 300},
#    "Beer mug": {"name": "Beer mug", "volume_ml": 500},
#    "Irish coffee cup": {"name": "Irish coffee cup", "volume_ml": 250},
#    "Hurricane glass": {"name": "Hurricane glass", "volume_ml": 450},
#    "Punch bowl": {"name": "Punch bowl", "volume_ml": 2000},
#    "Pitcher": {"name": "Pitcher", "volume_ml": 1200},
#    "Pint glass": {"name": "Pint glass", "volume_ml": 470},
#    "Copper Mug": {"name": "Copper mug", "volume_ml": 350},
#    "Beer Glass": {"name": "Beer glass", "volume_ml": 400},
#    "Parfait glass": {"name": "Parfait glass", "volume_ml": 200},
#    "Mason jar": {"name": "Mason jar", "volume_ml": 400},
#    "Brandy snifter": {"name": "Brandy snifter", "volume_ml": 180},
#    "Cordial glass": {"name": "Cordial glass", "volume_ml": 45},
#    "White wine glass": {"name": "White wine glass", "volume_ml": 240},
#    "Rocks glass": {"name": "Rocks glass", "volume_ml": 200},
#    "Beer pilsner": {"name": "Beer pilsner", "volume_ml": 350},
#    "Pousse cafe glass": {"name": "Pousse cafe glass", "volume_ml": 120},
#    "Coupe glass": {"name": "Coupe glass", "volume_ml": 180},
#    # Default per bicchieri sconosciuti
#    "default": {"name": "", "volume_ml": 0}
#}
#
#def transform_cocktail_json(input_file, output_file):
#    """Trasforma il file JSON dei cocktail ristrutturando strGlass e le istruzioni."""
#    
#    # Leggi il file JSON
#    with open(input_file, 'r', encoding='utf-8') as f:
#        data = json.load(f)
#    
#    # Trasforma ogni cocktail
#    for cocktail in data:
#        if isinstance(cocktail, dict):
#            # 1. Trasforma strGlass in oggetto glass
#            if 'strGlass' in cocktail:
#                glass_name = cocktail['strGlass']
#                if glass_name in GLASS_VOLUMES:
#                    cocktail['glass'] = copy.deepcopy(GLASS_VOLUMES[glass_name])
#                else:
#                    # Usa un oggetto predefinito per bicchieri non riconosciuti
#                    cocktail['glass'] = copy.deepcopy(GLASS_VOLUMES['default'])
#                    cocktail['glass']['name'] = glass_name
#                
#                # Rimuovi il campo originale
#                del cocktail['strGlass']
#            
#            # 2. Raggruppa le istruzioni
#            instructions = {}
#            
#            if 'strInstructions' in cocktail:
#                instructions['en'] = cocktail.pop('strInstructions')
#            elif 'strInstructionsEN' in cocktail:
#                instructions['en'] = cocktail.pop('strInstructionsEN')
#            
#            # Altre lingue
#            if 'strInstructionsES' in cocktail:
#                instructions['es'] = cocktail.pop('strInstructionsES')
#            if 'strInstructionsDE' in cocktail:
#                instructions['de'] = cocktail.pop('strInstructionsDE')
#            if 'strInstructionsFR' in cocktail:
#                instructions['fr'] = cocktail.pop('strInstructionsFR')
#            if 'strInstructionsIT' in cocktail:
#                instructions['it'] = cocktail.pop('strInstructionsIT')
#            
#            # Aggiungi l'oggetto instructions al cocktail
#            if instructions:
#                cocktail['instructions'] = instructions
#    
#    # Salva il risultato
#    with open(output_file, 'w', encoding='utf-8') as f:
#        json.dump(data, f, indent=2, ensure_ascii=False)
#    
#    print(f"Trasformazione completata. File salvato come {output_file}")
#
#if __name__ == "__main__":
#    input_file = "c:\\Users\\marco\\Downloads\\cocktail_updated.json"
#    output_file = "c:\\Users\\marco\\Downloads\\cocktail_structured.json"
#    
#    transform_cocktail_json(input_file, output_file)