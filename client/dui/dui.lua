local eventHandler <const> = require "common.events.handler"

-- This event handels dui <-> server communication by redirecting data and returning the response
eventHandler.onNui("triggerServerCallback", function(event)
    event.response = lib.callback.await(event.data.name, false, event.data.arguments)
end)

-- For creating a dui, we use ox_lib's built-in dui class (https://oxdocs.dev/ox_lib/Modules/Dui/Lua/Client).
-- For more information about duis read:
-- https://docs.fivem.net/docs/scripting-manual/nui-development/dui/
-- https://discord.com/channels/192358910387159041/1164139647673303160/1380379817513586709 and the ongoing messages (we use method No. 2 to render the dui)
-- https://github.com/Mycroft-Studios/FiveM-Dui-Boilerplate/blob/main/client/classes/dui.lua
return lib.dui:new({
    url = string.format("nui://%s/html/dui/laptop/dist/index.html", cache.resource),
    width = 1920,
    height = 1080,
    debug = false
})