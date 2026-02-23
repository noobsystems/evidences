local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local database <const> = require "server.database"
local logger <const> = require "server.logger"
local actionStorageDuration <const> = config.wiretap.actionStorageDuration

MySQL.update.await(
    [[
        CREATE TABLE IF NOT EXISTS wiretaps (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            type ENUM('ObservableCall', 'ObservableRadioFreq', 'ObservableSpyMicrophone') NOT NULL,
            startedAt BIGINT NOT NULL,
            endedAt BIGINT NOT NULL,
            observer TEXT NOT NULL,
            target TEXT NOT NULL,
            protocol TEXT NULL
        )
    ]]
)

if actionStorageDuration and type(actionStorageDuration) == "number" and actionStorageDuration > 0 then
    local currentMillis <const> = os.time() * 1000
    MySQL.update.await("DELETE FROM wiretaps WHERE (? - endedAt) > ?", { currentMillis, actionStorageDuration })
end

lib.callback.register("evidences:storeWiretap", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    logger.log(source, "A new wiretrap has been made. It started at "..arguments.startedAt.." and it ended at "..arguments.endedAt..". The wiretrap was made by "..arguments.observer.." and it was made on "..arguments.target.." using the protocol "..arguments.protocol.."", "wiretap", "info", "Wiretap stored", arguments)

    return database.insert(
        [[
            INSERT INTO wiretaps (type, startedAt, endedAt, observer, target, protocol)
            VALUES (?, ?, ?, ?, ?, ?)
        ]],
        arguments.type, arguments.startedAt, arguments.endedAt, arguments.observer, arguments.target, arguments.protocol,
        function(id)
            arguments.id = id
            return arguments
        end)
end)

lib.callback.register("evidences:getWiretaps", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    return database.query("SELECT * FROM wiretaps ORDER BY endedAt DESC LIMIT 10 OFFSET ?", arguments.offset)
end)