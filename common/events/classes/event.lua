---@class Event : OxClass
---@field name
local Event = lib.class("Event")

function Event:constructor(name)
    self.name = name
end

return Event