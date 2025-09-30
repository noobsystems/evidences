-- Add the following items to ox_inventory/data/items.lua
-- Do not change the item names inside the square brackets
-- You may change the item descriptions and labels of buttons

['evidence_laptop'] = {
    label = 'Evidence Laptop',
    description = 'Laptop for accessing DNA and fingerprint database',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.evidence_laptop'
    }
},
['evidence_box'] = {
    label = 'Evidence Box',
    description = 'Box to store evidences',
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
    label = 'Empty Baggy',
    weight = 100,
    stack = true
},
['baggy_blood'] = {
    label = 'Collected Blood',
    weight = 200,
    stack = false
},
['baggy_magazine'] = {
    label = 'Collected Magazin',
    weight = 200,
    stack = false
},
['hydrogen_peroxide'] = {
    label = 'Hydrogen peroxide',
    weight = 500,
    stack = true
},
['fingerprint_brush'] = {
    label = 'Fingerprint Brush',
    weight = 250,
    stack = true
},
['fingerprint_taken'] = {
    label = 'Collected Fingerprint',
    weight = 5,
    stack = false
},
['fingerprint_scanner'] = {
    label = 'Fingerprint Scanner',
    description = 'Scan Fingerprints',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    },
},
