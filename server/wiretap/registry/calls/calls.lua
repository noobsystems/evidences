local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local logger <const> = require "server.logger"
local eventHandler <const> = require "common.events.handler"
local phoneNumber <const> = require "server.wiretap.registry.calls.bridge.phone_number"
local ObservableCall <const> = require "server.wiretap.classes.observable_call"

local activeCalls = {}

-- init: get all calls already running when the script gets started
for _, playerId in ipairs(GetPlayers()) do
    local callChannel <const> = Player(playerId).state.callChannel

    if callChannel and callChannel ~= 0 then
        local observableCall <const> = activeCalls[callChannel] or ObservableCall:new(callChannel)
        activeCalls[callChannel] = observableCall
        observableCall:addTarget(playerId, phoneNumber and phoneNumber.getPhoneNumber(playerId))
    end
end

-- update the running calls
AddStateBagChangeHandler("callChannel", nil, function(bagName, key, newCallChannel)
    local playerId <const> = GetPlayerFromStateBagName(bagName)
    if playerId ~= 0 then

        if newCallChannel == 0 then -- player has left the current call
            local previousCallChannel <const> = Player(playerId).state.callChannel
            if previousCallChannel then
                local observableCall <const> = activeCalls[previousCallChannel]

                if observableCall then
                    observableCall:removeTarget(playerId)
                end
            end

        else -- player entered a call
            local observableCall <const> = activeCalls[newCallChannel] or ObservableCall:new(newCallChannel)
            activeCalls[newCallChannel] = observableCall
            observableCall:addTarget(playerId, phoneNumber and phoneNumber.getPhoneNumber(playerId))
        end

        TriggerClientEvent("evidences:updateActiveCalls", -1, activeCalls)
    end
end)

eventHandler.on("observationTargetRemoved", function(event)
    local observation <const> = event.arguments.observation
    if observation.__name == "ObservableCall" then
        local observableCall <const> = observation

        if not observableCall:hasTargets() then
            observableCall:clearObservers()
            activeCalls[observableCall.channel] = nil
            TriggerClientEvent("evidences:updateActiveCalls", -1, activeCalls)
        end
    end
end)

lib.callback.register("evidences:getActiveCalls", function(source)
    if not framework.hasPermission(config.wiretap.calls.permissions, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    return activeCalls
end)

lib.callback.register("evidences:observeObservableCall", function(observer, arguments)
    if not framework.hasPermission(config.wiretap.calls.permissions, observer) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    if arguments and arguments.channel then
        local observableCall <const> = activeCalls[arguments.channel]
        return observableCall and observableCall:addObserver(observer)
    end
end)

lib.callback.register("evidences:ignoreObservableCall", function(observer, arguments)
    if arguments and arguments.channel then
        local observableCall <const> = activeCalls[arguments.channel]
        return observableCall and observableCall:removeObserver(observer)
    end
end)