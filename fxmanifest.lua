fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'noobsystems'
description 'Advanced FiveM evidence script'
version '1.0.1'

dependencies {
    '/onesync',
    'oxmysql',
    'ox_lib',
    'ox_inventory',
    'ox_target'
}

client_scripts {
    'client/init.lua',
    'client/evidences/evidence_at_coords.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/init.lua'
}

shared_scripts {
    '@ox_lib/init.lua'
}

files {
    'locales/*.json',
    'config.lua',

    'common/*.lua',
    'common/events/**.lua',
    'common/frameworks/**/client.lua',
    'common/frameworks/framework.lua',
    
    'html/dui/laptop/dist/**',
    'html/dui/scanner/**',
    'html/nui/**',

    'client/**'
}

ui_page 'html/nui/index.html'