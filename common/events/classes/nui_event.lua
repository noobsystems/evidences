---@class NuiEvent : Event
---@field data table
---@field response any The response for the nui
local NuiEvent = lib.class("NuiEvent", require "common.events.classes.event")

---@param callbackName string The name of the RegisterNuiCallback
---@param data table Data provided by the NuiCallback
function NuiEvent:constructor(callbackName, data)
    self:super(callbackName)
    self.data = data or {}
    self.response = nil
end

return NuiEvent