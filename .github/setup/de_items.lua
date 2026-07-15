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
['forensic_kit'] = {
    label = 'Spurensicherungskoffer',
    description = 'Du benötigst diesen Koffer, um Beweismittel zu sichern. Der Koffer kann zehn Mal verwendet werden.',
    weight = 2500,
    close = false,
    stack = false,
    decay = true
},
['hydrogen_peroxide'] = {
    label = 'Wasserstoffperoxid',
    weight = 500,
    stack = true,
    client = {
        export = 'evidences.hydrogen_peroxide'
    }
},
['fingerprint_scanner'] = {
    label = 'Fingerabdruckscanner',
    description = 'Hiermit kannst den Fingerabdruck deines Gegenübers einscannen. Bei einem Datenbanktreffer zu dem Fingerabdruck wird dir dessen Identität angezeigt.',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    }
},
['collected_blood'] = {
    label = 'Gesichertes Blut',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'DNS kopieren',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_saliva'] = {
    label = 'Gesicherter Speichel',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'DNS kopieren',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_fingerprint'] = {
    label = 'Gesicherter Fingerabdruck',
    weight = 5,
    stack = false,
    buttons = {{
        label = 'Fingerabdruck kopieren',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "fingerprint")
        end
    }}
},
['collected_magazine'] = {
    label = 'Gesichertes Magazin',
    weight = 200,
    stack = false
},
['collected_casing'] = {
    label = 'Gesicherte Hülse',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'Seriennummer kopieren',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_bullet'] = {
    label = 'Gesicherte Kugel',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'Seriennummer kopieren',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_gunshot_residue'] = {
    label = 'Gesicherte Schmauchspuren',
    weight = 5,
    stack = false
},
['steel_file'] = {
    label = 'Feile',
    weight = 150,
    stack = false,
    decay = true,
    consume = 0.1,
    client = {
        export = 'evidences.steel_file'
    }
},
['spy_microphone'] = {
    label = 'Abhörwanze',
    description = 'Mikrofon zum Überwachen von Personen in der Nähe',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.spy_microphone'
    }
}