-- Add the following items to ox_inventory/data/items.lua
-- Do not change the item names inside the square brackets
-- You may change the item descriptions and labels of buttons

['evidence_laptop'] = {
    label = '証拠解析用ノートPC',
    description = 'DNAおよび指紋データベースにアクセスするためのノートPC',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.evidence_laptop'
    }
},
['evidence_box'] = {
    label = '証拠品保管箱',
    description = '証拠品を収納するための箱',
    weight = 250,
    stack = false,
    close = false,
    buttons = {{
        label = 'ラベルを貼る',
        action = function(slot)
            exports.evidences:evidence_box(slot)
        end
    }}
},
['forensic_kit'] = {
    label = '鑑識キット',
    description = '証拠を確保するために必要なキットです。10回まで使用可能です。',
    weight = 2500,
    close = false,
    stack = false,
    decay = true
},
['hydrogen_peroxide'] = {
    label = '過酸化水素水',
    weight = 500,
    stack = true,
    client = {
        export = 'evidences.hydrogen_peroxide'
    }
},
['fingerprint_scanner'] = {
    label = '指紋スキャナー',
    description = '目の前の人物の指紋をスキャンできます。指紋がデータベースと一致した場合、その身元が表示されます。',
    weight = 500,
    stack = false,
    close = true,
    consume = 0,
    client = {
        export = 'evidences.fingerprint_scanner',
    }
},
['collected_blood'] = {
    label = '採取された血液',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'DNAのコピ',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_saliva'] = {
    label = '採取された唾液',
    weight = 200,
    stack = false,
    buttons = {{
        label = 'DNAのコピ',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "dna")
        end
    }}
},
['collected_fingerprint'] = {
    label = '採取された指紋',
    weight = 5,
    stack = false,
    buttons = {{
        label = '指紋のコピ',
        action = function(slot)
            exports.evidences:copyEvidenceOwner(slot, "fingerprint")
        end
    }}
},
['collected_magazine'] = {
    label = '採取されたマガジン',
    weight = 200,
    stack = false
},
['collected_casing'] = {
    label = '回収された薬莢',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'シリアル番号をコピー',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_bullet'] = {
    label = '回収された銃弾',
    weight = 10,
    stack = false,
    buttons = {{
        label = 'シリアル番号をコピー',
        action = function(slot)
            exports.evidences:copySerialNumber(slot)
        end
    }}
},
['collected_gunshot_residue'] = {
    label = '採取された射撃残渣',
    weight = 5,
    stack = false
},
['steel_file'] = {
    label = '鉄工用ヤスリ',
    weight = 150,
    stack = false,
    decay = true,
    consume = 0.1,
    client = {
        export = 'evidences.steel_file'
    }
},
['spy_microphone'] = {
    label = 'スパイマイク',
    description = '周囲の人物を監視・傍受するためのマイク',
    weight = 1500,
    stack = true,
    close = true,
    client = {
        export = 'evidences.spy_microphone'
    }
}