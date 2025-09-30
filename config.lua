--[[
             _     _                          
            (_)   | |                         
   _____   ___  __| | ___ _ __   ___ ___  ___ 
  / _ \ \ / / |/ _` |/ _ \ '_ \ / __/ _ \/ __|
 |  __/\ V /| | (_| |  __/ | | | (_|  __/\__ \
  \___| \_/ |_|\__,_|\___|_| |_|\___\___||___/
                                              
  https://github.com/noobsystems/evidences
]]
local config = {}


-- Players don't leave fingerprints when wearing gloves. If you have custom clothing on your server, you need to add the ids of hands without gloves to this exceptions-list.
-- Note: Fingerprints are only created if the function returns false! This means you have to ability to add further conditions, which have to be fulfilled in order for a player not to leave any fingerprints.
config.isPedWearingGloves = function()
    local handsVariation <const> = GetPedDrawableVariation(cache.ped, 3)
    local exceptions <const>  = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 112, 113, 114, 184, 196, 198}

    return not lib.table.contains(exceptions, handsVariation)
end


-- Define the jobs which are allowed to interact with the evidence system.
-- Only players with one of this jobs may collect evidence, log into the evidence laptop and pick it up.
config.allowedJobs = {
    "police", "fib"
}


-- Here you can customize key hints and help texts.
-- This is currently only used when placing the evidence laptop.
config.inputHelp = {
    -- Display an input help message
    ---@param text string The text to be displayed (contains placeholders)
    ---@param codes table<"tildeDelimitedCodes"|"mappedValues", string[]> A list of elements to fill the placeholders with
    show = function(text, codes)
        -- Use the string array in codes under key "tildeDelimitedCodes" to replace the placeholders in text when using natives.
        -- codes.tildeDelimitedCodes values are formatted using the classical Rockstar Noth-style "~" formatting tags (e.g. ~INPUT_CONTEXT~)
        local replacements <const> = codes.tildeDelimitedCodes
        text = string.format(text, table.unpack(replacements))

        AddTextEntry("EVIDENCES_INPUT_HELP", text)
        BeginTextCommandDisplayHelp("EVIDENCES_INPUT_HELP")
        EndTextCommandDisplayHelp(0, true, true, -1)


        -- codes.mappedValues values are formatted as "[E]" or similar
        -- Therefore, they should be used to integrate custom input help uis.
        -- Here is an example for ox_lib's text ui (like https://coxdocs.dev/ox_lib/Modules/Interface/Client/textui)
        -- local replacements <const> = codes.mappedValues
        -- text = string.format(text, table.unpack(replacements))
        
        -- lib.showTextUI(text, {
        --     position = "top-center",
        --     icon = "fa-solid fa-keyboard",
        --     ...
        -- })
    end,

    -- Hides all currently displayed input help messages
    -- You can replace ClearAllHelpMessages() with e.g. lib.hideTextUI()
    hide = function()
        ClearAllHelpMessages()
    end
}


-- Replace the body of this function if you want to use a different notification system.
-- By default, notifications are handeled by ox_lib (https://coxdocs.dev/ox_lib/Modules/Interface/Client/notify)
---@param translation { key: string, arguments: string[] }
---@param notifyType? string The type of the notification (e.g. "success" or "error")
---@param duration? number The duration for the notify ui in milliseconds
function config.notify(translation, notifyType, duration)
    if not translation or type(translation) ~= "table" then
        return
    end

    local arguments <const> = translation.arguments or {}

    lib.notify({
        title = locale(translation.key .. ".title"),
        description = locale(translation.key .. ".description", table.unpack(arguments)),
        type = notifyType or "inform",
        duration = duration or 3000
    })
end

return config