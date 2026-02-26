local config <const> = require "config"
local licenses = {}

local logger = {}

-- Returns and caches the license of a player or nil
-- https://docs.fivem.net/docs/scripting-reference/runtimes/lua/functions/GetPlayerIdentifiers/
local function getLicense(source)
    if not licenses[source] then
        local license <const> = GetPlayerIdentifierByType(source, "license")
        licenses[source] = license and license:gsub("license:", "")
    end

    return licenses[source]
end

-- Log an event to the configured logging service
function logger.log(source, event, arguments)
    if not config.logging
        or not config.logging.enabled
        or not config.logging.loggedEvents[event] then
            return
    end

    local service <const> = config.logging.service

    if service == "ox_lib" then
        lib.logger(source, event, "", fields)
        return
    end

    if service == "discord" then
        local webhook <const> = config.logging.webhook
        if not webhook then
            lib.print.error("Logging is set to 'discord' but no webhook url is defined in config.")
            return
        end
        
        local fields = {}
        local keys = {}
        
        for key in pairs(arguments) do
            keys[#keys + 1] = key
        end

        table.sort(keys, function(a, b)
            return #tostring(arguments[a]) < #tostring(arguments[b])
        end)

        for _, key in ipairs(keys) do
            local value <const> = arguments[key]
            fields[#fields + 1] = {
                name = key,
                value = "```" .. value .. "```",
                inline = not (#tostring(value) > 25)
            }
        end

        local components = {}
        local license <const> = getLicense(source)
        local txAdminUrl <const> = config.logging.txAdminUrl

        if license then
            components = {
                {
                    type = 1,
                    components = {
                        {
                            type = 2,
                            style = 5,
                            label = txAdminUrl and "View actor in txAdmin" or "No txAdmin url defined in config.lua",
                            emoji = not txAdminUrl and { name = "⚠️" } or nil,
                            url = txAdminUrl and (txAdminUrl .. license) or "https://github.com/noobsystems/evidences/blob/main/config.lua",
                            disabled = not txAdminUrl
                        }
                    }
                }
            }
        end

        local body <const> = {
            username = "noobsystems/evidences",
            avatar_url = "https://avatars.githubusercontent.com/u/202514064",
            with_components = true,
            embeds = {
                {
                    title = event,
                    timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                    color = 0x113962,
                    fields = fields
                }
            },
            components = components
        }

        -- To match the Discord logging with the logging of ox_lib, the same response check is done here:
        -- https://github.com/overextended/ox_lib/blob/b4e3bcdad75f91eaa6d4e75063de4a281ebd36d9/imports/logger/server.lua#L112-L119
        SetTimeout(500, function()
            PerformHttpRequest(webhook .. "?with_components=true", function(status, _, _, response)
                if status < 200 or status > 299 then
                    if type(response) == "string" then
                        response = json.decode(response) or response
                        lib.print.warn(("unable to submit logs to %s (status: %s)\n%s"):format(webhook, status, json.encode(response, { indent = true })))
                    end
                end
            end, "POST", json.encode(body), { ["Content-Type"] = "application/json" })
        end)
    end
end

return logger