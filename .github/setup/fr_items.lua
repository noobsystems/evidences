-- Add the following items to ox_inventory/data/items.lua
-- Do not change the item names inside the square brackets
-- You may change the item descriptions and labels of buttons

['evidence_laptop'] = {
    label = 'Ordinateur de preuves',
    description = 'Ordinateur permettant d’accéder à la base de données ADN et d’empreintes digitales',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.evidence_laptop'
    }
},
['evidence_box'] = {
    label = 'Boîte de preuves',
    description = 'Boîte pour stocker des preuves',
    weight = 250,
    stack = false,
    close = false,
    buttons = {{
        label = 'Étiqueter',
        action = function(slot)
            exports.evidences:evidence_box(slot)
        end
    }}
},
['forensic_kit'] = {
    label = 'Kit de police scientifique',
    description = 'Vous avez besoin de ce kit pour sécuriser les preuves. La mallette peut être utilisée dix fois.',
    weight = 2500,
    close = false,
    stack = false,
    decay = true
},
['hydrogen_peroxide'] = {
    label = 'Peroxyde d\'hydrogène',
    weight = 500,
    stack = true,
    client = {
        export = 'evidences.hydrogen_peroxide'
    }
},
['fingerprint_scanner'] = {
    label = 'Scanner d\'empreintes',
    description = 'Grâce à cela, vous pouvez scanner l’empreinte digitale de la personne en face de vous. Si l’empreinte correspond à une entrée dans la base de données, son identité s’affichera.',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    },
},
['collected_blood'] = {
    label = 'Sang collecté',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'Copie d\'ADN',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_saliva'] = {
    label = 'Salive collectée',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'Copie d\'ADN',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_magazine'] = {
    label = 'Chargeur collecté',
    weight = 200,
    stack = false
},
['collected_fingerprint'] = {
    label = 'Empreinte collectée',
    weight = 5,
    stack = false,
    buttons = {{
        label = 'Copie d\'empreinte',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "fingerprint")
        end
    }}
},
['spy_microphone'] = {
    label = 'Micro-espion',
    description = 'Microphone pour l’observation des personnes à proximité',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.spy_microphone'
    }
}