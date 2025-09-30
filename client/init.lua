lib.locale()

require "client.evidences.evidences"

require "client.evidences.registry.blood"
require "client.evidences.registry.fingerprint"
require "client.evidences.registry.magazine"

require "client.dui.handler"

require "client.scanner.scanner"

require "client.items"

local config <const> = require "config"
RegisterNetEvent("evidences:notify", function(translation, type, duration)
    config.notify(translation, type, duration)
end)