import json
import sys

def find_cocktails_with_duplicate_ingredients(json_file_path):
    """
    Analizza un file JSON di cocktail e identifica quelli con ingredienti duplicati.
    
    Args:
        json_file_path (str): Percorso del file JSON contenente i cocktail
        
    Returns:
        list: Lista di tuple (id, idDrink, strDrink, ingredienti_duplicati)
    """
    try:
        # Carica il file JSON
        with open(json_file_path, 'r', encoding='utf-8') as file:
            cocktails = json.load(file)
        
        # Lista per contenere i risultati
        duplicates = []
        
        # Esamina ogni cocktail
        for cocktail in cocktails:
            # Estrai le informazioni del cocktail
            cocktail_id = cocktail.get('id')
            id_drink = cocktail.get('idDrink')
            drink_name = cocktail.get('strDrink')
            ingredients = cocktail.get('Ingredients', [])
            
            # Crea un dizionario per contare le occorrenze di ogni ingrediente
            ingredient_count = {}
            duplicate_ingredients = []
            
            # Conta gli ingredienti
            for ingredient in ingredients:
                name = ingredient.get('name', '').strip().lower()
                if name:  # Ignora gli ingredienti senza nome
                    ingredient_count[name] = ingredient_count.get(name, 0) + 1
                    
                    # Se è un duplicato, aggiungi alla lista
                    if ingredient_count[name] > 1:
                        duplicate_ingredients.append(name)
            
            # Se ci sono ingredienti duplicati, aggiungi il cocktail alla lista
            if duplicate_ingredients:
                duplicates.append({
                    'id': cocktail_id,
                    'idDrink': id_drink,
                    'name': drink_name,
                    'duplicate_ingredients': list(set(duplicate_ingredients))  # Rimuovi duplicati dalla lista
                })
        
        return duplicates
    
    except Exception as e:
        print(f"Errore durante l'analisi del file: {e}")
        return []

def main():
    # Controlla se è stato fornito un argomento per il percorso del file
    if len(sys.argv) > 1:
        json_file_path = sys.argv[1]
    else:
        json_file_path = "alldrinks.json"  # Percorso predefinito
    
    # Trova i cocktail con ingredienti duplicati
    duplicates = find_cocktails_with_duplicate_ingredients(json_file_path)
    
    # Stampa i risultati
    if duplicates:
        print(f"Trovati {len(duplicates)} cocktail con ingredienti duplicati:")
        for drink in duplicates:
            print(f"ID: {drink['id']}, idDrink: {drink['idDrink']}, Nome: {drink['name']}")
            print(f"Ingredienti duplicati: {', '.join(drink['duplicate_ingredients'])}")
            print("-" * 40)
    else:
        print("Nessun cocktail con ingredienti duplicati trovato.")

if __name__ == "__main__":
    main()
