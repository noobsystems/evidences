local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local logger <const> = require "server.logger"
local ObservableSpyMicrophone <const> = require "server.wiretap.classes.observable_spy_microphone"
local spyMicrophones = {}

lib.callback.register("evidences:getSpyMicrophones", function()
    return spyMicrophones
end)

lib.callback.register("evidences:placeSpyMicrophone", function(source, label, coords)
    if not spyMicrophones[label] then
        local observableSpyMicrophone <const> = ObservableSpyMicrophone:new(label, coords)
        observableSpyMicrophone:sync()
        spyMicrophones[label] = observableSpyMicrophone

        TriggerClientEvent("evidences:updateSpyMicrophones", -1, spyMicrophones)
        logger.log(source, "Spy microphone placed", "", { label = label, coords = tostring(coords) })
        return true
    end

    return false
end)

RegisterNetEvent("evidences:destroySpyMicrophone", function(label)
    local playerId <const> = source
    local observableSpyMicrophone <const> = spyMicrophones[label]

    if observableSpyMicrophone then
        observableSpyMicrophone:destroy()
        spyMicrophones[label] = nil

        TriggerClientEvent("evidences:updateSpyMicrophones", -1, spyMicrophones)
        logger.log(source, "Spy microphone picked up", { label = label, coords = tostring(observableSpyMicrophone.coords) })
        exports.ox_inventory:AddItem(playerId, "spy_microphone", 1)
    end
end)


RegisterNetEvent("evidences:addSpyMicrophoneTarget", function(label)
    local playerId <const> = source
    local observableSpyMicrophone <const> = spyMicrophones[label]

    if observableSpyMicrophone then
        observableSpyMicrophone:addTarget(playerId)
    end
end)

RegisterNetEvent("evidences:removeSpyMicrophoneTarget", function(label)
    local playerId <const> = source
    local observableSpyMicrophone <const> = spyMicrophones[label]

    if observableSpyMicrophone then
        observableSpyMicrophone:removeTarget(playerId)
    end
end)

lib.callback.register("evidences:observeObservableSpyMicrophone", function(observer, arguments)
    if not framework.hasPermission(config.wiretap.spyMicrophones.permissions, observer) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    if arguments and arguments.label then
        local observableSpyMicrophone <const> = spyMicrophones[arguments.label]
        return observableSpyMicrophone and observableSpyMicrophone:addObserver(observer)
    end
end)

lib.callback.register("evidences:ignoreObservableSpyMicrophone", function(observer, arguments)
    if arguments and arguments.label then
        local observableSpyMicrophone <const> = spyMicrophones[arguments.label]
        return observableSpyMicrophone and observableSpyMicrophone:removeObserver(observer)
    end
end)