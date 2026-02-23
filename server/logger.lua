local logger = {}

local log_config <const> = require("log_config")

local discordColors <const> = {
    info = tonumber("3498DB", 16),
    success = tonumber("66FFA3", 16),
    warning = tonumber("F1C40F", 16),
    error = tonumber("E74C3C", 16),
}

---Get the timestamp for Discord embeds of current type
---@return string?
local function timestamp()
    local ts = os.date("!%Y-%m-%dT%H:%M:%S.000Z") --[[@as string]]

    if #ts < 24 then return end
    if #ts > 24 then ts = ts:sub(1, 24) end
    if not ts:match("%d%d%d%d%-%d%d%-%d%dT%d%d%:%d%d%:%d%d%.%d%d%dZ") then return end

    return ts
end


local function logToDiscord(src, message, action, level, title, metadata)
    if not log_config.DiscordWebhooks[action] then
        print("[ERROR]: No webhook set for action " .. action)
        return
    end

	local cleanedUpIdentifiers = {}
	local accounts = {}
	local description = ""
	local accountsCount = 0

    if type(metadata) == "table" then
        description = json.encode(metadata, { indent = true }) .. "\n\n"
    elseif type(metadata) == "string" then
        description = metadata .. "\n\n"
    end

    if src then
        local identifiers = GetPlayerIdentifiers(src)

        for i = 1, #identifiers do
            local identifierTypeIndex = identifiers[i]:find(":")

            if not identifierTypeIndex then goto continue end

            local identifierType = identifiers[i]:sub(1, identifierTypeIndex - 1)
            local identifier = identifiers[i]:sub(identifierTypeIndex + 1)

            if identifierType == "steam" then
                accountsCount += 1
                accounts[accountsCount] = "- Steam: https://steamcommunity.com/profiles/" .. tonumber(identifier, 16)
            elseif identifierType == "discord" then
                accountsCount += 1
                accounts[accountsCount] = "- Discord: <@" .. identifier .. ">"
            end

            if identifierType ~= "ip" then cleanedUpIdentifiers[identifierType] = identifier end

            ::continue::
        end
    end

	if accountsCount > 0 then
		description = description .. "**Accounts:**\n"
		for i = 1, accountsCount do
			description = description .. accounts[i] .. "\n"
		end
	end

	description = description .. "**Identifiers:**"

	for identifierType in pairs(cleanedUpIdentifiers) do
		description = description .. "\n- **" .. identifierType .. ":** " .. cleanedUpIdentifiers[identifierType]
	end

	local embed = {
		title = title,
		description = message.."\n\n```"..description.."```",
		color = discordColors[level],
		timestamp = timestamp(),
		author = src and {
			name = GetPlayerName(src) .. " | " .. src
		},
		footer = {
			text = "Noobsystems Evidences",
			icon_url = "https://avatars.githubusercontent.com/u/202514064"
		}
	}

	PerformHttpRequest(log_config.DiscordWebhooks[action], function() end, "POST", json.encode({
		username = "Noobsystems Evidences",
        avatar_url = "https://avatars.githubusercontent.com/u/202514064",
		embeds = { embed }
	}), { ["Content-Type"] = "application/json" })
end

--- Log a message to the logging service
---@param src? number
---@param message string
---@param action string
---@param level "info" | "success" | "warning" | "error"
---@param title string
---@param metadata? table<string, any>
function logger.log(src, message, action, level, title, metadata)
    if not log_config.LoggingService then return end

    if log_config.LoggingService == "Discord" then
        logToDiscord(src, message, action, level, title, metadata)
    elseif log_config.LoggingService == "FiveManage" then
        if GetResourceState("fmsdk") ~= "started" then
            print("[ERROR]: log_config.LoggingService is set to 'FiveManage', but fmsdk is not started. To log using FiveManage, you need to install fmsdk from https://github.com/fivemanage/sdk/releases/latest.")
            return
        end
        metadata = metadata or {}
        metadata.playerSource = src
        exports.fmsdk:Log(log_config.FiveManageDataset or "default", level, title.."\n\n"..message, metadata)
    elseif log_config.LoggingService == "OX Lib" then
        lib.logger(src or -1, level, title.."\n\n"..message)
    end
end

return logger