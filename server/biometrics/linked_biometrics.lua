local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local database <const> = require "server.database"
local citizens <const> = require "server.citizens.citizens"
local allowedTypes <const> = { "fingerprint", "dna" }
local logger <const> = require "server.logger"

local linkedBiometrics = {}

MySQL.update.await(
    [[
        CREATE TABLE IF NOT EXISTS linked_fingerprint (
            fingerprint VARCHAR(16) PRIMARY KEY NOT NULL,
            identifier VARCHAR(500) NOT NULL UNIQUE,
            FOREIGN KEY (fingerprint) REFERENCES biometric_data(fingerprint)
        )
    ]]
)

MySQL.update.await(
    [[
        CREATE TABLE IF NOT EXISTS linked_dna (
            dna VARCHAR(16) PRIMARY KEY NOT NULL,
            identifier VARCHAR(500) NOT NULL UNIQUE,
            FOREIGN KEY (dna) REFERENCES biometric_data(dna)
        )
    ]]
)

lib.callback.register("evidences:linkBiometricDataToIdentifier", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    local type <const> = arguments.type
    local biometricData <const> = arguments.biometricData
    local identifier <const> = arguments.identifier

    if lib.table.contains(allowedTypes, type) then
        local result <const> = database.update(string.format("DELETE FROM linked_%s WHERE identifier = ?", type), identifier)

        if result.success then
            if biometricData then
                logger.log(source, "Biometric data linked to citizen", { evidenceType = type, biometricData = biometricData, identifier = identifier })

                return database.update(string.format([[
                    INSERT INTO linked_%s (%s, identifier) VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE identifier = ?
                ]], type, type), biometricData, identifier, identifier)
            end
        end

        return result
    end
end)

function linkedBiometrics.getCitizenLinkedToBiometricData(type, biometricData)    
    if lib.table.contains(allowedTypes, type) then
        local identifierLinkedToBiometricData <const> = database.selectFirstColumn(
            string.format("SELECT identifier FROM linked_%s WHERE %s = ?", type, type), 
            biometricData
        )

        if identifierLinkedToBiometricData.success then
            return citizens.getCitizen(identifierLinkedToBiometricData.response)
        end

        return identifierLinkedToBiometricData
    end
end

lib.callback.register("evidences:getCitizenLinkedToBiometricData", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    return linkedBiometrics.getCitizenLinkedToBiometricData(arguments.type, arguments.biometricData)
end)

lib.callback.register("evidences:getBiometricDataLinkedToIdentifier", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    return database.selectFirstRow(
        [[
            SELECT lf.fingerprint, ld.dna
            FROM (SELECT ? AS identifier) AS dummy
            LEFT JOIN linked_fingerprint lf ON dummy.identifier = lf.identifier
            LEFT JOIN linked_dna ld ON dummy.identifier = ld.identifier
        ]],
        arguments.identifier,
        function(response)
            return response or {}
        end
    )
end)

return linkedBiometrics