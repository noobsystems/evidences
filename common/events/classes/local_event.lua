---@class LocalEvent : Event
---@field arguments table
local LocalEvent = lib.class("LocalEvent", require "common.events.classes.event")

---@param eventName string The name of the AddEventHandler
---@param arguments table Arguments of the callback function of the AddEventHandler
function LocalEvent:constructor(eventName, arguments)
    self:super(eventName)
    self.arguments = arguments
end

return LocalEvent