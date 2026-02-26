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


-- Players don't need to give consent if they are cuffed and an officer takes their DNA or fingerprints.
-- If your police script uses a different cuff system, adjust the check (if a person is cuffed) here.
config.isPedCuffed = function(ped)
    return IsPedCuffed(ped) or IsEntityPlayingAnim(ped, "mp_arresting", "idle", 3)
end


-- If your server uses a custom death/down system, adjust the check (isPedDeadOrDying) accordingly here.
-- Return true if the ped is dead and false if alive
config.isPedDead = function(ped)
    return IsPedDeadOrDying(ped, true)
end


config.wiretap = {
    -- Enable or disable the wiretap app itself (requires pma-voice)
    enabled = true,

    -- Every action inside the wiretap app gets logged so everyone can check if the action was taken without justification.
    -- How long should these logs keep stored before deleting them on server start? (in milliseconds)
    -- Set to -1 to keep the actions logged forever.
    actionStorageDuration = 1000 * 60 * 60 * 24 * 7, -- default: one week in millis

    calls = {
        -- If you have npwd, roadphone, lb-phone or yphone installed on your server you can choose between phone numbers or player names
        displayPhoneNumbers = false,

        -- Allowed jobs and their minimum grades required to intercept phone calls.
        -- If permissions = {} the phone call section is disabled for everyone.
        permissions = {
            police = 0,
            fib = 0
        }
    },

    -- Spy microphenes can be placed by everyone on the server (they do not percist during server restarts)
    -- If someone is talking in the specified radius around a spy microphone, permitted players can listen to them using the wiretap app on the laptop
    spyMicrophones = {
        radius = 5,

        -- Allowed jobs and their minimum grades required to listen to spy microphones.
        -- If permissions = {} the spy microphones section is disabled for everyone.
        permissions = {
            police = 0,
            fib = 0
        }
    },

    radio = {
        -- Allowed jobs and their minimum grades required to intercept radio channels.
        -- If permissions = {} the radio section is disabled for everyone.
        permissions = {
            police = 0,
            fib = 0
        }
    }
}


-- Defines the conditions a player must match to perform specific actions of this script.
config.permissions = {
    pickup = { -- Allowed jobs and their minimum grades required to pick up a laptop
        police = 0,
        fib = 0
    },

    place = { -- Allowed jobs and their minimum grades required to place a laptop
        police = 0,
        fib = 0
    },

    access = { -- Allowed jobs and their minimum grades required to access the laptop (log in)
        police = 0,
        fib = 0
    },

    collect = { -- Allowed jobs and their minimum grades required to collect evidence
        police = 0,
        fib = 0
    }
}


-- if set to false, all citizens must be registered manually by police
-- if set to true, citizens are synced; they cannot be edited or deleted (buttons for that actions are not visible, too)
config.citizens = {
    synced = false
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


config.logging = {
    enabled = true,

    -- By default every event is logged.
    -- You can disable logging for specific events here.
    loggedEvents = {
        ["Evidences cleared"] = true,
        ["Biometric data taken"] = true,
        ["Biometric data linked to citizen"] = true,
        ["Citizen created"] = true,
        ["Citizen updated"] = true,
        ["Citizen deletion requested"] = true,
        ["Note created"] = true,
        ["Note edited"] = true,
        ["Note deletion requested"] = true,
        ["Evidence destroyed"] = true,
        ["Evidence collected"] = true,
        ["Fingerprint scanned"] = true,
        ["Observation started"] = true,
        ["Observation ended"] = true,
        ["Spy microphone placed"] = true,
        ["Spy microphone picked up"] = true
    },

    -- Define which logging service you want to use if enabled.
    -- You can choose between "ox_lib" (it supports Datadog, Grafana Loki and Fivemanage, see https://coxdocs.dev/ox_lib/Modules/Logger/Server) and "discord".
    service = "discord",

    -- If the logging service is set to "discord", you have to define a webhook url and your txAdmin web interface url.
    -- Refer to https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks.
    webhook = "https://discord.com/api/webhooks/1475539779419373640/Rt0gBBeT_HEXXktuZdUPV4-rIoDNH2xq_G2CjMSZYdOoOvGhodGq3hSmT3DoNZDDI7pO",
    txAdminUrl = "https://YOUR-IP.NET:40120/players?playerModal="
}

return config