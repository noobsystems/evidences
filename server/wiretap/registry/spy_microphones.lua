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
        logger.log(source, "A new spy microphone has been placed. It is located at "..json.encode(coords).."", "wiretap", "info", "Spy microphone placed", {label, coords})
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
        logger.log(source, "A spy microphone has been destroyed. It was located at "..json.encode(observableSpyMicrophone.coords).."", "wiretap", "info", "Spy microphone destroyed", {label, observableSpyMicrophone.coords})
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

    logger.log(observer, "A spy microphone has been observed. It is located at "..json.encode(observableSpyMicrophone.coords).."", "wiretap", "info", "Spy microphone observed", {label, observableSpyMicrophone.coords})
end)

lib.callback.register("evidences:ignoreObservableSpyMicrophone", function(observer, arguments)
    if arguments and arguments.label then
        local observableSpyMicrophone <const> = spyMicrophones[arguments.label]
        return observableSpyMicrophone and observableSpyMicrophone:removeObserver(observer)
    end
end)