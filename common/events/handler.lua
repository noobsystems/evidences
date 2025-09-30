local eventHandler = {}

local registeredEvents = {}

---@generic T : Event
---@param event T A new instance of the event
---@return T
function eventHandler.emit(event)
    for _, callback in pairs(registeredEvents[event.name] or {}) do
        callback(event)
    end

    return event
end

-- Registers a listener to the given event.
-- The callback function will be invoked each time the event is emitted, receiving a new instance of the corresponding event as its argument.
-- Each event can have multiple listeners. They are called in the order they were registered.
---@param name string The name of the event
---@param callback fun(event: T): void
---@return string key The key for the new callback in the callbacks list used for removing the callback
function eventHandler.on(name, callback)
    if not callback or type(callback) ~= "function" then
        lib.print.error("Event callback must be a function")
        return
    end

    local key <const> = tostring(callback)
    local callbacks = registeredEvents[name] or {}
    callbacks[key] = callback
    registeredEvents[name] = callbacks

    return key
end

-- Removes the hook of the callback with the given key from the event with the given name.
-- The key of the callback is returned by eventHandler.on() function
function eventHandler.removeCallback(name, key)
    local callbacks = registeredEvents[name] or {}
    callbacks[key] = nil
    registeredEvents[name] = callbacks
end

function eventHandler.removeCallbacks(name)
    registeredEvents[name] = nil
end

local registeredNetEvents = {}
-- Adds an event hook to a RegisterNetEvent
function eventHandler.onNet(eventName, callback)
    if not registeredNetEvents[eventName] then
        RegisterNetEvent(eventName, function(...)
            local netEventClass <const> = require "common.events.classes.net_event"
            eventHandler.emit(netEventClass:new(eventName, {...}))
        end)
        registeredNetEvents[eventName] = true
    end

    return eventHandler.on(eventName, callback)
end

local registeredNuiCallbacks = {}
-- Adds an event hook to a RegisterNuiCallback
function eventHandler.onNui(callbackName, callback)
    if not registeredNuiCallbacks[callbackName] then
        RegisterNUICallback(callbackName, function(data, cb)
            local nuiEventClass <const> = require "common.events.classes.nui_event"
            local event <const> = nuiEventClass:new(callbackName, data)
            eventHandler.emit(event)
            cb(event.response)
        end)
        registeredNuiCallbacks[callbackName] = true
    end

    return eventHandler.on(callbackName, callback)
end

local addedEventHandlers = {}
-- Adds an event hook to an AddEventHandler
function eventHandler.onLocal(eventName, callback)
    if not addedEventHandlers[eventName] then
        AddEventHandler(eventName, function(...)
            local localEventClass <const> = require "common.events.classes.local_event"
            eventHandler.emit(localEventClass:new(eventName, {...}))
        end)
        addedEventHandlers[eventName] = true
    end

    return eventHandler.on(eventName, callback)
end

return eventHandler