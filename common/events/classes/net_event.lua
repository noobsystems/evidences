---@class NetEvent : Event
---@field arguments table
local NetEvent = lib.class("NetEvent", require "common.events.classes.event")

---@param eventName string The name of the RegisterNetEvent
---@param arguments table Arguments of the callback function of the RegisterNetEvent
function NetEvent:constructor(eventName, arguments)
    self:super(eventName)
    self.arguments = arguments
end

return NetEvent