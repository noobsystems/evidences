-- Add the following items to ox_inventory/data/items.lua
-- Do not change the item names inside the square brackets
-- You may change the item descriptions and labels of buttons

['evidence_laptop'] = {
    label = 'Evidenční notebook',
    description = 'Notebook pro přístup do databáze DNA a otisků prstů',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.evidence_laptop'
    }
},
['evidence_box'] = {
    label = 'Krabička na důkazy',
    description = 'Krabička k uložení důkazů',
    weight = 250,
    stack = false,
    close = false,
    buttons = {{
        label = 'Štítek',
        action = function(slot)
            exports.evidences:evidence_box(slot)
        end
    }}
},
['baggy_empty'] = {
    label = 'Prázdný sáček',
    weight = 100,
    stack = true
},
['baggy_blood'] = {
    label = 'Odebraná krev',
    weight = 200,
    stack = false
},
['baggy_magazine'] = {
    label = 'Odebraný zásobník',
    weight = 200,
    stack = false
},
['hydrogen_peroxide'] = {
    label = 'Peroxid vodíku',
    weight = 500,
    stack = true,
    client = {
        export = 'evidences.hydrogen_peroxide'
    }
},
['fingerprint_brush'] = {
    label = 'Štětec na otisky prstů',
    weight = 250,
    stack = true
},
['fingerprint_taken'] = {
    label = 'Odebraný otisk prstu',
    weight = 5,
    stack = false
},
['fingerprint_scanner'] = {
    label = 'Skener otisků prstů',
    description = 'Skenování otisků prstů',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    },
},