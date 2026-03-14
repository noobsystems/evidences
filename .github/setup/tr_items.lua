-- Add the following items to ox_inventory/data/items.lua
-- Do not change the item names inside the square brackets
-- You may change the item descriptions and labels of buttons

['evidence_laptop'] = {
	label = 'Kanıt Bilgisayarı',
	description = 'DNA ve parmak izi veritabanına erişim için dizüstü bilgisayar',
	weight = 1500,
	stack = true,
	close = true,
	client = {
		export = 'evidences.evidence_laptop'
	}
},
['evidence_box'] = {
	label = 'Kanıt Kutusu',
	description = 'Kanıtları saklamak için kutu',
	weight = 250,
	stack = false,
	close = false,
	buttons = {{
		label = 'Etiket',
		action = function(slot)
			exports.evidences:evidence_box(slot)
		end
	}}
},
['forensic_kit'] = {
    label = 'Adli Tıp Kiti',
    description = 'Delilleri güvence altına almak için bu çantaya ihtiyacın var. Çanta on kez kullanılabilir.',
    weight = 2500,
    close = false,
    stack = false,
    decay = true
},
['hydrogen_peroxide'] = {
	label = 'Parmak İzi Temizleyici',
	weight = 500,
	stack = true,
	client = {
		export = 'evidences.hydrogen_peroxide'
	}
},
['fingerprint_scanner'] = {
	label = 'Parmak İzi Tarayıcısı',
	description = 'Bununla karşındaki kişinin parmak izini tarayabilirsin. Parmak izi veritabanındaki bir kayıtla eşleşirse, kimliği sana gösterilir.',
	weight = 500,
	stack = false,
	close = true,
	consume = 0,
	client = {
		export = 'evidences.fingerprint_scanner',
	},
},
['collected_blood'] = {
	label = 'Kan delili',
	weight = 200,
	stack = false,
    buttons = {{
        label = 'DNA Kopyası',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_saliva'] = {
    label = 'Tükürük delili',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'DNA Kopyası',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_magazine'] = {
	label = 'Şarjör Delili',
	weight = 200,
	stack = false
},
['collected_fingerprint'] = {
	label = 'Delil Parmak İzi',
	weight = 5,
	stack = false,
    buttons = {{
        label = 'Parmak İzi Kopyası',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "fingerprint")
        end
    }}
},
['spy_microphone'] = {
    label = 'Casus Mikrofon',
    description = 'Kişileri dinlemek için mikrofon',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.spy_microphone'
    }
}