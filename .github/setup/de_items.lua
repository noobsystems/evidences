-- Add the following items to ox_inventory/data/items.lua
-- Do not change the item names inside the square brackets
-- You may change the item descriptions and labels of buttons

['evidence_laptop'] = {
    label = 'Laptop',
    description = 'Laptop zum Zugriff auf DNA- und Fingerabdruck-Datenbank',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.evidence_laptop'
    }
},
['evidence_box'] = {
    label = 'Evidence-Box',
    description = 'Box zur Aufbewahrung von Beweisstücken',
    weight = 250,
    stack = false,
    close = false,
    buttons = {{
        label = 'Label',
        action = function(slot)
            exports.evidences:evidence_box(slot)
        end
    }}
},
['baggy_empty'] = {
    label = 'Zip-Beutel',
    weight = 100,
    stack = true
},
['baggy_blood'] = {
    label = 'Gesichertes Blut',
    weight = 200,
    stack = false
},
['baggy_magazine'] = {
    label = 'Gesichertes Magazin',
    weight = 200,
    stack = false
},
['hydrogen_peroxide'] = {
    label = 'Wasserstoffperoxid',
    weight = 500,
    stack = true
},
['fingerprint_brush'] = {
    label = 'Fingerabdruck-Pinsel',
    weight = 250,
    stack = true
},
['fingerprint_taken'] = {
    label = 'Gesicherter Fingerabdruck',
    weight = 5,
    stack = false
},
['fingerprint_scanner'] = {
    label = 'Fingerabdruckscanner',
    description = 'Scanne Fingerabdrücke',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    },
},
