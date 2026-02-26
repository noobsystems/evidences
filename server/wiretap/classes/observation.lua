local framework <const> = require "common.frameworks.framework"
local eventHandler <const> = require "common.events.handler"
local eventClass <const> = require "common.events.classes.event"
local logger <const> = require "server.logger"

---@class Observation : OxClass
---@field type string
---@field targets table
---@field observers table
local Observation = lib.class("Observation")

function Observation:constructor(targets, observers)
    self.type = self.__name
    self.targets = targets or {}
    self.observers = observers or {}

    eventHandler.onLocal("playerDropped", function(event)
        if event.source then
            self:removeTarget(event.source)
            self:removeObserver(event.source)
        end
    end)

    eventHandler.onNet("evidences:updateAudioWave", function(event)
        local target <const> = event.source
        local active <const> = event.arguments[1]

        if target and (active ~= nil) then
            if self.targets[target] then
                for observer, _ in pairs(self.observers) do
                    TriggerClientEvent("evidences:setAudioWaveActive", observer, target, active)
                end
            end
        end
    end)
end

function Observation:addTarget(playerId, name)
    playerId = tonumber(playerId)

    name = name or framework.getPlayerName(playerId)
    name = tostring(name)

    self.targets[playerId] = {
        playerId = playerId,
        name = name
    }

    for observer, _ in pairs(self.observers) do
        TriggerClientEvent("evidences:startListeningTo", observer, playerId)
        TriggerClientEvent("evidences:startTalkingTo", playerId, observer)
    end

    eventHandler.emit(eventClass:new("observationTargetAdded", {
        observation = self,
        addedTarget = {
            playerId = playerId,
            name = name
        }
    }))
end

function Observation:removeTarget(playerId)
    playerId = tonumber(playerId)

    if self.targets[playerId] then
        self.targets[playerId] = nil

        for observer, _ in pairs(self.observers) do
            TriggerClientEvent("evidences:setAudioWaveActive", observer, playerId, false)
            TriggerClientEvent("evidences:stopListeningTo", observer, playerId)
            TriggerClientEvent("evidences:stopTalkingTo", playerId, observer)
        end

        eventHandler.emit(eventClass:new("observationTargetRemoved", {
            observation = self,
            removedTarget = playerId
        }))
    end
end

function Observation:clearTargets()
    for target, _ in pairs(self.targets) do
        self:removeTarget(target)
    end
end

function Observation:hasTargets()
    return next(self.targets)
end

function Observation:addObserver(playerId)
    playerId = tonumber(playerId)

    self.observers[playerId] = true

    logger.log(playerId, "Observation started", {
        type = self.__name,
        label = self.label,
        coords = self.coords and tostring(self.coords) or nil,
        channel = self.channel,
        targets = #self.targets > 0 and json.encode(self.targets) or nil
    })

    for target, _ in pairs(self.targets) do
        TriggerClientEvent("evidences:startListeningTo", playerId, target)
        TriggerClientEvent("evidences:startTalkingTo", target, playerId)
    end
end

function Observation:removeObserver(playerId)
    playerId = tonumber(playerId)

    if self.observers[playerId] then
        self.observers[playerId] = nil

        for target, _ in pairs(self.targets) do
            TriggerClientEvent("evidences:stopListeningTo", playerId, target)
            TriggerClientEvent("evidences:stopTalkingTo", target, playerId)
        end
    end
end

function Observation:clearObservers()
    for observer, _ in pairs(self.observers) do
        self:removeObserver(observer)
    end
end

return Observation