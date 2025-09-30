local biometricData = {}

local framework <const> = require "common.frameworks.framework"
local cache = {}

MySQL.query.await([[CREATE TABLE IF NOT EXISTS biometric_data (
    identifier VARCHAR(500) PRIMARY KEY NOT NULL,
    fingerprint VARCHAR(16) UNIQUE NOT NULL,
    dna VARCHAR(16) UNIQUE NOT NULL
)]])

-- Creates a 16-char fingerprint string
local function createFingerprint(identifier)
    local salt <const> = ("%s_%s"):format(identifier, GetGameTimer())
    local hash1 <const> = joaat("fp_" .. salt)
    local hash2 <const> = joaat("salt_" .. tostring(math.random(1, 1e9)))

    local mask <const> = 0xFFFFFFFF
    return string.format("%08X%08X", hash1 & mask, hash2 & mask)
end

-- Creates a 16-char DNA string
local function createDNA()
    local bases <const> = { "A", "T", "G", "C" }
    local dna = ""

    for i = 1, 16 do
        dna = dna .. bases[math.random(1, #bases)]
    end

    return dna
end

---@param identifier number The frameworks identifier of the player
---@param fingerprint string The fingerprint of the player
---@param dna string The DNA of the player
---@return boolean Returns true in case the insertion has been successfull, otherwise false
local function insertBiometricData(identifier, fingerprint, dna)
    return pcall(MySQL.insert.await, "INSERT INTO biometric_data (identifier, fingerprint, dna) VALUES (?, ?, ?)", { identifier, fingerprint, dna })
end


---@param identifier string The frameworks identifier of the player
---@return { fingerprint: string, dna: string }
local function getBiometricData(identifier)
    if identifier then
        if cache[identifier] then
            return cache[identifier]
        end

        local row <const> = MySQL.prepare.await("SELECT fingerprint, dna FROM biometric_data WHERE identifier = ?", { tostring(identifier) })
        if row then
            cache[identifier] = row
            return row
        end

        -- local p = promise.new()

        -- CreateThread(function()
        --     local data

        --     for i = 1, 5 do
        --         local fingerprint <const> = createFingerprint(playerId)
        --         local dna <const> = createDNA()

        --         if insertBiometricData(identifier, fingerprint, dna) then
        --             data = {
        --                 fingerprint = fingerprint,
        --                 dna = dna
        --             }
        --             break
        --         end

        --         Wait(0)
        --     end

        --     p:resolve(data)
        -- end)

        -- local result <const> = Citizen.Await(p)
        -- cache[identifier] = result
        -- return result

        for i = 1, 5 do
            local fingerprint <const> = createFingerprint(identifier)
            local dna <const> = createDNA()

            if insertBiometricData(identifier, fingerprint, dna) then
                local data <const> = {
                    fingerprint = fingerprint,
                    dna = dna
                }

                cache[identifier] = data
                return data
            end

            Wait(0)
        end
    end
end

---@param playerId number The serverId of the player
---@param type? string The biometric data type to return
---@return string|{ fingerprint: string, dna: string }
function biometricData.getBiometricData(playerId, type)
    local identifier <const> = framework.getIdentifier(playerId)
    if identifier then
        local data <const> = getBiometricData(identifier)
        if data then
            return data[type]
        end
    end
end

---@param playerId number The serverId of the player
function biometricData.getFingerprint(playerId)
    local identifier <const> = framework.getIdentifier(playerId)
    if identifier then
        local data <const> = getBiometricData(identifier)
        if data then
            return data.fingerprint
        end
    end
end

---@param playerId number The serverId of the player
function biometricData.getDNA(playerId)
    local identifier <const> = framework.getIdentifier(playerId)
    if identifier then
        local data <const> = getBiometricData(identifier)
        if data then
            return data.dna
        end
    end
end

return biometricData