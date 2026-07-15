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
['forensic_kit'] = {
    label = 'Kit Forense',
    description = 'Necesitas este maletín para asegurar pruebas. El maletín puede usarse diez veces.',
    weight = 2500,
    close = false,
    stack = false,
    decay = true
},
['hydrogen_peroxide'] = {
    label = 'Peróxido de Hidrógeno',
    weight = 500,
    stack = true,
    client = {
        export = 'evidences.hydrogen_peroxide'
    }
},
['fingerprint_scanner'] = {
    label = 'Lector de Huellas Dactilares',
    description = 'Con esto puedes escanear la huella dactilar de la persona frente a ti. Si la huella coincide con una entrada en la base de datos, se te mostrará su identidad.',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    }
},
['collected_blood'] = {
    label = 'Muestra de Sangre',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'Copia de ADN',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_saliva'] = {
    label = 'Saliva recolectada',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'Copia de ADN',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_fingerprint'] = {
    label = 'CMuestra de Huella Dactilar',
    weight = 5,
    stack = false,
    buttons = {{
        label = 'Copia de huella dactilar',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "fingerprint")
        end
    }}
},
['collected_magazine'] = {
    label = 'Cargador Recolectado',
    weight = 200,
    stack = false
},
['collected_casing'] = {
    label = 'Casquillo recogido',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'Copiar número de serie',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_bullet'] = {
    label = 'Bala recogida',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'Copiar número de serie',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_gunshot_residue'] = {
    label = 'Residuos de disparo recolectados',
    weight = 5,
    stack = false
},
['steel_file'] = {
    label = 'Lima de acero',
    weight = 150,
    stack = false,
    decay = true,
    consume = 0.1,
    client = {
        export = 'evidences.steel_file'
    }
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
}