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
['forensic_kit'] = {
    label = 'Forenzní sada',
    description = 'Tento kufr potřebuješ k zajištění důkazů. Kufr lze použít desetkrát.',
    weight = 2500,
    close = false,
    stack = false,
    decay = true
},
['hydrogen_peroxide'] = {
    label = 'Peroxid vodíku',
    weight = 500,
    stack = true,
    client = {
        export = 'evidences.hydrogen_peroxide'
    }
},
['fingerprint_scanner'] = {
    label = 'Skener otisků prstů',
    description = 'Tímto můžeš naskenovat otisk prstu osoby naproti tobě. Pokud se otisk shoduje s databází, zobrazí se ti její identita.',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    }
},
['collected_blood'] = {
    label = 'Odebraná krev',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'Kopie DNA',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_saliva'] = {
    label = 'Odebraná slina',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'Kopie DNA',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_fingerprint'] = {
    label = 'Odebraný otisk prstu',
    weight = 5,
    stack = false,
    buttons = {{
        label = 'Kopie otisku prstu',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "fingerprint")
        end
    }}
},
['collected_magazine'] = {
    label = 'Odebraný zásobník',
    weight = 200,
    stack = false
},
['collected_casing'] = {
    label = 'Sebraná nábojnice',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'Kopírovat sériové číslo',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_bullet'] = {
    label = 'Sebraný náboj',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'Kopírovat sériové číslo',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_gunshot_residue'] = {
    label = 'Zajištěné povýstřelové zplodiny',
    weight = 5,
    stack = false
},
['steel_file'] = {
    label = 'Ocelový pilník',
    weight = 150,
    stack = false,
    decay = true,
    consume = 0.1,
    client = {
        export = 'evidences.steel_file'
    }
},
['spy_microphone'] = {
    label = 'Špionážní mikrofon',
    description = 'Mikrofon pro pozorování lidí v okolí',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.spy_microphone'
    }
}