-- Add the following items to ox_inventory/data/items.lua
-- Do not change the item names inside the square brackets
-- You may change the item descriptions and labels of buttons

['evidence_laptop'] = {
    label = 'Protátil de Pruebas',
    description = 'Portátil para acceder a bases de datos de ADN y huellas dactilares',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.evidence_laptop'
    }
},
['evidence_box'] = {
    label = 'Caja de Pruebas',
    description = 'Caja para guardar pruebas',
    weight = 250,
    stack = false,
    close = false,
    buttons = {{
        label = 'Etiquetar',
        action = function(slot)
            exports.evidences:evidence_box(slot)
        end
    }}
},
['baggy_empty'] = {
    label = 'Bolsa Vacía',
    weight = 100,
    stack = true
},
['baggy_blood'] = {
    label = 'Muestra de Sangre',
    weight = 200,
    stack = false
},
['baggy_magazine'] = {
    label = 'Cargador Recolectado',
    weight = 200,
    stack = false
},
['hydrogen_peroxide'] = {
    label = 'Peróxido de Hidrógeno',
    weight = 500,
    stack = true,
    client = {
        export = 'evidences.hydrogen_peroxide'
    }
},
['fingerprint_brush'] = {
    label = 'Cepillo de Huellas Dactilares',
    weight = 250,
    stack = true
},
['fingerprint_taken'] = {
    label = 'CMuestra de Huella Dactilar',
    weight = 5,
    stack = false
},
['fingerprint_scanner'] = {
    label = 'Lector de Huellas Dactilares',
    description = 'Escanéa huellas dactilares',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    },
},
['spy_microphone'] = {
    label = 'Micrófono Espía',
    description = 'Micrófono para escuchar a las personas cercanas',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.spy_microphone'
    }
},
