local config <const> = require "config"
local logger <const> = require "server.logger"
local framework <const> = require "common.frameworks.framework"
local ObservableRadioFreq <const> = require "server.wiretap.classes.observable_radio_freq"
local knownRadioFrequencies = {}

RegisterNetEvent("pma-voice:setTalkingOnRadio", function(talking)
    local playerId <const> = source
    local radioChannel = Player(playerId).state.radioChannel

    if radioChannel and radioChannel ~= 0 then
        local observableRadioFreq <const> = knownRadioFrequencies[radioChannel] or ObservableRadioFreq:new(radioChannel)
        knownRadioFrequencies[radioChannel] = observableRadioFreq

        if talking then
            observableRadioFreq:addTarget(playerId)
        else
            observableRadioFreq:removeTarget(playerId)
        end
    end
end)

lib.callback.register("evidences:observeObservableRadioFreq", function(observer, arguments)
    if not framework.hasPermission(config.wiretap.radio.permissions, observer) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    if arguments and arguments.channel then
        local observableRadioFreq <const> = knownRadioFrequencies[arguments.channel] or ObservableRadioFreq:new(arguments.channel)
        knownRadioFrequencies[arguments.channel] = observableRadioFreq
        observableRadioFreq:addObserver(observer)
    end

end)

lib.callback.register("evidences:ignoreObservableRadioFreq", function(observer, arguments)
    if arguments and arguments.channel then
        local observableRadioFreq <const> = knownRadioFrequencies[arguments.channel]
        return observableRadioFreq and observableRadioFreq:removeObserver(observer)
    end
end)